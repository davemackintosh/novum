import type { RxDocument, RxJsonSchema, RxCollection } from "rxdb"
import type { TableCodec } from "$lib/rxdb/database"
import type { Vector } from "$lib/types/vector"

interface IColorPalette {
	id: string
	name?: string
	colors: Vector[]
}

class ColorPalette implements IColorPalette, TableCodec<ColorPalette, IColorPalette> {
	colors: Vector[] = []
	name?: string
	id: string = ""

	constructor(id: string, name?: string, colors: Vector[] = []) {
		this.id = id
		this.name = name
		this.colors = colors
	}

	static fromDatabase(persistable: RxDocument<IColorPalette>): ColorPalette {
		return new ColorPalette(persistable.get("id"), persistable.get("name"), persistable.get("colors").map())
	}

	encode(instance: ColorPalette): IColorPalette {
		return {
			id: instance.id,
			name: instance.name,
			colors: instance.colors,
		}
	}

	static SCHEMA: RxJsonSchema<IColorPalette> = {
		version: 0,
		title: "color_palette",
		description: "Color palettes created by the artist.",
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


	static Collection: RxCollection<IColorPalette>
}

type ColorPalettes = ColorPalette[]

export {
	ColorPalette,
	type IColorPalette,
	type ColorPalettes,
}
