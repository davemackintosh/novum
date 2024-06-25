import { type IComponent } from "$lib/ecs/abstracts"
import { Vector } from "$lib/types/vector"

export class RootCanvasPointComponent implements IComponent {
	public point: Vector

	constructor(x: number, y: number) {
		this.point = new Vector(x, y)
	}
}
