import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text
} from 'react-native';
import { getVehicle } from '../../Services/Vehicle';
import { 
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

const VehicleListScreen = () => {
  const pageLimit = 10
  const [isVehiclesMaxed, setIsVehiclesMaxed] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false)
  const [vehicles, addVehicles] = useState<VehiclesUI[]>([])
  const [pagingOffset, setPagingOffset] = useState(0)
  const queries = {
    pageOffset: pagingOffset,
    page: pageLimit
  }

  useEffect(() => {
    setIsFetching(true)
    fetchVehiclesApi()
   }, [])

  // call api
  const fetchVehiclesApi = async (isRefreshing: boolean = false) => {
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
          lastUpdate: vehicle.attributes.updated_at
        }
      ))
      
      // handle replace list when refresh here to prevent list showing empty when pull to refresh
      if (isRefreshing) {
        addVehicles(uiModel)
      } else {
        addVehicles(prevList => [...prevList, ...uiModel])
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
    
    switch(status) {
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
    
    switch(status) {
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

    fetchVehiclesApi(true)
  }

  const handleLoadMore = () => {
    if (!isLoadMore && !isVehiclesMaxed) {
      setIsLoadMore(true)
      fetchVehiclesApi()
    }
  }

  return (
    <View style={styles.container}>
      <LoadingIndicator isShowed={isFetching} loadingText="Fetching Vehicle Data.." />
      <FlatList
        data={vehicles}
        renderItem={({ item }) => {
          return (
            <View style={styles.vehicleItemContainer}>
              <VehicleCard {...item} />
            </View>
          )
        }}
        bounces={isLoadMore ? false : true }
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
    <TouchableOpacity onPress={() => {}}>
      <View style={styles.vehicleCardContainer}>
        <Text style={styles.vehicleName}>{`Bus ${vehicle.busLabel.toUpperCase()}`}</Text>
        <View style={[styles.vehicleStatusContainer, { backgroundColor: vehicle.busStatusBg }]}>
          <Text style={styles.vehicleStatus}>{vehicle.busStatus}</Text>
        </View>
        <Text style={styles.vehicleLoc}>{`Lat: ${vehicle.latitude} Lng: ${vehicle.longitude}`}</Text>
        <Text style={styles.lastUpdated}>{`Last Update: ${vehicle.lastUpdate}`}</Text>
      </View>
    </TouchableOpacity>
  )}

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
    backgroundColor: '#0D3347',
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