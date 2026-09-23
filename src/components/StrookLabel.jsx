import { splitsOpSlash } from '@/lib/tekst';

/* Het kapitalenlabel boven een kop: een schuin streepje in de accentkleur en
   de tekst erachter. Elke / in de tekst krijgt de linkkleur. */

const StrookLabel = ({ tekst, streep = true }) => {
	if (!tekst) return null;

	return (
		<div className="strook-label" data-onthul="">
			{streep && <span className="strook-label__streep" aria-hidden="true" />}
			<span>{splitsOpSlash(tekst, 'strook-label__scheiding')}</span>
		</div>
	);
};

export default StrookLabel;
