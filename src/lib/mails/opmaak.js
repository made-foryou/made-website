import 'server-only';

/* Gedeelde opmaak van de mails uit het contactformulier. De ontwerpen staan
   in het canvas "Hero strook Made" (MailMelding*, MailBevestiging*), in Krijt
   en Nachtgroen.

   Mail is geen web: alles staat in tabellen met inline stijlen, want Gmail
   en Outlook negeren veel van wat in een <style> staat. Het lichte thema
   staat inline; het donkere zit in één @media (prefers-color-scheme: dark)
   die via de m-*-klassen de kleuren omzet. Apple Mail en Outlook voor Mac/iOS
   volgen dat; Gmail en Outlook.com kleuren zelf om. Het logo en het beeldmerk
   zijn PNG's (Gmail toont geen SVG) en staan er per thema in een eigen
   variant in. */

export const KOP = "'Nunito','Trebuchet MS',Arial,sans-serif";
export const TEKST = "'Instrument Sans','Segoe UI',Helvetica,Arial,sans-serif";

/* De rollen uit globals.css, uitgeschreven: var() werkt niet in mail. */
const KLEUR = {
	buiten: '#f3f1e8',
	vlak: '#fbfaf5',
	inzet: '#f3f1e8',
	inhoud: '#0e2b26',
	zwak: '#47564f',
	link: '#8a6210',
	rand: '#dedbcd',
	accent: '#be8a1c',
	opAccent: '#0e2b26',
};

const STIJL = `
:root { color-scheme: light dark; supported-color-schemes: light dark; }
body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
a { color: ${KLEUR.link}; }
@media (max-width: 620px) {
	.m-buiten-cel { padding: 24px 12px !important; }
	.m-pad { padding-left: 24px !important; padding-right: 24px !important; }
	.m-inzet-cel { padding: 20px !important; }
	.m-kop { font-size: 24px !important; }
}
@media (prefers-color-scheme: dark) {
	.m-buiten { background: #0e2b26 !important; }
	.m-vlak { background: #1b3d36 !important; }
	.m-inzet { background: #0e2b26 !important; }
	.m-inhoud { color: #f3f1e8 !important; }
	.m-zwak { color: #a9b6b1 !important; }
	.m-link { color: #d9a63a !important; }
	.m-rand { border-color: #0e2b26 !important; }
	.m-pil { background: #f3f1e8 !important; color: #0e2b26 !important; }
	.m-licht { display: none !important; }
	.m-donker { display: block !important; max-height: none !important; }
}`;

export function escapeHtml(tekst) {
	return String(tekst ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/* Een bericht met regeleinden; white-space: pre-line kent niet elke client. */
export function metRegels(tekst) {
	return escapeHtml(String(tekst ?? '').trim()).replace(/\r?\n/g, '<br>');
}

const TIJDZONE = 'Europe/Amsterdam';

/* "19 oktober 2026 om 14:05" */
export function ontvangenOp(datum) {
	const dag = new Intl.DateTimeFormat('nl-NL', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: TIJDZONE,
	}).format(datum);
	const tijd = new Intl.DateTimeFormat('nl-NL', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: TIJDZONE,
	}).format(datum);

	return `${dag} om ${tijd}`;
}

/* "made-foryou.nl" uit de site-URL. */
export function siteNaam(basis) {
	try {
		return new URL(basis).host.replace(/^www\./, '');
	} catch {
		return 'made-foryou.nl';
	}
}

/* Het label van een contactpersoon is "DE / Development"; de mail gebruikt
   het deel na de slash ("Menno, development"). */
export function afdeling(persoon) {
	const delen = String(persoon.label ?? '').split('/');
	return delen.length > 1 ? delen.at(-1).trim() : '';
}

/* "DE / Development · MADE", met de slash in de linkkleur. */
export function persoonsregel(persoon) {
	const label = String(persoon.label ?? '').trim();
	if (!label) return 'MADE';

	const delen = label.split('/').map((deel) => escapeHtml(deel.trim()));
	const slash = `<span class="m-link" style="color:${KLEUR.link};">/</span>`;
	return `${delen.join(` ${slash} `)} · MADE`;
}

export function label(tekst) {
	return `<div class="m-zwak" style="margin:0 0 16px;font-family:${TEKST};font-size:12px;font-weight:500;line-height:1.4;letter-spacing:0.14em;text-transform:uppercase;color:${KLEUR.zwak};">${tekst}</div>`;
}

export function kop(tekst) {
	return `<h1 class="m-inhoud m-kop" style="margin:0;font-family:${KOP};font-size:28px;font-weight:700;line-height:1.2;letter-spacing:-0.015em;color:${KLEUR.inhoud};">${tekst}</h1>`;
}

export function alinea(html, { grootte = 17, marge = '16px 0 0' } = {}) {
	return `<p class="m-zwak" style="margin:${marge};font-family:${TEKST};font-size:${grootte}px;line-height:1.6;color:${KLEUR.zwak};">${html}</p>`;
}

export function link(href, tekst) {
	return `<a class="m-link" href="${escapeHtml(href)}" style="color:${KLEUR.link};text-decoration:underline;text-underline-offset:3px;">${tekst}</a>`;
}

