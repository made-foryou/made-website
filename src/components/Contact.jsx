import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookLabel from '@/components/StrookLabel';
import { accentueer, anker, naarSleutel } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* Contactstrook: links bij wie je terechtkomt, rechts het formulier.
   De keuzerondjes in het formulier komen uit dezelfde contactpersonen als de
   kaarten ernaast, zodat er maar op één plek iets bijgehouden hoeft te worden.

   Het formulier post naar wat er in "Formulier-actie" staat. Staat dat leeg,
   dan wordt het formulier wel getoond maar nog niet verzonden; koppel daar het
   endpoint aan zodra dat er is. */

const Contact = ({ blok }) => {
	const kopId = `contact-kop-${blok._uid}`;
	const personen = blok.personen ?? [];
	const toonFormulier = blok.toon_formulier !== false;
	const actie = String(blok.formulier_actie ?? '').trim() || undefined;
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

					{blok.intro && (
						<p className="contact__intro" data-onthul="">
							{blok.intro}
						</p>
					)}

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

				{toonFormulier && (
					<form
						className="contact__formulier"
						action={actie}
						method="post"
						data-onthul=""
					>
						{keuzes.length > 0 && (
							<fieldset className="contact__keuze">
								<legend className="contact__keuze-kop">
									{blok.formulier_titel || 'Naar wie gaat je bericht?'}
								</legend>

								<div className="contact__keuze-rij">
									{keuzes.map((persoon) => (
										<label className="contact__optie" key={persoon._uid}>
											<input
												type="radio"
												name="ontvanger"
												value={naarSleutel(persoon.naam)}
												className="contact__radio"
											/>
											<span className="contact__optie-tekst">
												<span className="contact__optie-naam">
													{persoon.naam}
												</span>
												{persoon.rol && (
													<span className="contact__optie-rol">
														{persoon.rol}
													</span>
												)}
											</span>
										</label>
									))}
								</div>
							</fieldset>
						)}

						<div className="contact__rij">
							<div className="made-veld">
								<label
									className="made-veld__label"
									htmlFor={`naam-${blok._uid}`}
								>
									{blok.naam_label || 'Naam'}
								</label>
								<input
									id={`naam-${blok._uid}`}
									className="made-veld__invoer"
									type="text"
									name="naam"
									autoComplete="name"
									placeholder={blok.naam_placeholder || undefined}
								/>
							</div>

							<div className="made-veld">
								<label
									className="made-veld__label"
									htmlFor={`email-${blok._uid}`}
								>
									{blok.email_label || 'E-mailadres'}
								</label>
								<input
									id={`email-${blok._uid}`}
									className="made-veld__invoer"
									type="email"
									name="email"
									autoComplete="email"
									placeholder={blok.email_placeholder || undefined}
								/>
							</div>
						</div>

						<div className="made-veld">
							<label
								className="made-veld__label"
								htmlFor={`bericht-${blok._uid}`}
							>
								{blok.bericht_label || 'Waar kunnen we mee helpen?'}
							</label>
							<textarea
								id={`bericht-${blok._uid}`}
								className="made-veld__invoer contact__bericht"
								name="bericht"
								rows={5}
								placeholder={blok.bericht_placeholder || undefined}
							/>
						</div>

						<div className="contact__voet">
							{blok.privacy_tekst && (
								<p className="contact__privacy">{blok.privacy_tekst}</p>
							)}

							<button type="submit" className="made-knop made-knop--primair">
								{blok.verzend_label || 'Stuur je bericht'}
							</button>
						</div>
					</form>
				)}
			</div>
		</section>
	);
};

export default Contact;
