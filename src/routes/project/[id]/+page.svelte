<script lang="ts">
	import { onMount } from "svelte"
	import { P, match } from "ts-pattern"
	import { type RxDocument } from "rxdb"
	import { userAddress } from "$lib/stores/user"
	import { CQRS } from "$lib/cqrs"
	import { ArtistAggregator } from "$lib/cqrs/aggregates/project"
	import { ECS } from "$lib/ecs"
	import {
		EndDrawingCommand,
		NewLayerCommand,
		NewLayerEvent,
		StartDrawingCommand,
	} from "$lib/types/commands-events"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
	import { DrawingSystem } from "$lib/ecs/systems/drawing"
	import { DrawableStyles, Quadrilateral, Vector } from "$lib/ecs/components/drawings"
	import { ProjectView, Layer } from "$lib/cqrs/views/project"
	import { dbInstance } from "$lib/rxdb/database"
	import { page } from "$app/stores"

	let canvas: HTMLCanvasElement | null
	let error: string | null = null
	let color: string = "#000000"
	let thickness: number = 1
	let currentLayer: NewLayerEvent | null = null
	let render: boolean = true
	let currentProject: RxDocument<ProjectView> | null = null
	let layers: Layer[] = []

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

	function selectLayer(selectedLayerentity: NewLayerEvent) {
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
				currentLayer,
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
				currentLayer,
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

		currentProject = await dbInstance.projects
			.findOne({
				selector: {
					id: $page.params.id,
				},
			})
			.exec()

		currentProject?.layers$.subscribe((nextLayers) => {
			layers = nextLayers
		})

		if (currentProject?.id && !canvas) {
			error = "Could not find canvas element"
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
					error = "Could not get 2d context from canvas"
				})
	})
</script>

<div class="app">
	<aside>
		<p>
			{$userAddress}
			<small>
				Save this somewhere safe, this is your unique Novum address. Lose this and you lose all your
				work and invites.
			</small>
		</p>
		{#if !currentProject}
			<p>Loading...</p>
		{:else}
			<div class="project-meta">
				<p><strong>{currentProject?.name}</strong></p>
				<div class="toolbox">
					<button on:click={createNewLayer} disabled={!currentProject}>Create new layer</button>
				</div>
			</div>
			<ol class="layers">
				{#each layers as layer}
					<li class:selected={layer?.id === layer.id}>
						<button on:click={() => selectLayer(layer)}>{layer.name}</button>
					</li>
				{/each}
			</ol>
		{/if}
	</aside>
	<main>
		{#if error}
			<p>{error}</p>
		{:else}
			<canvas id="canvas" bind:this={canvas} on:mousedown={beginDrawing} on:mouseup={endDrawing} />
		{/if}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: row;
		height: 100vh;
	}

	aside {
		flex: 1;
		flex-grow: 0;
		border-right: 1px solid black;
		padding: 1em;
	}

	main {
		flex: 1;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 100%;
	}

	canvas {
		width: 100%;
		height: 100%;
		border: 1px solid pink;
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
