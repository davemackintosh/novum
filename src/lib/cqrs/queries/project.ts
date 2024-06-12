import { Query } from "$lib/cqrs"
import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
import { ProjectView } from "$lib/cqrs/views/project"
import { dbInstance } from "$lib/rxdb/database"

export class ProjectQuery extends Query<ProjectView, ProjectViewRepo, ProjectView[]> {
	constructor(repo: ProjectViewRepo) {
		super(repo)
	}

	async query(query: Partial<ProjectView> | undefined): Promise<ProjectView[]> {
		return dbInstance.projects.find({
			selector: query
		}).exec()
	}
}
