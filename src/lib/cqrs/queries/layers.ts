import type { ECS, Entity } from "$lib/ecs";
import { Query } from "..";
import { ProjectViewRepo } from "../view_repos/project";
import { ProjectView } from "../views/project";
import { layers, type DisplayableLayer } from "../../../stores/event-stream"
import { LayerComponent } from "$lib/ecs/components/layer";

export class LayersQuery extends Query<ProjectView, ProjectViewRepo, DisplayableLayer[]> {
	private readonly ecs: ECS

	constructor(repo: ProjectViewRepo, ecs: ECS) {
		super(repo)

		this.ecs = ecs
	}

	async query(query: Partial<ProjectView>): Promise<DisplayableLayer[]> {
		const project = await this.viewRepository.load(query.name ?? "")
		const results = ProjectView.from_query(project, this.ecs).layers

		console.log("LayersQuery results", results)

		const layerResults = results.map((layer) => ({
			id: layer.id,
			name: (layer.components[0] as LayerComponent).name!,
		}))

		layers.set(layerResults)

		return layerResults
	}
}
