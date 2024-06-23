<script lang="ts">
	import { appTheme } from "$lib/stores/app-config"
	import { dbInstance } from "$lib/rxdb/database"

	const themeBundle = appTheme()

	$: dbInstance.config.upsert({
		bundleName: $themeBundle.bundleName,
		currentThemeKey: $themeBundle.currentThemeKey,
	})
	$: theme = $themeBundle.getThemeConfig()
</script>

<div class="app" style="background-color: {theme.background}; color: {theme.foreground};">
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	main {
		flex: 1;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 100%;
	}
</style>
