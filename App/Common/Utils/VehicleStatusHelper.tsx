import {
    VEHICLE_STATUS_STOPPED,
    VEHICLE_STATUS_TRANSIT,
    VEHICLE_STATUS_BREAK,
    VEHICLE_STATUS_INCOMING,
    VEHICLE_STATUS_TRANSIT_BG,
    VEHICLE_STATUS_STOPPED_BG,
    VEHICLE_STATUS_BREAK_BG,
    VEHICLE_STATUS_INCOMING_BG,
} from '../../Common/Utils/Constants';

export const getVehicleStatusUI = (status: string): string => {
    let busStatus = ""

    switch (status) {
        case "STOPPED_AT":
            busStatus = VEHICLE_STATUS_STOPPED; break
        case "IN_TRANSIT_TO":
            busStatus = VEHICLE_STATUS_TRANSIT; break
        case "INCOMING_AT":
            busStatus = VEHICLE_STATUS_INCOMING; break
        default:
            busStatus = VEHICLE_STATUS_BREAK
    }

    return busStatus
}

export const getVehicleStatusBg = (status: string) => {
    let busStatusBg = ""

    switch (status) {
        case "STOPPED_AT":
            busStatusBg = VEHICLE_STATUS_STOPPED_BG; break
        case "IN_TRANSIT_TO":
            busStatusBg = VEHICLE_STATUS_TRANSIT_BG; break
        case "INCOMING_AT":
            busStatusBg = VEHICLE_STATUS_INCOMING_BG; break
        default:
            busStatusBg = VEHICLE_STATUS_BREAK_BG
    }

    return busStatusBg
}