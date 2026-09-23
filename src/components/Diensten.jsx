import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookKop from '@/components/StrookKop';
import { anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* Dienstenstrook: per vak een groep met daarin de losse diensten.
   Twee groepen passen naast elkaar; meer schuift door naar de volgende rij. */

const Diensten = ({ blok }) => {
	const kopId = `diensten-kop-${blok._uid}`;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('diensten', blok.vlak)}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="diensten__binnen">
				<StrookKop
					label={blok.label}
					titel={blok.headline}
					accent={blok.headline_accent}
					intro={blok.intro}
					kopId={kopId}
				/>

				{blok.groepen?.length > 0 && (
					<div className="diensten__groepen">
						{blok.groepen.map((nestedBlok) => (
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

export default Diensten;
