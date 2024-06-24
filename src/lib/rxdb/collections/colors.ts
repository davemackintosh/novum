import { type RxCollection, type RxJsonSchema } from "rxdb"
import type { ColorPalette as ColorPaletteType } from "$lib/types/color-palette"

const ColorPalette: RxJsonSchema<ColorPaletteType> = {
	version: 0,
	title: "color_palette",
	description: "Application config.",
	primaryKey: "id",
	type: "object",
	keyCompression: true,
	required: ["id", "name", "colors"],
	properties: {
		id: {
			type: "string",
			maxLength: 255,
		},
		name: {
			type: "string",
		},
		colors: {
			type: "array",
			items: {
				type: "object",
				properties: {
					x: {
						type: "number",
					},
					y: {
						type: "number",
					},
					z: {
						type: "number",
					},
					w: {
						type: "number",
					},
				},
				required: ["x", "y", "z"],
				additionalProperties: false,
			}
		},
	},
} as const

type ColorPaletteCollection = RxCollection<ColorPaletteType>

export { ColorPalette, type ColorPaletteCollection }

