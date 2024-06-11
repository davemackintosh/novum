import { ViewRepository, type PersistableEvent } from ".."
import { ProjectView } from "../views/project"
import { projects } from "../../../stores/project"
import { persistableEventToDrawingEvents, type DrawingEvents } from "$lib/types/commands-events"
import { dbInstance } from "$lib/rxdb/database"

export class ProjectViewRepo extends ViewRepository<DrawingEvents, ProjectView> {
	constructor() {
		const view = new ProjectView("new project")
		super("ProjectView", view)
	}

	async commit(): Promise<void> {
		console.info("Committing this project to storage", this.view)
		console.log(
			"UPSERT",
			await dbInstance.projects.upsert({
				id: this.view.id,
				name: this.view.name,
				layers: this.view.layers,
				members: this.view.members,
			}),
		)
	}

	async handle_event(event: DrawingEvents) {
		this.view.handle_event(event)
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async load(_: string | null = null): Promise<ProjectView[]> {
		const projectViews = new Map<string, ProjectView>()
		const events: PersistableEvent<DrawingEvents>[] = await dbInstance.events.find().exec()

		console.info("Loaded events from storage", events)

		for (const event of events) {
			const drawingEvent = persistableEventToDrawingEvents(event)

			if (!projectViews.has(event.aggregateId)) {
				const newProject = new ProjectView(null, event.aggregateId)
				newProject.handle_event(drawingEvent)
				projectViews.set(event.aggregateId, newProject)
			} else {
				projectViews.get(event.aggregateId)!.handle_event(drawingEvent)
			}
		}

		const projectsArray = Array.from(projectViews.values())

		projects.set(projectsArray)
		console.log("deserialized projects", projectsArray)

		return projectsArray
	}
}
