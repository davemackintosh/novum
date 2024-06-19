import type { RxDocument } from "rxdb";
import { type AppTheme, type AppThemeProperties, type PersistableThemeBundle } from "..";

export class DefaultTheme implements AppTheme {
	readonly bundleName: string
	currentThemeKey: string
	readonly themes: Record<string, AppThemeProperties>

	static DEFAULT_THEME_KEY = "dark"

	constructor(bundleName?: string, themes?: Record<string, AppThemeProperties>, currentThemeKey?: string) {
		this.bundleName = bundleName ?? "com.novum.norrsken-theme"
		this.themes = themes ?? {
			light: {
				background: "#f8f8f8",
				foreground: "#191920",
				cursor: "/theme/cursor-dark.png"
			},

			dark: {
				background: "#191920",
				foreground: "#f8f8f8",
				cursor: "/theme/cursor-light.png"
			}
		}

		this.currentThemeKey = currentThemeKey ?? DefaultTheme.DEFAULT_THEME_KEY
	}

	fromPersistence(document: RxDocument<PersistableThemeBundle>): AppTheme {
		return new DefaultTheme(document.bundleName, document.themes, document.currentThemeKey)
	}

	getThemeConfig(): AppThemeProperties {
		return this.themes[this.currentThemeKey]
	}

	setThemeKey(key: string): void {
		this.currentThemeKey = key
	}

}
