import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import Ionicons from "react-native-vector-icons/Ionicons"
import Example from "./components/Example"
import HomePage from "./components/HomePage"
import Scanner from "./components/Scanner"
import CredentialsList from "./src/components/CredentialsList"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const scannerStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Scanner" component={Scanner} />
    </Stack.Navigator>
  )
}

const credentialStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={CredentialsList} />
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="Example" component={Example} />
    </Stack.Navigator>
  )
}

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === "Scan") {
              iconName = focused ? "scan-circle" : "scan-circle-outline"
            } else if (route.name === "Credentials") {
              iconName = focused ? "wallet" : "wallet-outline"
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />
          }
        })}
        tabBarOptions={{
          activeTintColor: "tomato",
          inactiveTintColor: "gray"
        }}>
        <Tab.Screen name="Scan" component={scannerStack} />
        <Tab.Screen name="Credentials" component={credentialStack} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default App
