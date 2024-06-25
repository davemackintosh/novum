import { P, match } from "ts-pattern"
import type { RxCollection, RxDocument, RxJsonSchema } from "rxdb"
import { View } from "$lib/cqrs"
import {
	JoinEvent,
	LeaveEvent,
	NewLayerCommand,
	NewLayerEvent,
	NewProjectEvent,
	SetLayerNameEvent,
	type ProjectEvents,
} from "$lib/types/commands-events"
import type { ColorPalettes } from "$lib/rxdb/collections/color-palette"
import type { StaticMethods, TableCodec } from "$lib/rxdb/types"

interface ILayer {
	id: string
	name?: string
}

class Layer implements TableCodec<Layer, ILayer> {
	id: string
	name?: string

	constructor(id: string, name?: string) {
		this.id = id
		this.name = name
	}

	encode(instance: Layer): ILayer {
		return {
			id: instance.id,
			name: instance.name,
		}
	}

	static fromDatabase(instance: ILayer): Layer {
		return new Layer(instance.id, instance.name)
	}

	static fromCommand(command: NewLayerCommand): Layer {
		return new Layer(command.layerId, command.name)
	}
}

interface IProjectView {
	id?: string | null
	name?: string | null
	layers: ILayer[]
	members: string[]
	colorPalettes: ColorPalettes
}

class ProjectView
	extends View
	implements IProjectView, TableCodec<ProjectView, IProjectView> {
	id: string
	name: string
	layers: Layer[] = []
	members: string[] = []
	colorPalettes: ColorPalettes = []

	constructor(name: string, id: string, layers: Layer[] = [], members: string[] = [], colorPalettes: ColorPalettes) {
		super()

		this.id = id
		this.name = name
		this.layers = layers
		this.members = members
		this.colorPalettes = colorPalettes
	}

	static fromDatabase(persistable: RxDocument<IProjectView>): ProjectView {
		return new ProjectView(
			persistable.get("name"),
			persistable.get("id"),
			persistable.get("layers").map((layer: ILayer) => Layer.fromDatabase(layer)),
			persistable.get("members"),
			persistable.get("colorPalettes"),
		)
	}

	encode(instance: ProjectView): IProjectView {
		return {
			id: instance.id,
			name: instance.name,
			layers: instance.layers.map((layer: Layer) => ({ id: layer.id, name: layer.name })),
			members: instance.members,
			colorPalettes: instance.colorPalettes,
		}
	}

	public handle_event(event: ProjectEvents): ProjectView {
		console.info("ProjectView received event", event)
		return match(event)
			.with(P.instanceOf(NewProjectEvent), (event) => {
				const pEvent = event as NewProjectEvent
				this.name = pEvent.name
				this.id = pEvent.id

				return this
			})
			.with(P.instanceOf(NewLayerEvent), (event) => {
				const pEvent = event as NewLayerEvent
				this.layers.push(new Layer(pEvent.id, "new layer " + (this.layers.length + 1)))
				return this
			})
			.with(P.instanceOf(SetLayerNameEvent), (event) => {
				const pEvent = event as SetLayerNameEvent

				const layer = this.layers.find((layer) => layer.id === pEvent.layerId)

				if (layer) {
					layer.name = pEvent.name
				} else {
					console.error(`Layer with id ${pEvent.layerId} not found`)
					return this
				}
				this.layers = this.layers.map((layer) =>
					layer.id === pEvent.layerId ? new Layer(layer.id, pEvent.name) : layer,
				)

				return this
			})
			.with(P.instanceOf(JoinEvent), (event) => {
				this.members.push(event.userAddress)

				return this
			})
			.with(P.instanceOf(LeaveEvent), (event) => {
				this.members.splice(this.members.indexOf(event.userAddress), 1)

				return this
			})
			.otherwise(() => this)
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
							},
						},
					},
					required: ["id", "name", "colors"],
					additionalProperties: false,
				},
			},
		},
	} as const

	static Collection: RxCollection<IProjectView, StaticMethods<ProjectView>>
}

export { Layer, ProjectView, type IProjectView, type ILayer }
