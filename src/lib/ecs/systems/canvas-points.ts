import { P, match } from "ts-pattern";
import { RootCanvasPointComponent } from "../components/root-canvas-point";
import type { IComponent, System } from "$lib/ecs/abstracts";
import type { Entity } from "$lib/ecs/entity";
import type { Vector } from "$lib/ecs/components/drawings";
import { CanvasPointComponent } from "$lib/ecs/components/canvas-point";

export class CanvasPointsSystem implements System {
	public rootCanvasPoint: RootCanvasPointComponent | undefined
	public nextPoint: Vector | undefined

	update(entity: Entity): void {
		const rootCanvasPoint = entity.getComponent(RootCanvasPointComponent);
		if (rootCanvasPoint) {
			this.rootCanvasPoint = rootCanvasPoint
		}

		const currentPoint = entity.getComponent(CanvasPointComponent)

		if (currentPoint && this.rootCanvasPoint) {
			currentPoint.point = this.rootCanvasPoint!.point
		}

	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with(P.instanceOf(CanvasPointComponent), () => true)
			.with(P.instanceOf(RootCanvasPointComponent), () => true)
			.otherwise(() => false)
	}
}
