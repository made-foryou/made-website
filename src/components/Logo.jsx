/* Het MADE-woordmerk. De paden komen uit het designsysteem; de kleuren lopen
   via CSS-variabelen, zodat het logo in het donkere thema vanzelf omslaat naar
   de omgekeerde variant (krijt woordmerk, amber-licht slash). */

const WOORDMERK = [
	'M11 89 L11 11 L48 57 L85 11 L85 89',
	'M123 89 L155 11 L187 89',
	'M133 65 L177 65',
	'M313 89 L313 11 L346 11 C369 11 380 29 380 50 C380 71 369 89 346 89 Z',
	'M484 11 L418 11 L418 89 L484 89',
	'M418 50 L470 50',
];

const SLASH = 'M236 89 L264 11';

const Logo = ({ width = 260, tagline = true, className }) => {
	const hoogte = Math.round(((width * 100) / 495) * 10) / 10;

	const woordmerk = (
		<svg
			viewBox="0 0 495 100"
			width={width}
			height={hoogte}
			role="img"
			aria-label="MADE"
			focusable="false"
		>
			<g
				fill="none"
				stroke="var(--made-logo-woord)"
				strokeWidth={22}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{WOORDMERK.map((d) => (
					<path key={d} d={d} />
				))}
			</g>
			<path
				d={SLASH}
				fill="none"
				stroke="var(--made-logo-slash)"
				strokeWidth={22}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);

	return (
		<span className={['made-logo', className].filter(Boolean).join(' ')}>
			{woordmerk}
			{tagline && (
				<span
					className="made-logo__tagline"
					style={{ fontSize: `${width * 0.046}px` }}
				>
					for you
				</span>
			)}
		</span>
	);
};

export default Logo;
