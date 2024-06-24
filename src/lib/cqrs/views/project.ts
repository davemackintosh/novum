import { P, match } from "ts-pattern"
import type { RxDocument } from "rxdb"
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
import type { ColorPalettes } from "$lib/types/color-palette"
import type { TableCodec } from "$lib/rxdb/database"

class Layer {
	id: string
	name?: string

	constructor(id: string, name?: string) {
		this.id = id
		this.name = name
	}

	static fromCommand(command: NewLayerCommand): Layer {
		return new Layer(command.layerId, command.name)
	}
}

interface IProjectView {
	id?: string | null
	name?: string | null
	layers: Layer[]
	members: string[]
	colorPalettes: ColorPalettes
}

class ProjectView extends View implements IProjectView, TableCodec<ProjectView, IProjectView> {
	id?: string | null
	name?: string | null
	layers: Layer[]
	members: string[]
	colorPalettes: ColorPalettes

	constructor(name?: string | null, id?: string | null) {
		super()

		this.id = id
		this.name = name
		this.layers = []
		this.members = []
		this.colorPalettes = []
	}

	decode(persistable: RxDocument<IProjectView>): ProjectView {
		this.id = persistable.get("id")
		this.name = persistable.get("name")
		this.layers = persistable.get("layers").map((layer) => new Layer(layer.id, layer.name))
		this.members = persistable.get("members")
		this.colorPalettes = persistable.get("colorPalettes")

		return this
	}

	encode(instance: ProjectView): IProjectView {
		return {
			id: instance.id,
			name: instance.name,
			layers: instance.layers.map((layer) => ({ id: layer.id, name: layer.name })),
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
}

export { Layer, ProjectView, type IProjectView }
