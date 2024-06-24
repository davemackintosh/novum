import type { RxDocument } from "rxdb"
import type { TableCodec } from "$lib/rxdb/database"

interface IVector {
	x: number
	y: number
	z?: number
	w?: number
}

class Vector implements IVector, TableCodec<Vector, IVector> {
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

	decode(persistable: RxDocument<IVector>): Vector {
		this.x = persistable.get("x")
		this.y = persistable.get("y")
		this.z = persistable.get("z")
		this.w = persistable.get("w")
		return this
	}

	encode(instance: Vector): IVector {
		return {
			x: instance.x,
			y: instance.y,
			z: instance.z,
			w: instance.w,
		}
	}

	static fromHex(hex: string): Vector {
		const r = parseInt(hex.slice(1, 3), 16)
		const g = parseInt(hex.slice(3, 5), 16)
		const b = parseInt(hex.slice(5, 7), 16)
		return new Vector(r / 255, g / 255, b / 255)
	}

	private colorComponentToHex(c: number): string {
		const hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	public toHex(): string {
		if (this.z === undefined) {
			return `#${this.colorComponentToHex(this.x * 255) + this.colorComponentToHex(this.y * 255)}00`
		}

		return `#${this.colorComponentToHex(this.x * 255) + this.colorComponentToHex(this.y * 255) + this.colorComponentToHex(this.z * 255)}`
	}

	public toRGBString(): string {
		return `rgb(${this.x * 255}, ${this.y * 255}, ${this.z ?? 0 * 255})`
	}

	public toRGBAString(alpha: number = 1): string {
		return `rgba(${this.x * 255}, ${this.y * 255}, ${this.z ?? 0 * 255}, ${alpha})`
	}
}

export { Vector, type IVector }
