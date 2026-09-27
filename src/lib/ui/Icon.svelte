<script lang="ts" module>
	// Stroke icons on a 24×24 grid, drawn with currentColor so they follow the text color.
	const paths = {
		plus: 'M12 5v14M5 12h14',
		back: 'M19 12H5M12 19l-7-7 7-7',
		up: 'M18 15l-6-6-6 6',
		down: 'M6 9l6 6 6-6',
		trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
		pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
		chevron: 'M9 6l6 6-6 6'
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
