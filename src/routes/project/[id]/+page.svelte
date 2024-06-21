<script lang="ts">
	import { onMount } from "svelte"
	import { P, match } from "ts-pattern"
	import { userAddress } from "$lib/stores/user"
	import { CQRS } from "$lib/cqrs"
	import { ProjectAggregator } from "$lib/cqrs/aggregates/project"
	import { ECS } from "$lib/ecs"
	import { NewLayerCommand } from "$lib/types/commands-events"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
	import { DrawingSystem } from "$lib/ecs/systems/drawing"
	import { ProjectView, Layer } from "$lib/cqrs/views/project"
	import { page } from "$app/stores"
	import { ProjectQuery } from "$lib/cqrs/queries/project"
	import { RootCanvasPointComponent } from "$lib/ecs/components/root-canvas-point"
	import { Vector } from "$lib/ecs/components/drawings"
	import { PointerTool } from "$lib/types/toolbox"
	import { RasterizedImageComponent } from "$lib/ecs/components/rasterized-image"
	import { CanvasPointComponent } from "$lib/ecs/components/canvas-point"
	import { CanvasPointsSystem } from "$lib/ecs/systems/canvas-points"
	import { appTheme } from "$lib/stores/app-config"
	import Toolbox from "$lib/components/toolbox.svelte"
	import { PaintbrushComponent } from "$lib/ecs/components/paintbrushes"

	let canvas: HTMLCanvasElement | null
	let currentLayer: Layer | null = null
	let currentProject: ProjectView | null = null
	let currentToolSystem = new PointerTool()

	const ecs = new ECS()
	const viewRepo = new ProjectViewRepo()
	const query = new ProjectQuery(viewRepo)
	const cqrs = new CQRS(new ProjectAggregator(ecs), viewRepo)

	const themeBundle = appTheme()

	// This point gets updated by the canvas point system and updates all other points in the scene.
	const canvasPoint = new RootCanvasPointComponent(0, 0)
	const rootEntity = ecs.createEntity()
	rootEntity.addComponent(canvasPoint)
	ecs.addEntity(rootEntity)

	const cursor = ecs.createEntity()
	const cursorPosition = new CanvasPointComponent(canvasPoint.point.x, canvasPoint.point.y)
	cursor.addComponent(new RasterizedImageComponent($themeBundle.getThemeConfig().cursor, 8, 8))
	cursor.addComponent(cursorPosition)
	ecs.addEntity(cursor)

	const paintbrushEntity = ecs.createEntity()
	const paintbrushComponent = new PaintbrushComponent()
	paintbrushEntity.addComponent(paintbrushComponent)
	ecs.addEntity(paintbrushEntity)

	async function createNewLayer() {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		const newLayer = new NewLayerCommand("new layer " + (currentProject!.layers.length + 1))
		await cqrs.dispatchWithMetadata(currentProject!.id!, newLayer, {
			userAddress: $userAddress,
		})
		currentLayer = Layer.fromCommand(newLayer)
	}

	function selectLayer(selectedLayer: Layer) {
		currentLayer = selectedLayer
	}

	async function beginStroke(event: PointerEvent | TouchEvent) {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected", event)
			return
		}

		console.log(event)
	}

	async function updateStroke(event: PointerEvent | TouchEvent) {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected", event)
			return
		}

		// Update the canvas point x y and pressure from the event.
		if (event instanceof PointerEvent) {
			canvasPoint.point = new Vector(event.layerX, event.layerY)
		} else if (event instanceof TouchEvent) {
			canvasPoint.point = new Vector(event.touches[0].clientX, event.touches[0].clientY)
		}
	}

	async function endStroke(event: PointerEvent | TouchEvent) {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected", event)
			return
		}

		console.log(event)
	}

	function loop() {
		ecs.update()
		requestAnimationFrame(loop)
	}

	function resizeCanvas() {
		if (canvas) {
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
		}
	}

	onMount(async () => {
		await ecs.stateFromStorage($page.params.id)

		ecs.registerSystem(new CanvasPointsSystem())
		ecs.registerSystem(currentToolSystem)

		currentProject = await viewRepo.load($page.params.id)
		currentLayer = currentProject.layers[0]

		resizeCanvas()

		query.subscribe(
			{
				id: $page.params.id,
			},
			(projects) => {
				currentProject = projects[0]
			},
		)
	})

	$: if (canvas) resizeCanvas()
	$: match(canvas?.getContext("2d"))
		.with(P.nonNullable, (ctx) => {
			console.log("Got 2d context from canvas")
			ecs.registerSystem(new DrawingSystem(ctx, canvas))
			loop()
		})
		.otherwise(() => {
			console.error("Could not get 2d context from canvas")
		})
</script>

<svelte:window on:resize={resizeCanvas} />
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
			<Toolbox />
		</aside>
		<canvas
			bind:this={canvas}
			on:touchstart={beginStroke}
			on:touchmove={updateStroke}
			on:touchend={endStroke}
			on:pointerdown={beginStroke}
			on:pointermove={updateStroke}
			on:pointerup={endStroke}
		/>
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
		z-index: 1;
	}

	canvas {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 0;
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

	.project-meta {
		display: flex;
		flex-direction: row;
	}
</style>
