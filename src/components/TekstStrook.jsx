import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookLabel from '@/components/StrookLabel';
import { anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* Tekststrook: één kolom met label, kop en maximaal twee alinea's.
   De strook waarmee je iets uitlegt zonder beeld of kaarten erbij. */

const TekstStrook = ({ blok }) => {
	const kopId = `tekst-kop-${blok._uid}`;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('tekst-strook', blok.vlak)}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="tekst-strook__binnen">
				<StrookLabel tekst={blok.label} />

				{blok.headline && (
					<h2 id={kopId} className="tekst-strook__titel" data-onthul="">
						{blok.headline}
					</h2>
				)}

				{blok.intro && (
					<p className="tekst-strook__intro" data-onthul="">
						{blok.intro}
					</p>
				)}

				{blok.tekst && (
					<p className="tekst-strook__alinea" data-onthul="">
						{blok.tekst}
					</p>
				)}

				{blok.buttons?.length > 0 && (
					<div className="tekst-strook__acties" data-onthul="">
						{blok.buttons.map((nestedBlok) => (
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

export default TekstStrook;
