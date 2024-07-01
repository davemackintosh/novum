import { type RxCollection, type RxDocument, type RxJsonSchema } from "rxdb"
import type { StaticMethods } from "../collection-interfaces"

interface IConfig {
	userAddress: string
}

class Config implements IConfig {
	userAddress: string

	constructor(userAddress: string) {
		this.userAddress = userAddress
	}

	static fromDatabase(persistable: RxDocument<IConfig>): Config {
		return new Config(persistable.get("userAddress"))
	}

	encode(instance: Config): IConfig {
		return {
			userAddress: instance.userAddress,
		}
	}

	static SCHEMA: RxJsonSchema<IConfig> = {
		version: 0,
		title: "config",
		description: "Application config.",
		primaryKey: "userAddress",
		type: "object",
		keyCompression: true,
		required: ["userAddress"],
		properties: {
			userAddress: {
				type: "string",
				maxLength: 255,
			},
		},
	} as const

	static Collection: RxCollection<IConfig, StaticMethods<Config>>
}

export { Config, type IConfig }
