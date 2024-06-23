<script lang="ts" context="module">
	export enum ColorPaletteToolTab {
		ColorPicker,
		PalettePicker
	}
</script>

<script lang="ts">
	import { dbInstance } from "$lib/rxdb/database"
	import type { ColorPalette, ColorPalettes } from "$lib/types/color-palette"
	import { onMount } from "svelte"

	let palettes: ColorPalettes = []
	let currentPalette: ColorPalette | undefined

	onMount(async () => {
		const query = dbInstance.colorPalette.find()
		palettes = await query.exec()

		query.$.subscribe(changes => {
			palettes = changes
		})
	})


</script>

<div class="color-palette-panel">
</div>

<style>
	.color-palette-panel {
		display: flex;
		flex-direction: row;
	}
</style>