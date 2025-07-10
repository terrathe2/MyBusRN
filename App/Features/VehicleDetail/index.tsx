import React, { useEffect, useState, useRef } from "react"
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    useColorScheme
} from "react-native"
import MapView, { PROVIDER_GOOGLE, Marker, MapMarker, Callout } from "react-native-maps";
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { parseISO, format } from 'date-fns';
import { PRIMARY_COLOR } from "../../Common/Utils/Constants"
import { getVehicleStatusUI, getVehicleStatusBg } from '../../Common/Utils/VehicleStatusHelper';
import { RootStackParamList } from '../../Navigation/AppNavigator'
import LoadingIndicator from '../../Common/Components/LoadingIndicator';
import { Text } from "@react-navigation/elements";
import { getVehicleById } from "../../Services/Vehicle";
import { getRouteById } from "../../Services/Route";
import { getTripById } from "../../Services/Trip";
import Toast from "../../Common/Components/Toast";
import { defaultToastUI, ToastUI } from '../../Common/Models/ToastUI';

type VechicleDetailRouteProp = RouteProp<RootStackParamList, 'VehicleDetail'>;

const VehicleDetailScreen = () => {
    const navController = useNavigation()
    const isDarkMode = useColorScheme() === 'dark';
    const markerRef = useRef<MapMarker>(null); // MapMarker is the type of Marker, to avoid warning
    const route = useRoute<VechicleDetailRouteProp>()
    const { vehicleId } = route.params
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const [errorData, setErrorData] = useState<ToastUI>(defaultToastUI)
    const [vehicleData, setVehicleData] = useState<VehicleDetailUI>()
    const [vehicleRoute, setVehicleRoute] = useState<string>("")
    const [vehicleTrip, setVehicleTrip] = useState<string>("")

    // initial fetch
    useEffect(() => {
        fetchVehicleDetail()
    }, [])

    useEffect(() => {
        fetchRouteAndTrip()

        if (markerRef.current) {
            // Add a small delay to ensure marker is mounted before showing callout
            const timeout = setTimeout(() => {
                markerRef.current?.showCallout();
            }, 500);

            return () => clearTimeout(timeout);
        }
    }, [vehicleData])

    const fetchVehicleDetail = async () => {
        let response = await getVehicleById(vehicleId)

        if (response.data != null) {
            // mapping response to ui model
            const uiModel: VehicleDetailUI = {
                id: response.data.id,
                busStatus: getVehicleStatusUI(response.data.attributes.current_status),
                busStatusBg: getVehicleStatusBg(response.data.attributes.current_status),
                busLabel: response.data.attributes.label,
                latitude: response.data.attributes.latitude,
                longitude: response.data.attributes.longitude,
                lastUpdate: format(parseISO(response.data.attributes.updated_at), 'dd/MM/yyyy'),
                routeId: response.data.relationships.route.data.id,
                tripId: response.data.relationships.trip.data.id
            }
            setVehicleData(uiModel)
        } else {
            setErrorData({ show: true, message: "Failed to get Vehicle data" })
        }
    }

    const fetchRouteAndTrip = async () => {
        const response = Promise.all([
            getRouteById(vehicleData?.routeId),
            getTripById(vehicleData?.tripId)
        ])

        response
            .then(([route, trip]) => {
                console.log("error ", route);
                console.log("error 2 ", trip);

                if (route.errorCode != null && trip.errorCode != null) {
                    setErrorData({ show: true, message: "Failed to get Additional data" })
                } else if (route.errorCode != null) {
                    setErrorData({ show: true, message: "Failed to get Route data" })
                } else if (trip.errorCode != null) {
                    setErrorData({ show: true, message: "Failed to get Trip data" })
                }
                
                setVehicleRoute(route.data?.attributes.long_name ?? "-")
                setVehicleTrip(trip.data?.attributes.headsign ?? "-")

                // to make sure loading hidden after route and trip data showing
                setTimeout(() => {
                    setIsFetching(false)
                }, 800)
            })
            .catch(() => {
                setErrorData({ show: true, message: "Something wrong, please try again later" })
                // to make sure loading hidden after error toast showing
                setTimeout(() => {
                    setIsFetching(false)
                }, 800)
            })
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <MapView
                provider={PROVIDER_GOOGLE}
                region={{
                    latitude: vehicleData?.latitude ?? 0,
                    longitude: vehicleData?.longitude ?? 0,
                    latitudeDelta: 0.00922 * 1.5,
                    longitudeDelta: 0.00421 * 1.5,
                }}
                style={styles.mapContainer}
            >
                <Marker
                    ref={markerRef}
                    image={require("../../Common/Assets/ic_bus.png")}
                    coordinate={{
                        latitude: vehicleData?.latitude ?? 0,
                        longitude: vehicleData?.longitude ?? 0
                    }}
                >
                    <Callout tooltip style={styles.calloutContainer}>
                        <View style={styles.calloutTextContainer}>
                            <Text style={styles.calloutText}>Lat: {vehicleData?.latitude}</Text>
                            <Text style={styles.calloutText}>Lng: {vehicleData?.longitude}</Text>
                        </View>
                    </Callout>
                </Marker>
            </MapView>
            <TouchableOpacity onPress={() => navController.goBack()} style={styles.backBtnContainer}>
                <MaterialIcon
                    name={"arrow-left"}
                    size={24}
                    color="white"
                />
            </TouchableOpacity>
            <View style={[styles.detailCardContainer, { backgroundColor: vehicleData?.busStatusBg, marginBottom: -20 }]}>
                <Text style={styles.statusText}>{vehicleData?.busStatus}</Text>
            </View>
            <View style={[styles.detailCardContainer, styles.cardShadow]}>
                <Text style={[styles.sectionTitleText, { alignSelf: "center" }]}>Vehicle {vehicleData?.busLabel}</Text>
                <Text style={[styles.sectionTitleText, { marginTop: 8 }]}>Route</Text>
                <Text style={styles.sectionDescText}>{vehicleRoute ?? "-"}</Text>
                <Text style={[styles.sectionTitleText, { marginTop: 8 }]}>Trip</Text>
                <Text style={styles.sectionDescText}>{vehicleTrip ?? "-"}</Text>
                <Text style={styles.lastUpdatedText}>{`Last Update: ${vehicleData?.lastUpdate}`}</Text>
            </View>
            <LoadingIndicator isShowed={isFetching} loadingText="Fetching Vehicle Data.." />
            <Toast show={errorData.show} text={errorData.message} onHide={() => setErrorData(defaultToastUI)} />
        </View>
    )
}

