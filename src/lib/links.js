/* Zet een Storyblok multilink-veld om naar een href. */

export function resolveLink(link) {
	if (!link) return null;

	if (link.linktype === 'email') {
		return link.email ? `mailto:${link.email}` : null;
	}

	if (link.linktype === 'asset' || link.linktype === 'url') {
		return link.url || link.cached_url || null;
	}

	/* linktype 'story': cached_url is het pad binnen de space. */
	const pad = link.cached_url || link.url;
	if (!pad) return link.anchor ? `#${link.anchor}` : null;

	const genormaliseerd = pad === 'home' ? '/' : `/${pad.replace(/^\/+/, '')}`;
	return link.anchor ? `${genormaliseerd}#${link.anchor}` : genormaliseerd;
}

export function linkTarget(link) {
	return link?.target === '_blank' ?
			{ target: '_blank', rel: 'noopener noreferrer' }
		:	{};
}

/* Interne paden gaan via next/link; externe links, mailto's en ankers
   blijven een gewone <a>. */
export function isInternal(href) {
	return typeof href === 'string' && href.startsWith('/');
}
