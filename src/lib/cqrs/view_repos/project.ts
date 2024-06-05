import { ViewRepository, type PersistableEvent } from ".."
import { ProjectView } from "../views/project"
import { projects } from "../../../stores/project"
import { persistableEventToDrawingEvents, type DrawingEvents } from "$lib/types/commands-events"

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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	load(_: string | null = null): ProjectView[] {
		const projectViews = new Map<string, ProjectView>()
		const events: PersistableEvent<DrawingEvents>[] = JSON.parse(
			localStorage.getItem("events") || "[]",
		)

		console.info("Loading projects from localStorage", events)

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
