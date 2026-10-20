import 'server-only';
import {
	KOP,
	TEKST,
	afdeling,
	alinea,
	bericht,
	escapeHtml,
	inzet,
	inzetLabel,
	kop,
	kopbalk,
	label,
	link,
	mail,
	persoonsregel,
	rijen,
	sectie,
	siteNaam,
	voet,
} from '@/lib/mails/opmaak';

/* De bevestiging voor wie het formulier invulde (artboard MailBevestiging).
   Hij komt namens de gekozen persoon en gaat bij beantwoorden via Reply-To
   ook naar die persoon. */

export function maakBevestiging({ waarden, persoon, adres, termijn, basis }) {
	const naam = waarden.naam.trim();
	/* "Hoi Sanne", niet "Hoi Sanne de Vries". */
	const voornaam = naam.split(/\s+/)[0];
	const email = waarden.email.trim();
	const wie = persoon.naam;
	const telefoon = String(persoon.telefoon ?? '').trim();
	const site = siteNaam(basis);
	const wanneer = termijn ? `binnen ${termijn}` : 'zo snel mogelijk';
	const aan = [wie, afdeling(persoon).toLowerCase()].filter(Boolean).join(', ');

	const onderwerp = `Je bericht is bij ${wie}`;
	const intro = `Bedankt dat je even schreef. Ik lees het zelf en je hoort ${wanneer} van me. Geen postvak, geen ticketnummer.`;

	const ondertekening = [
		alinea('Groet,', { marge: '0 0 6px' }),
		`<div class="m-inhoud" style="font-family:${KOP};font-size:19px;font-weight:700;line-height:1.25;color:#0e2b26;">${escapeHtml(wie)}</div>`,
		`<div class="m-zwak" style="margin:4px 0 0;font-family:${TEKST};font-size:13px;line-height:1.5;color:#47564f;">${persoonsregel(persoon)}</div>`,
		persoon.email ?
			`<div style="margin:12px 0 0;font-family:${TEKST};font-size:15px;line-height:1.6;">${link(`mailto:${persoon.email}`, escapeHtml(persoon.email))}</div>`
		:	'',
	].join('');

	const kaart = [
		kopbalk(basis),
		sectie(
			[
				label('Bericht ontvangen'),
				kop(`Hoi ${escapeHtml(voornaam)}, je bericht is bij ${escapeHtml(wie)}.`),
				alinea(escapeHtml(intro)),
			].join(''),
			'40px 40px 32px',
		),
		inzet(
			inzetLabel('Dit stuurde je') +
				rijen([
					['Aan', escapeHtml(aan)],
					['Je e-mail', escapeHtml(email)],
				]) +
				`<div style="padding:4px 0 0;">${bericht(waarden.bericht, 15)}</div>`,
		),
		telefoon ?
			sectie(
				alinea(
					`Haast? Bel me gerust op ${link(`tel:${telefoon.replace(/[^+0-9]/g, '')}`, escapeHtml(telefoon))}.`,
					{ marge: '0' },
				),
				'32px 40px 0',
			)
		:	'',
		sectie(ondertekening, '28px 40px 40px'),
	].join('\n');

	const html = mail({
		titel: onderwerp,
		voorbeeld: intro,
		kaart,
		onder: voet(
			basis,
			[
				adres ? `MADE · ${escapeHtml(adres)}` : 'MADE',
				`Je krijgt deze mail omdat je het contactformulier op ${escapeHtml(site)} hebt ingevuld.`,
			],
		),
	});

	const tekst = [
		`Hoi ${voornaam}, je bericht is bij ${wie}.`,
		'',
		intro,
		'',
		'Dit stuurde je',
		`Aan: ${aan}`,
		`Je e-mail: ${email}`,
		'',
		waarden.bericht.trim(),
		'',
		...(telefoon ? [`Haast? Bel me gerust op ${telefoon}.`, ''] : []),
		'Groet,',
		wie,
		String(persoon.label ?? '').trim() ?
			`${persoon.label.trim()} · MADE`
		:	'MADE',
		persoon.email ?? '',
		'',
		'--',
		adres ? `MADE · ${adres}` : 'MADE',
		`Je krijgt deze mail omdat je het contactformulier op ${site} hebt ingevuld.`,
	].join('\n');

	return { onderwerp, html, tekst };
}
