import { type RxCollection, type RxDocument, type RxJsonSchema } from "rxdb"
import type { TableCodec } from "../database"
import { Layer, type IProjectView } from "$lib/cqrs/views/project"
import type { ColorPalettes } from "$lib/types/color-palette"

class Project implements IProjectView, TableCodec<Project, IProjectView> {
	colorPalettes: ColorPalettes
	members: string[]
	layers: Layer[]
	name?: string | null | undefined
	id?: string | null | undefined

	constructor(id?: string, name?: string, layers?: Layer[], members?: string[], colorPalettes?: ColorPalettes) {
		this.id = id
		this.name = name
		this.layers = layers || []
		this.members = members || []
		this.colorPalettes = colorPalettes || []
	}

	static fromDatabase(doc: RxDocument<IProjectView>): Project {
		return new Project(
			doc.get("id"),
			doc.get("name"),
			doc.get("layers").map((layer) => new Layer(layer.id, layer.name)),
			doc.get("members"),
			doc.get("colorPalettes"),
		)
	}

	encode(instance: Project): IProjectView {
		return {
			id: instance.id,
			name: instance.name,
			layers: instance.layers.map((layer) => ({ id: layer.id, name: layer.name })),
			members: instance.members,
			colorPalettes: instance.colorPalettes,
		}
	}

	static SCHEMA: RxJsonSchema<IProjectView> = {
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

	static Collection: RxCollection<IProjectView>
}

export { Project }
