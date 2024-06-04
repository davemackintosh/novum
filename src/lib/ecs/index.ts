import type { IComponent, System } from "./abstracts"
import { Entity } from "./entity"
import { persistableEventsToEntities } from "./utils"
import type { DrawingEvents } from "$lib/types/commands-events"
import type { PersistableEvent } from "$lib/cqrs"
import { createUUID } from "$lib/uuid"

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

	createEntity(aggregateId?: string): Entity {
		const entityId = aggregateId || createUUID()
		// In the real world, this would be problematic as entities are likely to be created in
		// quick succession which would result in the same entity being created multiple times or
		// consuming the same "id".
		return new Entity(entityId)
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
		const storedEvents: PersistableEvent<DrawingEvents>[] = JSON.parse(
			localStorage.getItem("events") || "[]",
		)
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
						system.update(entity)
					}
				}
			}
		}
	}
}
