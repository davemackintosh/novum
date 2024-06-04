import { writable } from "svelte/store"
import type { PersistableEvent } from "$lib/cqrs"
import type { DrawingEvents } from "../types/commands-events"

// We wouldn't normally parse an event stream to our views in the frontend
// but this is a demo/POC.
export const eventStore = writable<PersistableEvent<DrawingEvents>[]>([])

export interface DisplayableLayer {
	id: number
	name: string
}
export const layers = writable<DisplayableLayer[]>([])

