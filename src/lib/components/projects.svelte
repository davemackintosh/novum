<script lang="ts">
	import ProjectCard from "./project-card.svelte"
	import type { ProjectView } from "$lib/cqrs/views/project"
	import type { CQRS, ProjectEvents } from "$lib/cqrs"
	import type { ProjectAggregator } from "$lib/cqrs/aggregates/project"
	import { NewProjectCommand } from "$lib/types/commands-events"
	import { userAddress } from "$lib/stores/user"

	let projectName = ""
	export let projects: ProjectView[]
	export let cqrsInstance: CQRS<ProjectAggregator, ProjectEvents>

	function newProject() {
		const aggregateId = crypto.randomUUID()
		cqrsInstance.dispatchWithMetadata(
			aggregateId,
			new NewProjectCommand(projectName, aggregateId),
			{
				userAddress: $userAddress,
			},
		)
	}
</script>

{#each projects as project}
	<ProjectCard {project} />
{/each}
<div class="text-center">
	<input bind:value={projectName} type="text" autocapitalize="" spellcheck />
	<button on:click={newProject} disabled={projectName.length === 0}>New project</button>
</div>
