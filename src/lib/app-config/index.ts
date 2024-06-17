import { DefaultTheme } from "./themes/default"
import { dbInstance } from "$lib/rxdb/database"

enum ThemeMode {
	Light,
	Dark,
}

interface AppThemeProperties {
	background: string
	foreground: string
}

interface AppTheme {
	light: AppThemeProperties
	dark: AppThemeProperties
}

interface AppConfig {
	id: string
	themeMode: ThemeMode
	themeLibrary?: AppTheme
}

class App implements AppConfig {
	id: string
	themeMode: ThemeMode = ThemeMode.Light;
	themeLibrary?: AppTheme | undefined = undefined;
	theme?: AppThemeProperties

	constructor(id: string = crypto.randomUUID()) {
		this.id = id
		this.themeLibrary = new DefaultTheme()
		this.theme = this.themeLibrary.light

		this.loadFromDatabase()
	}

	toggleMode() {
		this.themeMode = this.themeMode === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light
	}

	private async loadFromDatabase() {
		// Load theme from database
		const config = await dbInstance.config.findOne().exec()

		if (config && config.id) {
			this.id = config.id
		}

		if (config && config.themeLibrary) {
			this.themeLibrary = config.themeLibrary
			this.themeMode = config.themeMode

			if (this.themeMode === ThemeMode.Dark) {
				this.theme = this.themeLibrary.dark
			} else {
				this.theme = this.themeLibrary.light
			}
		}
		await dbInstance.config.upsert(this)
	}
}

export {
	type AppTheme,
	type AppConfig,
	App
}
