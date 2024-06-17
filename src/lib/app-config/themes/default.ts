import type { AppTheme, AppThemeProperties } from "..";

export class DefaultTheme implements AppTheme {
	light: AppThemeProperties;
	dark: AppThemeProperties;

	constructor() {
		this.light = {
			background: "#ffffff",
			foreground: "#000000",
		}

		this.dark = {
			background: "#191920",
			foreground: "#f8f8f8",
		}
	}
}
