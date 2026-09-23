/* De beeldmerk-tegel uit het designsysteem: een vierkant met afgeronde hoeken
   en de schuine streep erin. De drie varianten komen uit het huisstijlhandboek;
   het zijn merkkleuren, dus ze wisselen niet per thema. */

const VARIANTEN = {
	nachtgroen: { vlak: 'var(--made-nachtgroen)', slash: 'var(--made-amber)' },
	amber: { vlak: 'var(--made-amber)', slash: 'var(--made-nachtgroen)' },
	krijt: { vlak: 'var(--made-krijt)', slash: 'var(--made-nachtgroen)' },
};

const SLASH = 'M45 92 L75 28';

/* Zonder titel is de tegel decoratief; met titel krijgt hij een naam mee. */
const Beeldmerk = ({ size = 48, variant = 'nachtgroen', titel, className }) => {
	const inkt = VARIANTEN[variant] || VARIANTEN.nachtgroen;

	return (
		<svg
			className={['made-beeldmerk', className].filter(Boolean).join(' ')}
			viewBox="0 0 120 120"
			width={size}
			height={size}
			focusable="false"
			{...(titel ?
				{ role: 'img', 'aria-label': titel }
			:	{ 'aria-hidden': 'true' })}
		>
			<rect
				width={120}
				height={120}
				rx={size < 20 ? 26 : 34}
				fill={inkt.vlak}
			/>
			<path
				d={SLASH}
				fill="none"
				stroke={inkt.slash}
				strokeWidth={21}
				strokeLinecap="round"
			/>
		</svg>
	);
};

export default Beeldmerk;
