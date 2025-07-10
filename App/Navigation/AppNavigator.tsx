import React from "react";
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import HomeScreen from "../Features/VehicleList"
import VehicleDetailScreen from "../Features/VehicleDetail"

export type RootStackParamList = {
  Home: undefined;
  VehicleDetail: { vehicleId: string };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RootStack = createNativeStackNavigator({
    screens: {
        Home: {
            screen: HomeScreen,
            options: {
                headerShown: false
            }
        },
        VehicleDetail: {
            screen: VehicleDetailScreen,
            options: {
                headerShown: false
            }
        }
    },
    initialRouteName: "Home",
});

export const Navigation = createStaticNavigation(RootStack);