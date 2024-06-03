import type { ECS, Entity } from "$lib/ecs";
import { Query } from "..";
import { ProjectViewRepo } from "../view_repos/project";
import { ProjectView } from "../views/project";

export class ProjectQuery extends Query<ProjectView, ProjectViewRepo, ProjectView> {
	private readonly ecs: ECS

	constructor(repo: ProjectViewRepo, ecs: ECS) {
		super(repo)
		
		this.ecs = ecs
    }

	async query(): Promise<ProjectView> {
		const results = ProjectView.from_query({}, this.ecs)
		
		return results
	} 
}
