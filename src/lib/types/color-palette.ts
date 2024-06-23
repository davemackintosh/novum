import type { Vector } from "$lib/ecs/components/drawings"

interface ColorPalette {
	id: string
	name?: string
	colors: Vector[]
}

type ColorPalettes = ColorPalette[]

export {
	type ColorPalette,
	type ColorPalettes,
}
