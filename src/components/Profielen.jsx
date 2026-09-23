import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookKop from '@/components/StrookKop';
import { anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* "Wat de naam zegt": de twee helften van het woordmerk als grote
   profielkaarten naast elkaar. */

const Profielen = ({ blok }) => {
	const kopId = `profielen-kop-${blok._uid}`;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('profielen', blok.vlak)}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="profielen__binnen">
				<StrookKop
					label={blok.label}
					titel={blok.headline}
					accent={blok.headline_accent}
					intro={blok.intro}
					kopId={kopId}
					formaat="groot"
				/>

				{blok.profielen?.length > 0 && (
					<div className="profielen__kaarten">
						{blok.profielen.map((nestedBlok) => (
							<StoryblokServerComponent
								blok={nestedBlok}
								key={nestedBlok._uid}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default Profielen;
