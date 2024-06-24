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
	import { Canvas2DContext } from "$lib/ecs/components/canvas-2d-context"
	import { Vector } from "$lib/ecs/components/drawings"
	import { CanvasPointsSystem } from "$lib/ecs/systems/canvas-points"
	import Toolbox from "$lib/components/toolbox.svelte"
	import {
		PaintbrushComponent,
		PaintbrushStylesComponent,
		PaintbrushType,
	} from "$lib/ecs/components/paintbrushes"
	import { CanvasPaintBrushSystem } from "$lib/ecs/systems/canvas-tools/paintbrush"
	import { appTheme } from "$lib/stores/app-config"

	let canvas: HTMLCanvasElement | null
	let currentLayer: Layer | null = null
	let currentProject: ProjectView | null = null

	const themeBundle = appTheme()
	const ecs = new ECS()
	const viewRepo = new ProjectViewRepo()
	const query = new ProjectQuery(viewRepo)
	const cqrs = new CQRS(new ProjectAggregator(ecs), viewRepo)

	const paintbrushSystem = new CanvasPaintBrushSystem()

	// This point gets updated by the canvas point system and updates all other points in the scene.
	const canvasPoint = new RootCanvasPointComponent(0, 0)
	const rootEntity = ecs.createEntity()

	const paintbrushStyles = new PaintbrushStylesComponent({
		width: 30,
		height: 50,
		pressure: 1,
		color: new Vector(0, 0, 0, 1.0),
		brushType: PaintbrushType.Filbert,
	})
	const canvas2dDrawingCtx = new Canvas2DContext()
	const paintbrush = new PaintbrushComponent()

	rootEntity.addComponent(canvasPoint)
	rootEntity.addComponent(paintbrushStyles)
	rootEntity.addComponent(canvas2dDrawingCtx)
	rootEntity.addComponent(paintbrush)

	ecs.addEntity(rootEntity)

	async function createNewLayer() {
		if (!currentProject) {
			throw new ReferenceError("no current project")
		}
		const newLayer = new NewLayerCommand(
			"new layer " + (currentProject!.layers.length + 1),
		)
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

		paintbrushSystem.setIsPainting(true)
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
			const { radiusX, radiusY, force, rotationAngle } = event.touches[0]

			paintbrushStyles.pressure = force
			paintbrushStyles.width = radiusX * 2
			paintbrushStyles.height = radiusY * 2
			paintbrushStyles.rotation = rotationAngle

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

		paintbrushSystem.setIsPainting(false)
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

	function handleColorChange(event: CustomEvent<string>) {
		paintbrushStyles.color = Vector.fromHex(event.detail)
	}

	onMount(async () => {
		await ecs.stateFromStorage($page.params.id)

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
			canvas2dDrawingCtx.setCtx(ctx)

			ecs.registerSystem(new CanvasPointsSystem())
			ecs.registerSystem(new DrawingSystem(ctx, canvas))
			ecs.registerSystem(paintbrushSystem)

			// Start rendering.
			loop()
		})
		.otherwise(() => {
			console.error("Could not get 2d context from canvas")
		})
</script>

<svelte:window on:resize={resizeCanvas} />
<div class="project">
	<header>
		<p>
			{$userAddress}
			<small>
				Save this somewhere safe, this is your unique Novum address. Lose this and you
				lose all your work and invites.
			</small>
		</p>
		<button
			type="button"
			on:click={() => {
				themeBundle.setThemeKey(
					$themeBundle.currentThemeKey === "light" ? "dark" : "light",
				)
			}}
		>
		</button>
		<Toolbox on:colorchange={handleColorChange} />
	</header>
	<div class="toolbox-canvas">
		{#if !currentProject}
			<p>Loading...</p>
		{:else}
			<aside class="project-meta">
				<div class="project--layers">
					<p><strong>{currentProject?.name}</strong></p>
					<div class="toolbox">
						<button on:click={createNewLayer} disabled={!currentProject}
							>Create new layer</button
						>
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
			<canvas
				bind:this={canvas}
				on:touchstart|preventDefault={beginStroke}
				on:touchmove|preventDefault={updateStroke}
				on:touchend|preventDefault={endStroke}
				on:pointerdown|preventDefault={beginStroke}
				on:pointermove|preventDefault={updateStroke}
				on:pointerup|preventDefault={endStroke}
			/>
		{/if}
	</div>
</div>

<style>
	header {
		display: flex;
		flex-direction: row;
		padding: 1em;
		z-index: 1;
		position: fixed;
	}

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
		position: fixed;
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
