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

	static fromHex(hex: string): Vector {
		const r = parseInt(hex.slice(1, 3), 16)
		const g = parseInt(hex.slice(3, 5), 16)
		const b = parseInt(hex.slice(5, 7), 16)
		return new Vector(r / 255, g / 255, b / 255)
	}

	public toRGBAString(alpha: number = 1): string {
		return `rgba(${this.x * 255}, ${this.y * 255}, ${this.z ?? 0 * 255}, ${alpha})`
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
