const pending = new Map<string, Promise<void>>();

/** Injects a third-party script once; later calls reuse the same promise. */
export function loadScript(src: string): Promise<void> {
	let promise = pending.get(src);
	if (!promise) {
		promise = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = src;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => {
				pending.delete(src);
				reject(new Error(`Impossibile caricare ${src}`));
			};
			document.head.append(script);
		});
		pending.set(src, promise);
	}
	return promise;
}
