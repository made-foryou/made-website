import { storyblokEditable } from '@storyblok/react/rsc';

/* Eén regel uit de opsomming, met de slash als opsommingsteken. */

const Stelling = ({ blok }) => (
	<li className="stelling" data-onthul="" {...storyblokEditable(blok)}>
		<span className="stelling__slash" aria-hidden="true">
			/
		</span>

		<div className="stelling__tekst">
			{blok.titel && <h3 className="stelling__titel">{blok.titel}</h3>}
			{blok.tekst && <p className="stelling__alinea">{blok.tekst}</p>}
		</div>
	</li>
);

export default Stelling;
