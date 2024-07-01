import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema"
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv"
import { wrappedKeyCompressionStorage } from "rxdb/plugins/key-compression"
import { wrappedKeyEncryptionCryptoJsStorage } from "rxdb/plugins/encryption-crypto-js"
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election"
import { addRxPlugin, createRxDatabase, type RxDatabase } from "rxdb"
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie"
import { Events } from "./collections/events"
import { Config } from "./collections/config"
import { ColorPalette } from "./collections/color-palette"
import { CollectionNames, type DatabaseType } from "./types"
import { browser } from "$app/environment"
import { ProjectView } from "$lib/cqrs/views/project"

/**
 * Create a new database instance and initialize the collections.
 */
async function getDatabase(): Promise<RxDatabase<DatabaseType>> {
	// @ts-expect-error Don't do anything in SSR.
	if (!browser) return null

	if (process.env.NODE_ENV !== "production") {
		const { RxDBDevModePlugin, disableWarnings } = await import("rxdb/plugins/dev-mode")
		disableWarnings()
		addRxPlugin(RxDBDevModePlugin)
	}

	addRxPlugin(RxDBMigrationSchemaPlugin)
	addRxPlugin(RxDBLeaderElectionPlugin)

	const db = await createRxDatabase<DatabaseType>({
		name: "novum",
		ignoreDuplicate: true,
		storage: wrappedValidateAjvStorage({
			storage: wrappedKeyCompressionStorage({
				storage: wrappedKeyEncryptionCryptoJsStorage({
					storage: getRxStorageDexie(),
				}),
			}),
		}),
	})

	await db.addCollections({
		[CollectionNames.EVENTS]: {
			schema: Events.SCHEMA,
			methods: {
				decode: function() {
					// @ts-expect-error TypeScript says this is the incorrect type but it does actually work and I couldn't find or convert to a type safely.
					return Events.fromDatabase(this)
				}
			},
		},
		[CollectionNames.PROJECTS]: {
			schema: ProjectView.SCHEMA,
			methods: {
				decode: function() {
					// @ts-expect-error TypeScript says this is the incorrect type but it does actually work and I couldn't find or convert to a type safely.
					return ProjectView.fromDatabase(this)
				}
			},
		},
		[CollectionNames.CONFIG]: {
			schema: Config.SCHEMA,
			methods: {
				decode: function() {
					// @ts-expect-error TypeScript says this is the incorrect type but it does actually work and I couldn't find or convert to a type safely.
					return Config.fromDatabase(this)
				}
			},
		},
		[CollectionNames.COLOR_PALETTES]: {
			schema: ColorPalette.SCHEMA,
			methods: {
				decode: function() {
					// @ts-expect-error TypeScript says this is the incorrect type but it does actually work and I couldn't find or convert to a type safely.
					return ColorPalette.fromDatabase(this)
				}
			},
		},
	})

	await db.waitForLeadership()

	return db
}

const dbInstance: RxDatabase<DatabaseType> = await getDatabase()

export { getDatabase, dbInstance }
