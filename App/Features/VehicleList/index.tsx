import React, { Children, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text
} from 'react-native';
import { parseISO, format } from 'date-fns';
import Icon from '../../Common/Components/Icons';
import { getVehicle } from '../../Services/Vehicle';
import {
  PRIMARY_COLOR,
  BUS_STATUS_STOPPED,
  BUS_STATUS_TRANSIT,
  BUS_STATUS_BREAK,
  BUS_STATUS_INCOMING,
  BUS_STATUS_TRANSIT_BG,
  BUS_STATUS_STOPPED_BG,
  BUS_STATUS_BREAK_BG,
  BUS_STATUS_INCOMING_BG,
} from '../../Common/Utils/Constants';
import LoadingIndicator from '../../Common/Components/LoadingIndicator';
import FooterIndicator from '../../Common/Components/FooterIdicator';
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
    fetchTripsApi()
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
      // handle error
    }
  }

  const fetchTripsApi = async () => {
    let response = await getTrips(selectedRoutes)

    if (response.data != null) {
      const uiModel: ItemVehicleFilterUI[] = response.data.map(route => (
        {
          id: route.id,
          name: `${route.attributes.headsign} - ${route.attributes.block_id}`
        }
      ))
      setTripFilters(prevFilters => {
        const newFilters = [...prevFilters]
        newFilters[0] = { ...newFilters[0], children: uiModel }
        return newFilters
      })
    } else {
      // handle error
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
          busStatus: getBusStatusUI(vehicle.attributes.current_status),
          busStatusBg: getBusStatusBg(vehicle.attributes.current_status),
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
      // handle error
    }
    console.log("response ", response?.data ?? response.errorCode)

    // item per fetch is limited to 10 (based on pageLimit), so when response is less than pageLimit, 
    // it's safe to assume that the vehicle list sent from API already maxed.
    setIsVehiclesMaxed(response.data?.length != null ? response.data.length < pageLimit : true)
    setIsFetching(false)
    setIsLoadMore(false)
    setPagingOffset(vehicles.length - 1) // set offset to last index of vehicle list
  }

  const getBusStatusUI = (status: string): string => {
    let busStatus = ""

    switch (status) {
      case "STOPPED_AT":
        busStatus = BUS_STATUS_STOPPED; break
      case "IN_TRANSIT_TO":
        busStatus = BUS_STATUS_TRANSIT; break
      case "INCOMING_AT":
        busStatus = BUS_STATUS_INCOMING; break
      default:
        busStatus = BUS_STATUS_BREAK
    }

    return busStatus
  }

  const getBusStatusBg = (status: string) => {
    let busStatusBg = ""

    switch (status) {
      case "STOPPED_AT":
        busStatusBg = BUS_STATUS_STOPPED_BG; break
      case "IN_TRANSIT_TO":
        busStatusBg = BUS_STATUS_TRANSIT_BG; break
      case "INCOMING_AT":
        busStatusBg = BUS_STATUS_INCOMING_BG; break
      default:
        busStatusBg = BUS_STATUS_BREAK_BG
    }

    return busStatusBg
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

  return (
    <View style={styles.container}>
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
    </View>
  )
}

const VehicleCard = (vehicle: VehiclesUI) => {
  return (
    <TouchableOpacity onPress={() => { }}>
      <View style={styles.vehicleCardContainer}>
        <Text style={styles.vehicleName}>{`Bus ${vehicle.busLabel.toUpperCase()}`}</Text>
        <View style={[styles.vehicleStatusContainer, { backgroundColor: vehicle.busStatusBg }]}>
          <Text style={styles.vehicleStatus}>{vehicle.busStatus}</Text>
        </View>
        <Text style={styles.vehicleLoc}>{`Lat: ${vehicle.latitude} Lng: ${vehicle.longitude}`}</Text>
        <Text style={styles.lastUpdated}>{`Last Update: ${vehicle.lastUpdate}`}</Text>
      </View>
    </TouchableOpacity>
  )
}

const window = Dimensions.get("window")
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  vehicleItemContainer: {
    flex: 1,
    margin: 10
  },
  vehicleCardContainer: {
    width: window.width - 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: PRIMARY_COLOR,
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