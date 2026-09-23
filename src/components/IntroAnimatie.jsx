'use client';

import { useEffect, useRef, useState } from 'react';
import { createTimeline, svg, utils } from 'animejs';
import {
	LIJNDIKTE,
	LOGO_BREEDTE,
	LOGO_DE_X,
	LOGO_MA_X,
	LOGO_MIDDEN,
	LOGO_SLASH,
	zetWoord,
} from '@/lib/woordmerk';

/* Intro-animatie van de site, in vier scènes:

   1. "MADE" tekent zich in, zonder slash.
   2. MA en DE schuiven uit elkaar en typen zich uit tot MARKETING en
      DEVELOPMENT (op smalle schermen onder elkaar).
   3. De aanvullingen worden weer gewist, MA en DE schuiven naar elkaar en de
      slash tekent zich ertussen: het volledige logo, met tagline.
   4. Het logo vliegt naar het logo in de hero-navigatie en de pagina komt
      onder de intro vandaan.

   De intro speelt één keer per browsersessie, niet bij prefers-reduced-motion
   en niet in een iframe (Storyblok Visual Editor). Met ?intro in de URL
   speelt hij altijd. Alle geometrie staat in svg-eenheden waarbij 1 eenheid =
   1 css-pixel en (0, 0) het midden van het scherm is; de schaal zit op één
   buitenste groep. */

const SESSIE_SLEUTEL = 'made-intro-gezien';

const MARKETING = zetWoord('MARKETING');
const DEVELOPMENT = zetWoord('DEVELOPMENT');

/* Scène 1: compact "MADE", gewone letterafstand tussen A en D. */
const MADE = zetWoord('MADE');
const COMPACT_MA_X = -MADE.breedte / 2;
const COMPACT_DE_X = COMPACT_MA_X + MADE.letters[2].x;

/* Scène 3: het logo zoals Logo.jsx het tekent, rond het middelpunt. */
const LOGO_MA = LOGO_MA_X - LOGO_MIDDEN;
const LOGO_DE = LOGO_DE_X - LOGO_MIDDEN;

/* De regel is 100 hoog; de groepen staan op y = -50 zodat het midden op 0 ligt. */
const REGEL_Y = -50;

const WOORDGAT = 120; /* tussen MARKETING en DEVELOPMENT op één regel */
const REGELGAT = 40; /* tussen de regels bij gestapelde weergave */
const STAPEL_BREEDTE = 720; /* onder deze viewportbreedte stapelen */
const RAND_MAX = 56; /* marge tot de schermrand in scène 2 (6vw, max 56) */

/* Draait vóór hydration en verbergt de overlay meteen als de intro niet hoort
   te spelen, zodat een herlaadde pagina hem niet even ziet opflitsen. */
const OVERSLAAN_SCRIPT = `(function(){try{var o=document.getElementById('made-intro');if(!o)return;var q=/[?&]intro(=|&|$)/.test(location.search);var g=sessionStorage.getItem('${SESSIE_SLEUTEL}');var m=matchMedia('(prefers-reduced-motion: reduce)').matches;var f=window.self!==window.top;if((g&&!q)||m||f){o.setAttribute('hidden','')}}catch(e){}})();`;

function moetSpelen() {
	try {
		const geforceerd = /[?&]intro(=|&|$)/.test(window.location.search);
		const gezien = sessionStorage.getItem(SESSIE_SLEUTEL);
		const minderBeweging = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;
		const inIframe = window.self !== window.top;
		return !((gezien && !geforceerd) || minderBeweging || inIframe);
	} catch {
		return false;
	}
}

const Letter = ({ letter }) => (
	<g className="made-intro__letter" transform={`translate(${letter.x} 0)`}>
		{letter.paden.map((d) => (
			<path key={d} d={d} />
		))}
	</g>
);

