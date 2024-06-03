<script lang="ts">
	import { CQRS } from "$lib/cqrs"
	import { ArtistAggregator } from "$lib/cqrs/aggregates/artist"
	import { ProjectView } from "$lib/cqrs/views/project"
	import { ECS, Entity } from "$lib/ecs"
	import { Layer } from "$lib/ecs/components/layer"
	import { onMount } from "svelte"
	import { P, Pattern, match } from "ts-pattern"
	import { EndDrawingCommand, NewLayerCommand, StartDrawingCommand } from "../types/commands-events"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
	import {layers, type DisplayableLayer} from "../stores/event-stream"
	import { LayersQuery } from "$lib/cqrs/queries/layers"
	import { ProjectQuery } from "$lib/cqrs/queries/project"
	import { DrawingSystem } from "$lib/ecs/systems/drawing"
	import { DrawableStyles, Quadrilateral, Vector } from "$lib/ecs/components/drawings"

	let name = "Novum"
	let canvas: HTMLCanvasElement | null
	let error: string | null = null
	let color: string = "#000000"
	let thickness: number = 1
	let layer: DisplayableLayer | null = null
	let render: boolean = true

	// In the real world, an ECS solves a data locality problem, 
	// the CPU cache is much faster than the memory access so we 
	// want to keep all data in contigious memory so it can be cached better.
	// An implementation of this can be found in another repo of mine 
	// @link https://github.com/davemackintosh/schwiftyes-demo
	//
	// For the purposes of this demo, we are using a simple ECS implementation
	// which allows us to attach multiple types of behaviours to a single entity
	// which in a design platform allows us to be incredibly flexible and fast 
	// which for designers, is very useful/important.
	const ecs = new ECS()
	const viewRepo = new ProjectViewRepo(ecs)
	const layersQuery = new LayersQuery(viewRepo, ecs)
	const cqrs = new CQRS(new ArtistAggregator(ecs), viewRepo)

	$: style = new DrawableStyles()

	async function createNewLayer() {
		const entity = ecs.createEntity()
        entity.addComponent(new Layer("new layer"))
		ecs.addEntity(entity)

        await cqrs.dispatch(entity.id + "", new NewLayerCommand("new layer"))
		await viewRepo.load("")
		await layersQuery.query({})
	}

	function selectLayer(selectedLayerentity: DisplayableLayer) {
		layer = selectedLayerentity
	}

	async function beginDrawing(event: MouseEvent) {
		if (!layer) {
			console.warn("Layer not selected")
            return
        }
		cqrs.dispatchWithMetadata(layer.id + "", new StartDrawingCommand(
			new Vector(event.offsetX, event.offsetY),
			new Quadrilateral(
				new Vector(event.offsetX, event.offsetY),
				new Vector(event.offsetX, event.offsetY),
			)),
			{
				userName: layer.name,
			})
	}

	async function endDrawing(event: MouseEvent) {
		if (!layer) {
			console.warn("Layer not selected")
            return
        }
		cqrs.dispatchWithMetadata(layer.name + "", new EndDrawingCommand(
			new Vector(event.offsetX, event.offsetY),
			new Quadrilateral(
				new Vector(event.offsetX, event.offsetY),
				new Vector(event.offsetX, event.offsetY),
			)
		),
			{
				userName: layer.name,
			})
    }

	function loop() {
		if (render) {
			ecs.update()
			requestAnimationFrame(loop)
		}
	}

	onMount(async () => {
		await layersQuery.query({})
		await ecs.stateFromStorage()
	
		if (!canvas) {
			error = "Could not find canvas element"
			return
		}

		match(canvas.getContext("2d"))
			.with(P.nonNullable, ctx => {
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
		<input type="checkbox" bind:checked={render} />
		<input bind:value={name} type="text" name="name" placeholder="Enter a username" />
		<div class="toolbox">
			<button on:click={createNewLayer}>Create new layer</button>
		</div>
		<ol>
			{#each $layers as entity}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<li class:selected={layer?.id === entity.id} on:click={() => selectLayer(entity)}>{entity.name}</li>
			{/each}
		</ol>
	</aside>
	<main>
		{#if error}
			<p>{error}</p>
		{:else}
			<canvas id="canvas" bind:this={canvas} on:mousedown={beginDrawing} on:mouseup={endDrawing}></canvas>
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
	}

	main {
		flex: 1;
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 100%;		
	}

	input {
		padding: 1rem;
	}

	canvas {
		width: 100%;
		height: 100%;
	border:1px solid pink;
	}

	li:hover {
		cursor: pointer;
	}

	li.selected {
		font-weight: bold;
	}
</style>
