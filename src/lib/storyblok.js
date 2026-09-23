import Page from '@/components/Page';
import Feature from '@/components/Feature';
import Grid from '@/components/Grid';
import Teaser from '@/components/Teaser';
import Hero from '@/components/Hero';
import Button from '@/components/Button';
import NavLink from '@/components/NavLink';
import OverOns from '@/components/OverOns';
import TeamLid from '@/components/TeamLid';
import TekstStrook from '@/components/TekstStrook';
import TekstBeeld from '@/components/TekstBeeld';
import Diensten from '@/components/Diensten';
import DienstGroep from '@/components/DienstGroep';
import Dienst from '@/components/Dienst';
import Pakketten from '@/components/Pakketten';
import Pakket from '@/components/Pakket';
import Contact from '@/components/Contact';
import ContactPersoon from '@/components/ContactPersoon';
import Loopband from '@/components/Loopband';
import Profielen from '@/components/Profielen';
import Profiel from '@/components/Profiel';
import Stappen from '@/components/Stappen';
import Stap from '@/components/Stap';
import Werk from '@/components/Werk';
import WerkItem from '@/components/WerkItem';
import Stellingen from '@/components/Stellingen';
import Stelling from '@/components/Stelling';
import Cta from '@/components/Cta';
import Voet from '@/components/Voet';
import VoetKolom from '@/components/VoetKolom';
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';

export const getStoryblokApi = storyblokInit({
	accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
	use: [apiPlugin],
	components: {
		page: Page,
		feature: Feature,
		grid: Grid,
		teaser: Teaser,
		hero: Hero,
		button: Button,
		nav_link: NavLink,
		over_ons: OverOns,
		team_lid: TeamLid,
		tekst: TekstStrook,
		tekst_beeld: TekstBeeld,
		diensten: Diensten,
		dienst_groep: DienstGroep,
		dienst: Dienst,
		pakketten: Pakketten,
		pakket: Pakket,
		contact: Contact,
		contact_persoon: ContactPersoon,
		loopband: Loopband,
		profielen: Profielen,
		profiel: Profiel,
		stappen: Stappen,
		stap: Stap,
		werk: Werk,
		werk_item: WerkItem,
		stellingen: Stellingen,
		stelling: Stelling,
		cta: Cta,
		voet: Voet,
		voet_kolom: VoetKolom,
	},
	apiOptions: {
		/** Set the correct region for your space. Learn more: https://www.storyblok.com/docs/packages/storyblok-js#example-region-parameter */
		region: process.env.STORYBLOK_REGION || 'eu',
		/** The following code is only required when creating a Storyblok space directly via the Blueprints feature. */
		endpoint: process.env.STORYBLOK_API_BASE_URL
			? `${new URL(process.env.STORYBLOK_API_BASE_URL).origin}/v2`
			: undefined,
	},
});
