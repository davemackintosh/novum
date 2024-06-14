import { match } from "ts-pattern"
import type { PersistableEvent } from "$lib/cqrs"

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
	layerId: string
	name: string

	constructor(name: string) {
		this.layerId = crypto.randomUUID()
		this.name = name
	}
}

class SetLayerNameCommand {
	layerId: string
	name: string

	constructor(layerId: string, name: string) {
		this.layerId = layerId
		this.name = name
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
	layerId: string
	name: string

	constructor(layerId: string, name: string) {
		super("1.0.0")
		this.layerId = layerId
		this.name = name
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
	| NewLayerEvent
	| SetLayerNameEvent
	| DeleteLayerEvent
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
			return new SetLayerNameEvent(pEvent.payload.layerId, pEvent.payload.name)
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
	type ProjectEvents,
	type ProjectCommands,
	persistableEventsToProjectEvents,
	persistableEventToProjectEvents,
	NewProjectCommand,
	NewProjectEvent,
	InviteCommand,
	InviteEvent,
	DeleteLayerCommand,
	DeleteLayerEvent,
	SetLayerNameCommand,
	SetLayerNameEvent,
}
