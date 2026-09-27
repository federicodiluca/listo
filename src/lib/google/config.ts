import { env } from '$env/dynamic/public';

/**
 * Google Cloud identifiers (see .env.example). They are public by design.
 *
 * Read from $env/dynamic/public rather than $env/static/public: the static module
 * refuses to build when a variable is missing, which would break a fresh clone
 * without credentials. Here a missing value just disables the Google features.
 */
export const googleConfig = {
	clientId: env.PUBLIC_GOOGLE_CLIENT_ID ?? '',
	apiKey: env.PUBLIC_GOOGLE_API_KEY ?? '',
	appId: env.PUBLIC_GOOGLE_APP_ID ?? ''
};

export const isGoogleConfigured = Boolean(
	googleConfig.clientId && googleConfig.apiKey && googleConfig.appId
);
