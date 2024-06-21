import { Vector } from "./drawings"
import { type IComponent } from "$lib/ecs/abstracts"

export class CanvasPointComponent implements IComponent {
	public point: Vector
	public pressure: number
	public tilt: Vector

	constructor(x: number, y: number) {
		this.point = new Vector(x, y)
		this.pressure = 0.5
		this.tilt = new Vector(0, 0)
	}
}
