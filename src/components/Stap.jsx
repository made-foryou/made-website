import { storyblokEditable } from '@storyblok/react/rsc';

/* Eén stap. Het nummer staat niet in de inhoud: de CSS-counter van
   .stappen__lijst telt zelf door. */

const Stap = ({ blok }) => (
	<li className="stap" data-onthul="" {...storyblokEditable(blok)}>
		<div className="stap__nummer" aria-hidden="true">
			<span className="stap__cijfer" />
			<span className="stap__scheiding">/</span>
		</div>

		{blok.titel && <h3 className="stap__titel">{blok.titel}</h3>}
		{blok.tekst && <p className="stap__tekst">{blok.tekst}</p>}
	</li>
);

export default Stap;
