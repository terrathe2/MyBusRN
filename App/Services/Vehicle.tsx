import axios from "axios"
import { BASE_URL, STATUS_CODE_500 } from "./ApiConstants"

type GetVechiclesProps = {
    pageOffset: number; // page offset like afterId but using index instead for pagination
    page?: number; // Max number of elements to return
    routes?: string[]; // Filter by route. If the vehicle is on a multi-route trip, it will be returned for any of the routes. Multiple route_id MUST be a comma-separated (U+002C COMMA, “,”) list.
    trips?: string[]; // Filter by /data/{index}/relationships/trip/data/id. Multiple /data/{index}/relationships/trip/data/id MUST be a comma-separated (U+002C COMMA, “,”) list. Cannot be combined with any other filter.
}

export const getVehicle = async ({pageOffset, page, routes = [], trips = []}: GetVechiclesProps): Promise<ApiResponse<VehiclesResponse[]>> => {
    try {
        let filterTripsQuery = ""
        
        // this condition to prevent sending filter trip query when there's no filter selected.
        // So, api response will not always empty. Because if this filter is sent, 
        // the response will always return empty, regarding the trips is available or not.
        if (trips.length > 0) {
            filterTripsQuery = `&filter[trips]=${routes}`
        }

        let apiUrl = BASE_URL + `/vehicles?page[offset]=${pageOffset}&page[limit]=${page}`
        let response = await axios.get(apiUrl)
        return response.data
    } catch (error) {
        const errStatus = JSON.parse(JSON.stringify(error)).response.status

        return { errorCode: errStatus ?? STATUS_CODE_500 }
    }
}