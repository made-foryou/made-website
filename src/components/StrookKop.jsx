import StrookLabel from '@/components/StrookLabel';
import Tekstveld from '@/components/Tekstveld';
import { accentueer, heeftTekst } from '@/lib/tekst';

/* De kop van een strook met kaarten: links het label en de kop, rechts een
   introzin of — als children worden meegegeven — bijvoorbeeld een knop.
   Met formaat="groot" staat de kop in de zware variant. */

const StrookKop = ({
	label,
	titel,
	accent,
	intro,
	kopId,
	formaat = 'klein',
	streep = true,
	children,
}) => {
	if (!label && !titel && !heeftTekst(intro) && !children) return null;

	return (
		<div className="strook-kop" data-formaat={formaat}>
			<div className="strook-kop__tekst">
				<StrookLabel tekst={label} streep={streep} />

				{titel && (
					<h2 id={kopId} className="strook-kop__titel" data-onthul="">
						{accentueer(titel, accent)}
					</h2>
				)}
			</div>

			<Tekstveld waarde={intro} className="strook-kop__intro" data-onthul="" />

			{children}
		</div>
	);
};

export default StrookKop;
