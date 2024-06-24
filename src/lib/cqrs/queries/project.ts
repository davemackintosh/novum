import { Query } from "$lib/cqrs"
import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
import { ProjectView, type IProjectView } from "$lib/cqrs/views/project"
import type { Project } from "$lib/rxdb/collections/projects"
import { dbInstance } from "$lib/rxdb/database"

export class ProjectQuery extends Query<ProjectView, ProjectViewRepo, Project[]> {
	constructor(repo: ProjectViewRepo) {
		super(repo)
	}

	async query(query: Partial<ProjectView> | undefined): Promise<Project[]> {
		return dbInstance.projects
			.find({
				selector: query,
			})
			.exec()
	}

	subscribe(
		query: Partial<ProjectView> | undefined,
		handler: (values: Project[]) => void,
	) {
		return dbInstance.projects
			.find({
				selector: query,
			})
			.$.subscribe(handler)
	}
}
