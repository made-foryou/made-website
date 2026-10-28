import Image from 'next/image';
import Link from 'next/link';
import { storyblokEditable } from '@storyblok/react/rsc';
import Tekstveld from '@/components/Tekstveld';
import { isInternal, linkTarget, resolveLink } from '@/lib/links';
import { splitsOpSlash } from '@/lib/tekst';

/* Eén profielkaart: portret met de twee letters uit het woordmerk erop,
   daaronder de naam en wat die persoon doet. Zonder foto blijft het vlak als
   plaatshouder staan, net als bij de teamkaarten.

   Met een link komt er onderaan een knop en is de hele kaart klikbaar. Anders
   dan bij werk_item is de kaart zelf geen <a>: de tekst is richtext en kan
   eigen links bevatten, en een <a> in een <a> mag niet. De knop is de link;
   zijn ::after legt een klikvlak over de hele kaart (zie globals.css). */

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

			<Tekstveld waarde={blok.tekst} className="profiel__alinea" />

			{href && (
				<Tag
					href={href}
					className="made-knop made-knop--secundair profiel__knop"
					aria-describedby={blok.naam ? naamId : undefined}
					{...linkTarget(blok.link)}
				>
					{blok.knop_label || 'Lees meer'}
				</Tag>
			)}
		</article>
	);
};

export default Profiel;
