import { StoryblokStory } from '@storyblok/react/rsc';
import { getStory, toFullSlug } from '@/lib/stories';

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const story = await getStory(toFullSlug(slug));

	/* Leeg laten valt terug op de metadata uit layout.js. */
	return {
		title: story.content.page_title || undefined,
		description: story.content.page_description || undefined,
	};
}

export default async function Page({ params }) {
	const { slug } = await params;
	const story = await getStory(toFullSlug(slug));

	return <StoryblokStory story={story} />;
}
