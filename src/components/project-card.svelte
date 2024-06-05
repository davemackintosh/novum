<script lang="ts">
	import { currentProject } from "../stores/project"
	import type { ProjectView } from "$lib/cqrs/views/project"

	export let project: ProjectView

	function loadProject(project: ProjectView) {
		currentProject.set(project)
	}
</script>

<div class="project-card">
	<div class="project-card-header">
		<div class="project-card-title">
			<h2>{project.name}</h2>
			<button on:click|preventDefault={() => loadProject(project)}>Load</button>
		</div>
	</div>
</div>
