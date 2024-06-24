<script lang="ts" context="module">
	export enum ColorPaletteToolTab {
		ColorPicker,
		PalettePicker,
	}
</script>

<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte"
	import ColorPicker from "svelte-awesome-color-picker"
	import PalettePicker from "./palette-picker.svelte"
	import { dbInstance, type TableCodec } from "$lib/rxdb/database"
	import type { ColorPalette, ColorPalettes } from "$lib/types/color-palette"

	let palettes: ColorPalettes = []
	let currentTab: ColorPaletteToolTab = ColorPaletteToolTab.PalettePicker
	let currentPalette: ColorPalette | undefined

	const dispatcher = createEventDispatcher()

	onMount(async () => {
		const query = dbInstance.color_palette.find()
		palettes = await query.exec()

		query.$.subscribe((changes) => {
			console.log("Changes detected:", changes)
			palettes = changes
		})
	})
</script>

<div class="color-palette-panel">
	<div class="tab-container">
		<button
			class:active={currentTab === ColorPaletteToolTab.ColorPicker}
			on:click={() => (currentTab = ColorPaletteToolTab.ColorPicker)}
		>
			Color Picker
		</button>
		<button
			class:active={currentTab === ColorPaletteToolTab.PalettePicker}
			on:click={() => (currentTab = ColorPaletteToolTab.PalettePicker)}
		>
			Palette Picker
		</button>
	</div>
	<div class="tabs-content">
		{#if currentTab === ColorPaletteToolTab.ColorPicker}
			<ColorPicker />
		{:else if currentTab === ColorPaletteToolTab.PalettePicker}
			<PalettePicker
				{palettes}
				on:paletteselect={(event) => (currentPalette = event.detail)}
			/>
		{/if}
	</div>
</div>

<style>
	.color-palette-panel {
		display: flex;
		flex-direction: row;
	}
</style>
