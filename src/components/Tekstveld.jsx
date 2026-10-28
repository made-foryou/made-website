import { StoryblokServerRichText } from '@storyblok/react/rsc';
import { heeftTekst } from '@/lib/tekst';

/* Een tekstveld uit Storyblok: richtext of platte tekst. Platte tekst komt
   uit een textarea, maar ook uit een veld dat naar richtext is omgezet zolang
   de inhoud daarna niet opnieuw is bewerkt. Richtext wordt een <div> met een
   <p> per alinea, platte tekst één <p>. Overige props, zoals data-onthul,
   komen op het buitenste element. */

const Tekstveld = ({ waarde, className, ...rest }) => {
	if (!heeftTekst(waarde)) return null;

	if (typeof waarde === 'string') {
		return (
			<p className={className} {...rest}>
				{waarde}
			</p>
		);
	}

	return (
		<StoryblokServerRichText
			document={waarde}
			className={['made-richtext', className].filter(Boolean).join(' ')}
			{...rest}
		/>
	);
};

export default Tekstveld;
