<script lang="ts">
	import ProjectCard from "./project-card.svelte"
	import type { ProjectView } from "$lib/cqrs/views/project"
	import type { CQRS, DrawingEvents } from "$lib/cqrs"
	import type { ArtistAggregator } from "$lib/cqrs/aggregates/artist"
	import { createUUID } from "$lib/uuid"
	import { NewProjectCommand } from "$lib/types/commands-events"

	export let projects: ProjectView[]
	export let cqrsInstance: CQRS<ArtistAggregator, DrawingEvents>

	function newProject() {
		const aggregateId = createUUID()
		cqrsInstance.dispatch(aggregateId, new NewProjectCommand("new project", aggregateId))
	}
</script>

{#each projects as project}
	<ProjectCard {project} on:click />
{/each}
<div class="text-center">
	<button on:click={newProject}>New project</button>
</div>
