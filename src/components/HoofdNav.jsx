import Link from 'next/link';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import Logo from '@/components/Logo';

/* Het logo met het menu ernaast. Geen eigen blok: de hero en de
   navigatiestrook renderen allebei deze component, zodat de intro (scène 4)
   op beide het logo vindt via .hoofdnav__logo. */

const HoofdNav = ({ items, logoBreedte }) => (
	<nav className="hoofdnav" aria-label="Hoofdmenu">
		<Link
			href="/"
			className="hoofdnav__logo"
			aria-label="MADE — naar de homepage"
		>
			<Logo width={Number(logoBreedte) || 150} tagline={false} />
		</Link>
		<div className="hoofdnav__menu" data-onthul="">
			{items?.map((nestedBlok) => (
				<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
			))}
		</div>
	</nav>
);

export default HoofdNav;
