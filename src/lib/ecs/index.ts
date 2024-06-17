import type { IComponent, System } from "./abstracts"
import { Entity } from "./entity"
import { entitiesFromPersistableEvents } from "./utils"
import { dbInstance } from "$lib/rxdb/database"

// A basic ECS for drawing on a canvas across multiple users.
export class ECS {
	public readonly entities: Entity[]
	private readonly registeredSystems: System[]

	constructor() {
		this.entities = []
		this.registeredSystems = []
	}

	registerSystem(system: System): void {
		console.info("Registered system", system)
		this.registeredSystems.push(system)
	}

	createEntity(): Entity {
		const entityId = crypto.randomUUID()
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

	async stateFromStorage(aggregateId: string): Promise<void> {
		const storedEvents = await dbInstance.events.find({
			selector: {
				aggregateId,
			}
		}).exec()
		const newEntities = entitiesFromPersistableEvents(storedEvents)

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
