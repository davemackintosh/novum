<script lang="ts">
	import ProjectCard from "./project-card.svelte"
	import type { ProjectView } from "$lib/cqrs/views/project"
	import type { CQRS, DrawingEvents } from "$lib/cqrs"
	import type { ArtistAggregator } from "$lib/cqrs/aggregates/artist"
	import { NewProjectCommand } from "$lib/types/commands-events"

	let projectName = ""
	export let projects: ProjectView[]
	export let cqrsInstance: CQRS<ArtistAggregator, DrawingEvents>

	function newProject() {
		const aggregateId = crypto.randomUUID()
		cqrsInstance.dispatch(aggregateId, new NewProjectCommand(projectName, aggregateId))
	}
</script>

{#each projects as project}
	<ProjectCard {project} />
{/each}
<div class="text-center">
	<input bind:value={projectName} type="text" autocapitalize="" spellcheck />
	<button on:click={newProject} disabled={projectName.length === 0}>New project</button>
</div>
