import { storyblokEditable } from '@storyblok/react/rsc';
import ActieveLink from '@/components/ActieveLink';
import { linkTarget, resolveLink } from '@/lib/links';

const NavLink = ({ blok }) => (
	<ActieveLink
		href={resolveLink(blok.link) || '#'}
		className="made-navlink"
		{...linkTarget(blok.link)}
		{...storyblokEditable(blok)}
	>
		{blok.label}
	</ActieveLink>
);

export default NavLink;
