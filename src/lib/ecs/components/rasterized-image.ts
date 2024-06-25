import { type IComponent } from "$lib/ecs/abstracts"
import { Vector } from "$lib/types/vector"

export class RasterizedImageComponent implements IComponent {
	public icon: string
	public point?: Vector
	public width?: number
	public height?: number

	constructor(icon: string, width?: number, height?: number) {
		this.icon = icon
		this.width = width
		this.height = height
	}
}
