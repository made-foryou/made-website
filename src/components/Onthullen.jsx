'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/* Onthult elementen zodra ze in beeld scrollen.

   Elk element met een data-onthul-attribuut begint verschoven en doorzichtig
   (zie globals.css) en krijgt data-onthul="zichtbaar" op het moment dat het
   de viewport binnenkomt. De overgang zelf zit volledig in CSS; dit component
   doet niets anders dan het attribuut omzetten.

   Elementen die in dezelfde waarneming binnenkomen worden op leesvolgorde
   gesorteerd en krijgen een oplopende --onthul-index, zodat een strook in een
   rustige golf verschijnt in plaats van in één klap. Blokken hoeven daar zelf
   niets voor te regelen: het attribuut volstaat.

   De begintoestand staat in CSS achter `scripting: enabled` en
   `prefers-reduced-motion: no-preference`. Zonder JavaScript of bij minder
   beweging staat alles dus gewoon op zijn plek, en is dit component een
   no-op. */

const OPTIES = {
	/* Pas onthullen als het element een stuk binnen de viewport staat; anders
	   is de animatie al voorbij voordat je het element goed ziet. */
	rootMargin: '0px 0px -12% 0px',
	threshold: 0.12,
};

const MAX_TREDEN = 6;

/* Documentvolgorde: dat is de volgorde waarin een blok bedoeld is om gelezen
   te worden, en die loopt niet in de war bij een element dat rechts staat maar
   hoger begint. IntersectionObserver levert zijn waarnemingen in willekeurige
   volgorde aan. */
function opDocumentvolgorde(a, b) {
	const positie = a.target.compareDocumentPosition(b.target);
	if (positie & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
	if (positie & Node.DOCUMENT_POSITION_PRECEDING) return 1;
	return 0;
}

function toonAlles() {
	document
		.querySelectorAll('[data-onthul]')
		.forEach((el) => el.setAttribute('data-onthul', 'zichtbaar'));
}

const Onthullen = () => {
	const pad = usePathname();

	useEffect(() => {
		const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (stil || typeof IntersectionObserver === 'undefined') {
			toonAlles();
			return undefined;
		}

		const waarnemer = new IntersectionObserver((waarnemingen, zelf) => {
			waarnemingen
				.filter((waarneming) => waarneming.isIntersecting)
				.sort(opDocumentvolgorde)
				.forEach((waarneming, index) => {
					const el = waarneming.target;
					el.style.setProperty(
						'--onthul-index',
						String(Math.min(index, MAX_TREDEN)),
					);
					el.setAttribute('data-onthul', 'zichtbaar');
					zelf.unobserve(el);
				});
		}, OPTIES);

		document
			.querySelectorAll('[data-onthul=""]')
			.forEach((el) => waarnemer.observe(el));

		return () => waarnemer.disconnect();
	}, [pad]);

	return null;
};

export default Onthullen;
