import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { regels } from '@/lib/tekst';

/* Eén kolom in de voet: links, losse regels (zoals een adres) of allebei. */

const VoetKolom = ({ blok }) => (
	<div className="voet-kolom" {...storyblokEditable(blok)}>
		{blok.titel && <div className="voet-kolom__titel">{blok.titel}</div>}

		{blok.links?.length > 0 && (
			<div className="voet-kolom__links">
				{blok.links.map((nestedBlok) => (
					<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
				))}
			</div>
		)}

		{regels(blok.regels).map((regel) => (
			<span className="voet-kolom__regel" key={regel}>
				{regel}
			</span>
		))}
	</div>
);

export default VoetKolom;
