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
