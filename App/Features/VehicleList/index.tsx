import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import { parseISO, format } from 'date-fns';
import { NavigationProp } from '../../Navigation/AppNavigator'
import Icon from '../../Common/Components/Icons';
import { getVehicle } from '../../Services/Vehicle';
import { PRIMARY_COLOR } from '../../Common/Utils/Constants';
import { getVehicleStatusUI, getVehicleStatusBg } from '../../Common/Utils/VehicleStatusHelper';
import LoadingIndicator from '../../Common/Components/LoadingIndicator';
import FooterIndicator from '../../Common/Components/FooterIdicator';
import VehicleStatus from '../../Common/Components/VehicleStatus';
import Toast from '../../Common/Components/Toast';
import { defaultToastUI, ToastUI } from '../../Common/Models/ToastUI';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { getRoutes } from '../../Services/Route';
import {
  defaultRouteFilters,
  defaultTripFilters,
  VehicleFiltersUI,
  ItemVehicleFilterUI
} from '../VehicleList/Models/VehicleFiltersUI'
import { getTrips } from '../../Services/Trip';

const VehicleListScreen = () => {
  const pageLimit = 10
  const [isVehiclesMaxed, setIsVehiclesMaxed] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false)
  const [errorData, setErrorData] = useState<ToastUI>(defaultToastUI)
  const [vehicles, addVehicles] = useState<VehiclesUI[]>([])
  const [routeFilters, setRouteFilters] = useState<VehicleFiltersUI[]>(defaultRouteFilters)
  const [tripFilters, setTripFilters] = useState<VehicleFiltersUI[]>(defaultTripFilters)
  const [pagingOffset, setPagingOffset] = useState(0)
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([])
  // temporary selected routes based on selectedRoutes, needed prevent api fetch when 
  // data change. Because, selectedRoutes (non temporary) is set to trigger api fetch when changed
  const [tempSelectedRoutes, setTempSelectedRoutes] = useState<string[]>([])
  const [selectedTrips, setSelectedTrips] = useState<string[]>([])
  // temporary selected routes based on selectedTrips, needed prevent api fetch when 
  // data change. Because, selectedTrips (non temporary) is set to trigger api fetch when changed
  const [tempSelectedTrips, setTempSelectedTrips] = useState<string[]>([])
  const queries = {
    pageOffset: pagingOffset,
    page: pageLimit,
    routes: selectedRoutes,
    trips: selectedTrips,
  }

  // initial fetch
  useEffect(() => {
    setIsFetching(true)
    fetchRoutesApi()
    fetchVehiclesApi()
  }, [])

  // fetch when selected route filter changed
  useEffect(() => {
    // reset everything related to trip filter everytime selected route changed
    setTripFilters([])
    setTempSelectedTrips([])
    setSelectedTrips([])
    // -------------------------
    
    // to prevent trips fetched when no selected routes yet
    if (selectedRoutes.length > 0) fetchTripsApi()
  }, [selectedRoutes])

  // fetch when selected trip filter changed
  useEffect(() => {
    setIsFetching(true)
    fetchVehiclesApi()
  }, [selectedTrips])

  const fetchRoutesApi = async () => {
    let response = await getRoutes()
    
    if (response.data != null) {
      const uiModel: ItemVehicleFilterUI[] = response.data.map(route => (
        {
          id: route.id,
          name: route.attributes.long_name
        }
      ))
      setRouteFilters(prevFilters => {
        const newFilters = [...prevFilters]
        newFilters[0] = { ...newFilters[0], children: uiModel }
        return newFilters
      })
    } else {
      setErrorData({ show: true, message: "Failed to get Routes data" })
    }
  }

  const fetchTripsApi = async () => {
    let response = await getTrips(selectedRoutes)

    if (response.data != null) {
      const uiModel: ItemVehicleFilterUI[] = response.data.map(route => (
        {
          id: route.id,
          name: `${route.attributes.headsign} - ${route.id}`
        }
      ))
      setTripFilters(prevFilters => {
        const newFilters = [...prevFilters]
        newFilters[0] = { ...newFilters[0], children: uiModel }
        return newFilters
      })
    } else {
      setErrorData({ show: true, message: "Failed to get Trips data" })
    }
  }

  // call vehicles api
  const fetchVehiclesApi = async (isLoadMore: boolean = false) => {
    let response = await getVehicle(queries)

    if (response.data != null) {
      // mapping response to ui model
      const uiModel: VehiclesUI[] = response.data.map(vehicle => (
        {
          id: vehicle.id,
          busStatus: getVehicleStatusUI(vehicle.attributes.current_status),
          busStatusBg: getVehicleStatusBg(vehicle.attributes.current_status),
          busLabel: vehicle.attributes.label,
          latitude: vehicle.attributes.latitude,
          longitude: vehicle.attributes.longitude,
          lastUpdate: format(parseISO(vehicle.attributes.updated_at), 'dd/MM/yyyy')
        }
      ))

      if (isLoadMore) {
        addVehicles(prevList => [...prevList, ...uiModel])
      } else {
        addVehicles(uiModel)
      }
    } else {
      setErrorData({ show: true, message: "Failed to get Vehicles data" })
    }

    // item per fetch is limited to 10 (based on pageLimit), so when response is less than pageLimit, 
    // it's safe to assume that the vehicle list sent from API already maxed.
    setIsVehiclesMaxed(response.data?.length != null ? response.data.length < pageLimit : true)
    setIsFetching(false)
    setIsLoadMore(false)
    setPagingOffset(vehicles.length - 1) // set offset to last index of vehicle list
  }

  const refreshing = () => {
    setIsFetching(true)

    // reset state that used for some condition
    setPagingOffset(0)
    setIsVehiclesMaxed(false)
    // -------------------------

    fetchVehiclesApi()
  }

  const handleLoadMore = () => {
    if (!isLoadMore && !isVehiclesMaxed) {
      setIsLoadMore(true)
      fetchVehiclesApi(true)
    }
  }

  const onSelectedRoutes = (selectedItems: string[]) => {
    setTempSelectedRoutes(selectedItems)
  }

  const onRouteFilterConfirmClick = () => {
    // used to compare array
    const stringSelectedRoutes = JSON.stringify(selectedRoutes)
    const stringTempSelectedRoutes = JSON.stringify(tempSelectedRoutes)

    // to prevent uneeded change
    if (stringSelectedRoutes != stringTempSelectedRoutes) {
      setSelectedRoutes(tempSelectedRoutes) // this will trigger use effect to re-fetch
    }
  }

  const onRouteFilterCancelClick = () => {
    if (selectedRoutes.length > 0) {
      setSelectedRoutes([]) // this will trigger use effect to re-fetch
    }

    if (tempSelectedRoutes.length > 0) {
      setTempSelectedRoutes([])
    }
  }

  const onSelectedTrips = (selectedItems: string[]) => {
    setTempSelectedTrips(selectedItems)
  }

  const onTripFilterConfirmClick = () => {
    // used to compare array
    const stringSelectedTrips = JSON.stringify(selectedTrips)
    const stringTempSelectedTrips = JSON.stringify(tempSelectedTrips)

    // to prevent uneeded change
    if (stringSelectedTrips != stringTempSelectedTrips) {
      setSelectedTrips(tempSelectedTrips) // this will trigger use effect to re-fetch
    }
  }

  const onTripFilterCancelCLick = () => {
    if (selectedTrips.length > 0) {
      setSelectedTrips([]) // this will trigger use effect to re-fetch
    }

    if (tempSelectedTrips.length > 0) {
      setTempSelectedTrips([])
    }
  }

  const backgroundStyle = {
    backgroundColor: Colors.lighter,
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.mainContainer]}>
      <View style={styles.container}>
        <StatusBar
          barStyle={'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <LoadingIndicator isShowed={isFetching} loadingText="Fetching Vehicle Data.." />
        {/* Route Filters */}
        <SectionedMultiSelect
          items={routeFilters}
          selectedItems={tempSelectedRoutes}
          IconRenderer={Icon}
          uniqueKey="id"
          subKey="children"
          selectText="Choose routes..."
          searchPlaceholderText="Search routes..."
          showDropDowns={true}
          expandDropDowns={true}
          readOnlyHeadings={true}
          showChips={false}
          showCancelButton={true}
          onSelectedItemsChange={onSelectedRoutes}
          onConfirm={onRouteFilterConfirmClick}
          onCancel={onRouteFilterCancelClick}
          colors={{
            primary: PRIMARY_COLOR,
            success: PRIMARY_COLOR,
            chipColor: PRIMARY_COLOR,
            cancel: "red"
          }}
          styles={{ selectToggle: { padding: 14, backgroundColor: "#eaeaea" } }}
        />
        {/* Trip Filters */}
        <SectionedMultiSelect
          items={tripFilters}
          selectedItems={tempSelectedTrips}
          IconRenderer={Icon}
          uniqueKey="id"
          subKey="children"
          selectText="Choose trips..."
          searchPlaceholderText="Search trips..."
          showDropDowns={true}
          expandDropDowns={true}
          readOnlyHeadings={true}
          showChips={false}
          showCancelButton={true}
          onSelectedItemsChange={onSelectedTrips}
          onConfirm={onTripFilterConfirmClick}
          onCancel={onTripFilterCancelCLick}
          colors={{
            primary: PRIMARY_COLOR,
            success: PRIMARY_COLOR,
            chipColor: PRIMARY_COLOR,
            cancel: "red"
          }}
          styles={{ selectToggle: { marginTop: 2, padding: 14, backgroundColor: "#eaeaea" } }}
        />
        <FlatList
          data={vehicles}
          renderItem={({ item }) => {
            return (
              <View style={styles.vehicleItemContainer}>
                <VehicleCard {...item} />
              </View>
            )
          }}
          bounces={isLoadMore ? false : true}
          keyExtractor={(_, index) => `${index}`}
          onRefresh={refreshing}
          refreshing={false}
          initialNumToRender={pageLimit}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => FooterIndicator(isLoadMore)}
        />
        <Toast show={errorData.show} text={errorData.message} onHide={() => setErrorData(defaultToastUI)} />
      </View>
    </SafeAreaView>
  )
}

