import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookKop from '@/components/StrookKop';
import { anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* De werkstrook: kop met een knop ernaast en daaronder de cases. */

const Werk = ({ blok }) => {
	const kopId = `werk-kop-${blok._uid}`;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('werk', blok.vlak)}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="werk__binnen">
				<StrookKop
					label={blok.label}
					titel={blok.headline}
					accent={blok.headline_accent}
					intro={blok.intro}
					kopId={kopId}
					formaat="groot"
				>
					{blok.buttons?.length > 0 && (
						<div className="werk__acties" data-onthul="">
							{blok.buttons.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					)}
				</StrookKop>

				{blok.items?.length > 0 && (
					<div className="werk__cases">
						{blok.items.map((nestedBlok) => (
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

export default Werk;
