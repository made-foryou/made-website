import { storyblokEditable } from '@storyblok/react/rsc';
import HoofdNav from '@/components/HoofdNav';
import { strookKlassen } from '@/lib/stroken';

/* Alleen het logo en het menu, voor een pagina die zonder hero begint.
   Dezelfde navigatie als bovenin de hero, maar zonder kop en beeldkant. */

const Navigatie = ({ blok }) => (
	<header
		className={strookKlassen('navigatie', blok.vlak)}
		{...storyblokEditable(blok)}
	>
		<div className="navigatie__binnen">
			<HoofdNav items={blok.nav_items} logoBreedte={blok.logo_width} />
		</div>
	</header>
);

export default Navigatie;
