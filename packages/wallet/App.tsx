import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { Verifiable, W3CCredential } from "did-jwt-vc"
import React from "react"
import { Alert, Button } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

import CredentialDetail from "./src/components/CredentialDetail"
import CredentialPicker from "./src/components/CredentialPicker"
import CredentialsList from "./src/components/CredentialsList"
import HomePage from "./src/components/HomePage"
import Scanner from "./src/components/Scanner"
import SettingsScreen from "./src/components/SettingsScreen"
import Verification from "./src/components/Verification"
import { deleteCredential } from "./src/lib/storage"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const ScannerStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScanScreen"
        component={HomePage}
        options={{ title: "Scan" }}
      />
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="CredentialPicker" component={CredentialPicker} />
      <Stack.Screen name="Verification" component={Verification} />
    </Stack.Navigator>
  )
}

const CredentialStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={CredentialsList} />
      <Stack.Screen
        name="Details"
        component={CredentialDetail}
        options={({ navigation, route }) => {
          return {
            headerRight: () => (
              <Button
                onPress={() => {
                  Alert.alert("Are you sure?", "This can not be undone.", [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Cancel Pressed"),
                      style: "cancel"
                    },
                    {
                      text: "OK",
                      onPress: async () => {
                        const params = route.params as Record<string, unknown>
                        if (params) {
                          const credential =
                            params.credential as Verifiable<W3CCredential>
                          if (credential) {
                            await deleteCredential(credential)
                          }
                        }
                        navigation.navigate("Home", { merge: true })
                      }
                    }
                  ])
                }}
                title="Delete"
              />
            )
          }
        }}
      />
    </Stack.Navigator>
  )
}

const SettingsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Stack.Navigator>
  )
}

const App = (): JSX.Element => {
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
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline"
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName ?? ""} size={size} color={color} />
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: [
            {
              display: "flex"
            },
            null
          ]
        })}
      >
        <Tab.Screen
          name="Scan"
          component={ScannerStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Credentials"
          component={CredentialStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStack}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default App
