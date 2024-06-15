import type { Constructor } from "./utils"
import { Entity } from "$lib/ecs/entity"

interface IComponent { }

interface System {
	update(entity: Entity): void
	accepts(component: Constructor<IComponent>): boolean
}

export { type IComponent, type System }
