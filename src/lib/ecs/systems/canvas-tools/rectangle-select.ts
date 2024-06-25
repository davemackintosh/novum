import { P, match } from "ts-pattern"
import type { IComponent, System } from "$lib/ecs/abstracts"
import { CanvasPointComponent } from "$lib/ecs/components/canvas-point"
import type { Entity } from "$lib/ecs/entity"
import { ToolboxTool, ToolboxToolBase } from "$lib/types/toolbox"
import { Vector } from "$lib/types/vector"

export class RectangleSelection extends ToolboxToolBase implements System {
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
