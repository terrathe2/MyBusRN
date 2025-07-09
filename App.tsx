import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  useColorScheme,
  Dimensions
} from 'react-native';
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import VehicleListScreen from './App/Features/VehicleList';
const { width, height } = Dimensions.get('window');

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.mainContainer]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <VehicleListScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 18,
    fontWeight: '400',
    color: "black",
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
