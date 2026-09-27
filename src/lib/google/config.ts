import { env } from '$env/dynamic/public';

/**
 * Google OAuth client id (see .env.example). It is public by design.
 *
 * Read from $env/dynamic/public rather than $env/static/public: the static module
 * refuses to build when a variable is missing, which would break a fresh clone
 * without credentials. Here a missing value just disables the Google features.
 */
export const googleConfig = {
	clientId: env.PUBLIC_GOOGLE_CLIENT_ID ?? ''
};

export const isGoogleConfigured = Boolean(googleConfig.clientId);
