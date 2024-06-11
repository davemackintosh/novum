import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { wrappedKeyCompressionStorage } from 'rxdb/plugins/key-compression'
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js'
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { addRxPlugin, createRxDatabase, type RxDatabase } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { Events, type EventsCollection } from './collections/events'
import { Projects, type ProjectsCollection } from './collections/projects'
import { browser } from '$app/environment'

type DatabaseType = {
	events: EventsCollection,
	projects: ProjectsCollection
}

/**
 * Create a new database instance and initialize the collections.
 */
async function getDatabase(): Promise<RxDatabase<DatabaseType>> {
	// @ts-expect-error Don't do anything in SSR.
	if (!browser) return null

	if (process.env.NODE_ENV !== 'production') {
		const { RxDBDevModePlugin, disableWarnings } = await import('rxdb/plugins/dev-mode')
		disableWarnings()
		addRxPlugin(RxDBDevModePlugin)
	}

	addRxPlugin(RxDBLeaderElectionPlugin)

	const db = await createRxDatabase<DatabaseType>({
		name: 'novum',
		ignoreDuplicate: true,
		storage: wrappedValidateAjvStorage({
			storage: wrappedKeyCompressionStorage({
				storage: wrappedKeyEncryptionCryptoJsStorage({
					storage: getRxStorageDexie()
				})
			})
		})
	})

	await db.addCollections({
		events: {
			schema: Events,
		},
		projects: {
			schema: Projects
		}
	})

	await db.waitForLeadership()

	return db
}

const dbInstance: RxDatabase<DatabaseType> = await getDatabase()

export {
	getDatabase,
	dbInstance,
}
