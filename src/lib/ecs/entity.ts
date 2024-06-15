import type { IComponent } from "./abstracts"
import type { Constructor } from "./utils"

export class Entity {
	public readonly id: string
	public readonly components: IComponent[]

	constructor(id?: string) {
		this.id = id ?? crypto.randomUUID()
		this.components = []
	}

	getComponents(): IComponent[] {
		return this.components
	}

	getComponent<T>(type: Constructor<T>): T | undefined {
		return this.components.find((c) => c instanceof type.constructor) as T | undefined
	}

	hasComponent<T>(component: new (...args: unknown[]) => T): boolean {
		return this.components.some((c) => c instanceof component.constructor)
	}

	addComponent(component: IComponent): void {
		this.components.push(component)
	}

	removeComponent(component: IComponent): void {
		this.components.splice(this.components.indexOf(component), 1)
	}
}
