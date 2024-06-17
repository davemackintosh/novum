import { writable } from "svelte/store";
import { App } from "$lib/app-config";

export const appConfig = writable(new App())

