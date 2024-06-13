import { ViewRepository, type PersistableEvent } from ".."
import { ProjectView } from "../views/project"
import { persistableEventToProjectEvents, type DrawingEvents } from "$lib/types/commands-events"
import { dbInstance } from "$lib/rxdb/database"

export class ProjectViewRepo extends ViewRepository<DrawingEvents, ProjectView> {
	constructor() {
		const view = new ProjectView("new project")
		super("ProjectView", view)
	}

	async commit(): Promise<void> {
		console.info("Committing this project to storage", this.view)
		await dbInstance.projects.upsert({
			id: this.view.id,
			name: this.view.name,
			layers: this.view.layers,
			members: this.view.members,
		})
	}

	async handle_event(event: DrawingEvents) {
		this.view.handle_event(event)
	}


	async load(aggregateId: string): Promise<ProjectView> {
		const events: PersistableEvent<DrawingEvents>[] = await dbInstance.events.find({
			selector: {
				aggregateId,
			}
		}).exec()

		console.info("Loaded events from storage", events)

		for (const event of events) {
			const drawingEvent = persistableEventToProjectEvents(event)

			this.handle_event(drawingEvent)
		}

		return this.view
	}
}
