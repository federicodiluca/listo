/**
 * "Installa l'app". Chrome and Edge (Android and desktop) announce that the site can be
 * installed with a `beforeinstallprompt` event, which can fire at any time after load:
 * it is captured here, globally, and replayed when the user taps the button. Browsers
 * without it (Safari on iPhone, Firefox…) get step-by-step instructions instead.
 */

type InstallPromptEvent = Event & {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type Platform = 'ios' | 'android' | 'desktop';

class Installer {
	/** The browser's own install dialog is available. */
	canPrompt = $state(false);
	/** Running as an installed app (or just installed): nothing to offer. */
	installed = $state(false);
	platform = $state<Platform>('desktop');

	#event: InstallPromptEvent | null = null;
	#listening = false;

	/** Call once in the browser, as early as possible (root layout). */
	listen() {
		if (this.#listening) return;
		this.#listening = true;
		const ua = navigator.userAgent;
		// iPadOS reports itself as a Mac: tell it apart by touch support
		this.platform =
			/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
				? 'ios'
				: /android/i.test(ua)
					? 'android'
					: 'desktop';
		this.installed =
			matchMedia('(display-mode: standalone)').matches ||
			// Safari's own flag for apps added to the home screen
			(navigator as Navigator & { standalone?: boolean }).standalone === true;

		addEventListener('beforeinstallprompt', (event) => {
			event.preventDefault(); // keep it for our button instead of the browser's mini-bar
			this.#event = event as InstallPromptEvent;
			this.canPrompt = true;
		});
		addEventListener('appinstalled', () => {
			this.installed = true;
			this.canPrompt = false;
			this.#event = null;
		});
	}

	/** Opens the browser's install dialog; resolves with whether the user accepted. */
	async prompt(): Promise<boolean> {
		if (!this.#event) return false;
		const event = this.#event;
		this.#event = null; // the event can be used only once
		this.canPrompt = false;
		await event.prompt();
		const { outcome } = await event.userChoice;
		return outcome === 'accepted';
	}
}

export const installer = new Installer();
