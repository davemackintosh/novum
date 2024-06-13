import { match } from "ts-pattern"
import type { PersistableEvent } from "$lib/cqrs"
import type { Drawable, Vector } from "$lib/ecs/components/drawings"
import { DrawableStyles } from "$lib/ecs/components/drawings"

/// COMMANDS
// Commands result in events that ultimately changes what anyone will and can see.

class JoinCommand {
	userAddress: string

	constructor(userAddress: string) {
		this.userAddress = userAddress
	}
}

class InviteCommand {
	inviteUserAddresses: string[]

	constructor(inviteUserAddresses: string[]) {
		this.inviteUserAddresses = inviteUserAddresses
	}
}

class LeaveCommand {
	userAddress: string

	constructor(userId: string) {
		this.userAddress = userId
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
	id: string
	name: string

	constructor(name: string) {
		this.id = crypto.randomUUID()
		this.name = name
	}
}

class SetLayerNameCommand {
	id: string
	name: string

	constructor(id: string, name: string) {
		this.id = id
		this.name = name
	}
}

class DrawingCommandBase {
	point: Vector
	type: Drawable
	style: DrawableStyles
	layer: NewLayerEvent

	constructor(
		point: Vector,
		type: Drawable,
		layer: NewLayerEvent,
		styles: DrawableStyles = new DrawableStyles(),
	) {
		this.point = point
		this.type = type
		this.style = styles
		this.layer = layer
	}
}

class StartDrawingCommand extends DrawingCommandBase {
	constructor(
		point: Vector,
		type: Drawable,
		layer: NewLayerEvent,
		styles: DrawableStyles = new DrawableStyles(),
	) {
		super(point, type, layer, styles)
	}
}

class EndDrawingCommand extends DrawingCommandBase {
	constructor(
		point: Vector,
		type: Drawable,
		layer: NewLayerEvent,
		styles: DrawableStyles = new DrawableStyles(),
	) {
		super(point, type, layer, styles)
	}
}

class DeleteLayerCommand {
	id: string

	constructor(id: string) {
		this.id = id
	}
}

type ProjectCommands =
	| JoinCommand
	| LeaveCommand
	| StartDrawingCommand
	| EndDrawingCommand
	| NewLayerCommand
	| InviteCommand
	| SetLayerNameCommand
	| DeleteLayerCommand

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
	userAddress: string

	constructor(userAddress: string) {
		super("1.0.0")
		this.userAddress = userAddress
	}
}

class LeaveEvent extends EventBase {
	userAddress: string

	constructor(userAddress: string) {
		super("1.0.0")
		this.userAddress = userAddress
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
	id: string

	constructor(id: string = crypto.randomUUID()) {
		super("1.0.0")
		this.id = id
	}
}

class SetLayerNameEvent extends EventBase {
	id: string
	name: string

	constructor(id: string, name: string) {
		super("1.0.0")
		this.id = id
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

class InviteEvent extends EventBase {
	inviteUserAddresses: string[]

	constructor(inviteUserAddresses: string[]) {
		super("1.0.0")
		this.inviteUserAddresses = inviteUserAddresses
	}
}

class DeleteLayerEvent extends EventBase {
	id: string

	constructor(id: string) {
		super("1.0.0")
		this.id = id
	}
}

type ProjectEvents =
	| JoinEvent
	| LeaveEvent
	| StartLineEvent
	| EndLineEvent
	| DestroyArtistsArt
	| NewLayerEvent
	| SetLayerNameEvent
	| DeleteLayerEvent
	| StartQuadrilateralEvent
	| EndQuadrilateralEvent
	| NewProjectEvent
	| InviteEvent

/// </EVENTS

// There's a smarter way to get the actual type here, using type guards but for the sake of simplicity
// I'll just cast to the event type based on the eventType property which is safe enough for now.
function persistableEventToProjectEvents(event: PersistableEvent<ProjectEvents>) {
	return match(event)
		.with({ eventType: "NewProjectEvent" }, () => {
			const pEvent = event as PersistableEvent<NewProjectEvent>
			return new NewProjectEvent(pEvent.payload.name, pEvent.payload.id)
		})
		.with({ eventType: "JoinEvent" }, () => new JoinEvent(event.metadata.userAddress))
		.with({ eventType: "LeaveEvent" }, () => new LeaveEvent(event.metadata.userAddress))
		.with(
			{ eventType: "NewLayerEvent" },
			() => new NewLayerEvent(),
		)
		.with({ eventType: "SetLayerNameEvent" }, () => {
			const pEvent = event as PersistableEvent<SetLayerNameEvent>
			return new SetLayerNameEvent(pEvent.payload.id, pEvent.payload.name)
		})
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
		.with({ eventType: "InviteEvent" }, () => {
			const pEvent = event as PersistableEvent<InviteEvent>
			return new InviteEvent(pEvent.payload.inviteUserAddresses)
		})
		.otherwise(() => {
			throw new Error(`Unknown event type: ${event.eventType}`)
		})
}

function persistableEventsToProjectEvents(
	events: PersistableEvent<ProjectEvents>[],
): ProjectEvents[] {
	return events.map(persistableEventToProjectEvents)
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
	type ProjectEvents,
	type ProjectCommands,
	persistableEventsToProjectEvents,
	persistableEventToProjectEvents,
	DestroyArtistsArt,
	DrawingEvent,
	NewProjectCommand,
	NewProjectEvent,
	InviteCommand,
	InviteEvent,
	DeleteLayerCommand,
	DeleteLayerEvent,
	SetLayerNameCommand,
	SetLayerNameEvent,
}
