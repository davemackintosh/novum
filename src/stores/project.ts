import { writable } from "svelte/store";
import { ProjectView } from "$lib/cqrs/views/project";

const projects = writable<ProjectView[]>([])
const currentProject = writable<ProjectView | null>(null)

export {
	projects,
	currentProject,
}
