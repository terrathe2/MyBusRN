interface VehiclesResponse {
    id: string;
    attributes: {
        current_status: string;
        label: string;
        latitude: number;
        longitude: number;
        updated_at: string;
    },
    relationships: {
        route: {
            data: {
                id: string
            }
        },
        trip: {
            data: {
                id: string
            }
        }
    },
}