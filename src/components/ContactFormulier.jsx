'use client';

import {
	Component,
	useActionState,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';
import { usePathname } from 'next/navigation';
import { verstuurContact } from '@/lib/verstuurContact';
import { LEEG, MAX, controleer, samenvatting } from '@/lib/contactformulier';
import {
	duw,
	komBinnen,
	minderBeweging,
	veerBreedte,
	verdwijn,
} from '@/lib/contactBeweging';

/* Het contactformulier, met de vier states uit het ontwerp (canvas "Hero
   strook Made", artboards Contact, ContactFouten, ContactVersturen en
   ContactVerstuurd): invullen, validatie, versturen en verstuurd. Versturen
   gaat via de server action verstuurContact (Postmark).

   De weergave loopt los van de action-state, zodat elke overgang de tijd
   krijgt:
   - versturen blijft minstens MIN_BEZIG staan, anders flitst een snelle
     Postmark-call voorbij;
   - voor het verstuurd-scherm vervaagt eerst de oude inhoud ('uitgang'),
     daarna veert het formulier naar zijn nieuwe hoogte en tekent het vinkje
     zich (contactBeweging.js).

   Zonder JavaScript post het formulier gewoon naar de action en rendert de
   server de nieuwe state, zonder beweging. Bij prefers-reduced-motion wisselen
   de states direct; de focus verhuist dan nog steeds. */

const BEGIN = { fase: 'invullen' };
const MIN_BEZIG = 900;

function volgBeweging(terug) {
	const lijst = window.matchMedia('(prefers-reduced-motion: reduce)');
	lijst.addEventListener('change', terug);
	return () => lijst.removeEventListener('change', terug);
}

function useMinderBeweging() {
	return useSyncExternalStore(volgBeweging, minderBeweging, () => false);
}

/* De laatste niet-lege waarde. Een melding die dichtklapt houdt zo zijn tekst
   tot hij helemaal weg is. */
function useLaatste(waarde) {
	const [laatste, setLaatste] = useState(waarde);
	if (waarde && waarde !== laatste) setLaatste(waarde);
	return waarde || laatste;
}

/* Klapt open en dicht via grid-template-rows (zie globals.css). */
const Uitklap = ({ open, index = 0, className, children }) => (
	<div
		className={['contact__uitklap', className].filter(Boolean).join(' ')}
		data-open={open ? '' : undefined}
		aria-hidden={open ? undefined : true}
		style={{ '--uitklap-index': Math.max(index, 0) }}
	>
		<div className="contact__uitklap-binnen">{children}</div>
	</div>
);

const Fout = ({ id, tekst, index }) => {
	const getoond = useLaatste(tekst);

	return (
		<Uitklap open={Boolean(tekst)} index={index}>
			<p id={id} className="made-veld__fout">
				{getoond}
			</p>
		</Uitklap>
	);
};

/* "mail Menno direct op menno@…" in de foutmeldingen. */
const Direct = ({ persoon }) =>
	persoon?.email ?
		<>
			mail {persoon.naam} direct op{' '}
			<a href={`mailto:${persoon.email}`}>{persoon.email}</a>.
		</>
	:	'mail ons direct.';

const MELDINGEN = {
	mislukt: (persoon) => (
		<>
			<strong>Versturen lukte niet.</strong> Probeer het zo nog eens, of{' '}
			<Direct persoon={persoon} />
		</>
	),
	'te-vaak': (persoon) => (
		<>
			<strong>Even wachten.</strong> Er kwamen net veel berichten binnen.
			Probeer het over een paar minuten opnieuw, of{' '}
			<Direct persoon={persoon} />
		</>
	),
	verouderd: (persoon) => (
		<>
			<strong>Versturen lukte niet.</strong> De site is net bijgewerkt.
			Kopieer je bericht, herlaad de pagina en verstuur het opnieuw, of{' '}
			<Direct persoon={persoon} />
		</>
	),
};

/* De inhoud van de samenvatting staat als één string ("fouten:3",
   "melding:mislukt"), zodat useLaatste hem kan vasthouden. */
function samenvattingTekst(inhoud, persoon) {
	const [soort, waarde] = inhoud.split(':');
	if (soort === 'fouten') {
		return (
			<>
				<strong>Bijna klaar.</strong> {samenvatting(Number(waarde))}
			</>
		);
	}

	return MELDINGEN[waarde]?.(persoon) ?? null;
}

const FoutIcoon = () => (
	<svg
		className="contact__samenvatting-icoon"
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="9" fill="none" strokeWidth="2.25" />
		<path d="M12 7.5 L12 13" fill="none" strokeWidth="2.5" />
		<circle className="contact__samenvatting-punt" cx="12" cy="16.6" r="1.4" />
	</svg>
);

const Draaier = () => (
	<svg
		className="made-knop__draaier"
		viewBox="0 0 24 24"
		width="16"
		height="16"
		aria-hidden="true"
	>
		<circle
			cx="12"
			cy="12"
			r="9"
			fill="none"
			stroke="currentColor"
			strokeOpacity="0.3"
			strokeWidth="3"
		/>
		<path
			d="M12 3 A9 9 0 0 1 21 12"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
		/>
	</svg>
);

function Formulier({
	blokId,
	keuzes,
	teksten,
	beginWaarden,
	beginMelding,
	herstel,
	bewaar,
}) {
	const pad = usePathname();
	const stil = useMinderBeweging();
	const [state, verstuur, bezig] = useActionState(verstuurContact, BEGIN);

	const [waarden, setWaarden] = useState(
		() =>
			state.waarden ??
			beginWaarden ?? {
				...LEEG,
				ontvanger: keuzes.length === 1 ? keuzes[0].sleutel : '',
			},
	);
	const [geprobeerd, setGeprobeerd] = useState(() => Boolean(state.fouten));
	const [wachten, setWachten] = useState(false);
	const [gestuurd, setGestuurd] = useState(false);
	const [uitgangKlaar, setUitgangKlaar] = useState(false);
	const [terug, setTerug] = useState(false);
	const [afgehandeld, setAfgehandeld] = useState(null);
	const [ronde, setRonde] = useState(0);
	const [geforceerd, setGeforceerd] = useState(null);

	const formulierRef = useRef(null);
	const faseRef = useRef(null);
	const samenvattingRef = useRef(null);
	const knopRef = useRef(null);
	const knopBreedte = useRef(0);
	const succesRef = useRef(null);
	const vinkRef = useRef(null);
	const kopRef = useRef(null);
	const hoogteVoor = useRef(0);
	const timer = useRef(null);
	const tijdlijn = useRef(null);

	/* "Nog een bericht sturen" zet de huidige state opzij; useActionState
	   zelf kent geen reset. */
	const actueel = state === afgehandeld ? BEGIN : state;
	const gelukt = actueel.fase === 'verstuurd' || geforceerd === 'verstuurd';
	const viaScript = gestuurd || geforceerd === 'verstuurd';

	let fase = 'invullen';
	if (bezig || wachten || geforceerd === 'versturen') fase = 'versturen';
	else if (gelukt && viaScript && !stil && !uitgangKlaar) fase = 'uitgang';
	else if (gelukt) fase = 'verstuurd';

	const vergrendeld = fase === 'versturen' || fase === 'uitgang';
	const fouten = geprobeerd && fase === 'invullen' ? controleer(waarden) : {};
	const foutVelden = Object.keys(fouten);
	const melding =
		fase !== 'invullen' ? null
		: geforceerd === 'mislukt' || geforceerd === 'te-vaak' ? geforceerd
		: (actueel.melding ?? (state === BEGIN ? beginMelding : null));

	const inhoud =
		foutVelden.length ? `fouten:${foutVelden.length}`
		: melding ? `melding:${melding}`
		: '';
	const getoondeInhoud = useLaatste(inhoud);

	const gekozen =
		keuzes.find((keuze) => keuze.sleutel === waarden.ontvanger) ?? null;
	const ontvangerNaam = actueel.ontvangerNaam ?? gekozen?.naam ?? 'ons';
	const email = actueel.email ?? waarden.email.trim();
	const voetTekst =
		vergrendeld ?
			`Even geduld, je bericht gaat naar ${gekozen?.naam ?? 'ons'}.`
		:	teksten.privacy;
	const knopTekst = vergrendeld ? 'Bezig met versturen' : teksten.verzend;

	function zet(veld, waarde) {
		if (vergrendeld) return;
		const nieuw = { ...waarden, [veld]: waarde };
		setWaarden(nieuw);
		bewaar(nieuw);
	}

	function bijVersturen(event) {
		if (vergrendeld) {
			event.preventDefault();
			return;
		}

		const nieuweFouten = Object.keys(controleer(waarden));
		const stondOpen = Boolean(inhoud);
		setGeprobeerd(true);
		setGeforceerd(null);

		if (nieuweFouten.length) {
			event.preventDefault();
			if (stondOpen && !stil) duw(samenvattingRef.current);

			const veld = formulierRef.current.elements.namedItem(nieuweFouten[0]);
			const doel = veld instanceof RadioNodeList ? veld[0] : veld;
			doel?.focus();
			return;
		}

		/* Alles is ingevuld: de action loopt. */
		knopBreedte.current = knopRef.current.offsetWidth;
		setGestuurd(true);
		setWachten(true);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setWachten(false), MIN_BEZIG);
	}

	function opnieuwBeginnen() {
		hoogteVoor.current = formulierRef.current?.offsetHeight ?? 0;
		setAfgehandeld(state);
		setUitgangKlaar(false);
		setGestuurd(false);
		setGeprobeerd(false);
		setGeforceerd(null);
		setTerug(false);
		setWaarden(LEEG);
		bewaar(LEEG);
		setRonde((r) => r + 1);
	}

	function nogEenBericht() {
		if (stil) opnieuwBeginnen();
		else setTerug(true);
	}

	useEffect(() => {
		const lopend = timer;
		return () => clearTimeout(lopend.current);
	}, []);

	/* De knop veert mee met de wissel naar "Bezig met versturen" en terug.
	   knopBreedte is de breedte die hij bij de vorige tekst had. */
	useLayoutEffect(() => {
		const knop = knopRef.current;
		if (!knop) return undefined;

		const van = knopBreedte.current;
		knopBreedte.current = knop.offsetWidth;
		if (stil) return undefined;

		const animatie = veerBreedte(knop, van);
		return () => animatie?.revert();
	}, [knopTekst, stil]);

	/* Gelukt: eerst vervaagt het ingevulde formulier. */
	useEffect(() => {
		if (fase !== 'uitgang') return undefined;

		const animatie = verdwijn([...faseRef.current.children], () => {
			hoogteVoor.current = formulierRef.current.offsetHeight;
			setUitgangKlaar(true);
		});
		return () => animatie.revert();
	}, [fase]);

	/* Daarna het verstuurd-moment. */
	useLayoutEffect(() => {
		if (fase !== 'verstuurd' || !viaScript) return undefined;

		if (stil || !hoogteVoor.current) {
			kopRef.current?.focus();
			return undefined;
		}

		const { tijdlijn: tl, opruimen } = komBinnen({
			formulier: formulierRef.current,
			vanHoogte: hoogteVoor.current,
			elementen: succesRef.current.querySelectorAll('[data-binnen]'),
			vink: vinkRef.current,
			klaar: () => kopRef.current?.focus(),
		});
		tijdlijn.current = tl;
		return opruimen;
	}, [fase, viaScript, stil]);

	/* "Nog een bericht sturen": het succesblok vervaagt, dan begint het
	   formulier opnieuw. */
	useEffect(() => {
		if (!terug) return undefined;

		const animatie = verdwijn(
			[...succesRef.current.children],
			opnieuwBeginnen,
		);
		return () => animatie.revert();
		// opnieuwBeginnen hoort bij deze render; het effect moet alleen op terug starten.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [terug]);

	useLayoutEffect(() => {
		if (!ronde) return undefined;

		const eerste = () =>
			formulierRef.current
				.querySelector('.contact__radio, .made-veld__invoer')
				?.focus();

		if (stil || !hoogteVoor.current) {
			eerste();
			return undefined;
		}

		const { tijdlijn: tl, opruimen } = komBinnen({
			formulier: formulierRef.current,
			vanHoogte: hoogteVoor.current,
			elementen: faseRef.current.querySelectorAll(
				':scope > :not(.contact__uitklap)',
			),
			klaar: eerste,
		});
		tijdlijn.current = tl;
		return opruimen;
	}, [ronde, stil]);

	/* Alleen in development: states forceren en de tijdlijn pauzeren of
	   seeken bij het afstemmen, net als window.__madeIntro. */
	useEffect(() => {
		if (process.env.NODE_ENV === 'production') return undefined;

		window.__madeContact = {
			toon: (naam) => setGeforceerd(naam ?? null),
			vul: (deel) => setWaarden((huidig) => ({ ...huidig, ...deel })),
			get tijdlijn() {
				return tijdlijn.current;
			},
		};
		return () => {
			delete window.__madeContact;
		};
	}, []);

	const id = (veld) => `contact-${veld}-${blokId}`;
	const beschrijving = (veld) =>
		fouten[veld] ? id(`${veld}-fout`) : undefined;
	const ongeldig = (veld) => (fouten[veld] ? 'true' : undefined);

	return (
		<form
			ref={formulierRef}
			className="contact__formulier"
			action={verstuur}
			onSubmit={bijVersturen}
			noValidate
			data-onthul={herstel ? 'zichtbaar' : ''}
			data-bezig={vergrendeld ? '' : undefined}
		>
			<input type="hidden" name="pagina" value={pad ?? '/'} />
			<input type="hidden" name="blok" value={blokId} />

			{/* Voor bots: een mens ziet dit veld niet en vult het dus niet in. */}
			<div className="contact__honing" aria-hidden="true">
				<label htmlFor={id('website')}>Website</label>
				<input
					id={id('website')}
					type="text"
					name="website"
					tabIndex={-1}
					autoComplete="off"
					defaultValue=""
				/>
			</div>

			{fase === 'verstuurd' ?
				<div ref={succesRef} className="contact__succes" role="status">
					<div ref={vinkRef} className="contact__vink" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="28" height="28">
							<path
								d="M5 12.5 L10 17.5 L19 7"
								fill="none"
								strokeWidth="3"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>

					<div className="contact__succes-tekst">
						<div className="contact__succes-label" data-binnen="">
							Verstuurd
						</div>
						<h3
							ref={kopRef}
							className="contact__succes-kop"
							tabIndex={-1}
							data-binnen=""
						>
							Je bericht is bij {ontvangerNaam}.
						</h3>
						<p className="contact__succes-uitleg" data-binnen="">
							Je krijgt{' '}
							{teksten.termijn ?
								`binnen ${teksten.termijn}`
							:	'zo snel mogelijk'}{' '}
							antwoord op {email || 'je e-mailadres'}. Een bevestiging
							staat al in je inbox, met daarin wat je ons stuurde.
						</p>
					</div>

					<button
						type="button"
						className="made-knop made-knop--link contact__opnieuw"
						onClick={nogEenBericht}
						data-binnen=""
					>
						Nog een bericht sturen
					</button>
				</div>
			:	<div ref={faseRef} className="contact__fase">
					<Uitklap open={Boolean(inhoud)}>
						<div
							ref={samenvattingRef}
							className="contact__samenvatting"
							role="alert"
						>
							<FoutIcoon />
							<span key={getoondeInhoud} className="contact__wissel">
								{getoondeInhoud &&
									samenvattingTekst(getoondeInhoud, gekozen)}
							</span>
						</div>
					</Uitklap>

					<div className="contact__velden">
						{keuzes.length > 0 && (
							<fieldset
								className={
									fouten.ontvanger ?
										'contact__keuze contact__keuze--fout'
									:	'contact__keuze'
								}
							>
								<legend className="contact__keuze-kop">
									{teksten.keuzeKop}
								</legend>

								<div className="contact__keuze-rij">
									{keuzes.map((keuze) => (
										<label className="contact__optie" key={keuze.sleutel}>
											<input
												type="radio"
												name="ontvanger"
												value={keuze.sleutel}
												className="contact__radio"
												checked={waarden.ontvanger === keuze.sleutel}
												onChange={() => zet('ontvanger', keuze.sleutel)}
												aria-disabled={vergrendeld || undefined}
												aria-describedby={beschrijving('ontvanger')}
											/>
											<span className="contact__optie-tekst">
												<span className="contact__optie-naam">
													{keuze.naam}
												</span>
												{keuze.rol && (
													<span className="contact__optie-rol">
														{keuze.rol}
													</span>
												)}
											</span>
										</label>
									))}
								</div>

								<Fout
									id={id('ontvanger-fout')}
									tekst={fouten.ontvanger}
									index={foutVelden.indexOf('ontvanger')}
								/>
							</fieldset>
						)}

						<div className="contact__rij">
							<div
								className={
									fouten.naam ? 'made-veld made-veld--fout' : 'made-veld'
								}
							>
								<label className="made-veld__label" htmlFor={id('naam')}>
									{teksten.naamLabel}
								</label>
								<input
									id={id('naam')}
									className="made-veld__invoer"
									type="text"
									name="naam"
									autoComplete="name"
									maxLength={MAX.naam}
									placeholder={teksten.naamPlaceholder}
									value={waarden.naam}
									onChange={(e) => zet('naam', e.target.value)}
									readOnly={vergrendeld}
									aria-invalid={ongeldig('naam')}
									aria-describedby={beschrijving('naam')}
								/>
								<Fout
									id={id('naam-fout')}
									tekst={fouten.naam}
									index={foutVelden.indexOf('naam')}
								/>
							</div>

							<div
								className={
									fouten.email ? 'made-veld made-veld--fout' : 'made-veld'
								}
							>
								<label className="made-veld__label" htmlFor={id('email')}>
									{teksten.emailLabel}
								</label>
								<input
									id={id('email')}
									className="made-veld__invoer"
									type="email"
									name="email"
									autoComplete="email"
									maxLength={MAX.email}
									placeholder={teksten.emailPlaceholder}
									value={waarden.email}
									onChange={(e) => zet('email', e.target.value)}
									readOnly={vergrendeld}
									aria-invalid={ongeldig('email')}
									aria-describedby={beschrijving('email')}
								/>
								<Fout
									id={id('email-fout')}
									tekst={fouten.email}
									index={foutVelden.indexOf('email')}
								/>
							</div>
						</div>

						<div
							className={
								fouten.bericht ? 'made-veld made-veld--fout' : 'made-veld'
							}
						>
							<label className="made-veld__label" htmlFor={id('bericht')}>
								{teksten.berichtLabel}
							</label>
							<textarea
								id={id('bericht')}
								className="made-veld__invoer contact__bericht"
								name="bericht"
								rows={5}
								maxLength={MAX.bericht}
								placeholder={teksten.berichtPlaceholder}
								value={waarden.bericht}
								onChange={(e) => zet('bericht', e.target.value)}
								readOnly={vergrendeld}
								aria-invalid={ongeldig('bericht')}
								aria-describedby={beschrijving('bericht')}
							/>
							<Fout
								id={id('bericht-fout')}
								tekst={fouten.bericht}
								index={foutVelden.indexOf('bericht')}
							/>
						</div>
					</div>

					<div className="contact__voet">
						<p className="contact__privacy" aria-live="polite">
							<span key={voetTekst} className="contact__wissel">
								{voetTekst}
							</span>
						</p>

						<button
							ref={knopRef}
							type="submit"
							className="made-knop made-knop--primair contact__knop"
							aria-disabled={vergrendeld || undefined}
							aria-busy={vergrendeld || undefined}
						>
							<span
								key={knopTekst}
								className="contact__knop-inhoud contact__wissel"
							>
								{vergrendeld && <Draaier />}
								{knopTekst}
							</span>
						</button>
					</div>
				</div>
			}
		</form>
	);
}

/* Na een nieuwe deploy kent de server de action van een open tabblad niet
   meer, en dan gooit React een fout in plaats van een state terug te geven.
   Dit vangnet bouwt het formulier dan opnieuw op, met wat er al ingevuld
   was en een melding om de pagina te herladen. */
class Vangnet extends Component {
	constructor(props) {
		super(props);
		this.state = { fout: false };
	}

	static getDerivedStateFromError() {
		return { fout: true };
	}

	componentDidCatch(fout) {
		console.error('[contact]', fout);
	}

	render() {
		return this.props.render(this.state.fout);
	}
}

const ContactFormulier = (props) => {
	const [bewaard, setBewaard] = useState(null);

	return (
		<Vangnet
			render={(fout) => (
				<Formulier
					key={fout ? 'herstel' : 'eerste'}
					{...props}
					herstel={fout}
					beginWaarden={fout ? bewaard : null}
					beginMelding={fout ? 'verouderd' : null}
					bewaar={setBewaard}
				/>
			)}
		/>
	);
};

export default ContactFormulier;
