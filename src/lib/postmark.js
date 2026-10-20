import 'server-only';

/* Eén mail versturen via de Postmark API. Bewust zonder SDK: het is één
   POST. Open- en linktracking staan uit; onder het formulier beloven we dat
   we gegevens alleen gebruiken om te antwoorden.

   POSTMARK_SERVER_TOKEN is de token van de Postmark-server. Met de token
   POSTMARK_API_TEST controleert Postmark het verzoek wel, maar verstuurt het
   niets; handig in development.

   POSTMARK_MESSAGE_STREAM is de ID van de transactionele message stream
   waarlangs de mails gaan. Hij is verplicht en valt bewust niet terug op
   Postmarks standaardstream 'outbound': zo komt het contactformulier nooit
   ongemerkt tussen andere mail terecht. */

const ENDPOINT = 'https://api.postmarkapp.com/email';

export class PostmarkFout extends Error {
	constructor(code, melding) {
		super(`Postmark ${code}: ${melding}`);
		this.name = 'PostmarkFout';
		this.code = code;
	}
}

/* '"Naam" <adres>'. De naam komt deels uit het formulier, dus alles wat de
   adresregel zou kunnen breken gaat eruit. */
export function adres(naam, email) {
	const schoon = String(naam ?? '')
		.replace(/["<>\\\r\n]/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	return schoon ? `"${schoon}" <${email}>` : email;
}

export async function stuurMail({
	van,
	aan,
	antwoordAan,
	onderwerp,
	html,
	tekst,
	tag,
}) {
	const token = process.env.POSTMARK_SERVER_TOKEN;
	const stream = process.env.POSTMARK_MESSAGE_STREAM;
	if (!token || !stream) {
		throw new PostmarkFout(
			'config',
			`${token ? 'POSTMARK_MESSAGE_STREAM' : 'POSTMARK_SERVER_TOKEN'} ontbreekt`,
		);
	}

	let antwoord;
	try {
		antwoord = await fetch(ENDPOINT, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Postmark-Server-Token': token,
			},
			body: JSON.stringify({
				From: van,
				To: aan,
				ReplyTo: antwoordAan,
				Subject: onderwerp,
				HtmlBody: html,
				TextBody: tekst,
				Tag: tag,
				MessageStream: stream,
				TrackOpens: false,
				TrackLinks: 'None',
			}),
			cache: 'no-store',
			signal: AbortSignal.timeout(10_000),
		});
	} catch (fout) {
		throw new PostmarkFout('netwerk', fout.message);
	}

	const data = await antwoord.json().catch(() => ({}));
	if (!antwoord.ok || data.ErrorCode) {
		throw new PostmarkFout(
			data.ErrorCode ?? antwoord.status,
			data.Message ?? antwoord.statusText,
		);
	}

	return data.MessageID;
}
