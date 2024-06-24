<script lang="ts" context="module">
	export enum AvailableTools {
		Pointer,
		RectangleSelector,
		Paintbrush,
	}

	export interface ToolDescriptor {
		name: string
		icon: string
		description: string
	}

	export type ToolObject = {
		type: AvailableTools
		descriptor: ToolDescriptor
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte"
	import ColorPalettePanel from "$lib/components/color-palette-panel.svelte"

	const toolbelt: ToolObject[] = [
		{
			type: AvailableTools.Pointer,
			descriptor: {
				name: "Pointer",
				icon: "/theme/cursor-dark.png",
				description: "Pointer",
			},
		},
		{
			type: AvailableTools.RectangleSelector,
			descriptor: {
				name: "RectangleSelector",
				icon: "/theme/rectangle-selector.jpg",
				description: "RectangleSelector",
			},
		},
		{
			type: AvailableTools.Paintbrush,
			descriptor: {
				name: "Paintbrush",
				icon: "/theme/paint-brush.jpg",
				description: "Paintbrush",
			},
		},
	]

	const dispatcher = createEventDispatcher()

	function handleColorChange(color: string): void {
		dispatcher("colorchange", color)
	}

	function handleToolChange(tool: ToolObject): void {
		dispatcher("toolchange", tool)
	}
</script>

<div class="toolbox">
	<ul class="toolbox">
		{#each toolbelt as tool}
			<li>
				<button
					type="button"
					title={tool.descriptor.name}
					on:click={() => handleToolChange(tool)}
				>
					<img
						src={tool.descriptor.icon}
						alt={tool.descriptor.description}
						width="16"
						height="16"
					/>
				</button>
			</li>
		{/each}
	</ul>
	<div class="color-palette">
		<ColorPalettePanel on:colorchange={(event) => handleColorChange(event.detail)} />
	</div>
</div>

<style>
	.toolbox {
		margin: 0;
		padding: 0;
	}

	.toolbox li {
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
