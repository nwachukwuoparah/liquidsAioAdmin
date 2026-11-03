"use client";

import { useEffect, useState } from "react";

const PLACES_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

interface UseGooglePlacesAutocompleteResult {
    predictions: string[];
    isLoading: boolean;
    errorMessage: string | null;
}

/**
 * Debounced Google Places autocomplete predictions for location filters.
 * @param input - Free-text query typed in the location search field.
 * @param enabled - Whether predictions should be fetched.
 */
export function useGooglePlacesAutocomplete(
    input: string,
    enabled: boolean,
): UseGooglePlacesAutocompleteResult {
    const [predictions, setPredictions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setPredictions([]);
            setIsLoading(false);
            setErrorMessage(null);
            return;
        }

        const trimmedInput = input.trim();

        if (trimmedInput.length < MIN_QUERY_LENGTH) {
            setPredictions([]);
            setIsLoading(false);
            setErrorMessage(null);
            return;
        }

        let cancelled = false;
        const timeoutId = window.setTimeout(() => {
            const AutocompleteService = window.google?.maps?.places?.AutocompleteService;

            if (!AutocompleteService) {
                setPredictions([]);
                setIsLoading(false);
                setErrorMessage("Location search is unavailable.");
                return;
            }

            setIsLoading(true);
            const service = new AutocompleteService();

            service.getPlacePredictions(
                {
                    input: trimmedInput,
                    componentRestrictions: { country: "us" },
                },
                (results, status) => {
                    if (cancelled) {
                        return;
                    }

                    setIsLoading(false);

                    if (status === "OK" && results) {
                        setPredictions(results.map((prediction) => prediction.description));
                        setErrorMessage(null);
                        return;
                    }

                    setPredictions([]);

                    if (status === "ZERO_RESULTS") {
                        setErrorMessage(null);
                        return;
                    }

                    setErrorMessage("Unable to search locations.");
                },
            );
        }, PLACES_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [enabled, input]);

    return {
        predictions,
        isLoading,
        errorMessage,
    };
}
