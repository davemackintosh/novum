// Event streams will allow us to traverse through time
// to create a history of events.
// This typucally happens on the backend as a data/domain driven design principle
// that gives us flexibility.
// for the sake of brevity, we're just going to parse the event stream on the frontend
// without any server-side processing.
// This also begins the process of creating a CQRS type architecture which keeps all of 
// our code organised into verbs and nouns that means we have the flexibility to change our
// read model any time we want without any historical data loss or architectural complexity.

import type { PersistableEvent } from "$lib/cqrs"
import { match } from "ts-pattern"
import type { Drawable, Line, Quadrilateral, Vector } from "../lib/ecs/components/drawings"
import { DrawableStyles} from "../lib/ecs/components/drawings"

/// COMMANDS
// Commands result in events that ultimately changes what anyone will and can see.

export class JoinCommand {
	userName: string

	constructor(userName: string) {
		this.userName = userName
	}
}

export class LeaveCommand {
	userId: string
	destroy?: boolean

	constructor(userId: string, destroy: boolean = false) {
		this.userId = userId
		this.destroy = destroy
	}
}

export class NewLayerCommand {
	name: string

	constructor(name: string) {
        this.name = name
    }
}

export class DrawingCommandBase {
	start: Vector
	type: Drawable
	style: DrawableStyles


	constructor(start: Vector, type: Drawable, styles: DrawableStyles = new DrawableStyles()) {
		this.start = start
		this.type = type
		this.style = styles
	}
}

export class StartDrawingCommand extends DrawingCommandBase {
	constructor(start: Vector, type: Drawable, styles: DrawableStyles = new DrawableStyles()) {
		super(start, type, styles)
	}
}

export class EndDrawingCommand extends DrawingCommandBase {
	constructor(start: Vector, type: Drawable, styles: DrawableStyles = new DrawableStyles()) {
		super(start, type, styles)
	}
}

export type ArtistCommands = JoinCommand | LeaveCommand | StartDrawingCommand | EndDrawingCommand | NewLayerCommand

/// </COMMANDS

/// EVENTS
// Events are the result of commands and are persisted to the event store (usually a database.)

abstract class EventBase {
	version: string

	constructor(version: string) {
        this.version = version
    }
}

export class JoinEvent extends EventBase {
	userName: string
	userId: string

	constructor(userName: string, userId: string) {
		super("1.0.0")
		this.userName = userName
		// generate a unique id for the user.
		this.userId = Math.random().toString(36)
	}
}

export class LeaveEvent extends EventBase {
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

export class NewLayerEvent extends EventBase {
	name: string

	constructor(name: string = "new layer") {
		super("1.0.0")
		this.name = name
	}
}

export class DestroyArtistsArt extends EventBase {
	userId: string

	constructor(userId: string) {
		super("1.0.0")
		this.userId = userId
	}
}

class DrawingEvent extends EventBase {
	userId: string
	x: number
	y: number
	color: string
	width: number

	constructor(userId: string, x: number, y: number, color: string, width: number) {
		super("1.0.0")
		this.userId = userId
		this.x = x
		this.y = y
		this.color = color
		this.width = width
	}
}

export class StartLineEvent extends DrawingEvent {
	constructor(userId: string, x: number, y: number, color: string, width: number) {
		super(userId, x, y, color, width)
	}
}

export class EndLineEvent extends DrawingEvent {
	constructor(userId: string, x: number, y: number, color: string, width: number) {
		super(userId, x, y, color, width)
	}
}

export class StartQuadrilateralEvent extends DrawingEvent {
	constructor(userid: string, x: number, y: number, color: string, width: number) {
		super(userid, x, y, color, width)
	}
}

export class EndQuadrilateralEvent extends DrawingEvent {
	constructor(userid: string, x: number, y: number, color: string, width: number) {
		super(userid, x, y, color, width)
	}
}

export type DrawingEvents = JoinEvent | LeaveEvent | StartLineEvent | EndLineEvent | DestroyArtistsArt | NewLayerEvent
/// </EVENTS

export function persistableEventsToDrawingEvents(events: PersistableEvent[]): DrawingEvents[] {
	return events.map(event => 
		match(event.eventType)
			.with("JoinEvent", () => new JoinEvent(event.metadata.userName, event.metadata.userId))
			.with("LeaveEvent", () => new LeaveEvent(event.metadata.userName, event.metadata.userId, event.payload.destroy))
			.with("NewLayerEvent", () => new NewLayerEvent(event.payload.name))
			.with("StartLineEvent", () => new StartLineEvent(event.metadata.userId, event.payload.x, event.payload.y, event.payload.color, event.payload.width))
			.with("EndLineEvent", () => new EndLineEvent(event.metadata.userId, event.payload.x, event.payload.y, event.payload.color, event.payload.width))
			.with("StartQuadrilateralEvent", () => new StartQuadrilateralEvent(event.metadata.userId, event.payload.x, event.payload.y, event.payload.color, event.payload.width))
			.with("EndQuadrilateralEvent", () => new EndQuadrilateralEvent(event.metadata.userId, event.payload.x, event.payload.y, event.payload.color, event.payload.width))
			.otherwise(() => {
				throw new Error(`Unknown event type: ${event.eventType}`)
			})
	)
}
