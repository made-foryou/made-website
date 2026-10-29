'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isInternal, linkCurrent } from '@/lib/links';

/* De <a> van een NavLink. Een server component kan het huidige pad niet
   lezen, dus alleen dit stuk draait client-side; zo schuift de actieve link
   ook mee bij navigeren via next/link. */

const ActieveLink = ({ href, ...props }) => {
	const pathname = usePathname();
	const Tag = isInternal(href) ? Link : 'a';

	return <Tag href={href} {...linkCurrent(href, pathname)} {...props} />;
};

export default ActieveLink;
