import { match } from "ts-pattern"
import { Entity } from "$lib/ecs/entity"
import { LayerComponent } from "$lib/ecs/components/layer"
import type { PersistableEvent, ProjectEvents } from "$lib/cqrs"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T

function entitiesFromPersistableEvents(events: PersistableEvent<ProjectEvents>[]): Entity[] {
	const entities: Entity[] = events.map((event) => {
		const entity = new Entity(event.aggregateId)

		match(event)
			.with({ eventType: "NewLayerEvent" }, () => {
				const component = new LayerComponent()
				entity.addComponent(component)
			})
			.otherwise(() => {
				console.warn(`Unknown event type: ${event.eventType}`)
			})

		return entity
	})

	return entities
}

export { entitiesFromPersistableEvents, type Constructor }
