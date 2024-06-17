import { Vector } from "./drawings"
import { type IComponent } from "$lib/ecs/abstracts"

export class RootCanvasPointComponent implements IComponent {
	public point: Vector

	constructor(x: number, y: number) {
		this.point = new Vector(x, y)
	}
}


