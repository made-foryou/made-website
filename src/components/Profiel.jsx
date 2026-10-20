import Image from 'next/image';
import Link from 'next/link';
import { storyblokEditable } from '@storyblok/react/rsc';
import { isInternal, linkTarget, resolveLink } from '@/lib/links';
import { splitsOpSlash } from '@/lib/tekst';

/* Eén profielkaart: portret met de twee letters uit het woordmerk erop,
   daaronder de naam en wat die persoon doet. Zonder foto blijft het vlak als
   plaatshouder staan, net als bij de teamkaarten.

   Met een link komt er onderaan een knop, en is de hele kaart klikbaar: de
   knop is de enige <a>, en een ::after op die knop spant over de kaart. Zo
   staat er één link met een duidelijke naam in de toegankelijkheidsboom, in
   plaats van een <a> om de kop en de alinea heen. */

const Profiel = ({ blok }) => {
	const foto = blok.foto?.filename || null;
	const href = resolveLink(blok.link);
	const naamId = `profiel-naam-${blok._uid}`;
	const Tag = isInternal(href) ? Link : 'a';

	return (
		<article
			className={href ? 'profiel profiel--link' : 'profiel'}
			data-onthul=""
			{...storyblokEditable(blok)}
		>
			<div className="profiel__portret">
				{foto ? (
					<Image
						src={foto}
						alt={blok.foto?.alt || blok.naam || ''}
						fill
						sizes="(max-width: 900px) 100vw, 560px"
						className="profiel__foto"
					/>
				) : (
					<span className="profiel__plaatshouder" aria-hidden="true">
						{blok.naam || 'Foto'}
					</span>
				)}

				{blok.badge && (
					<span className="profiel__badge" aria-hidden="true">
						{blok.badge}
					</span>
				)}
			</div>

			<div className="profiel__tekst">
				{blok.label && (
					<div className="profiel__label">
						{splitsOpSlash(blok.label, 'profiel__scheiding')}
					</div>
				)}

				{blok.naam && (
					<h3 id={naamId} className="profiel__naam">
						{blok.naam}
					</h3>
				)}
				{blok.functie && <div className="profiel__functie">{blok.functie}</div>}
			</div>

			{blok.tekst && <p className="profiel__alinea">{blok.tekst}</p>}

			{href && (
				<Tag
					href={href}
					className="made-knop made-knop--secundair profiel__knop"
					aria-describedby={blok.naam ? naamId : undefined}
					{...linkTarget(blok.link)}
				>
					{blok.knop_label || 'Lees meer'}
					<svg
						className="profiel__pijl"
						viewBox="0 0 16 16"
						width="16"
						height="16"
						aria-hidden="true"
					>
						<path
							d="M2 8h11M9 3.5 13.5 8 9 12.5"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Tag>
			)}
		</article>
	);
};

export default Profiel;
