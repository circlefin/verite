import "./shim.js"
import "crypto"
import "react-native-gesture-handler"
import { AppRegistry } from "react-native"
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding"
import App from "./App"
import { name as appName } from "./app.json"

polyfillEncoding()

AppRegistry.registerComponent(appName, () => App)
