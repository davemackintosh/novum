import { type IComponent } from "$lib/ecs/abstracts"

export class LayerComponent implements IComponent {
	public name?: string

	constructor(name: string = "new layer") {
		this.name = name
	}
}
