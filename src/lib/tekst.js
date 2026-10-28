/* Tekst-helpers die in meerdere blokken terugkomen. */

/* "Marketing / Development" — elke schuine streep krijgt de accentkleur.
   Geeft een array terug die React direct kan renderen. */
export function splitsOpSlash(tekst, className) {
	return String(tekst ?? '')
		.split('/')
		.flatMap((deel, index) =>
			index === 0
				? [deel]
				: [
						<span key={`sep-${index}`} className={className}>
							/
						</span>,
						deel,
					],
		);
}

/* Zet het accentwoord in een kop om naar <em>; die kleurt amber via de CSS. */
export function accentueer(titel, accent) {
	const tekst = String(titel ?? '');
	const woord = String(accent ?? '').trim();
	if (!woord) return tekst;

	const positie = tekst.toLowerCase().indexOf(woord.toLowerCase());
	if (positie === -1) return tekst;

	return [
		tekst.slice(0, positie),
		<em key="accent">{tekst.slice(positie, positie + woord.length)}</em>,
		tekst.slice(positie + woord.length),
	];
}

/* Eén item per regel — voor tekstvelden waarin een lijstje wordt getypt. */
export function regels(tekst) {
	return String(tekst ?? '')
		.split('\n')
		.map((regel) => regel.trim())
		.filter(Boolean);
}

/* "Muriël" -> "muriel"; gebruikt als waarde in het contactformulier. */
export function naarSleutel(tekst) {
	return String(tekst ?? '')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/* Een anker-id uit Storyblok; met of zonder # ingevoerd. */
export function anker(waarde) {
	return String(waarde ?? '').replace(/^#/, '') || undefined;
}

/* Lege knopen in een richtext-document: een leeg richtextveld is geen null
   maar een doc met een lege paragraaf. */
const LEGE_KNOPEN = ['doc', 'paragraph', 'heading', 'hard_break'];

/* Of een tekstveld iets bevat; voor platte tekst en voor Storyblok-richtext. */
export function heeftTekst(waarde) {
	if (typeof waarde === 'string') return waarde.trim() !== '';
	if (!waarde || typeof waarde !== 'object') return false;
	if (typeof waarde.text === 'string') return waarde.text.trim() !== '';

	return (
		!LEGE_KNOPEN.includes(waarde.type) ||
		(waarde.content ?? []).some(heeftTekst)
	);
}
