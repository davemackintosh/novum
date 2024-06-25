import { Query } from "$lib/cqrs"
import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
import { ProjectView, type IProjectView } from "$lib/cqrs/views/project"
import type { Project } from "$lib/rxdb/collections/projects"
import { CollectionNames, dbInstance } from "$lib/rxdb/database"

export class ProjectQuery extends Query<ProjectView, ProjectViewRepo, Project[]> {
	constructor(repo: ProjectViewRepo) {
		super(repo)
	}

	async query(query: Partial<ProjectView> | undefined): Promise<Project[]> {
		return dbInstance[CollectionNames.PROJECTS]
			.find({
				selector: query,
			})
			.exec()
			.then((docs) => docs.map((doc) => doc.decode()))
	}

	subscribe(
		query: Partial<ProjectView> | undefined,
		handler: (values: IProjectView[]) => void,
	) {
		return dbInstance[CollectionNames.PROJECTS]
			.find({
				selector: query,
			})
			.$.subscribe(handler)
	}
}
