<script lang="ts">
	import { onMount } from "svelte"
	import { P, match } from "ts-pattern"
	import { layers, type DisplayableLayer } from "../stores/event-stream"
	import Projects from "../components/projects.svelte"
	import { CQRS } from "$lib/cqrs"
	import { ArtistAggregator } from "$lib/cqrs/aggregates/artist"
	import { ECS } from "$lib/ecs"
	import {
		EndDrawingCommand,
		NewLayerCommand,
		StartDrawingCommand,
	} from "$lib/types/commands-events"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
	import { DrawingSystem } from "$lib/ecs/systems/drawing"
	import { DrawableStyles, Quadrilateral, Vector } from "$lib/ecs/components/drawings"
	import type { ProjectView } from "$lib/cqrs/views/project"
	import { ProjectQuery } from "$lib/cqrs/queries/project"

	let name = "Novum"
	let canvas: HTMLCanvasElement | null
	let error: string | null = null
	let color: string = "#000000"
	let thickness: number = 1
	let layer: DisplayableLayer | null = null
	let render: boolean = true
	let projectId: string = ""
	let projects: ProjectView[] = []

	// In the real world, an ECS solves a data locality problem,
	// the CPU cache is much faster than the memory access so we
	// want to keep all data in contigious memory so it can be cached better.
	// An better implementation of this can be found in another repo of mine
	// @link https://github.com/davemackintosh/schwiftyes-demo
	//
	// For the purposes of this demo, we are using a simple ECS implementation
	// which allows us to attach multiple types of behaviours to a single entity
	// which in a design platform allows us to be incredibly flexible and fast
	// which for designers, is very useful/important.
	const ecs = new ECS()
	const viewRepo = new ProjectViewRepo()
	const projectQuery = new ProjectQuery(viewRepo)
	const cqrs = new CQRS(new ArtistAggregator(), viewRepo)

	$: style = new DrawableStyles(color, thickness)

	async function loadProject(project: ProjectView) {
		projectId = project.id!
	}

	async function createNewLayer() {
		await cqrs.dispatch(projectId, new NewLayerCommand("new layer"))
		viewRepo.load()
	}

	function selectLayer(selectedLayerentity: DisplayableLayer) {
		layer = selectedLayerentity
	}

	async function beginDrawing(event: MouseEvent) {
		if (!layer) {
			console.warn("Layer not selected")
			return
		}
		cqrs.dispatchWithMetadata(
			projectId,
			new StartDrawingCommand(
				new Vector(event.offsetX, event.offsetY),
				new Quadrilateral(new Vector(event.offsetX, event.offsetY), undefined),
				style,
			),
			{
				userId: "", // We'll get this from the store later.
				userName: layer.name,
			},
		)
	}

	async function endDrawing(event: MouseEvent) {
		if (!layer) {
			console.warn("Layer not selected")
			return
		}
		cqrs.dispatchWithMetadata(
			projectId,
			new EndDrawingCommand(
				new Vector(event.offsetX, event.offsetY),
				new Quadrilateral(undefined, new Vector(event.offsetX, event.offsetY)),
			),
			{
				userId: "", // We'll get this from the store later.
				userName: layer.name,
			},
		)
	}

	function loop() {
		if (render) {
			ecs.update()
			requestAnimationFrame(loop)
		}
	}

	onMount(async () => {
		await ecs.stateFromStorage()
		viewRepo.load()
		projects = projectQuery.query()
		console.log("PROJECTS", projects)

		if (projectId && !canvas) {
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
		<input bind:value={name} type="text" name="name" placeholder="Enter a username" />
		<div class="toolbox">
			<button on:click={createNewLayer}>Create new layer</button>
		</div>
		<ol class="layers">
			{#each $layers as entity}
				<li class:selected={layer?.id === entity.id}>
					<button on:click={() => selectLayer(entity)}>{entity.name}</button>
				</li>
			{/each}
		</ol>
	</aside>
	<main>
		{#if error}
			<p>{error}</p>
		{:else if !projectId}
			<Projects {projects} cqrsInstance={cqrs} on:click={loadProject} />
		{:else}
			<canvas id="canvas" bind:this={canvas} on:mousedown={beginDrawing} on:mouseup={endDrawing}
			></canvas>
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
