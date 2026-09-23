import Link from 'next/link';
import { storyblokEditable } from '@storyblok/react/rsc';
import { isInternal, linkTarget, resolveLink } from '@/lib/links';

const NavLink = ({ blok }) => {
	const href = resolveLink(blok.link) || '#';
	const Tag = isInternal(href) ? Link : 'a';

	return (
		<Tag
			href={href}
			className="made-navlink"
			{...linkTarget(blok.link)}
			{...storyblokEditable(blok)}
		>
			{blok.label}
		</Tag>
	);
};

export default NavLink;
