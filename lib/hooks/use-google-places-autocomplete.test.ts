import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGooglePlacesAutocomplete } from "./use-google-places-autocomplete";

describe("useGooglePlacesAutocomplete", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("returns Google Places prediction descriptions", async () => {
        const getPlacePredictions = vi.fn((_request, callback) => {
            callback(
                [
                    {
                        description: "Philadelphia, PA, USA",
                        place_id: "place-1",
                    },
                ],
                "OK",
            );
        });

        vi.stubGlobal("google", {
            maps: {
                places: {
                    AutocompleteService: vi.fn(function AutocompleteService() {
                        return { getPlacePredictions };
                    }),
                },
            },
        });

        const { result } = renderHook(() =>
            useGooglePlacesAutocomplete("Philadelphia", true),
        );

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(getPlacePredictions).toHaveBeenCalled();
        expect(result.current.predictions).toEqual(["Philadelphia, PA, USA"]);
        expect(result.current.errorMessage).toBeNull();
    });

    it("does not query until the input is long enough", async () => {
        const getPlacePredictions = vi.fn();

        vi.stubGlobal("google", {
            maps: {
                places: {
                    AutocompleteService: vi.fn(function AutocompleteService() {
                        return { getPlacePredictions };
                    }),
                },
            },
        });

        renderHook(() => useGooglePlacesAutocomplete("P", true));

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(getPlacePredictions).not.toHaveBeenCalled();
    });
});
