import { type RxCollection, type RxJsonSchema } from "rxdb"
import type { DrawingEvents } from "$lib/types/commands-events"

interface Metadata {
	userAddress: string
}

interface PersistableEvent<T extends DrawingEvents> {
	aggregateTypeId: string
	aggregateType: string
	aggregateId: string
	sequence: number
	eventType: string
	eventVersion: string
	payload: T
	metadata: Metadata
	timestamp: number
}

const Events: RxJsonSchema<PersistableEvent<DrawingEvents>> = {
	version: 0,
	title: "events",
	description: "The event source events that make up this instance of Novum.",
	primaryKey: {
		key: "aggregateTypeId",
		fields: ["aggregateId", "aggregateType", "sequence"],
		separator: ".",
	},
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
			maxLength: 255,
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

type EventsCollection = RxCollection<PersistableEvent<DrawingEvents>>

export { Events, type PersistableEvent, type Metadata, type EventsCollection }