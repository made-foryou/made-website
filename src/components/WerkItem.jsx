import Image from 'next/image';
import Link from 'next/link';
import { storyblokEditable } from '@storyblok/react/rsc';
import { isInternal, linkTarget, resolveLink } from '@/lib/links';
import { splitsOpSlash } from '@/lib/tekst';

/* Eén case. Met een link wordt de hele kaart klikbaar; zonder link blijft het
   een gewone kaart. De breedte bepaalt hoeveel van de rij hij inneemt. */

const BREEDTES = ['smal', 'normaal', 'breed'];

const WerkItem = ({ blok }) => {
	const breedte = BREEDTES.includes(blok.breedte) ? blok.breedte : 'normaal';
	const href = resolveLink(blok.link);
	const beeld = blok.beeld?.filename || null;

	const inhoud = (
		<>
			<div className="werk-case__beeld">
				{beeld ? (
					<Image
						src={beeld}
						alt={blok.beeld?.alt || blok.titel || ''}
						fill
						sizes="(max-width: 900px) 100vw, 740px"
						className="werk-case__foto"
					/>
				) : (
					<span className="werk-case__plaatshouder" aria-hidden="true">
						{blok.titel || 'Beeld'}
					</span>
				)}
			</div>

			<div className="werk-case__tekst">
				<div className="werk-case__kop">
					{blok.label && (
						<div className="werk-case__label">
							{splitsOpSlash(blok.label, 'werk-case__scheiding')}
						</div>
					)}
					{blok.titel && <h3 className="werk-case__titel">{blok.titel}</h3>}
				</div>

				{blok.resultaat && (
					<div className="werk-case__resultaat">
						<div className="werk-case__getal">{blok.resultaat}</div>
						{blok.resultaat_toelichting && (
							<div className="werk-case__toelichting">
								{blok.resultaat_toelichting}
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);

	const className = `werk-case werk-case--${breedte}`;

	if (!href) {
		return (
			<article
				className={className}
				data-onthul=""
				{...storyblokEditable(blok)}
			>
				{inhoud}
			</article>
		);
	}

	const Tag = isInternal(href) ? Link : 'a';

	return (
		<Tag
			href={href}
			className={`${className} werk-case--link`}
			data-onthul=""
			{...linkTarget(blok.link)}
			{...storyblokEditable(blok)}
		>
			{inhoud}
		</Tag>
	);
};

export default WerkItem;
