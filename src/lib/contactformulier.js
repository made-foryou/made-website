/* Controle van het contactformulier. Het formulier en de server action
   gebruiken allebei dit bestand, zodat een melding op beide plekken gelijk
   is; er mag dus geen server-only code in. De teksten komen letterlijk uit
   het ontwerp (canvas "Hero strook Made", artboard ContactFouten). */

/* Ook de maxLength op de velden; de server controleert het opnieuw. */
export const MAX = { naam: 120, email: 254, bericht: 5000 };

/* De volgorde waarin de velden op het scherm staan. De focus springt naar
   het eerste veld in deze volgorde dat een fout heeft. */
export const VELDEN = ['ontvanger', 'naam', 'email', 'bericht'];

export const LEEG = { ontvanger: '', naam: '', email: '', bericht: '' };

/* Eén @ en geen tekens die in een adresregel iets anders betekenen (komma,
   puntkomma, haken, aanhalingstekens). Zo kan niemand via het veld een
   tweede ontvanger aan de mail hangen. */
const EMAIL = /^[^\s@,;<>"()[\]\\]+@[^\s@,;<>"()[\]\\]+\.[^\s@,;<>"()[\]\\]+$/;

export function uitFormulier(formData) {
	return Object.fromEntries(
		VELDEN.map((veld) => [veld, String(formData.get(veld) ?? '')]),
	);
}

export function controleer(waarden) {
	const fouten = {};
	const naam = String(waarden.naam ?? '').trim();
	const email = String(waarden.email ?? '').trim();
	const bericht = String(waarden.bericht ?? '').trim();

	if (!waarden.ontvanger) fouten.ontvanger = 'Kies naar wie je bericht gaat.';

	if (!naam) fouten.naam = 'Vul je naam in.';
	else if (naam.length > MAX.naam) {
		fouten.naam = `Hou je naam onder de ${MAX.naam} tekens.`;
	}

	if (!email) fouten.email = 'Vul je e-mailadres in.';
	else if (email.length > MAX.email || !EMAIL.test(email)) {
		fouten.email = 'Vul een geldig e-mailadres in, zoals naam@bedrijf.nl.';
	}

	if (!bericht) fouten.bericht = 'Schrijf kort waar we je mee kunnen helpen.';
	else if (bericht.length > MAX.bericht) {
		fouten.bericht = `Hou je bericht onder de ${MAX.bericht} tekens, of mail ons direct.`;
	}

	return fouten;
}

export function samenvatting(aantal) {
	return aantal === 1 ?
			'Nog 1 ding om in te vullen.'
		:	`Nog ${aantal} dingen om in te vullen.`;
}
