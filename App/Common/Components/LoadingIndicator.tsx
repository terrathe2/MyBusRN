import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native'

const window = Dimensions.get('window')

type LoadingIndicatorProps = {
    isShowed: boolean;
    loadingText?: string;
}

const LoadingIndicator = ({isShowed, loadingText}: LoadingIndicatorProps) => {
  if (isShowed) {
    return (
      <View style={styles.spinnerContainer}>
        <View style={styles.spinnerOverlay} />
        <View style={styles.spinner}>
          <ActivityIndicator color="#F7AE43" size="large" />
          <Text style={styles.textLoader}>{loadingText}</Text>
        </View>
      </View>
    )
  } else {
    <View />
  }
}

const styles = StyleSheet.create({
    spinnerContainer: {
      width: window.width,
      height: window.height,
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100
    },
    spinnerOverlay: {
      width: window.width,
      height: window.height,
      opacity: 0.8,
      backgroundColor: 'black',
    },
    spinner: {
      position: 'absolute',
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 6,
      opacity: 0.7,
      padding: 18,
      backgroundColor: '#092534',
    },
    textLoader: {
      fontFamily: "OpenSans",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 5,
      color: 'white',
      textAlign: 'center'
    },
})

export default LoadingIndicator