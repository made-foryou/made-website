import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookLabel from '@/components/StrookLabel';
import { accentueer, anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* Kop links, een opsomming rechts — in het ontwerp "Drie dingen die je bij ons
   niet krijgt". Elke regel begint met een grote schuine streep. */

const Stellingen = ({ blok }) => {
	const kopId = `stellingen-kop-${blok._uid}`;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('stellingen', blok.vlak || 'verhoogd')}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="stellingen__binnen">
				<div className="stellingen__tekst">
					<StrookLabel tekst={blok.label} />

					{blok.headline && (
						<h2 id={kopId} className="stellingen__titel" data-onthul="">
							{accentueer(blok.headline, blok.headline_accent)}
						</h2>
					)}

					{blok.intro && (
						<p className="stellingen__intro" data-onthul="">
							{blok.intro}
						</p>
					)}
				</div>

				{blok.stellingen?.length > 0 && (
					<ul className="stellingen__lijst">
						{blok.stellingen.map((nestedBlok) => (
							<StoryblokServerComponent
								blok={nestedBlok}
								key={nestedBlok._uid}
							/>
						))}
					</ul>
				)}
			</div>
		</section>
	);
};

export default Stellingen;
