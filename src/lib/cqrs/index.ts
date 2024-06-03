import type { ArtistCommands, DrawingEvents } from "../../types/commands-events"

export interface PersistableEvent {
	aggregateType: string
	aggregateId: string
    sequence: number
    eventType: string
    eventVersion: string
    payload: any
    metadata: any
    timestamp: number
}

export class AggregateError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "AggregateError"
	}
}

export abstract class Aggregate<Events extends DrawingEvents, Commands extends ArtistCommands> {
	public readonly name: string
	private readonly version: number

	constructor(name: string, version: number) {
		this.name = name
		this.version = version
	}

	abstract handle_command(_aggregateId: string, _command: Commands): Events[];
}

export abstract class View<Events extends DrawingEvents> {
	abstract handle_event(_event: Events): View<Events>;
}

export abstract class Query<
	V extends View<DrawingEvents>,
	VR extends ViewRepository<DrawingEvents, V>,
	Returns
> {
	protected readonly viewRepository: VR

	constructor(viewRepository: VR) {
		this.viewRepository = viewRepository
	}

	abstract query(query: Partial<V>): Promise<Returns>;
}

export abstract class ViewRepository<Events extends DrawingEvents, V extends View<Events>> {
	private readonly name: string
	protected readonly view: V

	constructor(name: string, view: V) {
		this.name = name
		this.view = view
	}

	// Commit a view to storage.
	abstract commit(): Promise<void>;

	abstract handle_event(event: Events): Promise<void>;
	abstract load(aggregateId: string): Promise<V>;
}

export class EventRepository<Events extends DrawingEvents> {
	async commit(events: PersistableEvent[]): Promise<void> {
		// In the real world, we would commit these events to a database.
		console.info("Committing events", events)

		const existingEvents = JSON.parse(localStorage.getItem("events") || "[]")

		localStorage.setItem("events", JSON.stringify([
			...existingEvents,
			...events,
		]))

		return Promise.resolve()
	}
}

export class CQRS<A extends Aggregate<Events, ArtistCommands>, Events extends DrawingEvents> {
	private readonly aggregate: A
	private readonly eventRepository: EventRepository<Events>;
	private readonly viewRepository: ViewRepository<Events, View<Events>>;

	constructor(aggregate: A, viewRepository: ViewRepository<Events, View<Events>>) {
		this.aggregate = aggregate
		this.eventRepository = new EventRepository<DrawingEvents>()
		this.viewRepository = viewRepository
	}

	// Handle a command.
	async dispatchWithMetadata(aggregateId: string, command: ArtistCommands, metadata: any): Promise<Events[]> { 
		const events = await this.aggregate.handle_command(aggregateId, command)
		let currentSequence = JSON.parse(localStorage.getItem("events") || "[]").length
		const persistableEvents: PersistableEvent[] = events.map((event, i) => ({
                aggregateType: this.aggregate.name,
                aggregateId: aggregateId,
                sequence: currentSequence++,
                eventType: event.constructor.name,
                eventVersion: event.version,
                payload: event,
                metadata: metadata,
                timestamp: Date.now()
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
		return this.dispatchWithMetadata(aggregateId, command, null)
	}
}