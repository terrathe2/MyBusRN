import axios from "axios"
import { BASE_URL, STATUS_CODE_500 } from "./ApiConstants"

const emptyTripResponse = { 
    data: { 
        id: "", 
        attributes: { 
            block_id: "",
            headsign: "" 
        } 
    } 
}

export const getTrips = async (routeIds: string[]): Promise<ApiResponse<TripsResponse[]>> => {
    try {
        let apiUrl = BASE_URL + `/trips?filter[route]=${routeIds}`
        let response = await axios.get(apiUrl)
        return response.data
    } catch (error) {
        const errStatus = JSON.parse(JSON.stringify(error)).status

        return { errorCode: errStatus ?? STATUS_CODE_500 }
    }
}

export const getTripById = async (tripId?: string): Promise<ApiResponse<TripsResponse>> => {
    try {
        if (tripId == null || tripId == "") return emptyTripResponse

        let apiUrl = BASE_URL + `/trips/${tripId}`
        let response = await axios.get(apiUrl)
        return response.data
    } catch (error) {
        const errStatus = JSON.parse(JSON.stringify(error)).status

        return { errorCode: errStatus ?? STATUS_CODE_500 }
    }
}