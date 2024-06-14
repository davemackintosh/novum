<script lang="ts">
	import { onMount } from "svelte"
	import { P, match } from "ts-pattern"
	import { userAddress } from "$lib/stores/user"
	import { CQRS } from "$lib/cqrs"
	import { ArtistAggregator } from "$lib/cqrs/aggregates/project"
	import { ECS } from "$lib/ecs"
	import { NewLayerCommand } from "$lib/types/commands-events"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
	import { DrawingSystem } from "$lib/ecs/systems/drawing"
	import { ProjectView, Layer } from "$lib/cqrs/views/project"
	import { page } from "$app/stores"
	import { ProjectQuery } from "$lib/cqrs/queries/project"

	let canvas: HTMLCanvasElement | null
	let currentLayer: Layer | null = null
	let render: boolean = true
	let currentProject: ProjectView | null = null

	const ecs = new ECS()
	const viewRepo = new ProjectViewRepo()
	const query = new ProjectQuery(viewRepo)
	const cqrs = new CQRS(new ArtistAggregator(), viewRepo)

	async function createNewLayer() {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		await cqrs.dispatchWithMetadata(
			currentProject!.id!,
			new NewLayerCommand("new layer " + (currentProject!.layers.length + 1)),
			{
				userAddress: $userAddress,
			},
		)
	}

	function selectLayer(selectedLayerentity: Layer) {
		currentLayer = selectedLayerentity
	}

	async function beginDrawing(event: MouseEvent) {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected", event)
			return
		}
	}

	async function endDrawing(event: MouseEvent) {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected", event)
			return
		}
	}

	function loop() {
		ecs.update()
		requestAnimationFrame(loop)
	}

	onMount(async () => {
		await ecs.stateFromStorage($page.params.id)

		currentProject = await viewRepo.load($page.params.id)

		query.subscribe(
			{
				id: $page.params.id,
			},
			(projects) => {
				currentProject = projects[0]
			},
		)

		if (currentProject?.id && !canvas) {
			console.error("Could not find canvas element")
			return
		}

		if (canvas)
			match(canvas.getContext("2d"))
				.with(P.nonNullable, (ctx) => {
					console.log("Got 2d context from canvas")
					ecs.registerSystem(new DrawingSystem(ctx))
					if (render) loop()
				})
				.otherwise(() => {
					console.error("Could not get 2d context from canvas")
				})
	})
</script>

<div class="toolbox-canvas">
	{#if !currentProject}
		<p>Loading...</p>
	{:else}
		<aside class="project-meta">
			<div class="project--layers">
				<p><strong>{currentProject?.name}</strong></p>
				<div class="toolbox">
					<button on:click={createNewLayer} disabled={!currentProject}>Create new layer</button>
				</div>

				<ol class="layers">
					{#each currentProject.layers as layer}
						<li class:selected={currentLayer?.id === layer.id}>
							<button on:click={() => selectLayer(layer)}>{layer.name}</button>
						</li>
					{/each}
				</ol>
			</div>
		</aside>
		<canvas bind:this={canvas} on:mousedown={beginDrawing} on:mouseup={endDrawing} />
	{/if}
</div>

<style>
	.toolbox-canvas {
		display: flex;
		height: 100vh;
		flex-direction: row;
	}

	aside {
		flex: 2;
		flex-grow: 0;
		border-right: 1px solid black;
		padding: 1em;
	}

	canvas {
		width: 100%;
		height: 100%;
	}

	ol {
		margin: 0;
		padding: 0;
	}

	li {
		list-style: none;
	}

	li:hover {
		cursor: pointer;
	}

	li.selected {
		font-weight: bold;
	}

	.layers button {
		appearance: none;
		font-weight: inherit;
		border: 0;
		background: none;
	}

	.layers button:hover {
		cursor: pointer;
	}
</style>
