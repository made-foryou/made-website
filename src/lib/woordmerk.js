/* Lettervormen in de stijl van het MADE-woordmerk.

   M, A, D en E zijn letterlijk de paden uit Logo.jsx, verschoven naar x = 0.
   De overige letters zijn in dezelfde geometrie getekend: één lijn van 22,
   ronde uiteinden, kaphoogte van y = 11 tot y = 89 op een regel van 100.
   Ze bestaan alleen voor de intro-animatie ("MARKETING" en "DEVELOPMENT")
   en zijn geen onderdeel van het logo zelf. */

export const LIJNDIKTE = 22;

/* Afstand tussen de hartlijnen van twee opeenvolgende letters, afgelezen van
   de M→A en D→E in het logo (85 → 123 en 380 → 418). */
export const LETTERAFSTAND = 38;

/* Kwartcirkel-benadering voor de ronde letters. */
const K = 0.5523;

const ovaal = (rx, ry) => {
	const cx = rx;
	const cy = 50;
	const kx = K * rx;
	const ky = K * ry;
	return {
		boven: `${cx} ${cy - ry}`,
		links: `0 ${cy}`,
		onder: `${cx} ${cy + ry}`,
		rechts: `${rx * 2} ${cy}`,
		bovenLinks: `C${cx - kx} ${cy - ry} 0 ${cy - ky} 0 ${cy}`,
		linksOnder: `C0 ${cy + ky} ${cx - kx} ${cy + ry} ${cx} ${cy + ry}`,
		onderRechts: `C${cx + kx} ${cy + ry} ${rx * 2} ${cy + ky} ${rx * 2} ${cy}`,
		rechtsBoven: `C${rx * 2} ${cy - ky} ${cx + kx} ${cy - ry} ${cx} ${cy - ry}`,
	};
};

const o = ovaal(34, 39);

export const GLYFEN = {
	M: { breedte: 74, paden: ['M0 89 L0 11 L37 57 L74 11 L74 89'] },
	A: { breedte: 64, paden: ['M0 89 L32 11 L64 89', 'M10 65 L54 65'] },
	D: {
		breedte: 67,
		paden: ['M0 89 L0 11 L33 11 C56 11 67 29 67 50 C67 71 56 89 33 89 Z'],
	},
	E: { breedte: 66, paden: ['M66 11 L0 11 L0 89 L66 89', 'M0 50 L52 50'] },
	R: {
		breedte: 60,
		paden: [
			'M0 89 L0 11 L30 11 C46.6 11 60 21.3 60 34 C60 46.7 46.6 57 30 57 L0 57',
			'M32 57 L60 89',
		],
	},
	K: { breedte: 60, paden: ['M0 89 L0 11', 'M60 11 L0 52', 'M23 36 L60 89'] },
	T: { breedte: 64, paden: ['M0 11 L64 11', 'M32 11 L32 89'] },
	I: { breedte: 0, paden: ['M0 11 L0 89'] },
	N: { breedte: 60, paden: ['M0 89 L0 11 L60 89 L60 11'] },
	G: {
		breedte: 68,
		paden: [
			`M62 28 C57 17 47 11 34 11 ${o.bovenLinks} ${o.linksOnder} ${o.onderRechts} L68 50 L38 50`,
		],
	},
	V: { breedte: 64, paden: ['M0 11 L32 89 L64 11'] },
	L: { breedte: 56, paden: ['M0 11 L0 89 L56 89'] },
	O: {
		breedte: 68,
		paden: [
			`M${o.boven} ${o.bovenLinks} ${o.linksOnder} ${o.onderRechts} ${o.rechtsBoven} Z`,
		],
	},
	P: {
		breedte: 60,
		paden: [
			'M0 89 L0 11 L30 11 C46.6 11 60 21.6 60 35 C60 48.4 46.6 59 30 59 L0 59',
		],
	},
};

/* Letterparen die optisch te los staan door de brede bovenbalk van de T;
   de correctie gaat van de standaardafstand af. */
const KERNING = { ET: -8, TI: -12, NT: -8 };

/* Zet een woord om in letters met hun x-positie (hartlijn) binnen het woord,
   plus de totale breedte van het woord. */
export function zetWoord(woord) {
	let x = 0;
	let vorige = '';
	const letters = [];

	for (const teken of woord) {
		const glyf = GLYFEN[teken];
		if (!glyf) throw new Error(`Geen glyf voor "${teken}"`);
		x += KERNING[vorige + teken] ?? 0;
		letters.push({ teken, x, ...glyf });
		x += glyf.breedte + LETTERAFSTAND;
		vorige = teken;
	}

	return { letters, breedte: x - LETTERAFSTAND };
}

/* Het logo in de viewBox van Logo.jsx (0–495), met de x van de eerste letter
   van elke helft en de slash. De intro tekent alles rond het middelpunt
   (247,5), zodat het één op één op het gerenderde logo past. */
export const LOGO_BREEDTE = 495;
export const LOGO_MIDDEN = LOGO_BREEDTE / 2;
export const LOGO_MA_X = 11;
export const LOGO_DE_X = 313;
export const LOGO_SLASH = 'M236 89 L264 11';
