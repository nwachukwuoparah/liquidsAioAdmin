import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminSessionProfile } from "@/lib/auth/hooks/use-admin-session-profile";

const mockGetAccessToken = vi.fn();

vi.mock("@/lib/auth/utilities/auth-token-storage", () => ({
    getAccessToken: () => mockGetAccessToken(),
}));

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

describe("useAdminSessionProfile", () => {
    beforeEach(() => {
        mockGetAccessToken.mockReset();
    });

    it("loads profile details from the access token after mount", async () => {
        mockGetAccessToken.mockReturnValue(
            buildTestJwt({
                firstName: "Samuel",
                lastName: "Nathaniel",
                email: "samuelnath@email.com",
                profilePicture: "https://cdn.example.com/samuel.png",
            }),
        );

        const { result } = renderHook(() => useAdminSessionProfile());

        await waitFor(() => {
            expect(result.current.isSessionProfileReady).toBe(true);
        });

        expect(result.current.sessionProfile).toMatchObject({
            displayName: "Samuel Nathaniel",
            email: "samuelnath@email.com",
            initials: "SN",
            profileImageUrl: "https://cdn.example.com/samuel.png",
        });
    });

    it("reloads the session profile when the access token changes", async () => {
        mockGetAccessToken.mockReturnValue(
            buildTestJwt({
                firstName: "Nwachukwu",
                lastName: "Oparah",
                profilePicture: "https://cdn.example.com/old.png",
            }),
        );

        const { result } = renderHook(() => useAdminSessionProfile());

        await waitFor(() => {
            expect(result.current.sessionProfile?.profileImageUrl).toBe(
                "https://cdn.example.com/old.png",
            );
        });

        mockGetAccessToken.mockReturnValue(
            buildTestJwt({
                firstName: "Nwachukwu",
                lastName: "Oparah",
                profilePicture: "https://cdn.example.com/new.png",
            }),
        );

        window.dispatchEvent(new Event("laio:admin-session-profile-changed"));

        await waitFor(() => {
            expect(result.current.sessionProfile?.profileImageUrl).toBe(
                "https://cdn.example.com/new.png",
            );
        });
    });
});
