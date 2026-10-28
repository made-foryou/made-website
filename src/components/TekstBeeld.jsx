import Image from 'next/image';
import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookLabel from '@/components/StrookLabel';
import Tekstveld from '@/components/Tekstveld';
import { anker } from '@/lib/tekst';
import { strookKlassen } from '@/lib/stroken';

/* Tekst naast beeld. Met beeld_positie op "links" wisselen de kolommen om;
   dat is de "Beeld naast tekst"-variant uit het ontwerp. Onder 900px staat
   het beeld altijd onder de tekst (zie globals.css).

   Zonder afbeelding blijft het beeldvlak staan als plaatshouder, zodat de
   strook niet verspringt zodra er later een foto bij komt. */

const TekstBeeld = ({ blok }) => {
	const kopId = `tekst-beeld-kop-${blok._uid}`;
	const positie = blok.beeld_positie === 'links' ? 'links' : 'rechts';
	const beeld = blok.beeld?.filename || null;

	return (
		<section
			id={anker(blok.anchor)}
			className={strookKlassen(
				`tekst-beeld tekst-beeld--beeld-${positie}`,
				blok.vlak,
			)}
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="tekst-beeld__binnen">
				<div className="tekst-beeld__tekst">
					<StrookLabel tekst={blok.label} />

					{blok.headline && (
						<h2 id={kopId} className="tekst-beeld__titel" data-onthul="">
							{blok.headline}
						</h2>
					)}

					<Tekstveld
						waarde={blok.tekst}
						className="tekst-beeld__alinea"
						data-onthul=""
					/>

					{blok.buttons?.length > 0 && (
						<div className="tekst-beeld__acties" data-onthul="">
							{blok.buttons.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					)}
				</div>

				<div className="tekst-beeld__beeld" data-onthul="">
					{beeld ? (
						<Image
							src={beeld}
							alt={blok.beeld?.alt || ''}
							fill
							sizes="(max-width: 900px) 100vw, 656px"
							className="tekst-beeld__foto"
						/>
					) : (
						<span className="tekst-beeld__plaatshouder" aria-hidden="true">
							{blok.label || 'Afbeelding'}
						</span>
					)}
				</div>
			</div>
		</section>
	);
};

export default TekstBeeld;
