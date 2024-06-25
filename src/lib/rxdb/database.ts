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
import { CollectionNames, DatabaseType } from "./types"
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
				decode: Events.fromDatabase,
			},
		},
		[CollectionNames.PROJECTS]: {
			schema: ProjectView.SCHEMA,
			methods: {
				decode: ProjectView.fromDatabase,
			},
		},
		[CollectionNames.CONFIG]: {
			schema: Config.SCHEMA,
			methods: {
				decode: Config.fromDatabase,
			},
		},
		[CollectionNames.COLOR_PALETTES]: {
			schema: ColorPalette.SCHEMA,
			methods: {
				decode: ColorPalette.fromDatabase,
			},
		},
	})

	await db.waitForLeadership()

	return db
}

const dbInstance: RxDatabase<DatabaseType> = await getDatabase()

export { getDatabase, dbInstance }
