// Event streams will allow us to traverse through time
// to create a history of events.
// This typucally happens on the backend as a data/domain driven design principle
// that gives us flexibility.
// for the sake of brevity, we're just going to parse the event stream on the frontend
// without any server-side processing.
// This also begins the process of creating a CQRS type architecture which keeps all of 
// our code organised into verbs and nouns that means we have the flexibility to change our
// read model any time we want without any historical data loss or architectural complexity.

import type { Drawable, Line, Quadrilateral } from "../lib/ecs/components/drawings"

export interface ESEvent {
	aggregateId: string
	aggregateType: string
	eventType: string
	// We will take care of the serialization of the payload to JSON on commit.
	payload: Event
	timestamp: Date
	version: number
	sequenceNumber: number
}

/// COMMANDS
// Commands result in events that ultimately changes what anyone will and can see.

export class JoinCommand {
	userName: string
	userId: string

	constructor(userName: string, userId: string) {
		this.userName = userName
		this.userId = userId
	}
}

export class LeaveCommand {
	userName: string
	userId: string
	destroy?: boolean

	constructor(userName: string, userId: string, destroy: boolean = false) {
		this.userName = userName
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

export class StartDrawingCommand {
	userId: string
	x: number
	y: number
	color: string
	width: number
	type: Drawable


	constructor(userId: string, x: number, y: number, color: string, width: number, type: Drawable) {
		this.userId = userId
		this.x = x
		this.y = y
		this.color = color
		this.width = width
		this.type = type
	}
}

export class EndDrawingCommand {
	userId: string
	x: number
	y: number
	color: string
	width: number
	type: Drawable


	constructor(userId: string, x: number, y: number, color: string, width: number, type: Drawable) {
		this.userId = userId
		this.x = x
		this.y = y
		this.color = color
		this.width = width
		this.type = type
	}
}

export type ArtistCommands = JoinCommand | LeaveCommand | StartDrawingCommand | EndDrawingCommand | NewLayerCommand

/// </COMMANDS

/// EVENTS
// Events are the result of commands and are persisted to the event store (usually a database.)

export class JoinEvent {
	userName: string
	userId: string

	constructor(userName: string, userId: string) {
		this.userName = userName
		this.userId = userId
	}
}

export class LeaveEvent {
	userName: string
	userId: string
	destroy?: boolean

	constructor(userName: string, userId: string, destroy?: boolean) {
		this.userName = userName
		this.userId = userId
		this.destroy = destroy
	}
}

export class NewLayerEvent {
	name: string

	constructor(name: string) {
		this.name = name
	}
}

export class DestroyArtistsArt {
	userId: string

	constructor(userId: string) {
		this.userId = userId
	}
}

class DrawingEvent {
	userId: string
	x: number
	y: number
	color: string
	width: number

	constructor(userId: string, x: number, y: number, color: string, width: number) {
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

export type DrawingEvents = JoinEvent | LeaveEvent | StartLineEvent | EndLineEvent | DestroyArtistsArt | NewLayerCommand
/// </EVENTS