const VehicleCard = (vehicle: VehiclesUI) => {
  const navController = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity
      onPress={() => navController.navigate("VehicleDetail", { vehicleId: vehicle.id })}
      style={styles.vehicleCardContainer}
    >
      <Text style={styles.vehicleName}>{`Vehicle ${vehicle.busLabel.toUpperCase()}`}</Text>
      <VehicleStatus statusText={vehicle.busStatus} statusBg={vehicle.busStatusBg} />
      <Text style={styles.vehicleLoc}>{`Lat: ${vehicle.latitude} Lng: ${vehicle.longitude}`}</Text>
      <Text style={styles.lastUpdated}>{`Last Update: ${vehicle.lastUpdate}`}</Text>
    </TouchableOpacity>
  )
}

const { width } = Dimensions.get("window")
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  container: {
    flex: 1,
  },
  vehicleItemContainer: {
    flex: 1,
    margin: 10
  },
  vehicleCardContainer: {
    width: width - 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: PRIMARY_COLOR,
    elevation: 5,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowOffset: {
      height: 0,
      width: 0
    }
  },
  vehicleName: {
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
    color: "white",
  },
  vehicleLoc: {
    marginTop: 8,
    fontSize: 12,
    color: "white"
  },
  lastUpdated: {
    marginTop: 16,
    alignSelf: "flex-end",
    fontSize: 10,
    color: "#D3D3D3"
  }
})

export default VehicleListScreen