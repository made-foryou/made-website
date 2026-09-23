import { storyblokEditable } from '@storyblok/react/rsc';
import { splitsOpSlash } from '@/lib/tekst';

/* Eén contactkaart: bij wie je terechtkomt, met mailadres en nummer.
   Een leeg veld laat de regel gewoon weg. */

const ContactPersoon = ({ blok }) => {
	const telefoon = String(blok.telefoon ?? '').trim();

	return (
		<article className="contact-kaart" {...storyblokEditable(blok)}>
			{blok.label && (
				<div className="contact-kaart__label">
					{splitsOpSlash(blok.label, 'contact-kaart__scheiding')}
				</div>
			)}

			{blok.naam && <div className="contact-kaart__naam">{blok.naam}</div>}
			{blok.rol && <div className="contact-kaart__rol">{blok.rol}</div>}

			{blok.email && (
				<a className="contact-kaart__mail" href={`mailto:${blok.email}`}>
					{blok.email}
				</a>
			)}

			{telefoon && (
				<a
					className="contact-kaart__telefoon"
					href={`tel:${telefoon.replace(/[^+0-9]/g, '')}`}
				>
					{telefoon}
				</a>
			)}
		</article>
	);
};

export default ContactPersoon;
