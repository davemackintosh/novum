import { type IComponent } from "$lib/ecs/abstracts"
import { Vector } from "$lib/types/vector"

class Drawable implements IComponent {
	transformOrigin: Vector
	styles: DrawableStyles

	constructor() {
		this.transformOrigin = new Vector(0, 0)
		this.styles = new DrawableStyles()
	}
}

class DrawableStyles {
	fill: string
	thickness: number

	constructor(fill: string = "#000000", thickness: number = 4) {
		this.fill = fill
		this.thickness = thickness
	}
}

export { Drawable, DrawableStyles }
