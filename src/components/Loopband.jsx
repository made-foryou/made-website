import { storyblokEditable } from '@storyblok/react/rsc';
import { regels } from '@/lib/tekst';

/* De loopband: een smalle donkere band met steekwoorden, gescheiden door
   amberkleurige slashes. De rij staat er twee keer in, zodat de beweging
   naadloos doorloopt; bij prefers-reduced-motion staat hij stil (globals.css).

   De band is decoratief — dezelfde woorden staan verderop in de diensten —
   en daarom aria-hidden, zoals in het ontwerp. */

const Loopband = ({ blok }) => {
	const items = regels(blok.items);
	if (items.length === 0) return null;

	return (
		<div className="loopband" aria-hidden="true" {...storyblokEditable(blok)}>
			<div className="loopband__spoor">
				{[0, 1].map((kopie) => (
					<div className="loopband__rij" key={kopie}>
						{items.map((item) => (
							<span className="loopband__item" key={item}>
								{item}
								<span className="loopband__scheiding">/</span>
							</span>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

export default Loopband;
