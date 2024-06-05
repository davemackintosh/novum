import { P, match } from "ts-pattern"
import type { DisplayableLayer } from "../../../stores/event-stream"
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
	public layers: DisplayableLayer[]
	public members: string[]

	constructor(name?: string | null, id?: string | null) {
		super()

		this.id = id
		this.name = name
		this.layers = []
		this.members = []
	}

	handle_event(event: DrawingEvents): ProjectView {
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
				const layer: DisplayableLayer = {
					id: pEvent.id,
					name: pEvent.name
				}
				this.layers.push(layer)
				return this
			})
			.with(P.instanceOf(JoinEvent), (event) => {
				this.members.push(event.userId)

				return this
			})
			.with(P.instanceOf(LeaveEvent), (event) => {
				this.members.splice(this.members.indexOf(event.userId), 1)

				return this
			})
			.otherwise(() => this)
	}
}
