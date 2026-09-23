import Link from 'next/link';
import { storyblokEditable } from '@storyblok/react/rsc';
import { isInternal, linkTarget, resolveLink } from '@/lib/links';

const VARIANTEN = ['primair', 'secundair', 'link'];

const Button = ({ blok }) => {
	const variant =
		VARIANTEN.includes(blok.variant) ? blok.variant : 'primair';
	const className = `made-knop made-knop--${variant}`;
	const href = resolveLink(blok.link);

	if (!href) {
		return (
			<button type="button" className={className} {...storyblokEditable(blok)}>
				{blok.label}
			</button>
		);
	}

	const Tag = isInternal(href) ? Link : 'a';

	return (
		<Tag
			href={href}
			className={className}
			{...linkTarget(blok.link)}
			{...storyblokEditable(blok)}
		>
			{blok.label}
		</Tag>
	);
};

export default Button;
