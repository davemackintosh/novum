import { P, match } from "ts-pattern"
import type { IComponent, System } from "$lib/ecs/abstracts"
import { CanvasPointComponent } from "$lib/ecs/components/canvas-point"
import type { Vector } from "$lib/ecs/components/drawings"
import type { Entity } from "$lib/ecs/entity"
import { RasterizedImageComponent } from "$lib/ecs/components/rasterized-image"

enum ToolboxTool {
	PointerTool,
	RectangleSelection,
	Pencil,
	Eraser,
	Rectangle,
	Line,
	Quadrilateral,
}

class ToolboxToolBase {
	type?: ToolboxTool
	name?: string
	icon?: string
	description?: string
	tutorial?: string

	constructor() {}
}

class PointerTool extends ToolboxToolBase implements System {
	constructor() {
		super()
		this.type = ToolboxTool.PointerTool
		this.name = "Pointer"
		this.icon = "pointer"
		this.description = "Select elements"
		this.tutorial = "Move the cursor over an element and click/tap to select it."
	}

	update(entity: Entity): void {
		const position = entity.getComponent(CanvasPointComponent)
		const icon = entity.getComponent(RasterizedImageComponent)

		if (!position) {
			console.warn("Couldn't get position for rectangle selection.")
			return
		}

		if (!icon) {
			console.warn("Didn't find an icon for the cursor.")
			return
		}

		icon!.point = position!.point!
	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with(P.instanceOf(RasterizedImageComponent), () => true)
			.with(P.instanceOf(CanvasPointComponent), () => true)
			.otherwise(() => false)
	}
}

class RectangleSelection extends ToolboxToolBase implements System {
	start?: Vector
	end?: Vector

	constructor(start?: Vector) {
		super()
		this.type = ToolboxTool.RectangleSelection
		this.name = "Rectangle Selection"
		this.icon = "rectangle"
		this.description = "Select a rectangle on the canvas."
		this.tutorial = "Click and drag to create a rectangle."

		this.start = start
	}

	update(entity: Entity): void {
		const position = entity.getComponent(CanvasPointComponent)

		if (!position) {
			console.warn("Couldn't get position for rectangle selection.")
		}

		console.log(position)
	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with(P.instanceOf(CanvasPointComponent), () => true)
			.otherwise(() => false)
	}
}

export { ToolboxTool, ToolboxToolBase, RectangleSelection, PointerTool }
