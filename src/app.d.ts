// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// Globals defined by Google's scripts, loaded at runtime (see $lib/google).
// TypeScript 6 no longer picks up @types packages automatically.
/// <reference types="google.accounts" />
/// <reference types="google.picker" />
/// <reference types="gapi" />

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
