import { describe, expect, it } from "vitest";
import {
    DEFAULT_ADMIN_DISPLAY_NAME,
    DEFAULT_ADMIN_ROLE_LABEL,
    resolveAdminSessionProfile,
} from "@/lib/auth/utilities/resolve-admin-session-profile";

function buildTestJwt(payload: Record<string, unknown>): string {
    const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
        "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    return `${encodedHeader}.${encodedPayload}.test-signature`;
}

describe("resolveAdminSessionProfile", () => {
    it("returns defaults when no access token is available", () => {
        expect(resolveAdminSessionProfile(null)).toEqual({
            displayName: DEFAULT_ADMIN_DISPLAY_NAME,
            email: "",
            roleLabel: DEFAULT_ADMIN_ROLE_LABEL,
            profileImageUrl: null,
            initials: "AU",
        });
    });

    it("resolves name, email, role, and profile image from token claims", () => {
        const accessToken = buildTestJwt({
            firstName: "Samuel",
            lastName: "Nathaniel",
            email: "samuelnath@email.com",
            roleName: "superAdmin",
            profileImageUrl: "https://cdn.example.com/profile.jpg",
        });

        expect(resolveAdminSessionProfile(accessToken)).toEqual({
            displayName: "Samuel Nathaniel",
            email: "samuelnath@email.com",
            roleLabel: "SUPER ADMIN",
            profileImageUrl: "https://cdn.example.com/profile.jpg",
            initials: "SN",
        });
    });

    it("resolves profilePicture, roles, and obscuredMail from the admin JWT shape", () => {
        const accessToken = buildTestJwt({
            type: "admin",
            firstName: "Nwachukwu",
            lastName: "Oparah",
            obscuredMail: "n****rah@gmail.com",
            profilePicture:
                "https://res.cloudinary.com/extelvogroup/image/upload/v1783653081/profiles/SwhvZlC2nQv0/profile-picture.png",
            roles: ["superAdmin"],
        });

        expect(resolveAdminSessionProfile(accessToken)).toEqual({
            displayName: "Nwachukwu Oparah",
            email: "n****rah@gmail.com",
            roleLabel: "SUPER ADMIN",
            profileImageUrl:
                "https://res.cloudinary.com/extelvogroup/image/upload/v1783653081/profiles/SwhvZlC2nQv0/profile-picture.png",
            initials: "NO",
        });
    });

    it("falls back to initials when no profile image claim is present", () => {
        const accessToken = buildTestJwt({
            fullName: "Samuel Nathaniel",
            email: "samuelnath@email.com",
        });

        expect(resolveAdminSessionProfile(accessToken)).toMatchObject({
            displayName: "Samuel Nathaniel",
            email: "samuelnath@email.com",
            profileImageUrl: null,
            initials: "SN",
        });
    });

    it("derives the display name and initials from the email when name claims are missing", () => {
        const accessToken = buildTestJwt({
            email: "samuel.nathaniel@email.com",
            roleName: "admin",
        });

        expect(resolveAdminSessionProfile(accessToken)).toMatchObject({
            displayName: "Samuel Nathaniel",
            email: "samuel.nathaniel@email.com",
            initials: "SN",
            roleLabel: "ADMIN",
        });
    });
});
