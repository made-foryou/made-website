import { storyblokEditable } from '@storyblok/react/rsc';

/* Eén dienst als kaart. Met "accent" komt er een amber streepje boven. */

const Dienst = ({ blok }) => (
	<article className="made-kaart" {...storyblokEditable(blok)}>
		{blok.accent && <div className="made-kaart__accent" aria-hidden="true" />}
		{blok.titel && <h3 className="made-kaart__titel">{blok.titel}</h3>}
		{blok.tekst && <p className="made-kaart__tekst">{blok.tekst}</p>}
	</article>
);

export default Dienst;
