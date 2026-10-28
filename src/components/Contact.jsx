import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookLabel from '@/components/StrookLabel';
import ContactFormulier from '@/components/ContactFormulier';
import Tekstveld from '@/components/Tekstveld';
import { accentueer, anker, naarSleutel } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* Contactstrook: links bij wie je terechtkomt, rechts het formulier.
   De keuzerondjes in het formulier komen uit dezelfde contactpersonen als de
   kaarten ernaast, zodat er maar op één plek iets bijgehouden hoeft te worden.

   Het formulier zelf (states, transities, versturen via Postmark) staat in
   ContactFormulier.jsx. Het krijgt de mailadressen alleen om ze in een
   foutmelding te tonen; de server action zoekt de ontvanger zelf op in de
   story. Zonder contactpersonen valt er niemand te kiezen, en blijft het
   formulier weg. */

const Contact = ({ blok }) => {
	const kopId = `contact-kop-${blok._uid}`;
	const personen = blok.personen ?? [];
	const toonFormulier = blok.toon_formulier !== false;
	const keuzes = personen.filter((persoon) => persoon.naam);

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen('contact', blok.vlak)}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="contact__binnen">
				<div className="contact__tekst">
					<StrookLabel tekst={blok.label} />

					{blok.headline && (
						<h2 id={kopId} className="contact__titel" data-onthul="">
							{accentueer(blok.headline, blok.headline_accent)}
						</h2>
					)}

					<Tekstveld
						waarde={blok.intro}
						className="contact__intro"
						data-onthul=""
					/>

					{personen.length > 0 && (
						<div className="contact__personen" data-onthul="">
							{personen.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					)}

					{blok.adres && (
						<p className="contact__adres" data-onthul="">
							<span className="contact__adres-label">
								{blok.adres_label || 'Adres'}
							</span>
							<span className="contact__adres-tekst">{blok.adres}</span>
						</p>
					)}
				</div>

				{toonFormulier && keuzes.length > 0 && (
					<ContactFormulier
						blokId={blok._uid}
						keuzes={keuzes.map((persoon) => ({
							sleutel: naarSleutel(persoon.naam),
							naam: persoon.naam,
							rol: persoon.rol || '',
							email: String(persoon.email ?? '').trim(),
						}))}
						teksten={{
							keuzeKop: blok.formulier_titel || 'Naar wie gaat je bericht?',
							naamLabel: blok.naam_label || 'Naam',
							naamPlaceholder: blok.naam_placeholder || undefined,
							emailLabel: blok.email_label || 'E-mailadres',
							emailPlaceholder: blok.email_placeholder || undefined,
							berichtLabel: blok.bericht_label || 'Waar kunnen we mee helpen?',
							berichtPlaceholder: blok.bericht_placeholder || undefined,
							privacy: blok.privacy_tekst || '',
							verzend: blok.verzend_label || 'Stuur je bericht',
							termijn: String(blok.antwoord_termijn ?? '').trim(),
						}}
					/>
				)}
			</div>
		</section>
	);
};

export default Contact;
