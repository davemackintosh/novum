import { Entity, IComponent } from "$lib/ecs"
import type { PersistableEvent } from "$lib/cqrs"
import type { DrawingEvents } from "$lib/types/commands-events"

export function persistableEventsToEntities(events: PersistableEvent<DrawingEvents>[]): Entity[] {
	const entities: Entity[] = events.map((event, i) => {
		const entity = new Entity(i)

		entity.addComponent(event.payload as IComponent)

		return entity
	})

	return entities
}
