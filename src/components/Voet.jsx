import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { splitsOpSlash } from '@/lib/tekst';

/* De voet van de pagina. Staat altijd op het diepste nachtgroen; de
   logokleuren wisselen mee via de tokens in globals.css, dus het woordmerk
   hoeft hier geen aparte variant te zijn. */

const Voet = ({ blok }) => {
	const logoBreedte = Number(blok.logo_width) || 200;

	return (
		<footer className="voet" {...storyblokEditable(blok)}>
			<div className="voet__binnen">
				<div className="voet__boven">
					<div className="voet__merk">
						<Link
							href="/"
							className="voet__logo"
							aria-label="MADE — naar de homepage"
						>
							<Logo width={logoBreedte} tagline={false} />
						</Link>

						{blok.tekst && <p className="voet__tekst">{blok.tekst}</p>}
					</div>

					{blok.kolommen?.length > 0 && (
						<div className="voet__kolommen">
							{blok.kolommen.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					)}
				</div>

				<div className="voet__onder">
					{blok.copyright && (
						<p className="voet__copyright">
							{splitsOpSlash(blok.copyright, 'voet__scheiding')}
						</p>
					)}

					{blok.onderlinks?.length > 0 && (
						<div className="voet__onderlinks">
							{blok.onderlinks.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</footer>
	);
};

export default Voet;
