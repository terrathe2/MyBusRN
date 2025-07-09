import React from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"

const FooterIndicator = (isShow: boolean) => {
    if (isShow) {
        return (
            <View style={styles.container}>
                <ActivityIndicator animating size="large" />
            </View>
        )
    } else {
        return (
            <View />
        )
    }
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10
    }
})

export default FooterIndicator