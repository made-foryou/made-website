import { storyblokEditable } from '@storyblok/react/rsc';
import Tekstveld from '@/components/Tekstveld';

/* Eén stap. Het nummer staat niet in de inhoud: de CSS-counter van
   .stappen__lijst telt zelf door. */

const Stap = ({ blok }) => (
	<li className="stap" data-onthul="" {...storyblokEditable(blok)}>
		<div className="stap__nummer" aria-hidden="true">
			<span className="stap__cijfer" />
			<span className="stap__scheiding">/</span>
		</div>

		{blok.titel && <h3 className="stap__titel">{blok.titel}</h3>}
		<Tekstveld waarde={blok.tekst} className="stap__tekst" />
	</li>
);

export default Stap;
