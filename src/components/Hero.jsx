import Link from 'next/link';
import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import Logo from '@/components/Logo';
import Beeldmerk from '@/components/Beeldmerk';
import Tekstveld from '@/components/Tekstveld';
import { accentueer, splitsOpSlash } from '@/lib/tekst';

const Slash = ({ positie }) => (
	<svg
		viewBox="0 0 250 500"
		className={`hero__slash hero__slash--${positie}`}
		data-onthul=""
		aria-hidden="true"
	>
		<path
			d="M55 445 L195 55"
			strokeWidth={110}
			strokeLinecap="round"
			fill="none"
		/>
	</svg>
);

const Hero = ({ blok }) => {
	const toonNav = blok.show_nav !== false;
	/* Twee beeldkanten: de twee losse slashes, of het nachtgroen vlak met de
	   slash die eruit loopt en het beeldmerk erin. */
	const opVlak = blok.beeld_variant === 'vlak';
	const logoBreedte = Number(blok.logo_width) || 150;
	const slashHoogte = Number(blok.slash_size) || 480;

	return (
		<section
			className="hero"
			style={{ '--hero-slash-hoogte': `${slashHoogte}px` }}
			{...storyblokEditable(blok)}
		>
			{toonNav && (
				<div className="hero__binnen">
					<nav className="hero__nav" aria-label="Hoofdmenu">
						<Link
							href="/"
							className="hero__logo"
							aria-label="MADE — naar de homepage"
						>
							<Logo width={logoBreedte} tagline={false} />
						</Link>
						<div className="hero__menu" data-onthul="">
							{blok.nav_items?.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					</nav>
				</div>
			)}

			<div className="hero__binnen hero__strook">
				<div className="hero__tekst">
					{blok.label && (
						<div className="hero__label" data-onthul="">
							{splitsOpSlash(blok.label, 'hero__label-scheiding')}
						</div>
					)}

					<h1 className="hero__titel" data-onthul="">
						{accentueer(blok.headline, blok.headline_accent)}
					</h1>

					<Tekstveld
						waarde={blok.intro}
						className="hero__intro"
						data-onthul=""
					/>

					{blok.buttons?.length > 0 && (
						<div className="hero__acties" data-onthul="">
							{blok.buttons.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					)}
				</div>

				<div className="hero__beeld" aria-hidden={opVlak ? undefined : 'true'}>
					{opVlak ?
						<div className="hero__beeldvlak" data-onthul="">
							<svg
								className="hero__vlakslash"
								viewBox="0 0 250 500"
								aria-hidden="true"
							>
								<path
									d="M55 445 L195 55"
									strokeWidth={110}
									strokeLinecap="round"
									fill="none"
								/>
							</svg>

							{blok.beeld_label && (
								<div className="hero__vlaklabel">
									{splitsOpSlash(
										blok.beeld_label,
										'hero__vlaklabel-scheiding',
									)}
								</div>
							)}

							{blok.toon_beeldmerk !== false && (
								<Beeldmerk
									className="hero__vlakmerk"
									size={72}
									variant="krijt"
								/>
							)}
						</div>
					:	<>
							<Slash positie="achter" />
							<Slash positie="voor" />
						</>
					}
				</div>
			</div>
		</section>
	);
};

export default Hero;
