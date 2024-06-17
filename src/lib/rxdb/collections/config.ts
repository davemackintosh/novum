import { type RxCollection, type RxJsonSchema } from "rxdb"
import type { AppConfig } from "$lib/app-config"

const Config: RxJsonSchema<AppConfig> = {
	version: 0,
	title: "projects",
	description: "Application config.",
	primaryKey: "id",
	type: "object",
	keyCompression: true,
	required: ["id", "themeLibrary", "themeMode"],
	properties: {
		id: {
			type: "string",
			maxLength: 50,
		},
		themeLibrary: {
			type: "object",
		},
		themeMode: {
			type: "string",
			enum: ["Light", "Dark"],
		}
	},
} as const

type ConfigCollection = RxCollection<AppConfig>

export { Config, type ConfigCollection }