/* Het rijtje "Van / E-mail / Ontvangen": label in de kopletter, waarde zwak. */
export function rijen(paren) {
	const tr = paren
		.map(
			([naam, waarde]) =>
				`<tr><td class="m-inhoud" width="96" valign="top" style="width:96px;padding:0 12px 4px 0;font-family:${KOP};font-size:15px;font-weight:600;line-height:1.6;color:${KLEUR.inhoud};">${naam}</td><td class="m-zwak" valign="top" style="padding:0 0 4px;font-family:${TEKST};font-size:15px;line-height:1.6;color:${KLEUR.zwak};">${waarde}</td></tr>`,
		)
		.join('');

	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${tr}</table>`;
}

/* Het ingezette vlak met het bericht, op de buitenkleur. */
export function inzet(inhoud) {
	return `<tr><td class="m-pad" style="padding:0 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="m-inzet m-inzet-cel" style="padding:24px;background:${KLEUR.inzet};border-radius:16px;">${inhoud}</td></tr></table></td></tr>`;
}

export function inzetLabel(tekst) {
	return `<div class="m-zwak" style="margin:0 0 10px;font-family:${TEKST};font-size:12px;font-weight:500;line-height:1.4;letter-spacing:0.14em;text-transform:uppercase;color:${KLEUR.zwak};">${tekst}</div>`;
}

export function bericht(tekst, grootte) {
	return `<p class="m-inhoud" style="margin:0;font-family:${TEKST};font-size:${grootte}px;line-height:1.6;color:${KLEUR.inhoud};">${metRegels(tekst)}</p>`;
}

/* Amber knop; dezelfde kleuren in beide thema's, net als op de site. */
export function knop(href, tekst) {
	return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:10px;background:${KLEUR.accent};"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 24px;font-family:${KOP};font-size:15px;font-weight:700;line-height:1;color:${KLEUR.opAccent};text-decoration:none;border-radius:10px;">${tekst}</a></td></tr></table>`;
}

/* Twee <img>'s: de lichte staat aan, de donkere gaat aan onder
   prefers-color-scheme: dark. Outlook (mso) krijgt alleen de lichte. */
function beeldPaar({ licht, donker, breedte, hoogte, alt }) {
	return `<img class="m-licht" src="${licht}" width="${breedte}" height="${hoogte}" alt="${alt}" style="display:block;border:0;outline:none;width:${breedte}px;height:${hoogte}px;"><!--[if !mso]><!--><img class="m-donker" src="${donker}" width="${breedte}" height="${hoogte}" alt="${alt}" style="display:none;max-height:0;overflow:hidden;border:0;outline:none;width:${breedte}px;height:${hoogte}px;"><!--<![endif]-->`;
}

export function kopbalk(basis, pil) {
	const logo = beeldPaar({
		licht: `${basis}/mail/logo.png`,
		donker: `${basis}/mail/logo-omgekeerd.png`,
		breedte: 132,
		hoogte: 27,
		alt: 'MADE',
	});
	const pilCel =
		pil ?
			`<td align="right" valign="middle"><span class="m-pil" style="display:inline-block;padding:7px 14px;background:${KLEUR.inhoud};color:${KLEUR.buiten};border-radius:999px;font-family:${KOP};font-size:12px;font-weight:700;line-height:1;letter-spacing:0.08em;">${pil}</span></td>`
		:	'';

	return `<tr><td class="m-pad m-rand" style="padding:30px 40px;border-bottom:1px solid ${KLEUR.rand};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">${logo}</td>${pilCel}</tr></table></td></tr>`;
}

/* Onder de kaart: het beeldmerk en een paar regels klein. */
export function voet(basis, regels) {
	const beeldmerk = beeldPaar({
		licht: `${basis}/mail/beeldmerk.png`,
		donker: `${basis}/mail/beeldmerk-krijt.png`,
		breedte: 32,
		hoogte: 32,
		alt: '',
	});
	const tekst = regels
		.map(
			(regel) =>
				`<p class="m-zwak" style="margin:10px 0 0;font-family:${TEKST};font-size:13px;line-height:1.5;color:${KLEUR.zwak};">${regel}</p>`,
		)
		.join('');

	return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center">${beeldmerk}</td></tr></table>${tekst}`;
}

/* De hele mail. `kaart` zijn de <tr>'s binnen de kaart, `onder` staat eronder. */
export function mail({ titel, voorbeeld, kaart, onder }) {
	/* Opvulling na de voorbeeldtekst, zodat de inbox er niet het begin van
	   de mail achter plakt. */
	const vulling = '&#847;&zwnj;&nbsp;'.repeat(60);

	return `<!doctype html>
<html lang="nl" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(titel)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700&amp;family=Instrument+Sans:wght@400;500;600&amp;display=swap">
<style>${STIJL}</style>
</head>
<body class="m-buiten" style="margin:0;padding:0;background:${KLEUR.buiten};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(voorbeeld)}${vulling}</div>
<table role="presentation" class="m-buiten" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${KLEUR.buiten};">
<tr><td class="m-buiten-cel" align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
<tr><td class="m-vlak" style="background:${KLEUR.vlak};border-radius:16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${kaart}
</table>
</td></tr>
<tr><td align="center" style="padding:28px 0 0;text-align:center;">${onder}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/* Een blok tekst binnen de kaart, met de horizontale marge van het ontwerp. */
export function sectie(inhoud, padding) {
	return `<tr><td class="m-pad" style="padding:${padding};">${inhoud}</td></tr>`;
}
