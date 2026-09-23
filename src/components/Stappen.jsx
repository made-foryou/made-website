import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookKop from '@/components/StrookKop';
import { anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* De aanpak in genummerde stappen. De nummers komen uit een CSS-counter, dus
   een stap ertussen schuiven hoeft alleen in Storyblok te gebeuren. */

const Stappen = ({ blok }) => {
	const kopId = `stappen-kop-${blok._uid}`;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('stappen', blok.vlak || 'nachtgroen')}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="stappen__binnen">
				<StrookKop
					label={blok.label}
					titel={blok.headline}
					accent={blok.headline_accent}
					intro={blok.intro}
					kopId={kopId}
					formaat="groot"
					streep={false}
				/>

				{blok.stappen?.length > 0 && (
					<ol className="stappen__lijst">
						{blok.stappen.map((nestedBlok) => (
							<StoryblokServerComponent
								blok={nestedBlok}
								key={nestedBlok._uid}
							/>
						))}
					</ol>
				)}
			</div>
		</section>
	);
};

export default Stappen;