const IntroAnimatie = () => {
	const [actief, setActief] = useState(true);
	const wortel = useRef(null);
	const besluit = useRef(null);
	const overslaanRef = useRef(() => {});

	useEffect(() => {
		/* Eén keer beslissen: in development draait dit effect twee keer
		   (Strict Mode) en de sessie-vlag staat dan al. */
		if (besluit.current === null) besluit.current = moetSpelen();
		if (!besluit.current || !wortel.current) {
			/* Niet spelen: het inline script heeft de overlay al verborgen; dit
			   is het vangnet voor als dat script niet liep. Geen setState hier,
			   dat zou een extra render direct na hydration betekenen. */
			wortel.current?.setAttribute('hidden', '');
			return undefined;
		}

		try {
			sessionStorage.setItem(SESSIE_SLEUTEL, '1');
		} catch {
			/* Privémodus zonder storage: dan speelt de intro elke keer. */
		}

		const intro = speelIntro(wortel.current, () => setActief(false));
		overslaanRef.current = intro.overslaan;

		const opToets = (event) => {
			if (event.key === 'Escape') intro.overslaan();
		};
		window.addEventListener('keydown', opToets);

		return () => {
			window.removeEventListener('keydown', opToets);
			intro.opruimen();
		};
	}, []);

	if (!actief) return null;

	return (
		<>
			<div
				id="made-intro"
				className="made-intro"
				ref={wortel}
				suppressHydrationWarning
			>
				<div className="made-intro__achtergrond" />
				<div className="made-intro__toneel" aria-hidden="true">
					<svg
						className="made-intro__svg"
						viewBox="-50 -50 100 100"
						width="100"
						height="100"
						focusable="false"
					>
						<g
							className="made-intro__woord"
							strokeWidth={LIJNDIKTE}
							style={{ opacity: 0 }}
						>
							<g
								className="made-intro__ma"
								style={{
									transform: `translateX(${COMPACT_MA_X}px) translateY(${REGEL_Y}px)`,
								}}
							>
								{MARKETING.letters.map((letter, i) => (
									<Letter key={i} letter={letter} />
								))}
							</g>
							<g
								className="made-intro__de"
								style={{
									transform: `translateX(${COMPACT_DE_X}px) translateY(${REGEL_Y}px)`,
								}}
							>
								{DEVELOPMENT.letters.map((letter, i) => (
									<Letter key={i} letter={letter} />
								))}
							</g>
							<path
								className="made-intro__slash"
								d={LOGO_SLASH}
								transform={`translate(${-LOGO_MIDDEN} ${REGEL_Y})`}
							/>
							<text
								className="made-intro__tagline"
								x="5"
								y="82"
								textAnchor="middle"
								style={{ opacity: 0 }}
							>
								for you
							</text>
						</g>
					</svg>
				</div>
				<button
					type="button"
					className="made-intro__overslaan"
					onClick={() => overslaanRef.current()}
				>
					Overslaan
				</button>
			</div>
			<script dangerouslySetInnerHTML={{ __html: OVERSLAAN_SCRIPT }} />
		</>
	);
};

export default IntroAnimatie;

/* ------------------------------------------------------------ Animatie */

