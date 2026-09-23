/* Elke strook kan op een ander vlak staan. De klasse zet alleen de rollen om
   (zie globals.css); componenten blijven zo dezelfde markup houden. */

const VLAKKEN = {
	verhoogd: 'strook--verhoogd',
	nachtgroen: 'strook--nachtgroen',
};

export function strookKlassen(basis, vlak) {
	const modifier = VLAKKEN[vlak];
	return modifier ? `${basis} ${modifier}` : basis;
}
