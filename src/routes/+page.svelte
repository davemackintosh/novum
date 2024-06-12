<script lang="ts">
	import { onMount } from "svelte"
	import { currentProject, projects } from "$lib/stores/project"
	import { userAddress } from "$lib/stores/user"
	import Projects from "$lib/components/projects.svelte"
	import { CQRS } from "$lib/cqrs"
	import { ArtistAggregator } from "$lib/cqrs/aggregates/project"
	import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"

	let error: string | null = null

	const viewRepo = new ProjectViewRepo()
	const cqrs = new CQRS(new ArtistAggregator(), viewRepo)

	onMount(async () => {
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
