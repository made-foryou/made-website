import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { accentueer, regels, splitsOpSlash } from '@/lib/tekst';

/* Eén prijskaart. De kenmerken worden als één per regel ingevoerd.
   Een uitgelicht pakket staat op nachtgroen en steekt iets uit; de kleuren
   daarvan lopen via de --made-uitgelicht-tokens, zodat het donkere thema
   vanzelf meekomt. */

const Vink = () => (
	<svg viewBox="0 0 24 24" className="pakket__vink" aria-hidden="true">
		<path
			d="M5 13 L10 18 L19 7"
			fill="none"
			strokeWidth={3}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const Pakket = ({ blok }) => {
	const uitgelicht = Boolean(blok.uitgelicht);
	const kenmerken = regels(blok.kenmerken);

	return (
		<article
			className={`pakket${uitgelicht ? ' pakket--uitgelicht' : ''}`}
			data-onthul=""
			{...storyblokEditable(blok)}
		>
			{uitgelicht && blok.badge && (
				<div className="pakket__badge">{blok.badge}</div>
			)}

			<div className="pakket__kop">
				{blok.label && (
					<div className="pakket__label">
						{splitsOpSlash(blok.label, 'pakket__scheiding')}
					</div>
				)}

				{blok.titel && (
					<h3 className="pakket__titel">
						{accentueer(blok.titel, blok.titel_accent)}
					</h3>
				)}
			</div>

			{(blok.prijs || blok.prijs_toelichting) && (
				<div className="pakket__prijs">
					{blok.prijs && <div className="pakket__bedrag">{blok.prijs}</div>}
					{blok.prijs_toelichting && (
						<div className="pakket__toelichting">{blok.prijs_toelichting}</div>
					)}
				</div>
			)}

			{kenmerken.length > 0 && (
				<ul className="pakket__kenmerken">
					{kenmerken.map((kenmerk) => (
						<li className="pakket__kenmerk" key={kenmerk}>
							<Vink />
							<span>{kenmerk}</span>
						</li>
					))}
				</ul>
			)}

			{blok.buttons?.length > 0 && (
				<div className="pakket__actie">
					{blok.buttons.map((nestedBlok) => (
						<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
					))}
				</div>
			)}
		</article>
	);
};

export default Pakket;
