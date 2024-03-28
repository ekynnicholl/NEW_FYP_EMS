/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		missingSuspenseWithCSRBailout: false,
	},
	webpack: config => {
		config.resolve.alias.canvas = false;

		return config;
	},
};

module.exports = nextConfig;
