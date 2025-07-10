import axios from "axios"
import { BASE_URL, STATUS_CODE_500 } from "./ApiConstants"

const emptyRouteResponse = { 
    data: { 
        id: "", 
        attributes: { 
            long_name: "" 
        } 
    } 
}

export const getRoutes = async (): Promise<ApiResponse<RoutesResponse[]>> => {
    try {
        let apiUrl = BASE_URL + `/routes`
        let response = await axios.get(apiUrl)
        return response.data
    } catch (error) {
        const errStatus = JSON.parse(JSON.stringify(error)).status

        return { errorCode: errStatus ?? STATUS_CODE_500 }
    }
}

export const getRouteById = async (routeId?: string): Promise<ApiResponse<RoutesResponse>> => {
    try {
        if (routeId == null || routeId == "") return emptyRouteResponse

        let apiUrl = BASE_URL + `/routes/${routeId}`
        let response = await axios.get(apiUrl)
        return response.data
    } catch (error) {
        const errStatus = JSON.parse(JSON.stringify(error)).status

        return { errorCode: errStatus ?? STATUS_CODE_500 }
    }
}