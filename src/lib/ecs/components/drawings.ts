import { Component } from "$lib/ecs"

export class Drawable extends Component {
	transformOrigin: Vector
	styles: DrawableStyles

	constructor() {
		super()
		this.transformOrigin = new Vector(0, 0)
		this.styles = new DrawableStyles()
	}
}

export class DrawableStyles {
	fill: string
	thickness: number

	constructor(fill: string = "#000000", thickness: number = 4) {
		this.fill = fill
		this.thickness = thickness
	}
}

export class Vector {
	x: number
	y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}
}

// We can draw quadrilaterals that start and end at some point with a fill.
export class Quadrilateral extends Drawable {
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

export class Line extends Drawable {
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

export type Drawables = Quadrilateral | Line
