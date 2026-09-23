import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookLabel from '@/components/StrookLabel';
import { accentueer, anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* De afsluitende oproep: kop, tekst en knoppen, met rechts de twee slashes
   uit het woordmerk. Staat standaard op nachtgroen. */

const Slash = ({ positie }) => (
	<svg
		viewBox="0 0 250 500"
		className={`cta__slash cta__slash--${positie}`}
		aria-hidden="true"
	>
		<path
			d="M55 445 L195 55"
			strokeWidth={110}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const Cta = ({ blok }) => {
	const kopId = `cta-kop-${blok._uid}`;
	const toonSlash = blok.toon_slash !== false;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('cta', blok.vlak || 'nachtgroen')}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="cta__binnen">
				<div className="cta__tekst">
					<StrookLabel tekst={blok.label} streep={false} />

					{blok.headline && (
						<h2 id={kopId} className="cta__titel" data-onthul="">
							{accentueer(blok.headline, blok.headline_accent)}
						</h2>
					)}

					{blok.tekst && (
						<p className="cta__alinea" data-onthul="">
							{blok.tekst}
						</p>
					)}

					{blok.buttons?.length > 0 && (
						<div className="cta__acties" data-onthul="">
							{blok.buttons.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					)}
				</div>

				{toonSlash && (
					<div className="cta__beeld" aria-hidden="true">
						<Slash positie="achter" />
						<Slash positie="voor" />
					</div>
				)}
			</div>
		</section>
	);
};

export default Cta;
