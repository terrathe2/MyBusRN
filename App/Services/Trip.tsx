import axios from "axios"
import { BASE_URL, STATUS_CODE_500 } from "./ApiConstants"

export const getTrips = async (routeIds: string[]): Promise<ApiResponse<TripsResponse[]>> => {
    try {
        let apiUrl = BASE_URL + `/trips?filter[route]=${routeIds}`
        let response = await axios.get(apiUrl)
        return response.data
    } catch (error) {
        const errStatus = JSON.parse(JSON.stringify(error)).response.status

        return { errorCode: errStatus ?? STATUS_CODE_500 }
    }
}