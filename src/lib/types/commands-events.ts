// Event streams will allow us to traverse through time
// to create a history of events.
// This typucally happens on the backend as a data/domain driven design principle
// that gives us flexibility.
// for the sake of brevity, we're just going to parse the event stream on the frontend
// without any server-side processing.
// This also begins the process of creating a CQRS type architecture which keeps all of
// our code organised into verbs and nouns that means we have the flexibility to change our
// read model any time we want without any historical data loss or architectural complexity.

import { match } from "ts-pattern"
import type { PersistableEvent } from "$lib/cqrs"
import type { Drawable, Vector } from "$lib/ecs/components/drawings"
import { DrawableStyles } from "$lib/ecs/components/drawings"
import { createUUID } from "$lib/uuid"

/// COMMANDS
// Commands result in events that ultimately changes what anyone will and can see.

class JoinCommand {
	userName: string

	constructor(userName: string) {
		this.userName = userName
	}
}

class LeaveCommand {
	userId: string
	destroy?: boolean

	constructor(userId: string, destroy: boolean = false) {
		this.userId = userId
		this.destroy = destroy
	}
}

class NewProjectCommand {
	id: string
	name: string

	constructor(name: string, id: string) {
		this.id = id
		this.name = name
	}
}

class NewLayerCommand {
	name: string

	constructor(name: string) {
		this.name = name
	}
}

class DrawingCommandBase {
	point: Vector
	type: Drawable
	style: DrawableStyles

	constructor(point: Vector, type: Drawable, styles: DrawableStyles = new DrawableStyles()) {
		this.point = point
		this.type = type
		this.style = styles
	}
}

class StartDrawingCommand extends DrawingCommandBase {
	constructor(point: Vector, type: Drawable, styles: DrawableStyles = new DrawableStyles()) {
		super(point, type, styles)
	}
}

class EndDrawingCommand extends DrawingCommandBase {
	constructor(point: Vector, type: Drawable, styles: DrawableStyles = new DrawableStyles()) {
		super(point, type, styles)
	}
}

type ArtistCommands =
	| JoinCommand
	| LeaveCommand
	| StartDrawingCommand
	| EndDrawingCommand
	| NewLayerCommand

/// </COMMANDS

/// EVENTS
// Events are the result of commands and are persisted to the event store (usually a database.)

abstract class EventBase {
	version: string

	constructor(version: string) {
		this.version = version
	}
}

class JoinEvent extends EventBase {
	userName: string
	userId: string

	constructor(userName: string) {
		super("1.0.0")
		this.userName = userName
		this.userId = createUUID()
	}
}

class LeaveEvent extends EventBase {
	userName: string
	userId: string
	destroy?: boolean

	constructor(userName: string, userId: string, destroy?: boolean) {
		super("1.0.0")
		this.userName = userName
		this.userId = userId
		this.destroy = destroy
	}
}

class NewProjectEvent extends EventBase {
	name: string
	id: string

	constructor(name: string, id: string) {
		super("1.0.0")
		this.name = name
		this.id = id
	}
}

class NewLayerEvent extends EventBase {
	name: string

	constructor(name: string = "new layer") {
		super("1.0.0")
		this.name = name
	}
}

class DestroyArtistsArt extends EventBase {
	userId: string

	constructor(userId: string) {
		super("1.0.0")
		this.userId = userId
	}
}

class DrawingEvent extends EventBase {
	point: Vector
	styles: DrawableStyles

	constructor(point: Vector, styles: DrawableStyles) {
		super("1.0.0")
		this.point = point
		this.styles = styles
	}
}

class StartLineEvent extends DrawingEvent {
	constructor(point: Vector, styles: DrawableStyles) {
		super(point, styles)
	}
}

class EndLineEvent extends DrawingEvent {
	constructor(point: Vector, styles: DrawableStyles) {
		super(point, styles)
	}
}

class StartQuadrilateralEvent extends DrawingEvent {
	constructor(point: Vector, styles: DrawableStyles) {
		super(point, styles)
	}
}

class EndQuadrilateralEvent extends DrawingEvent {
	constructor(point: Vector, styles: DrawableStyles) {
		super(point, styles)
	}
}

type DrawingEvents =
	| JoinEvent
	| LeaveEvent
	| StartLineEvent
	| EndLineEvent
	| DestroyArtistsArt
	| NewLayerEvent
	| StartQuadrilateralEvent
	| EndQuadrilateralEvent
	| NewProjectEvent
/// </EVENTS

// There's a smarter way to get the actual type here, using type guards but for the sake of simplicity
// I'll just cast to the event type based on the eventType property which is safe enough for now.
function persistableEventsToDrawingEvents(
	events: PersistableEvent<DrawingEvents>[],
): DrawingEvents[] {
	return events.map((event) =>
		match(event)
			.with({ eventType: "NewProjectEvent" }, () => {
				const pEvent = event as PersistableEvent<NewProjectEvent>
				return new NewProjectEvent(pEvent.payload.name, pEvent.payload.id)
			})
			.with({ eventType: "JoinEvent" }, () => new JoinEvent(event.metadata.userName))
			.with(
				{ eventType: "LeaveEvent" },
				() =>
					new LeaveEvent(
						event.metadata.userName,
						event.metadata.userId,
						(event.payload as LeaveEvent).destroy,
					),
			)
			.with(
				{ eventType: "NewLayerEvent" },
				() => new NewLayerEvent((event.payload as NewLayerEvent).name),
			)
			.with({ eventType: "StartLineEvent" }, () => {
				const pEvent = event as PersistableEvent<StartLineEvent>
				return new StartLineEvent(pEvent.payload.point, pEvent.payload.styles)
			})
			.with({ eventType: "EndLineEvent" }, () => {
				const pEvent = event as PersistableEvent<EndLineEvent>
				return new EndLineEvent(pEvent.payload.point, pEvent.payload.styles)
			})
			.with({ eventType: "StartQuadrilateralEvent" }, () => {
				const pEvent = event as PersistableEvent<EndLineEvent>
				return new StartQuadrilateralEvent(pEvent.payload.point, pEvent.payload.styles)
			})
			.with({ eventType: "EndQuadrilateralEvent" }, () => {
				const pEvent = event as PersistableEvent<EndLineEvent>
				return new EndQuadrilateralEvent(pEvent.payload.point, pEvent.payload.styles)
			})
			.otherwise(() => {
				throw new Error(`Unknown event type: ${event.eventType}`)
			}),
	)
}

export {
	JoinCommand,
	LeaveCommand,
	NewLayerCommand,
	JoinEvent,
	LeaveEvent,
	NewLayerEvent,
	StartLineEvent,
	EndLineEvent,
	StartQuadrilateralEvent,
	EndQuadrilateralEvent,
	DrawingCommandBase,
	StartDrawingCommand,
	EndDrawingCommand,
	type DrawingEvents,
	type ArtistCommands,
	persistableEventsToDrawingEvents,
	DestroyArtistsArt,
	DrawingEvent,
	NewProjectCommand,
	NewProjectEvent,
}
