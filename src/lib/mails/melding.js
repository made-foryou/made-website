import 'server-only';
import {
	alinea,
	bericht,
	escapeHtml,
	inzet,
	inzetLabel,
	knop,
	kop,
	kopbalk,
	label,
	link,
	mail,
	ontvangenOp,
	rijen,
	sectie,
	siteNaam,
	voet,
} from '@/lib/mails/opmaak';

/* De melding voor degene die in het formulier gekozen is (artboard
   MailMelding). Beantwoorden gaat via Reply-To rechtstreeks naar de
   afzender; de knop doet hetzelfde met een mailto. */

export function maakMelding({ waarden, persoon, termijn, basis, ontvangen }) {
	const naam = waarden.naam.trim();
	const email = waarden.email.trim();
	const site = siteNaam(basis);
	const datum = ontvangenOp(ontvangen);
	const belofte =
		termijn ?
			`Op de site beloven we antwoord binnen ${termijn}.`
		:	'Op de site beloven we zo snel mogelijk antwoord.';
	const antwoordLink = `mailto:${email}?subject=${encodeURIComponent(`Re: je bericht via ${site}`)}`;

	const onderwerp = `Nieuw bericht van ${naam} via de site`;

	const kaart = [
		kopbalk(basis, `Voor ${escapeHtml(persoon.naam)}`),
		sectie(
			[
				label('Nieuw bericht via de site'),
				kop(`${escapeHtml(naam)} stuurde je een bericht`),
				`<div style="padding:20px 0 0;">${rijen([
					['Van', escapeHtml(naam)],
					['E-mail', link(`mailto:${email}`, escapeHtml(email))],
					['Ontvangen', escapeHtml(datum)],
				])}</div>`,
			].join(''),
			'40px 40px 28px',
		),
		inzet(inzetLabel('Bericht') + bericht(waarden.bericht, 17)),
		sectie(
			knop(antwoordLink, `Beantwoord ${escapeHtml(naam)}`) +
				alinea(escapeHtml(belofte), { grootte: 13, marge: '14px 0 0' }),
			'32px 40px 40px',
		),
	].join('\n');

	const html = mail({
		titel: onderwerp,
		voorbeeld: waarden.bericht.trim().slice(0, 120),
		kaart,
		onder: voet(basis, [
			`Verstuurd via het contactformulier op ${escapeHtml(site)}.`,
			`Beantwoord je deze mail, dan gaat je antwoord rechtstreeks naar ${escapeHtml(naam)}.`,
		]),
	});

	const tekst = [
		`Voor ${persoon.naam}`,
		'',
		`${naam} stuurde je een bericht`,
		'',
		`Van: ${naam}`,
		`E-mail: ${email}`,
		`Ontvangen: ${datum}`,
		'',
		'Bericht:',
		waarden.bericht.trim(),
		'',
		belofte,
		'',
		'--',
		`Verstuurd via het contactformulier op ${site}.`,
		`Beantwoord je deze mail, dan gaat je antwoord rechtstreeks naar ${naam}.`,
	].join('\n');

	return { onderwerp, html, tekst };
}
