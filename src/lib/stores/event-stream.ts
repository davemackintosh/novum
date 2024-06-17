import { writable } from "svelte/store"
import type { ProjectEvents } from "$lib/types/commands-events"
import type { PersistableEvent } from "$lib/cqrs"

// We wouldn't normally parse an event stream to our views in the frontend
// but this is a demo/POC.
const eventStore = writable<PersistableEvent<ProjectEvents>[]>([])

interface DisplayableLayer {
	id: string
	name: string
}
const layers = writable<DisplayableLayer[]>([])

export { eventStore, layers }
export type { DisplayableLayer }
