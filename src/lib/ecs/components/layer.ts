import { type IComponent } from "$lib/ecs/abstracts"

export class LayerComponent implements IComponent {
	public name: string

	constructor(name: string) {
		this.name = name
	}
}
