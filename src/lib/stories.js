import { cache } from 'react';
import { getStoryblokApi } from '@/lib/storyblok';

/* Alleen server-side gebruiken: React cache() dedupliceert de call binnen één
   request, zodat generateMetadata en de pagina samen één keer ophalen. */

/* In development de draft, in productie de gepubliceerde versie. Met
   STORYBLOK_VERSION forceer je het expliciet — nodig op een previewdeploy waar
   de Visual Editor op draait, want die heeft de draft nodig. */
function storyVersion() {
	const override = process.env.STORYBLOK_VERSION;
	if (override === 'draft' || override === 'published') return override;

	return process.env.NODE_ENV === 'production' ? 'published' : 'draft';
}

export function toFullSlug(slug) {
	return slug?.length ? slug.join('/') : 'home';
}

export const getStory = cache(async (fullSlug) => {
	const storyblokApi = getStoryblokApi();
	const { data } = await storyblokApi.get(`cdn/stories/${fullSlug}`, {
		version: storyVersion(),
	});

	return data.story;
});
