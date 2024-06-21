import type { RxDocument } from "rxdb"

interface AppThemeProperties {
	background: string
	foreground: string
	cursor: string
}

interface PersistableThemeBundle {
	readonly bundleName: string
	currentThemeKey: string
}

interface AppTheme extends PersistableThemeBundle {
	getThemeConfig(): AppThemeProperties
	setThemeKey(key: string): void
	fromPersistence(document: RxDocument<PersistableThemeBundle>): AppTheme
}

export { type AppTheme, type AppThemeProperties, type PersistableThemeBundle }
