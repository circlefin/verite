import "./shim.js"
import "crypto"
import "react-native-gesture-handler"
import { TextEncoder, TextDecoder } from "fastestsmallesttextencoderdecoder"
import { AppRegistry } from "react-native"
import { polyfillGlobal } from "react-native/Libraries/Utilities/PolyfillFunctions"
import App from "./App"
import { name as appName } from "./app.json"

polyfillGlobal("TextEncoder", () => TextEncoder)
polyfillGlobal("TextDecoder", () => TextDecoder)
AppRegistry.registerComponent(appName, () => App)
