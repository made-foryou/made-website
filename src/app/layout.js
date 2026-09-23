import './globals.css';
import { Instrument_Sans, Nunito } from 'next/font/google';
import StoryblokProvider from '@/components/StoryblokProvider';
import IntroAnimatie from '@/components/IntroAnimatie';
import Onthullen from '@/components/Onthullen';

const nunito = Nunito({
	subsets: ['latin'],
	weight: ['400', '600', '700'],
	variable: '--font-nunito',
	display: 'swap',
});

const instrumentSans = Instrument_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	variable: '--font-instrument-sans',
	display: 'swap',
});

export const metadata = {
	title: 'MADE — marketing & development',
	description:
		'MADE is een fullstack developer en een online marketeer met SEO als vak. Geen bureau, geen accountmanager ertussen: je spreekt altijd degene die het maakt.',
};

export const viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#f3f1e8' },
		{ media: '(prefers-color-scheme: dark)', color: '#0e2b26' },
	],
};

export default function RootLayout({ children }) {
	return (
		<StoryblokProvider>
			<html
				lang="nl"
				className={`${nunito.variable} ${instrumentSans.variable}`}
			>
				<body>
					<IntroAnimatie />
					<Onthullen />
					{children}
				</body>
			</html>
		</StoryblokProvider>
	);
}
