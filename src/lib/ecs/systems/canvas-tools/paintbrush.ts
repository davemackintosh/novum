import { P, match } from "ts-pattern";
import { RootCanvasPointComponent } from "$lib/ecs/components/root-canvas-point";
import { PaintbrushComponent } from "$lib/ecs/components/paintbrush";
import type { IComponent, System } from "$lib/ecs/abstracts";
import type { Entity } from "$lib/ecs/entity";
import type { Vector } from "$lib/ecs/components/drawings";

export class CanvasPaintBrushSystem implements System {
	public rootCanvasPoint: RootCanvasPointComponent | undefined
	public nextPoint: Vector | undefined

	update(entity: Entity): void {
		const rootCanvasPoint = entity.getComponent(RootCanvasPointComponent)
		const paintbrush = entity.getComponent(PaintbrushComponent)

		if (paintbrush && rootCanvasPoint)
			paintbrush.renderAtPoint(rootCanvasPoint.point)
	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with(P.instanceOf(RootCanvasPointComponent), () => true)
			.with(P.instanceOf(PaintbrushComponent), () => true)
			.otherwise(() => false)
	}
}

