/**
 * Custom app entry point. We must use this file to support being called
 * from a monorepo.
 *
 * See more: https://docs.expo.dev/guides/monorepos/#change-default-entrypoint
 */
import "./src/lib/shims"
import { registerRootComponent } from "expo"

import App from "./App"

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
