import { type ECS } from "$lib/ecs";
import { ViewRepository, type PersistableEvent } from "..";
import { persistableEventsToDrawingEvents, type DrawingEvents } from "$lib/types/commands-events";
import { ProjectView } from "../views/project";

export class ProjectViewRepo extends ViewRepository<DrawingEvents, ProjectView> {
	private readonly ecs: ECS

	constructor(ecs: ECS) {
		const view = new ProjectView("new project", ecs)
		super("ProjectView", view)

		this.ecs = ecs
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
		const project: PersistableEvent<DrawingEvents>[] = JSON.parse(localStorage.getItem("events") || "[]")
		const events = persistableEventsToDrawingEvents(project.filter(e => e.aggregateId === aggregateId))

		console.info("Loading project from localStorage", events)

		for (const event of events)
			this.view.handle_event(event)

		console.log("deserialized project", this.view)
		return this.view
	}
}
