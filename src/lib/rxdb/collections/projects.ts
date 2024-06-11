import { type RxCollection, type RxJsonSchema } from "rxdb"
import type { ProjectView } from "$lib/cqrs/views/project"

type PersistableProject = Omit<ProjectView, "handle_event">

const Projects: RxJsonSchema<PersistableProject> = {
	version: 0,
	title: "projects",
	description: "Persistance of the ProjectView.",
	primaryKey: "id",
	type: "object",
	keyCompression: true,
	required: ["id", "name", "layers", "members"],
	properties: {
		id: {
			type: "string",
			maxLength: 50,
		},
		name: {
			type: "string",
		},
		layers: {
			type: "array",
			items: {
				type: "object",
			},
		},
		members: {
			type: "array",
			items: {
				type: "string",
			},
		},
	},
} as const

type ProjectsCollection = RxCollection<PersistableProject>

export { Projects, type ProjectsCollection }