function speelIntro(wortel, klaar) {
	const woord = wortel.querySelector('.made-intro__woord');
	const ma = wortel.querySelector('.made-intro__ma');
	const de = wortel.querySelector('.made-intro__de');
	const slash = wortel.querySelector('.made-intro__slash');
	const tagline = wortel.querySelector('.made-intro__tagline');
	const achtergrond = wortel.querySelector('.made-intro__achtergrond');
	const knop = wortel.querySelector('.made-intro__overslaan');

	const tekenbaar = (groep) =>
		[...groep.querySelectorAll('.made-intro__letter')].map((letter) =>
			svg.createDrawable(letter.querySelectorAll('path')),
		);
	const maTekens = tekenbaar(ma);
	const deTekens = tekenbaar(de);
	const slashTeken = svg.createDrawable(slash);

	/* Maatvoering: de logoschaal in scène 1 en 3, en de kleinere schaal
	   waarop de volledige woorden in scène 2 binnen het scherm passen. */
	const vw = window.innerWidth;
	const gestapeld = vw < STAPEL_BREEDTE;
	const logoSchaal = utils.clamp(vw * 0.62, 150, 440) / LOGO_BREEDTE;
	const scene2Breedte = gestapeld
		? DEVELOPMENT.breedte
		: MARKETING.breedte + WOORDGAT + DEVELOPMENT.breedte;
	const rand = utils.clamp(vw * 0.06, 20, RAND_MAX);
	const woordSchaal = Math.min(logoSchaal, (vw - 2 * rand) / scene2Breedte);

	let maUit;
	let deUit;
	if (gestapeld) {
		const halveRegel = (100 + REGELGAT) / 2;
		maUit = { x: -MARKETING.breedte / 2, y: REGEL_Y - halveRegel };
		deUit = { x: -DEVELOPMENT.breedte / 2, y: REGEL_Y + halveRegel };
	} else {
		const links = -scene2Breedte / 2;
		maUit = { x: links, y: REGEL_Y };
		deUit = { x: links + MARKETING.breedte + WOORDGAT, y: REGEL_Y };
	}

	document.body.classList.add('made-intro-actief');
	utils.set(woord, { scale: logoSchaal, opacity: 1 });

	let overgedragen = false;
	let vlucht = null;
	let paginaInhoud = [];
	let doelLogo = null;

	const tl = createTimeline({
		defaults: { ease: 'inOutQuart' },
		onComplete: () => overdracht(),
	});

	const teken = (tekens, start, tussenpoos, duur) =>
		tekens.forEach((t, i) => {
			tl.add(
				t,
				{ draw: ['0 0', '0 1'], duration: duur, ease: 'out(2.4)' },
				start + i * tussenpoos,
			);
		});

	const wis = (tekens, start, tussenpoos, duur) =>
		[...tekens].reverse().forEach((t, i) => {
			tl.add(
				t,
				{ draw: ['0 1', '0 0'], duration: duur, ease: 'in(1.8)' },
				start + i * tussenpoos,
			);
		});

	/* Scène 1 — MADE tekent zich in. */
	teken([maTekens[0], maTekens[1], deTekens[0], deTekens[1]], 0, 110, 640);
	tl.add(knop, { opacity: [0, 1], duration: 400, ease: 'out(2)' }, 1200);

	/* Scène 2 — uit elkaar en uittypen. */
	const uitElkaar = 1500;
	tl.add(
		ma,
		{ translateX: maUit.x, translateY: maUit.y, duration: 800 },
		uitElkaar,
	)
		.add(
			de,
			{ translateX: deUit.x, translateY: deUit.y, duration: 800 },
			uitElkaar,
		)
		.add(woord, { scale: woordSchaal, duration: 800 }, uitElkaar);

	const typen = uitElkaar + 600;
	teken(maTekens.slice(2), typen, 65, 220);
	teken(deTekens.slice(2), typen + 240, 65, 220);

	/* Scène 3 — wissen, naar elkaar, slash en tagline. */
	const wissen = 4400;
	wis(maTekens.slice(2), wissen, 45, 140);
	wis(deTekens.slice(2), wissen, 45, 140);

	const samen = wissen + 480;
	tl.add(ma, { translateX: LOGO_MA, translateY: REGEL_Y, duration: 800 }, samen)
		.add(de, { translateX: LOGO_DE, translateY: REGEL_Y, duration: 800 }, samen)
		.add(woord, { scale: logoSchaal, duration: 800 }, samen)
		.add(
			slashTeken,
			{ draw: ['0 0', '0 1'], duration: 480, ease: 'out(3)' },
			samen + 380,
		)
		.add(
			tagline,
			{ opacity: [0, 1], translateY: [8, 0], duration: 450, ease: 'out(2)' },
			samen + 820,
		);

	/* Even laten staan voordat de overdracht begint. */
	tl.call(() => {}, samen + 1900);

	/* Scène 4 — het logo vliegt naar de navigatie, de pagina komt tevoorschijn. */
	function overdracht() {
		if (overgedragen) return;
		overgedragen = true;
		tl.pause();

		doelLogo = document.querySelector('.hero__logo svg');
		paginaInhoud = [
			...document.querySelectorAll(
				'.hero__menu, .hero__label, .hero__titel, .hero__intro, .hero__acties, .hero__slash, .hero__beeldvlak',
			),
		];

		/* De hero-elementen dragen ook data-onthul (zie Onthullen.jsx). Haal dat
		   attribuut hier wég in plaats van het op 'zichtbaar' te zetten: zolang
		   het er staat geldt de CSS-transitie van 900ms, en die kruipt achter
		   elke waarde aan die deze tijdlijn schrijft. Je ziet de hero dan al
		   half staan voordat de vlucht hem inanimeert. Zonder attribuut is deze
		   tijdlijn de enige die ze beweegt. */
		paginaInhoud.forEach((el) => {
			el.removeAttribute('data-onthul');
			el.style.removeProperty('--onthul-index');
		});

		utils.set(paginaInhoud, { opacity: 0, translateY: 18 });
		if (doelLogo) doelLogo.style.opacity = '0';

		vlucht = createTimeline({
			defaults: { ease: 'inOutQuart' },
			onComplete: afronden,
		});

		vlucht
			.add(tagline, { opacity: 0, duration: 260, ease: 'out(2)' }, 0)
			.add(knop, { opacity: 0, duration: 260, ease: 'out(2)' }, 0);

		if (doelLogo) {
			const doel = doelLogo.getBoundingClientRect();
			vlucht.add(
				woord,
				{
					translateX: doel.left + doel.width / 2 - window.innerWidth / 2,
					translateY: doel.top + doel.height / 2 - window.innerHeight / 2,
					scale: doel.width / LOGO_BREEDTE,
					duration: 950,
				},
				0,
			);
		} else {
			vlucht.add(
				woord,
				{ scale: logoSchaal * 0.94, opacity: 0, duration: 600 },
				0,
			);
		}

		/* De hero komt als één geheel mee terwijl de overlay wegvalt. Geen
		   stagger hier: de overdracht moet één beweging zijn. De trapsgewijze
		   opbouw per element is er wel bij een bezoek zonder intro, want dan
		   onthult Onthullen.jsx de strook bij het scrollen. */
		vlucht
			.add(achtergrond, { opacity: 0, duration: 620, ease: 'inOutSine' }, 240)
			.add(
				paginaInhoud,
				{ opacity: 1, translateY: 0, duration: 700, ease: 'out(3)' },
				300,
			);
	}

	function herstelPagina() {
		document.body.classList.remove('made-intro-actief');
		if (doelLogo) doelLogo.style.opacity = '';
		paginaInhoud.forEach((el) => {
			el.removeAttribute('data-onthul');
			el.style.opacity = '';
			el.style.transform = '';
		});
	}

	function afronden() {
		herstelPagina();
		klaar();
	}

	function overslaan() {
		if (overgedragen) return;
		tl.seek(tl.duration, true);
		overdracht();
	}

	/* Zet alles terug in de begintoestand. Dat is nodig omdat React in
	   development elk effect twee keer draait: createDrawable leest de
	   stroke-linecap uit de berekende stijl, en als de eerste run daar nog
	   'butt' (voor een leeg pad) in heeft achtergelaten, blijven de letters
	   in de tweede run voorgoed met rechte uiteinden en hoeken staan. */
	function opruimen() {
		tl.revert();
		if (vlucht) vlucht.revert();
		wortel.querySelectorAll('path').forEach((pad) => {
			pad.style.strokeLinecap = '';
			pad.removeAttribute('stroke-dasharray');
			pad.removeAttribute('stroke-dashoffset');
			pad.removeAttribute('pathLength');
		});
		herstelPagina();
	}

	/* Alleen in development: handvat om de tijdlijn vanuit de console te
	   pauzeren en te seeken bij het afstemmen van de timing. */
	if (process.env.NODE_ENV !== 'production') {
		window.__madeIntro = { tijdlijn: tl, overslaan };
	}

	return { overslaan, opruimen };
}
