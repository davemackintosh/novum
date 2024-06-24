<script lang="ts">
	import ColorPicker, {
		type HsvaColor,
		type RgbaColor,
	} from "svelte-awesome-color-picker"
	import { Vector } from "$lib/ecs/components/drawings"
	import type { ColorPalette, ColorPalettes } from "$lib/types/color-palette"
	import { dbInstance } from "$lib/rxdb/database"

	let newPaletteName = ""
	export let palettes: ColorPalettes

	async function requestNewPalette() {
		const created = await dbInstance.color_palette.insert({
			id: crypto.randomUUID(),
			name: newPaletteName,
			colors: [new Vector(0, 0, 0)],
		})

		console.log(`Created new palette: `, created)
	}

	async function updatePalette(palette: ColorPalette) {
		console.log(`Updating palette: ${palette.name}`)
		// Update the palette in the state
		//...
	}

	async function addNewColor(toPalette: ColorPalette) {
		console.log(`Adding new color to palette: ${toPalette.name}`)
		toPalette.colors.push(new Vector(0, 0, 0))
	}

	function updateColor(
		palette: ColorPalette,
		event: CustomEvent<{
			hsv: HsvaColor | undefined
			rgb: RgbaColor | undefined
			hex: string | undefined
		}>,
	) {
		console.log(`Updating color in palette: ${palette.name}`)
		console.log(event.detail)
	}

	$: console.log(palettes)
</script>

<div class="color-palette">
	{#each palettes as palette}
		<div class="palette">
			<p class="palette-name">{palette.name}</p>
			<div class="color-swatch">
				{#each palette.colors as color}
					<div class="color-swatch">
						<ColorPicker
							on:input={(event) => updateColor(palette, event)}
							hex={color.toHex()}
						/>
					</div>
				{/each}
				<button on:click|preventDefault={() => addNewColor(palette)}>+</button>
			</div>
		</div>
	{/each}
	<div class="new-palette">
		<input
			type="text"
			bind:value={newPaletteName}
			placeholder="Enter a new palette name"
		/>
		<button on:click={requestNewPalette}>Create</button>
	</div>
</div>

<style>
	.color-palette {
		display: flex;
		flex-direction: column;
	}
</style>
