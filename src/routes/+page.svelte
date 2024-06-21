<script lang="ts">
	import { onMount } from "svelte"
	import { userAddress } from "$lib/stores/user"
	import Projects from "$lib/components/projects.svelte"
	import { CQRS } from "$lib/cqrs"
	import { ProjectAggregator } from "$lib/cqrs/aggregates/project"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
	import { ProjectQuery } from "$lib/cqrs/queries/project"
	import type { ProjectView } from "$lib/cqrs/views/project"
	import { ECS } from "$lib/ecs"

	let error: string | null = null
	let projects: ProjectView[] = []

	const ecs = new ECS()
	const viewRepo = new ProjectViewRepo()
	const cqrs = new CQRS(new ProjectAggregator(ecs), viewRepo)
	const query = new ProjectQuery(viewRepo)

	onMount(async () => {
		projects = await query.query({})

		query.subscribe({}, (newProjects) => {
			error = null
			projects = newProjects
		})
	})
</script>

<div class="app">
	<aside>
		<p>
			{$userAddress}
			<small>
				Save this somewhere safe, this is your unique Novum address. Lose this and you
				lose all your work and invites.
			</small>
		</p>
	</aside>
	<main>
		{#if error}
			<p>{error}</p>
		{:else}
			<Projects {projects} cqrsInstance={cqrs} />
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
