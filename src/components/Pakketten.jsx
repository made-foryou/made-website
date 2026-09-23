import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookKop from '@/components/StrookKop';
import { anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* Pakkettenstrook: drie prijskaarten naast elkaar, waarvan er één uitgelicht
   kan staan. Meer dan drie pakketten schuiven door naar de volgende rij. */

const Pakketten = ({ blok }) => {
	const kopId = `pakketten-kop-${blok._uid}`;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('pakketten', blok.vlak)}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="pakketten__binnen">
				<StrookKop
					label={blok.label}
					titel={blok.headline}
					accent={blok.headline_accent}
					intro={blok.intro}
					kopId={kopId}
					formaat="groot"
				/>

				{blok.pakketten?.length > 0 && (
					<div className="pakketten__kaarten">
						{blok.pakketten.map((nestedBlok) => (
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

export default Pakketten;
