import { writable } from "svelte/store"
import { dbInstance } from "$lib/rxdb/database"

export const appTheme = () => {
	const innerValue = writable()

	const { set, update, subscribe } = innerValue

	const query = dbInstance.config.findOne()

	query.exec().then((config) => {
		if (config) {
			set(config.decode())

			config.$.subscribe((nextConfig) => {
				set(nextConfig.decode())
			})
		}
	})

	return {
		set,
		update,
		subscribe,
	}
}
