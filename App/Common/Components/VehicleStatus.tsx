import React from "react"
import { View, Text, StyleSheet, StyleProp, TextStyle } from "react-native"

type VehicleStatusProps = {
    statusText?: string;
    statusBg?: string;
}

const VehicleStatus = ({ statusText, statusBg }: VehicleStatusProps) => {
    return (
        <View style={[styles.vehicleStatusContainer, { backgroundColor: statusBg }]}>
            <Text style={styles.vehicleStatus}>{statusText}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    vehicleStatusContainer: {
    alignSelf: "flex-start",
    borderRadius: 10,
    marginTop: 8,
    padding: 10
  },
  vehicleStatus: {
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 1,
    color: "white",
  },
})

export default VehicleStatus