import type { System } from "$lib/ecs/abstracts"
import { CanvasPointComponent } from "$lib/ecs/components/canvas-point"
import { RasterizedImageComponent } from "$lib/ecs/components/rasterized-image"
import type { Entity } from "$lib/ecs/entity"
import { ToolboxTool, ToolboxToolBase } from "$lib/types/toolbox"

export class PointerTool extends ToolboxToolBase implements System {
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
