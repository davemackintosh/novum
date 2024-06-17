<script lang="ts">
	import { userAddress } from "$lib/stores/user"
	import { appConfig } from "$lib/stores/app-config"

	const app = appConfig
</script>

<div
	class="app"
	style="background-color: {$app.theme?.background}; color: {$app.theme?.foreground};"
>
	<header>
		<p>
			{$userAddress}
			<small>
				Save this somewhere safe, this is your unique Novum address. Lose this and you lose all your
				work and invites.
			</small>
		</p>
		<button type="button" on:click={() => $app.toggleMode()}> </button>
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
