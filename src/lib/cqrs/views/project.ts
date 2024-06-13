import { P, match } from "ts-pattern"
import { View } from "$lib/cqrs"
import {
	JoinEvent,
	LeaveEvent,
	NewLayerEvent,
	NewProjectEvent,
	SetLayerNameEvent,
	persistableEventsToProjectEvents,
	type ProjectEvents,
} from "$lib/types/commands-events"
import { dbInstance } from "$lib/rxdb/database"

class Layer {
	id: string
	name?: string

	constructor(id: string, name?: string) {
		this.id = id
		this.name = name
	}
}

class ProjectView extends View {
	public id?: string | null
	public name?: string | null
	public layers: Layer[]
	public members: string[]

	constructor(name?: string | null, id?: string | null) {
		super()

		this.id = id
		this.name = name
		this.layers = []
		this.members = []

		if (id)
			this.subscribe_to_events(id)
	}

	// Apparently, you can't have a private abstract method in a TypeScript class,
	// which is fucking stupid.
	public subscribe_to_events(aggregateId: string) {
		dbInstance.events.find({
			selector: {
				aggregateId,
			},
		}).$.subscribe((values) => {
			console.log("received updates to view ", values)
			const events = persistableEventsToProjectEvents(values)
			events.forEach((event) => this.handle_event(event))
		})
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
				this.layers.push(new Layer(pEvent.id))
				return this
			})
			.with(P.instanceOf(SetLayerNameEvent), (event) => {
				const pEvent = event as SetLayerNameEvent

				const layer = this.layers.find((layer) => layer.id === pEvent.id)

				if (layer) {
					layer.name = pEvent.name
				} else {
					console.error(`Layer with id ${pEvent.id} not found`)
					return this
				}
				this.layers = this.layers.map((layer) =>
					layer.id === pEvent.id ? new Layer(layer.id, pEvent.name) : layer,
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

export {
	Layer,
	ProjectView,
}
