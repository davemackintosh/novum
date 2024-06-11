import { P, match } from "ts-pattern"
import { View } from "$lib/cqrs"
import {
	JoinEvent,
	LeaveEvent,
	NewLayerEvent,
	NewProjectEvent,
	type DrawingEvents,
} from "$lib/types/commands-events"

export class ProjectView extends View<DrawingEvents> {
	public id?: string | null
	public name?: string | null
	public layers: NewLayerEvent[]
	public members: string[]

	constructor(name?: string | null, id?: string | null) {
		super()

		this.id = id
		this.name = name
		this.layers = []
		this.members = []
	}

	public handle_event(event: DrawingEvents): ProjectView {
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
				this.layers.push(pEvent)
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
