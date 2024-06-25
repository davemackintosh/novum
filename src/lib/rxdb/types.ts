import { ColorPalette } from "./collections/color-palette"
import { Config } from "./collections/config"
import { Events } from "./collections/events"
import { ProjectView } from "$lib/cqrs/views/project"

const enum CollectionNames {
	EVENTS = "events",
	PROJECTS = "projects",
	CONFIG = "config",
	COLOR_PALETTES = "color_palettes",
}

type DatabaseType = {
	[CollectionNames.EVENTS]: typeof Events.Collection
	[CollectionNames.PROJECTS]: typeof ProjectView.Collection
	[CollectionNames.CONFIG]: typeof Config.Collection
	[CollectionNames.COLOR_PALETTES]: typeof ColorPalette.Collection
}

interface StaticMethods<T> {
	decode(): T
}

interface TableCodec<InstanceType, PersistableType = InstanceType> {
	encode(instance: InstanceType): PersistableType
}

export { type TableCodec, CollectionNames, type StaticMethods, type DatabaseType }

