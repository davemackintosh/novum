import type { PersistableEvent } from "$lib/cqrs"
import type { DrawingEvents } from "$lib/types/commands-events"
import { persistableEventsToEntities } from "./utils"

export class Entity {
	public readonly id: number
	public readonly components: IComponent[]

	constructor(id: number) {
		this.id = id
		this.components = []
	}

	getComponents(): IComponent[] {
		return this.components
	}

	getComponent<T>(type: new (...args: unknown[]) => T): T | undefined {
		return this.components.find(c => c instanceof type.constructor) as T | undefined
	}

	hasComponent<T>(component: new (...args: unknown[]) => T): boolean {
		return this.components.some(c => c instanceof component.constructor)
	}

	addComponent(component: IComponent): void {
		this.components.push(component)
	}

	removeComponent(component: IComponent): void {
		this.components.splice(this.components.indexOf(component), 1)
	}
}

export abstract class IComponent {
	public readonly name: string

	constructor(name: string) {
		this.name = name
	}
}

export abstract class System {
	abstract update(entity: Entity, component: IComponent): void;

	abstract accepts(subscription: IComponent): boolean
}

// A basic ECS for drawing on a canvas across multiple users.
export class ECS {
	public readonly entities: Entity[]
	private readonly registeredSystems: System[]

	constructor() {
		this.entities = []
		this.registeredSystems = []
	}

	registerSystem(system: System): void {
		this.registeredSystems.push(system)
	}

	createEntity(): Entity {
		// In the real world, this would be problematic as entities are likely to be created in
		// quick succession which would result in the same entity being created multiple times or 
		// consuming the same "id".
		const entity = new Entity(this.entities.length + 1)

		return entity
	}

	addEntity(entity: Entity): void {
		this.entities.push(entity)
	}

	addComponent(entity: Entity, component: IComponent): void {
		entity.addComponent(component)
	}

	removeComponent(entity: Entity, component: IComponent): void {
		entity.removeComponent(component)
	}

	removeEntity(entity: Entity): void {
		this.entities.splice(this.entities.indexOf(entity), 1)
	}

	async stateFromStorage(): Promise<void> {
		const storedEvents: PersistableEvent<DrawingEvents>[] = JSON.parse(localStorage.getItem("events") || "[]")
		const newEntities = persistableEventsToEntities(storedEvents)

		for (const newEntity of newEntities) {
			this.addEntity(newEntity)
		}

		console.log("applied ecs state from project view", this.entities)
	}

	update(): void {
		for (const entity of this.entities) {
			for (const system of this.registeredSystems) {
				for (const component of entity.getComponents()) {
					if (system.accepts(component)) {
						console.log("update", entity, component, system)
						system.update(entity, component)
					}
				}
			}
		}
	}
}
