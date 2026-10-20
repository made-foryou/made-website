'use server';

import { headers } from 'next/headers';
import { getStory } from '@/lib/stories';
import { naarSleutel } from '@/lib/tekst';
import { controleer, uitFormulier } from '@/lib/contactformulier';
import { adres, stuurMail } from '@/lib/postmark';
import { maakMelding } from '@/lib/mails/melding';
import { maakBevestiging } from '@/lib/mails/bevestiging';

/* Verstuurt het contactformulier: een melding naar de gekozen persoon en een
   bevestiging naar de afzender, allebei via Postmark.

   Het mailadres van de ontvanger komt nooit uit het formulier. Het formulier
   stuurt alleen de pagina, de _uid van het contact-blok en de sleutel van de
   persoon mee; hier wordt de persoon in de story zelf opgezocht. Zo blijft
   Storyblok de enige plek waar contactpersonen staan, en kan niemand deze
   action naar een willekeurig adres laten mailen.

   De bevestiging gaat wél naar een adres dat de bezoeker zelf intypt. Tegen
   misbruik daarvan staan er een honeypot, een rate limit per IP en een
   noodrem op het totaal. Die tellers leven in het geheugen van dit proces;
   dat volstaat zolang de site als één `next start` draait. */

const PER_IP = { aantal: 5, venster: 10 * 60 * 1000 };
const TOTAAL = { aantal: 40, venster: 60 * 60 * 1000 };

const perIp = new Map();
let totaal = [];

function magVersturen(ip, nu = Date.now()) {
	const recent = (tijden, venster) => tijden.filter((t) => nu - t < venster);

	totaal = recent(totaal, TOTAAL.venster);
	const eigen = recent(perIp.get(ip) ?? [], PER_IP.venster);

	if (eigen.length >= PER_IP.aantal || totaal.length >= TOTAAL.aantal) {
		perIp.set(ip, eigen);
		return false;
	}

	eigen.push(nu);
	totaal.push(nu);
	perIp.set(ip, eigen);

	/* Verlopen adressen opruimen, zodat de Map niet blijft groeien. */
	if (perIp.size > 500) {
		for (const [sleutel, tijden] of perIp) {
			if (!recent(tijden, PER_IP.venster).length) perIp.delete(sleutel);
		}
	}

	return true;
}

/* X-Real-IP zet Nginx zelf op het adres van de bezoeker. Van
   X-Forwarded-For telt alleen het laatste item: de items ervoor kan de
   bezoeker zelf meesturen. */
function bezoekersIp(kop) {
	const echt = kop.get('x-real-ip')?.trim();
	if (echt) return echt;

	const doorgestuurd = kop.get('x-forwarded-for')?.split(',').at(-1)?.trim();
	return doorgestuurd || 'lokaal';
}

/* Zonder SITE_URL de host van dit verzoek; dan kloppen de afbeeldingen in de
   mail in elk geval op de omgeving waar hij vandaan komt. */
function siteBasis(kop) {
	const ingesteld = String(process.env.SITE_URL ?? '').replace(/\/+$/, '');
	if (ingesteld) return ingesteld;

	const host = kop.get('x-forwarded-host') ?? kop.get('host') ?? 'localhost';
	const protocol = kop.get('x-forwarded-proto') ?? 'https';
	return `${protocol}://${host}`;
}

function zoekBlok(knoop, uid) {
	if (!knoop || typeof knoop !== 'object') return null;
	if (Array.isArray(knoop)) {
		for (const kind of knoop) {
			const gevonden = zoekBlok(kind, uid);
			if (gevonden) return gevonden;
		}
		return null;
	}
	if (knoop._uid === uid && knoop.component === 'contact') return knoop;

	return zoekBlok(Object.values(knoop), uid);
}

async function zoekOntvanger(pagina, blokId, sleutel) {
	const slug = String(pagina ?? '').replace(/^\/+|\/+$/g, '') || 'home';
	if (!/^[a-z0-9/_-]+$/i.test(slug) || !blokId) return null;

	let story;
	try {
		story = await getStory(slug);
	} catch {
		return null;
	}

	const contact = zoekBlok(story?.content, String(blokId));
	const persoon = (contact?.personen ?? []).find(
		(p) => p.naam && naarSleutel(p.naam) === sleutel,
	);
	if (!persoon?.email) return null;

	return { contact, persoon };
}

export async function verstuurContact(vorige, formData) {
	const waarden = uitFormulier(formData);

	/* Een mens ziet het veld "website" niet. Is het ingevuld, dan doen we
	   alsof het gelukt is, zodat een bot er niets van leert. */
	if (String(formData.get('website') ?? '').trim()) {
		return { fase: 'verstuurd', ontvangerNaam: 'ons', email: waarden.email };
	}

	const fouten = controleer(waarden);
	if (Object.keys(fouten).length) {
		return { fase: 'invullen', fouten, waarden };
	}

	const kop = await headers();

	if (!magVersturen(bezoekersIp(kop))) {
		return { fase: 'invullen', waarden, melding: 'te-vaak' };
	}

	const gevonden = await zoekOntvanger(
		formData.get('pagina'),
		formData.get('blok'),
		waarden.ontvanger,
	);
	const afzender = process.env.CONTACT_AFZENDER;

	if (!gevonden || !afzender) {
		console.error(
			'[contact] niet verstuurd:',
			gevonden ? 'CONTACT_AFZENDER ontbreekt' : 'ontvanger niet gevonden',
		);
		return { fase: 'invullen', waarden, melding: 'mislukt' };
	}

	const { contact, persoon } = gevonden;
	const gegevens = {
		waarden,
		persoon,
		adres: String(contact.adres ?? '').trim(),
		termijn: String(contact.antwoord_termijn ?? '').trim(),
		basis: siteBasis(kop),
		ontvangen: new Date(),
	};

	/* Eerst de melding: komt die niet aan, dan is het bericht niet verstuurd
	   en mag de bezoeker het opnieuw proberen. */
	try {
		await stuurMail({
			van: adres('MADE website', afzender),
			aan: adres(persoon.naam, persoon.email),
			antwoordAan: adres(waarden.naam, waarden.email.trim()),
			tag: 'contact-melding',
			...maakMelding(gegevens),
		});
	} catch (fout) {
		console.error('[contact] melding niet verstuurd:', fout.message);
		return { fase: 'invullen', waarden, melding: 'mislukt' };
	}

	/* Een mislukte bevestiging (bijvoorbeeld een adres dat Postmark als
	   inactief kent) houdt het bericht zelf niet tegen. */
	try {
		await stuurMail({
			van: adres(`${persoon.naam} van MADE`, afzender),
			aan: adres(waarden.naam, waarden.email.trim()),
			antwoordAan: adres(persoon.naam, persoon.email),
			tag: 'contact-bevestiging',
			...maakBevestiging(gegevens),
		});
	} catch (fout) {
		console.error('[contact] bevestiging niet verstuurd:', fout.message);
	}

	return {
		fase: 'verstuurd',
		ontvangerNaam: persoon.naam,
		email: waarden.email.trim(),
	};
}
