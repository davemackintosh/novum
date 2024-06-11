import { match } from "ts-pattern"
import { QuadrilateralComponent } from "./components/quadrilateral"
import { Entity } from "$lib/ecs/entity"
import { LayerComponent } from "$lib/ecs/components/layer"
import type { PersistableEvent } from "$lib/cqrs"
import type {
	DrawingEvents,
	EndQuadrilateralEvent,
	StartQuadrilateralEvent,
} from "$lib/types/commands-events"

export function persistableEventsToEntities(events: PersistableEvent<DrawingEvents>[]): Entity[] {
	const entities: Entity[] = events.map((event) => {
		const entity = new Entity(event.aggregateId)

		match(event)
			.with({ eventType: "NewLayerEvent" }, () => {
				const component = new LayerComponent()
				entity.addComponent(component)
			})
			.with({ eventType: "StartQuadrilateralEvent" }, () => {
				const pEvent = event.payload as StartQuadrilateralEvent
				const component = entity.getComponent(QuadrilateralComponent)
				if (component) {
					component.start = pEvent.point
					entity.addComponent(component)
				} else {
					entity.addComponent(new QuadrilateralComponent(pEvent.point))
				}
			})
			.with({ eventType: "EndQuadrilateralEvent" }, () => {
				const pEvent = event.payload as EndQuadrilateralEvent
				const component = entity.getComponent(QuadrilateralComponent)
				if (component) {
					component.end = pEvent.point
				} else {
					entity.addComponent(new QuadrilateralComponent(undefined, pEvent.point))
				}
			})
			.otherwise(() => {
				console.warn(`Unknown event type: ${event.eventType}`)
			})

		return entity
	})

	return entities
}
