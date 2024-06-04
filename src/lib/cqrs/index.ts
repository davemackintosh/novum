import type { ArtistCommands, DrawingEvents } from "$lib/types/commands-events"

interface Metadata {
	userId: string
	userName: string
}

interface PersistableEvent<T extends DrawingEvents> {
	aggregateType: string
	aggregateId: string
	sequence: number
	eventType: string
	eventVersion: string
	payload: T
	metadata: Metadata
	timestamp: number
}

class AggregateError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "AggregateError"
	}
}

abstract class Aggregate<Events extends DrawingEvents, Commands extends ArtistCommands> {
	public readonly name: string
	private readonly version: number

	constructor(name: string, version: number) {
		this.name = name
		this.version = version
	}

	abstract handle_command(
		_aggregateId: string,
		_command: Commands,
		metadata?: Metadata,
	): Promise<Events[]>
}

abstract class View<Events extends DrawingEvents> {
	abstract handle_event(_event: Events): View<Events>
}

abstract class Query<
	V extends View<DrawingEvents>,
	VR extends ViewRepository<DrawingEvents, V>,
	Returns,
> {
	protected readonly viewRepository: VR

	constructor(viewRepository: VR) {
		this.viewRepository = viewRepository
	}

	abstract query(query: Partial<V>): Returns
}

abstract class ViewRepository<Events extends DrawingEvents, V extends View<Events>> {
	private readonly name: string
	protected readonly view: V

	constructor(name: string, view: V) {
		this.name = name
		this.view = view
	}

	// Commit a view to storage.
	abstract commit(): Promise<void>

	abstract handle_event(event: Events): Promise<void>
	abstract load(aggregateId: string): V
}

class EventRepository {
	async commit(events: PersistableEvent<DrawingEvents>[]): Promise<void> {
		// In the real world, we would commit these events to a database.
		console.info("Committing events", events)

		const existingEvents = JSON.parse(localStorage.getItem("events") || "[]")

		localStorage.setItem("events", JSON.stringify([...existingEvents, ...events]))

		return Promise.resolve()
	}
}

class CQRS<A extends Aggregate<Events, ArtistCommands>, Events extends DrawingEvents> {
	private readonly aggregate: A
	private readonly eventRepository: EventRepository
	private readonly viewRepository: ViewRepository<Events, View<Events>>

	constructor(aggregate: A, viewRepository: ViewRepository<Events, View<Events>>) {
		this.aggregate = aggregate
		this.eventRepository = new EventRepository()
		this.viewRepository = viewRepository
	}

	// Handle a command.
	async dispatchWithMetadata(
		aggregateId: string,
		command: ArtistCommands,
		metadata: Metadata,
	): Promise<Events[]> {
		const events = await this.aggregate.handle_command(aggregateId, command, metadata)
		let currentSequence = JSON.parse(localStorage.getItem("events") || "[]").length
		const persistableEvents: PersistableEvent<DrawingEvents>[] = events.map((event) => ({
			aggregateType: this.aggregate.name,
			aggregateId: aggregateId,
			sequence: currentSequence++,
			eventType: event.constructor.name,
			eventVersion: event.version,
			payload: event,
			metadata: metadata,
			timestamp: Date.now(),
		}))

		await this.eventRepository.commit(persistableEvents)

		for (const event of events) {
			// In a real world CQRS implementation, this would be triggered by a message queue,
			// or a dynamostream, postgres TRIGGER, etc. Keeping it simple for now though for
			// interview purposes.
			await this.viewRepository.handle_event(event)
			await this.viewRepository.commit()
		}

		return events
	}

	async dispatch(aggregateId: string, command: ArtistCommands): Promise<Events[]> {
		return this.dispatchWithMetadata(aggregateId, command, {
			userId: "",
			userName: "",
		})
	}
}

export {
	AggregateError,
	Aggregate,
	View,
	Query,
	ViewRepository,
	CQRS,
	EventRepository,
	type PersistableEvent,
	type Metadata,
	type DrawingEvents,
}
