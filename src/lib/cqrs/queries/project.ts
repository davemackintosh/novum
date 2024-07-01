import { Query } from "$lib/cqrs"
import { ProjectViewRepo } from "$lib/cqrs/view_repos/project"
import { ProjectView, type IProjectView } from "$lib/cqrs/views/project"
import { dbInstance } from "$lib/rxdb/database"
import { CollectionNames } from "$lib/rxdb/types"

export class ProjectQuery extends Query<ProjectView, ProjectViewRepo, ProjectView[]> {
	constructor(repo: ProjectViewRepo) {
		super(repo)
	}

	async query(query: Partial<ProjectView> | undefined): Promise<ProjectView[]> {
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
