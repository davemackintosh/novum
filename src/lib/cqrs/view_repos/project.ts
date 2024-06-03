import { Entity, type ECS } from "$lib/ecs";
import { P, match } from "ts-pattern";
import { ViewRepository } from "..";
import type { DrawingEvents } from "../../../types/commands-events";
import { ProjectView } from "../views/project";
import { Layer } from "$lib/ecs/components/layer";

export class ProjectViewRepo extends ViewRepository<DrawingEvents, ProjectView> {
	constructor(ecs: ECS) { 
		const view = new ProjectView("new project", ecs)
		super("ProjectView", view)
	}

	async commit(): Promise<void> {
		console.info("Committing this project to localStorage", this)
		localStorage.setItem("project", JSON.stringify(this.view))
	}

	async handle_event(event: DrawingEvents) {
		await this.view.handle_event(event)
	}

	async load(aggregateId: string): Promise<ProjectView> {
		// This would load from the database by querying for the aggregateId
		// and replaying all the events in the order they were committed in order
		// to create the current state of the aggregate.
		const project = JSON.parse(localStorage.getItem("project") || "{}")
		console.info("Loading project from localStorage", project)

		if (project.layers) {
			this.view.layers = project.layers.map((storedEntity: { id: number, components: {name: string}[]}) => {
				const entity = new Entity(storedEntity.id)
				entity.addComponent(new Layer(storedEntity.components[0].name))

				return entity
			})
		}

		this.view.name = project.name
		this.view.members = project.members.map((member: { name: string }) => member.name)

		console.log("deserialized project", this.view)
        return project
	}
}