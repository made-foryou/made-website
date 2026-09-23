import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { splitsOpSlash } from '@/lib/tekst';

/* Eén vak binnen de dienstenstrook, bijvoorbeeld "DE / Development",
   met de diensten van dat vak als kaarten erin. */

const DienstGroep = ({ blok }) => (
	<div className="dienst-groep" data-onthul="" {...storyblokEditable(blok)}>
		{blok.label && (
			<div className="dienst-groep__label">
				{splitsOpSlash(blok.label, 'dienst-groep__scheiding')}
			</div>
		)}

		{blok.diensten?.length > 0 && (
			<div className="dienst-groep__kaarten">
				{blok.diensten.map((nestedBlok) => (
					<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
				))}
			</div>
		)}
	</div>
);

export default DienstGroep;
