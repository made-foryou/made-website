import Image from 'next/image';
import { storyblokEditable } from '@storyblok/react/rsc';
import { splitsOpSlash } from '@/lib/tekst';

/* Eén kaart in de Over ons-strook: portret, rol, naam en een korte tekst.
   Zonder foto blijft de verhouding staan en komt er een plaatshouder met de
   initiaal in; zo springt de strook niet zodra er later een foto bij komt. */

const rolLabel = (afkorting, rol) => {
	const delen = [afkorting, rol].map((deel) => String(deel ?? '').trim());
	const gevuld = delen.filter(Boolean);
	if (gevuld.length === 0) return null;

	return splitsOpSlash(gevuld.join(' / '), 'team-kaart__rol-scheiding');
};

const TeamLid = ({ blok }) => {
	const naam = blok.naam || '';
	const rol = rolLabel(blok.rol_afkorting, blok.rol);
	const foto = blok.foto?.filename || null;

	return (
		<article className="team-kaart" data-onthul="" {...storyblokEditable(blok)}>
			<div className="team-kaart__portret">
				{foto ? (
					<Image
						src={foto}
						alt={blok.foto?.alt || naam}
						fill
						sizes="(max-width: 900px) 100vw, 340px"
						className="team-kaart__foto"
					/>
				) : (
					<span className="team-kaart__plaatshouder" aria-hidden="true">
						{naam.slice(0, 1) || '—'}
					</span>
				)}
			</div>

			<div className="team-kaart__tekst">
				{rol && <div className="team-kaart__rol">{rol}</div>}
				{naam && <h3 className="team-kaart__naam">{naam}</h3>}
				{blok.omschrijving && (
					<p className="team-kaart__omschrijving">{blok.omschrijving}</p>
				)}
			</div>
		</article>
	);
};

export default TeamLid;
