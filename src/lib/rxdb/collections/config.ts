import { type RxCollection, type RxJsonSchema } from "rxdb"
import { type PersistableThemeBundle } from "$lib/app-config"

const Config: RxJsonSchema<PersistableThemeBundle> = {
	version: 0,
	title: "config",
	description: "Application config.",
	primaryKey: "bundleName",
	type: "object",
	keyCompression: true,
	required: ["bundleName", "currentThemeKey"],
	properties: {
		bundleName: {
			type: "string",
			maxLength: 255,
		},
		currentThemeKey: {
			type: "string",
		},
	},
} as const

type ConfigCollection = RxCollection<PersistableThemeBundle>

export { Config, type ConfigCollection }
