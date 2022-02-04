import React, { FC } from "react"
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator
} from "react-native"

type Props = {
  onCancel?: () => void
  onConfirm?: () => void
  isLoading?: boolean
  cancel?: string
  confirm?: string
}

const Card: FC<Props> = ({
  children,
  onCancel,
  onConfirm,
  isLoading,
  cancel,
  confirm
}) => {
  const showButtons = onCancel ?? onConfirm

  const styles = StyleSheet.create({
    cardShadow: {
      shadowColor: "black",
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 10,
      shadowOpacity: 0.26,
      elevation: 8,
      borderRadius: 10
    },
    card: {
      backgroundColor: "white",
      borderRadius: 10,
      flexDirection: "column",
      justifyContent: "center",
      width: 300,
      overflow: "hidden"
    },
    cardButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: "#EEE",
      backgroundColor: "#FFF"
    },
    cancelButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      marginHorizontal: 2,
      borderRightWidth: 1,
      borderRightColor: "#EEE"
    },
    cancelButtonText: {
      fontSize: 18
    },
    submitButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      marginHorizontal: 2
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: "500"
    }
  })

  return (
    <View style={styles.cardShadow}>
      <View style={styles.card}>
        {children}

        {showButtons && (
          <View style={styles.cardButtons}>
            {onCancel && (
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>
                  {cancel ?? "Cancel"}
                </Text>
              </Pressable>
            )}
            {onConfirm && (
              <Pressable style={styles.submitButton} onPress={onConfirm}>
                {isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.submitButtonText}>{confirm ?? "OK"}</Text>
                )}
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default Card
