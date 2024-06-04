import { P, match } from "ts-pattern"
import { View } from "$lib/cqrs"
import {
	JoinEvent,
	LeaveEvent,
	NewProjectEvent,
	type DrawingEvents,
} from "$lib/types/commands-events"
import { Entity } from "$lib/ecs/entity"

export class ProjectView extends View<DrawingEvents> {
	public id?: string
	public name: string
	public layers: Entity[]
	public members: string[]

	constructor(name: string, id?: string) {
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
