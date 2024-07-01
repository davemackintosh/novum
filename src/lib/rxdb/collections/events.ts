import { type RxCollection, type RxDocument, type RxJsonSchema } from "rxdb"
import type { StaticMethods } from "../collection-interfaces"
import type { ProjectEvents } from "$lib/types/commands-events"

interface Metadata {
	userAddress: string
}

interface IEvent {
	aggregateTypeId: string
	aggregateType: string
	aggregateId: string
	sequence: number
	eventType: string
	eventVersion: string
	payload: ProjectEvents
	metadata: Metadata
	timestamp: number
}

class Events implements IEvent {
	aggregateTypeId: string
	aggregateType: string
	aggregateId: string
	sequence: number
	eventType: string
	eventVersion: string
	payload: ProjectEvents
	metadata: Metadata
	timestamp: number

	constructor(
		aggregateTypeId: string,
		aggregateType: string,
		aggregateId: string,
		sequence: number,
		eventType: string,
		eventVersion: string,
		payload: ProjectEvents,
		metadata: Metadata,
		timestamp: number,
	) {
		this.aggregateTypeId = aggregateTypeId
		this.aggregateType = aggregateType
		this.aggregateId = aggregateId
		this.sequence = sequence
		this.eventType = eventType
		this.eventVersion = eventVersion
		this.payload = payload
		this.metadata = metadata
		this.timestamp = timestamp
	}

	static fromDatabase(persistable: RxDocument<IEvent>): Events {
		return new Events(
			persistable.get("aggregateTypeId"),
			persistable.get("aggregateType"),
			persistable.get("aggregateId"),
			persistable.get("sequence"),
			persistable.get("eventType"),
			persistable.get("eventVersion"),
			persistable.get("payload"),
			persistable.get("metadata"),
			persistable.get("timestamp"),
		)
	}

	encode(instance: Events): IEvent {
		return {
			aggregateTypeId: instance.aggregateTypeId,
			aggregateType: instance.aggregateType,
			aggregateId: instance.aggregateId,
			sequence: instance.sequence,
			eventType: instance.eventType,
			eventVersion: instance.eventVersion,
			payload: instance.payload,
			metadata: instance.metadata,
			timestamp: instance.timestamp,
		}
	}

	static SCHEMA: RxJsonSchema<IEvent> = {
		version: 0,
		title: "events",
		description: "The event source events that make up this instance of Novum.",
		primaryKey: "aggregateTypeId",
		type: "object",
		keyCompression: true,
		required: ["aggregateId", "aggregateType", "sequence", "payload", "eventType"],
		properties: {
			aggregateTypeId: {
				type: "string",
				maxLength: 255,
			},
			aggregateId: {
				type: "string",
			},
			aggregateType: {
				type: "string",
			},
			sequence: {
				type: "integer",
			},
			eventType: {
				type: "string",
			},
			eventVersion: {
				type: "string",
			},
			payload: {
				type: "object",
			},
			metadata: {
				type: "object",
			},
			timestamp: {
				type: "integer",
			},
		},
	} as const

	static Collection: RxCollection<IEvent, StaticMethods<IEvent>>
}

export { Events, type IEvent as PersistableEvent, type Metadata }
