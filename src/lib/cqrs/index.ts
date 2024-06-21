import type { Metadata, PersistableEvent } from "$lib/rxdb/collections/events"
import { dbInstance } from "$lib/rxdb/database"
import type { ProjectEvents, ProjectCommands } from "$lib/types/commands-events"

class AggregateError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "AggregateError"
	}
}

abstract class Aggregate<Events extends ProjectEvents, Commands extends ProjectCommands> {
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

abstract class View<Events extends ProjectEvents = ProjectEvents> {
	abstract handle_event(_event: Events): View<Events>
}

abstract class Query<
	V extends View<ProjectEvents>,
	VR extends ViewRepository<ProjectEvents, V>,
	Returns,
> {
	protected readonly viewRepository: VR

	constructor(viewRepository: VR) {
		this.viewRepository = viewRepository
	}

	abstract query(query: Partial<V>): Promise<Returns>
}

abstract class ViewRepository<Events extends ProjectEvents, V extends View<Events>> {
	private readonly name: string
	protected readonly view: V

	constructor(name: string, view: V) {
		this.name = name
		this.view = view
	}

	// Commit a view to storage.
	abstract commit(): Promise<void>

	abstract handle_event(event: Events): Promise<void>
	abstract load(aggregateId: string): Promise<V | V[]>
}

class EventRepository {
	async commit(events: PersistableEvent<ProjectEvents>[]): Promise<void> {
		// In the real world, we would commit these events to a database.
		console.info("Committing events", events)

		for (const event of events) {
			console.log("Inserting event", event)
			await dbInstance.events.insert(event)
		}
	}
}

class CQRS<A extends Aggregate<Events, ProjectCommands>, Events extends ProjectEvents> {
	private readonly aggregate: A
	private readonly eventRepository: EventRepository
	private readonly viewRepository: ViewRepository<Events, View<Events>>

	constructor(aggregate: A, viewRepository: ViewRepository<Events, View<Events>>) {
		this.aggregate = aggregate
		this.eventRepository = new EventRepository()
		this.viewRepository = viewRepository
	}

	async getNextSequence(aggregateId: string): Promise<number> {
		const events = await dbInstance.events
			.find({
				selector: {
					aggregateId,
				},
			})
			.exec()

		console.log("SEQUENCE", events.length)

		return events.length
	}

	// Handle a command.
	async dispatchWithMetadata(
		aggregateId: string,
		command: ProjectCommands,
		metadata: Metadata,
	): Promise<Events[]> {
		const events = await this.aggregate.handle_command(aggregateId, command, metadata)
		const currentSequence = (await this.getNextSequence(aggregateId)) + 1

		const persistableEvents: PersistableEvent<ProjectEvents>[] = events.map((event, i) => {
			console.log("Next Sequence: ", currentSequence + i)

			return {
				aggregateTypeId: `${aggregateId}.${this.aggregate.name}.${currentSequence + i}`,
				aggregateType: this.aggregate.name,
				aggregateId: aggregateId,
				sequence: currentSequence + i,
				eventType: event.constructor.name,
				eventVersion: event.version,
				payload: event,
				metadata: metadata,
				timestamp: Date.now(),
			}
		})

		await this.eventRepository.commit(persistableEvents)

		for (const event of events) {
			await this.viewRepository.handle_event(event)
			await this.viewRepository.commit()
		}

		return events
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
	type ProjectEvents,
}
