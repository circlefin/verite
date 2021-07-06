import {NavigationContainer} from "@react-navigation/native"
import {createStackNavigator} from "@react-navigation/stack"
import React from "react"
import Example from "./Example"
import Scanner from "./Scanner"
import HomePage from "./components/HomePage"

const Stack = createStackNavigator()

const App = (): Element => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Scanner" component={Scanner} />
        <Stack.Screen name="Example" component={Example} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
