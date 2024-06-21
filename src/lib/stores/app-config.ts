import { writable } from "svelte/store"
import { type AppTheme } from "$lib/app-config"
import { DefaultTheme } from "$lib/app-config/themes/default"
import { dbInstance } from "$lib/rxdb/database"

export const appTheme = (defaultValue: AppTheme = new DefaultTheme()) => {
	const innerValue = writable(defaultValue)

	const { set, update, subscribe } = innerValue

	dbInstance.config
		.findOne()
		.exec()
		.then((config) => {
			if (config) {
				console.log("found config")
				set(defaultValue.fromPersistence(config))
			}
		})

	const setThemeKey = (key: string) => {
		update((theme) => {
			theme.setThemeKey(key)
			return theme
		})
	}

	return {
		setThemeKey,
		set,
		update,
		subscribe,
	}
}
