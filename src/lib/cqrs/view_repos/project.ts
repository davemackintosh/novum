import { ViewRepository, type PersistableEvent } from ".."
import { ProjectView } from "../views/project"
import { persistableEventsToDrawingEvents, type DrawingEvents } from "$lib/types/commands-events"

export class ProjectViewRepo extends ViewRepository<DrawingEvents, ProjectView> {
	constructor() {
		const view = new ProjectView("new project")
		super("ProjectView", view)
	}

	async commit(): Promise<void> {
		console.info("Committing this project to localStorage", this)
		localStorage.setItem("project", JSON.stringify(this.view))
	}

	async handle_event(event: DrawingEvents) {
		this.view.handle_event(event)
	}

	load(aggregateId: string | null = null): ProjectView {
		// This would load from the database by querying for the aggregateId
		// and replaying all the events in the order they were committed in order
		// to create the current state of the aggregate.
		const project: PersistableEvent<DrawingEvents>[] = JSON.parse(
			localStorage.getItem("events") || "[]",
		)
		const events = persistableEventsToDrawingEvents(
			aggregateId ? project.filter((e) => e.aggregateId === aggregateId) : project,
		)

		console.info("Loading project from localStorage", events)

		for (const event of events) this.view.handle_event(event)

		console.log("deserialized project", this.view)
		return this.view
	}
}
