import { P, match } from "ts-pattern"
import { RootCanvasPointComponent } from "$lib/ecs/components/root-canvas-point"
import {
	PaintbrushComponent,
	PaintbrushStylesComponent,
} from "$lib/ecs/components/paintbrushes"
import type { IComponent, System } from "$lib/ecs/abstracts"
import type { Entity } from "$lib/ecs/entity"
import type { Vector } from "$lib/ecs/components/drawings"
import { Canvas2DContext } from "$lib/ecs/components/canvas-2d-context"

export class CanvasPaintBrushSystem implements System {
	public rootCanvasPoint: RootCanvasPointComponent | undefined
	public nextPoint: Vector | undefined
	public lastPoint: Vector | undefined
	private isPainting: boolean = false

	update(entity: Entity): void {
		const paintbrush = entity.getComponent(PaintbrushComponent)
		const rootCanvasPoint = entity.getComponent(RootCanvasPointComponent)
		const renderingContext = entity.getComponent(Canvas2DContext)
		const paintbrushStyles = entity.getComponent(PaintbrushStylesComponent)

		if (!renderingContext || !renderingContext.hasCtx()) {
			console.warn("Couldn't get rendering context for paintbrush.")
			return
		}

		if (!paintbrushStyles) {
			console.warn("Couldn't get paintbrush styles for paintbrush.")
			return
		}

		if (paintbrush && rootCanvasPoint && this.isPainting) {
			paintbrush.paint(
				renderingContext.getCtx(),
				paintbrushStyles,
				rootCanvasPoint.point,
				this.lastPoint,
			)
			this.lastPoint = rootCanvasPoint.point
		}
	}

	setIsPainting(isPainting: boolean): void {
		this.isPainting = isPainting
	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with(P.instanceOf(RootCanvasPointComponent), () => true)
			.with(P.instanceOf(PaintbrushComponent), () => true)
			.with(P.instanceOf(PaintbrushStylesComponent), () => true)
			.with(P.instanceOf(Canvas2DContext), () => true)
			.otherwise(() => false)
	}
}
