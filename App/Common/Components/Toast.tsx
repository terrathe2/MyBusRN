import React, { useEffect, useRef, useState } from 'react'
import {
    View,
    Text,
    Animated,
    StyleSheet,
    Dimensions,
} from 'react-native'

type ToastProps = {
    show: boolean;
    text: string;
    onHide: () => void
}

const Toast = ({ show = false, text, onHide }: ToastProps) => {
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (show) callToast()
    }, [show])

    const callToast = () => {
        Animated.timing(
            animation,
            {
                toValue: -285,
                duration: 350,
                useNativeDriver: true
            }
        ).start(closeToast)
    }

    const closeToast = () => {
        setTimeout(() => {
            Animated.timing(
                animation,
                {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true
                }).start(onHide)
        }, 3000)
    }


    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: animation }] }]}>
            <Text style={styles.message}>
                {text}
            </Text>
        </Animated.View>
    )
}

const { width, height } = Dimensions.get("window")
const styles = StyleSheet.create({
    // Toast
    container: {
        flex: 1,
        width: width - 50,
        height: height / 14,
        position: "absolute",
        bottom: -100,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        opacity: 1,
        backgroundColor: "#383838",
        zIndex: 101

    },
    message: {
        color: "#FFFFFF",
        fontSize: 12
    },
})

export default Toast