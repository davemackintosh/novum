import { match } from "ts-pattern";
import type { IComponent, System } from "$lib/ecs/abstracts";
import type { Entity } from "$lib/ecs/entity";
import type { Vector } from "$lib/ecs/components/drawings";
import { CanvasPointComponent } from "$lib/ecs/components/canvas-point";

export class CanvasPointsSystem implements System {
	public nextPoint: Vector | undefined

	update(entity: Entity): void {
		const component = entity.getComponent(CanvasPointComponent);
		if (!component) {
			throw new Error("Entity does not have CanvasPointsComponent");
		}


	}
	accepts(component: IComponent): boolean {
		return match(component)
			.with(CanvasPointComponent, () => true)
			.otherwise(() => false)
	}
}
