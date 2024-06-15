import { type IComponent } from "$lib/ecs/abstracts"

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

class Vector {
	x: number
	y: number
	z?: number
	w?: number

	constructor(x: number, y: number, z?: number, w?: number) {
		this.x = x
		this.y = y
		this.z = z
		this.w = w
	}
}

// We can draw quadrilaterals that start and end at some point with a fill.
class Quadrilateral extends Drawable {
	start?: Vector
	end?: Vector
	styles: DrawableStyles

	constructor(start?: Vector, end?: Vector) {
		super()
		this.start = start
		this.end = end
		this.styles = new DrawableStyles()
	}
}

class Line extends Drawable {
	start: Vector
	end: Vector
	styles: DrawableStyles

	constructor(start: Vector, end: Vector) {
		super()
		this.start = start
		this.end = end
		this.styles = new DrawableStyles()
	}
}

type Drawables = Quadrilateral | Line

export { Drawable, DrawableStyles, Vector, Quadrilateral, Line, type Drawables }
