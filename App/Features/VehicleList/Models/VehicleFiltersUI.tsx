export interface VehicleFiltersUI {
    name: string;
    id: number;
    children: ItemVehicleFilterUI[]
}

export interface ItemVehicleFilterUI {
    name: string;
    id: string;
}

export const defaultRouteFilters: VehicleFiltersUI[] = [
    {
        name: "Routes",
        id: 0,
        children: []
    }
]

export const defaultTripFilters: VehicleFiltersUI[] = [
    {
        name: "Trips",
        id: 0,
        children: []
    }
]