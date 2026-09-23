/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'a.storyblok.com' },
			{ protocol: 'https', hostname: 'a-us.storyblok.com' },
		],
	},
	// The following environment variables can be safely exposed to the public bundle.
	// The Storyblok public access token is required for features like live preview.
	env: {
		STORYBLOK_DELIVERY_API_TOKEN: process.env.STORYBLOK_DELIVERY_API_TOKEN,
		STORYBLOK_API_BASE_URL: process.env.STORYBLOK_API_BASE_URL,
		STORYBLOK_REGION: process.env.STORYBLOK_REGION,
	},
};

export default nextConfig;
