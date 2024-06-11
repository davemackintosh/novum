<script lang="ts">
	import { onMount } from "svelte"
	import { P, match } from "ts-pattern"
	import { currentProject, projects } from "../stores/project"
	import { userAddress } from "../stores/user"
	import Projects from "../components/projects.svelte"
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

	let canvas: HTMLCanvasElement | null
	let error: string | null = null
	let color: string = "#000000"
	let thickness: number = 1
	let currentLayer: NewLayerEvent | null = null
	let render: boolean = true

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
	const cqrs = new CQRS(new ArtistAggregator(), viewRepo)

	$: style = new DrawableStyles(color, thickness)

	async function createNewLayer() {
		if (!$currentProject) {
			throw new ReferenceError("no current project")
		}
		await cqrs.dispatch($currentProject.id!, new NewLayerCommand("new layer"))
		viewRepo.load()
	}

	function selectLayer(selectedLayerentity: NewLayerEvent) {
		currentLayer = selectedLayerentity
	}

	async function beginDrawing(event: MouseEvent) {
		if (!$currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected")
			return
		}
		cqrs.dispatchWithMetadata(
			$currentProject.id!,
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
		if (!$currentProject) {
			throw new ReferenceError("no current project")
		}
		if (!currentLayer) {
			console.warn("Layer not selected")
			return
		}
		cqrs.dispatchWithMetadata(
			$currentProject.id!,
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
		if (render) {
			ecs.update()
			requestAnimationFrame(loop)
		}
	}

	onMount(async () => {
		await ecs.stateFromStorage()
		viewRepo.load()

		if ($currentProject?.id && !canvas) {
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
		{#if $currentProject}
			<div class="project-meta">
				<p><strong>{$currentProject?.name}</strong></p>
				<div class="toolbox">
					<button on:click={createNewLayer} disabled={!$currentProject}>Create new layer</button>
				</div>
			</div>
			<ol class="layers">
				{#each $currentProject.layers as layer}
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
		{:else if !$currentProject?.id}
			<Projects projects={$projects} cqrsInstance={cqrs} />
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
