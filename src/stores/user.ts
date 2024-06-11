import { derived } from "svelte/store"
import { browser } from "$app/environment"

const userAddress = derived([], () => {
	if (!browser) return ""

	const userAddress = localStorage.getItem("userAddress") ?? crypto.randomUUID()

	localStorage.setItem("userAddress", userAddress)

	return userAddress
})

export { userAddress }
