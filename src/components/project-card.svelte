<script lang="ts">
	import type { ProjectView } from "$lib/cqrs/views/project"

	export let project: ProjectView
</script>

<div class="project-card">
	<div class="project-card-header">
		<div class="project-card-title">
			<h2>{project.name}</h2>
			<button on:click>Load</button>
		</div>
	</div>
</div>
