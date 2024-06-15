import type { IComponent, System } from "$lib/ecs/abstracts"
import type { Vector } from "$lib/ecs/components/drawings"
import type { Entity } from "$lib/ecs/entity"

enum ToolboxTool {
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

	constructor() {
	}
}

class RectangleSelection extends ToolboxToolBase implements System {
	start: Vector
	end?: Vector

	constructor(start: Vector) {
		super()
		this.type = ToolboxTool.RectangleSelection
		this.name = "Rectangle Selection"
		this.icon = "rectangle"
		this.description = "Select a rectangle on the canvas."
		this.tutorial = "Click and drag to create a rectangle."

		this.start = start
	}

	update(entity: Entity): void {

	}

	accepts(component: IComponent): boolean {
		throw new Error("Method not implemented.")
	}
}

export { ToolboxTool, ToolboxToolBase, RectangleSelection }