const { width } = Dimensions.get('window')
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    backBtnContainer: {
        position: "absolute",
        top: StatusBar.currentHeight,
        left: 16,
        marginTop: 10,
        padding: 10,
        borderRadius: "50%",
        borderWidth: 1,
        borderColor: "white",
        backgroundColor: PRIMARY_COLOR,
        elevation: 5,
        shadowColor: "black",
        shadowOpacity: 0.5,
        shadowOffset: {
            height: 0,
            width: 0
        },
        zIndex: 10
    },
    mapContainer: {
        flex: 1,
        marginBottom: -20 // minus margin to fill the empty space showed by rounded
    },
    calloutContainer: {
        width: width - 10, // set callout width to static to prevent callout visual bug
        marginBottom: 15,
        borderTopRightRadius: 21,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    calloutTextContainer: {
        padding: 10,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "white",
    },
    calloutText: {
        fontSize: 14,
        color: "white"
    },
    detailCardContainer: {
        width: width,
        padding: 14,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        zIndex: 20
    },
    cardShadow: {
        elevation: 5,
        shadowColor: "black",
        shadowOpacity: 0.5,
        shadowOffset: {
            height: 0,
            width: 0
        },
    },
    statusText: {
        paddingBottom: 20,
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        alignSelf: "center"
    },
    sectionTitleText: {
        fontSize: 20,
        fontWeight: "bold",
        alignSelf: "flex-start",
        color: "black"
    },
    sectionDescText: {
        fontSize: 14,
        alignSelf: "flex-start",
        color: "black"
    },
    lastUpdatedText: {
        marginTop: 16,
        alignSelf: "flex-end",
        fontSize: 12,
        color: "black"
    }
})

export default VehicleDetailScreen