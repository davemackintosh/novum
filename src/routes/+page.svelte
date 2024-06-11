<script lang="ts">
	import { onMount } from "svelte"
	import { currentProject, projects } from "$lib/stores/project"
	import { userAddress } from "$lib/stores/user"
	import Projects from "$lib/components/projects.svelte"
	import { CQRS } from "$lib/cqrs"
	import { ArtistAggregator } from "$lib/cqrs/aggregates/project"
	import { ECS } from "$lib/ecs"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"

	let error: string | null = null

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

	onMount(async () => {
		await ecs.stateFromStorage()
		viewRepo.load()
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
	</aside>
	<main>
		{#if error}
			<p>{error}</p>
		{:else if !$currentProject?.id}
			<Projects projects={$projects} cqrsInstance={cqrs} />
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
</style>
