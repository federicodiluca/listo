<script lang="ts" module>
	// Stroke icons on a 24×24 grid, drawn with currentColor so they follow the text color.
	const paths = {
		plus: 'M12 5v14M5 12h14',
		back: 'M19 12H5M12 19l-7-7 7-7',
		up: 'M18 15l-6-6-6 6',
		down: 'M6 9l6 6 6-6',
		trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
		pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
		chevron: 'M9 6l6 6-6 6',
		check: 'M20 6 9 17l-5-5',
		close: 'M18 6 6 18M6 6l12 12',
		search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
		sort: 'M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4',
		archive: 'M21 8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8M2 3h20v5H2zM10 12h4',
		restore: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
		// sync
		cloud: 'M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z',
		cloudOff:
			'M2 2l20 20M5.8 5.8A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.3-.2M21.5 16.5A4.5 4.5 0 0 0 17.5 10h-1.8A7 7 0 0 0 10 5.1',
		refresh:
			'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M16 16h5v5',
		external: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
		download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
		// landing
		offline:
			'M12 20h.01M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.7M19 12.9a10 10 0 0 0-2-1.5M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 11 4.9M2 2l20 20',
		shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
		phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
		// section tabs
		items: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
		tag: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
		settings: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
		// template icons
		snowflake:
			'M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5M18.1 5.6l-.9 3.4 3.4.9M5.9 5.6l.9 3.4-3.4.9M18.1 18.4l-.9-3.4 3.4-.9M5.9 18.4l.9-3.4-3.4-.9',
		jar: 'M8 3h8M7 6h10M7 6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2M9 3v3M15 3v3M5 12h14',
		cart: 'M2 3h3l2.7 12.2a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6M9 20h.01M18 20h.01',
		blank: 'M6 3h9l4 4v14H6zM14 3v5h5M12.5 11v6M9.5 14h6',
		// "add an emoji" placeholder
		smile:
			'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01'
	} as const;

	export type IconName = keyof typeof paths;
</script>

<script lang="ts">
	let { name, size = 20 }: { name: IconName; size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={paths[name]} />
</svg>
