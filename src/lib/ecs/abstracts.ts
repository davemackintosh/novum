import { Entity } from "$lib/ecs/entity"

abstract class IComponent {
	constructor() {}
}

abstract class System {
	abstract update(entity: Entity): void

	abstract accepts(subscription: IComponent): boolean
}

export { IComponent, System }
