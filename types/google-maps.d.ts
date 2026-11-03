/** Minimal Google Maps Places typings used by location autocomplete. */
declare namespace google.maps.places {
    interface AutocompletionRequest {
        input: string;
        componentRestrictions?: {
            country: string | string[];
        };
    }

    interface AutocompletePrediction {
        description: string;
        place_id: string;
    }

    type PlacesServiceStatus =
        | "OK"
        | "ZERO_RESULTS"
        | "OVER_QUERY_LIMIT"
        | "REQUEST_DENIED"
        | "INVALID_REQUEST"
        | "UNKNOWN_ERROR"
        | "NOT_FOUND";

    class AutocompleteService {
        getPlacePredictions(
            request: AutocompletionRequest,
            callback: (
                results: AutocompletePrediction[] | null,
                status: PlacesServiceStatus,
            ) => void,
        ): void;
    }
}

declare namespace google.maps {
    const places: typeof google.maps.places;
}

interface Window {
    google?: {
        maps?: {
            places?: {
                AutocompleteService: typeof google.maps.places.AutocompleteService;
            };
        };
    };
}
