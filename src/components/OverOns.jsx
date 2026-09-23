import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import StrookLabel from '@/components/StrookLabel';
import { anker } from '@/lib/tekst';

/* De Over ons-strook: links het verhaal, rechts de teamkaarten.
   Onder 900px komt het team onder de tekst te staan (zie globals.css). */

const OverOns = ({ blok }) => {
	const kopId = `over-ons-kop-${blok._uid}`;

	return (
		<section
			id={anker(blok.anchor)}
			className="over-ons"
			aria-labelledby={blok.headline ? kopId : undefined}
			{...storyblokEditable(blok)}
		>
			<div className="over-ons__binnen">
				<div className="over-ons__tekst">
					<StrookLabel tekst={blok.label} />

					{blok.headline && (
						<h2 id={kopId} className="over-ons__titel" data-onthul="">
							{blok.headline}
						</h2>
					)}

					{blok.intro && (
						<p className="over-ons__intro" data-onthul="">
							{blok.intro}
						</p>
					)}

					{blok.tekst && (
						<p className="over-ons__alinea" data-onthul="">
							{blok.tekst}
						</p>
					)}

					{blok.buttons?.length > 0 && (
						<div className="over-ons__acties" data-onthul="">
							{blok.buttons.map((nestedBlok) => (
								<StoryblokServerComponent
									blok={nestedBlok}
									key={nestedBlok._uid}
								/>
							))}
						</div>
					)}
				</div>

				{blok.team?.length > 0 && (
					<div className="over-ons__team">
						{blok.team.map((nestedBlok) => (
							<StoryblokServerComponent
								blok={nestedBlok}
								key={nestedBlok._uid}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default OverOns;
