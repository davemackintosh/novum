<script lang="ts">
	import { onMount } from "svelte"
	import { P, match } from "ts-pattern"
	import { userAddress } from "$lib/stores/user"
	import { CQRS } from "$lib/cqrs"
	import { ArtistAggregator } from "$lib/cqrs/aggregates/project"
	import { ECS } from "$lib/ecs"
	import {
		EndDrawingCommand,
		NewLayerCommand,
		StartDrawingCommand,
	} from "$lib/types/commands-events"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
	import { DrawingSystem } from "$lib/ecs/systems/drawing"
	import { DrawableStyles, Quadrilateral, Vector } from "$lib/ecs/components/drawings"
	import { ProjectView, Layer } from "$lib/cqrs/views/project"
	import { page } from "$app/stores"

	let canvas: HTMLCanvasElement | null
	let color: string = "#000000"
	let thickness: number = 1
	let currentLayer: Layer | null = null
	let render: boolean = true
	let currentProject: ProjectView | null = null

	const ecs = new ECS()
	const viewRepo = new ProjectViewRepo()
	const cqrs = new CQRS(new ArtistAggregator(), viewRepo)

	$: style = new DrawableStyles(color, thickness)

	async function createNewLayer() {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		await cqrs.dispatchWithMetadata(currentProject!.id!, new NewLayerCommand("new layer"), {
			userAddress: $userAddress,
		})
	}

	function selectLayer(selectedLayerentity: Layer) {
		currentLayer = selectedLayerentity
	}

	async function beginDrawing(event: MouseEvent) {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected")
			return
		}
		cqrs.dispatchWithMetadata(
			currentProject.id!,
			new StartDrawingCommand(
				new Vector(event.offsetX, event.offsetY),
				new Quadrilateral(new Vector(event.offsetX, event.offsetY), undefined),
				currentLayer.id,
				style,
			),
			{
				userAddress: $userAddress,
			},
		)
	}

	async function endDrawing(event: MouseEvent) {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected")
			return
		}
		cqrs.dispatchWithMetadata(
			currentProject!.id!,
			new EndDrawingCommand(
				new Vector(event.offsetX, event.offsetY),
				new Quadrilateral(undefined, new Vector(event.offsetX, event.offsetY)),
				currentLayer.id,
				style,
			),
			{
				userAddress: $userAddress,
			},
		)
	}

	function loop() {
		ecs.update()
		requestAnimationFrame(loop)
	}

	onMount(async () => {
		await viewRepo.load($page.params.id)
		await ecs.stateFromStorage($page.params.id)

		currentProject = await viewRepo.load($page.params.id)
		currentProject.subscribe_to_events(currentProject.id!)

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
