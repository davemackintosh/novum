<script lang="ts">
	import { userAddress } from "$lib/stores/user"
	import { appTheme } from "$lib/stores/app-config"
	import { dbInstance } from "$lib/rxdb/database"

	const themeBundle = appTheme()

	console.log({
		bundleName: $themeBundle.bundleName,
		currentThemeKey: $themeBundle.currentThemeKey,
	})
	$: dbInstance.config.upsert({
		bundleName: $themeBundle.bundleName,
		currentThemeKey: $themeBundle.currentThemeKey,
	})
	$: theme = $themeBundle.getThemeConfig()
</script>

<div class="app" style="background-color: {theme.background}; color: {theme.foreground};">
	<header>
		<p>
			{$userAddress}
			<small>
				Save this somewhere safe, this is your unique Novum address. Lose this and you lose all your
				work and invites.
			</small>
		</p>
		<button
			type="button"
			on:click={() => {
				themeBundle.setThemeKey($themeBundle.currentThemeKey === "light" ? "dark" : "light")
			}}
		>
		</button>
	</header>
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

	header {
		flex: 1;
		padding: 1em;
		z-index: 1;
	}

	main {
		flex: 1;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 100%;
	}
</style>
