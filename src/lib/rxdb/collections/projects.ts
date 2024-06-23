import { type RxCollection, type RxJsonSchema } from "rxdb"
import type { ProjectView } from "$lib/cqrs/views/project"

const Projects: RxJsonSchema<ProjectView> = {
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
		handle_event: {
			type: "null",
		},
		colorPalettes: {
			type: "array",
			items: {
				type: "object",
				properties: {
					id: {
						type: "string",
						maxLength: 255,
					},
					name: {
						type: "string",
					},
					colors: {
						type: "array",
						items: {
							type: "object",
							properties: {
								x: {
									type: "string",
								},
								y: {
									type: "string",
								},
								z: {
									type: "string",
								},
							},
							required: ["x", "y", "z"],
							additionalProperties: false,
						}
					},
				},
				required: ["id", "name", "colors"],
				additionalProperties: false,
			}
		}
	},
} as const

type ProjectsCollection = RxCollection<ProjectView>

export { Projects, type ProjectsCollection }
