import { type RxCollection, type RxJsonSchema } from "rxdb"
import { type PersistableThemeBundle } from "$lib/app-config"

const Config: RxJsonSchema<PersistableThemeBundle> = {
	version: 0,
	title: "projects",
	description: "Application config.",
	primaryKey: "bundleName",
	type: "object",
	keyCompression: true,
	required: ["bundleName", "currentThemeKey", "themes"],
	properties: {
		bundleName: {
			type: "string",
			maxLength: 255,
		},
		currentThemeKey: {
			type: "string",
		},
		themes: {
			type: "object",
			additionalProperties: {
				type: "object",
				required: ["background", "foreground"],
				properties: {
					background: {
						type: "string",
					},
					foreground: {
						type: "string",
					},
					cursor: {
						type: "string",
					}
				},
			},
		}
	},
} as const

type ConfigCollection = RxCollection<PersistableThemeBundle>

export { Config, type ConfigCollection }

