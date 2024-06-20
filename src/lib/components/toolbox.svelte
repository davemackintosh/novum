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
</script>

<script lang="ts">
	const toolbelt: Record<AvailableTools, ToolDescriptor> = {
		[AvailableTools.Pointer]: {
			name: "Pointer",
			icon: "/theme/cursor-dark.png",
			description: "Pointer",
		},
		[AvailableTools.RectangleSelector]: {
			name: "RectangleSelector",
			icon: "/theme/cursor-dark.png",
			description: "RectangleSelector",
		},
		[AvailableTools.Paintbrush]: {
			name: "Paintbrush",
			icon: "/theme/cursor-dark.png",
			description: "Paintbrush",
		},
	}
</script>

<ul class="toolbox">
	{#each Object.values(toolbelt) as tool}
		<li>
			<button type="button" title={tool.name}>
				<img src={tool.icon} alt={tool.description} width="16" height="16" />
			</button>
		</li>
	{/each}
</ul>

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
