import { animate, createTimeline, stagger, svg, utils } from 'animejs';

/* De beweging tussen de states van het contactformulier (ContactFormulier.jsx).
   Kleine overgangen staan in CSS: het openklappen van meldingen en het
   inkomen van gewisselde tekst. Hier staat alleen wat CSS niet kan: hoogte
   en breedte meeveren met nieuwe inhoud, en het ene georkestreerde moment,
   het verstuurd-scherm, waarin het vinkje zichzelf tekent zoals de letters in
   de intro.

   Animeer nooit opacity of transform van het <form> zelf: dat draagt
   data-onthul, en de CSS-transitie daarvan kruipt dan achter anime.js aan.
   Het formulier krijgt hier alleen een height-tween. */

export function minderBeweging() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* De knop wordt breder of smaller als zijn tekst wisselt; laat hem meeveren
   vanaf de breedte die hij net had. */
export function veerBreedte(el, van) {
	const naar = el.offsetWidth;
	if (!van || Math.abs(naar - van) < 1) return null;

	return animate(el, {
		width: [`${van}px`, `${naar}px`],
		duration: 260,
		ease: 'out(3)',
		onComplete: () => {
			el.style.width = '';
		},
	});
}

/* Een korte duw, als iemand opnieuw verstuurt terwijl de melding al staat. */
export function duw(el) {
	return animate(el, {
		translateX: [0, -3, 3, -2, 2, 0],
		duration: 320,
		ease: 'inOut(2)',
	});
}

/* De huidige inhoud vervaagt omhoog voordat er een andere state komt. */
export function verdwijn(elementen, klaar) {
	return animate(elementen, {
		opacity: [1, 0],
		translateY: [0, -8],
		duration: 180,
		delay: stagger(30),
		ease: 'in(2)',
		onComplete: klaar,
	});
}

/* createDrawable zet pathLength en dash-attributen op het pad en leest de
   stroke-linecap uit de berekende stijl. Zet alles terug, anders houdt een
   tweede run (StrictMode) een vinkje met rechte uiteinden over; zie
   opruimen() in IntroAnimatie.jsx. */
function herstelPad(pad) {
	pad.style.strokeLinecap = '';
	pad.removeAttribute('stroke-dasharray');
	pad.removeAttribute('stroke-dashoffset');
	pad.removeAttribute('pathLength');
}

/* Na een wissel van state: het formulier veert van zijn oude hoogte naar de
   nieuwe, en de nieuwe inhoud komt trapsgewijs op. Met `vink` erbij is dit
   het verstuurd-moment: de groene schijf veert in en het vinkje tekent
   zichzelf. Geeft { tijdlijn, opruimen } terug. */
export function komBinnen({ formulier, vanHoogte, elementen, vink, klaar }) {
	const naarHoogte = formulier.offsetHeight;
	const veert = vanHoogte && Math.abs(vanHoogte - naarHoogte) > 1;
	const pad = vink?.querySelector('path');
	const lijn = pad ? svg.createDrawable(pad) : null;
	const verborgen = [...elementen, ...(vink ? [vink] : [])];

	/* De begintoestand meteen zetten, nog in de layout-effect: de tijdlijn
	   begint pas op de volgende frame, en anders zie je één frame lang de
	   nieuwe inhoud op zijn nieuwe hoogte. */
	if (veert) utils.set(formulier, { height: `${vanHoogte}px` });
	utils.set(elementen, { opacity: 0, translateY: 12 });
	if (vink) utils.set(vink, { opacity: 0, scale: 0.6 });
	if (lijn) utils.set(lijn, { draw: '0 0' });

	/* Na afloop terug naar de stijlen uit CSS: hetzelfde beeld, zonder
	   achtergebleven inline stijlen. revert() alleen is niet genoeg, want dat
	   zet terug naar wat utils.set hierboven neerzette. */
	function opruimen() {
		tijdlijn.revert();
		formulier.style.height = '';
		for (const el of verborgen) {
			el.style.opacity = '';
			el.style.transform = '';
		}
		if (pad) herstelPad(pad);
	}

	const tijdlijn = createTimeline({
		onComplete: () => {
			opruimen();
			klaar?.();
		},
	});

	if (veert) {
		tijdlijn.add(
			formulier,
			{
				height: [`${vanHoogte}px`, `${naarHoogte}px`],
				duration: 480,
				ease: 'out(4)',
			},
			0,
		);
	}

	const start = vink ? 300 : 120;

	if (vink) {
		tijdlijn.add(
			vink,
			{ opacity: 1, scale: 1, duration: 420, ease: 'outBack(1.6)' },
			120,
		);
		tijdlijn.add(lijn, { draw: '0 1', duration: 380, ease: 'inOut(2)' }, 260);
	}

	tijdlijn.add(
		elementen,
		{
			opacity: 1,
			translateY: 0,
			duration: 520,
			ease: 'out(4)',
			delay: stagger(60),
		},
		start,
	);

	return { tijdlijn, opruimen };
}
