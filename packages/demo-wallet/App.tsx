import {NavigationContainer} from "@react-navigation/native"
import {createStackNavigator} from "@react-navigation/stack"
import React from "react"
import Example from "./components/Example"
import HomePage from "./components/HomePage"
import Scanner from "./components/Scanner"

const Stack = createStackNavigator()

const App = () => {
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
