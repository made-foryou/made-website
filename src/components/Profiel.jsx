import Image from 'next/image';
import { storyblokEditable } from '@storyblok/react/rsc';
import { splitsOpSlash } from '@/lib/tekst';

/* Eén profielkaart: portret met de twee letters uit het woordmerk erop,
   daaronder de naam en wat die persoon doet. Zonder foto blijft het vlak als
   plaatshouder staan, net als bij de teamkaarten. */

const Profiel = ({ blok }) => {
	const foto = blok.foto?.filename || null;

	return (
		<article className="profiel" data-onthul="" {...storyblokEditable(blok)}>
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

				{blok.naam && <h3 className="profiel__naam">{blok.naam}</h3>}
				{blok.functie && <div className="profiel__functie">{blok.functie}</div>}
			</div>

			{blok.tekst && <p className="profiel__alinea">{blok.tekst}</p>}
		</article>
	);
};

export default Profiel;
