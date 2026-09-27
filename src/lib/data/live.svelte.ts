import { liveQuery } from 'dexie';

/**
 * Reactive view of a database query: `current` is `undefined` while loading, then
 * always up to date, because Dexie's liveQuery re-runs the query whenever the data it
 * read changes (even from another tab).
 *
 * `key` is read synchronously so Svelte tracks it: when it changes (e.g. the list id
 * in the URL), the old subscription is dropped and the query restarts. Must be called
 * during component initialisation, like any $effect.
 */
export function live<T, K>(key: () => K, query: (key: K) => Promise<T>): { readonly current?: T } {
	let current = $state<T>();
	$effect(() => {
		const k = key();
		const subscription = liveQuery(() => query(k)).subscribe({
			next: (value) => (current = value),
			error: (error) => console.error('Query fallita', error)
		});
		return () => subscription.unsubscribe();
	});
	return {
		get current() {
			return current;
		}
	};
}
