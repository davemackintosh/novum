import type { ProjectView } from "$lib/cqrs/views/project"
import { P, match } from "ts-pattern"

export class Entity {
	public readonly id: number
	public readonly components: Component[]

	constructor(id: number) {
        this.id = id
		this.components = []
    }

	getComponents(): Component[] {
		return this.components
    }

	getComponent<T>(type: new (...args: any[]) => T): T | undefined { 
		return this.components.find(c => c instanceof type.constructor) as T | undefined
	}

	hasComponent<T>(component: new (...args: any[]) => T): boolean {
		return this.components.some(c => c instanceof component.constructor)
	}

	addComponent(component: Component): void {
		this.components.push(component)
	}

	removeComponent(component: Component): void {
        this.components.splice(this.components.indexOf(component), 1)
    }
}

export class Component { }

export abstract class System {
	abstract update(entity: Entity, component: Component): void;

	abstract accepts(subscription: Component): boolean
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
	
	addComponent(entity: Entity, component: Component): void {
			entity.addComponent(component)
	}
	
	removeComponent(entity: Entity, component: Component): void {
		entity.removeComponent(component)
	}
	
	removeEntity(entity: Entity): void {
        this.entities.splice(this.entities.indexOf(entity), 1)
	}

	stateFromStorage(projectView: ProjectView): void { 
		projectView.layers.forEach(layer => {
			const entity = new Entity(layer.id)
			this.addEntity(entity)
			for (const component of layer.components) {
				entity.addComponent(component)
			}
		})
		
		console.log("applied ecs state from project view", this)
	}
	
	update(): void {
		// Update all systems based on their component subscriptions.
		for (const entity of this.entities) {
			for (const system of this.registeredSystems) {
				for (const component of entity.getComponents()) {
					if (system.accepts(component)) {
						system.update(entity, component)
					}
				}
			}
		}
    }
}