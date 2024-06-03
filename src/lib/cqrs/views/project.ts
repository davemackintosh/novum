import { P, match } from "ts-pattern";
import { CQRS, View } from "..";
import { JoinEvent, LeaveEvent, NewLayerEvent, StartLineEvent, type DrawingEvents } from "../../../types/commands-events";
import { ECS, Entity } from "$lib/ecs";
import { Layer } from "$lib/ecs/components/layer";
import type { ArtistAggregator } from "../aggregates/artist";

export class ProjectView extends View<DrawingEvents> {
	public name: string
	public layers: Entity[]
	public members: string[]
	private readonly ecs: ECS

	constructor(name: string, ecs: ECS) {
        super()

		this.name = name
		this.layers = []
		this.members = []
		this.ecs = ecs
    }

	// This basically just deserializes the project view from local storage.
	public static from_query(query: Partial<ProjectView>, ecs: ECS): ProjectView {
		const instance = new ProjectView("", ecs)
		if (query.name) {
            instance.name = query.name
		}

		if (query.layers) {
			instance.layers = query.layers		}

		if (query.members) {
            instance.members = query.members
        }
		
		return instance
	}

	handle_event(event: DrawingEvents): ProjectView {
		console.info("ProjectView received event", event)
		return match(event)
			.with(P.instanceOf(JoinEvent), (event) => { 
				this.members.push(event.userId)

				return this
			})
			.with(P.instanceOf(LeaveEvent), (event) => {
				this.members.splice(this.members.indexOf(event.userId), 1)

				return this
			})
			.with(P.instanceOf(NewLayerEvent), () => {
				const entity = this.ecs.createEntity()
				const component = new Layer("new layer")
				entity.addComponent(component)
				
				this.layers.push(entity)

				return this
			})
			.with(P.instanceOf(StartLineEvent), () => { 
				const entity = this.ecs.createEntity()
				const component = new Layer("new layer")
				entity.addComponent(component)
				
				this.layers.push(entity)

				return this
			})
			.otherwise(() => this)
	}
}