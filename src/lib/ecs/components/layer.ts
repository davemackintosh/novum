import { IComponent } from "$lib/ecs/abstracts"

export class LayerComponent extends IComponent {
	public name?: string

	constructor(name: string = "new layer") {
		super()

		this.name = name
	}
}
