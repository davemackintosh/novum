import { Query } from "$lib/cqrs"
import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
import { ProjectView } from "$lib/cqrs/views/project"
import type { DrawingEvent, NewProjectEvent } from "$lib/types/commands-events"
import type { PersistableEvent } from "$lib/cqrs"

export class ProjectQuery extends Query<ProjectView, ProjectViewRepo, ProjectView[]> {
	constructor(repo: ProjectViewRepo) {
		super(repo)
	}

	query(): ProjectView[] {
		const events = JSON.parse(localStorage.getItem("events") || "[]") as PersistableEvent<DrawingEvent>[]
		const projects = events.filter((event) => event.eventType === "NewProjectEvent").map((event) => new ProjectView((event.payload as unknown as NewProjectEvent).name))

		return projects.map((project) => {
			const projectEvents = events.filter(event => event.aggregateId === project.id)

			for (const event of projectEvents) {
				project.handle_event(event.payload)
			}

			return project
		})
	}
}
