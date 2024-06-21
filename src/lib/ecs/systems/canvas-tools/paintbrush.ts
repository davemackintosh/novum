import { P, match } from "ts-pattern"
import { RootCanvasPointComponent } from "$lib/ecs/components/root-canvas-point"
import { PaintbrushComponent } from "$lib/ecs/components/paintbrushes"
import type { IComponent, System } from "$lib/ecs/abstracts"
import type { Entity } from "$lib/ecs/entity"
import type { Vector } from "$lib/ecs/components/drawings"
import { Canvas2DContext } from "$lib/ecs/components/canvas-2d-context"

export class CanvasPaintBrushSystem implements System {
	public rootCanvasPoint: RootCanvasPointComponent | undefined
	public nextPoint: Vector | undefined
	public lastPoint: Vector | undefined

	update(entity: Entity): void {
		const rootCanvasPoint = entity.getComponent(RootCanvasPointComponent)
		const paintbrush = entity.getComponent(PaintbrushComponent)
		const renderingContext = entity.getComponent(Canvas2DContext)

		if (!renderingContext) {
			console.warn("Couldn't get rendering context for paintbrush.")
			return
		}

		if (paintbrush && rootCanvasPoint) {
			paintbrush.paint(renderingContext.ctx, rootCanvasPoint.point, this.lastPoint)
			this.lastPoint = rootCanvasPoint.point
		}
	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with(P.instanceOf(RootCanvasPointComponent), () => true)
			.with(P.instanceOf(PaintbrushComponent), () => true)
			.otherwise(() => false)
	}
}
