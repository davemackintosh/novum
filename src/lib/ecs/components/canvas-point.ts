import { type IComponent } from "$lib/ecs/abstracts"

export class CanvasPointComponent implements IComponent {
	public x: number
	public y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}
}

