import { describe, expect, it } from "vitest";
import {
    encodeSetupAuthFlowPayload,
    encodeVerifyAuthFlowPayload,
    mergeAuthFlowWithSetupData,
    readSetupAuthFlowPayloadFromSearchParams,
    readVerifyAuthFlowPayloadFromSearchParams,
} from "@/lib/auth/utilities/auth-flow-payload";

describe("encodeSetupAuthFlowPayload", () => {
    it("encodes setup token and data as base64 JSON", () => {
        const encodedPayload = encodeSetupAuthFlowPayload({
            setupToken: "setup-token",
            data: { requiresTwoFactorSetup: true },
        });

        expect(encodedPayload).toBe(
            btoa(JSON.stringify({
                setupToken: "setup-token",
                data: { requiresTwoFactorSetup: true },
            })),
        );
    });
});

describe("encodeVerifyAuthFlowPayload", () => {
    it("encodes session token without setup token", () => {
        const encodedPayload = encodeVerifyAuthFlowPayload({
            token: "session-token",
            data: { email: "admin@liquidsaio.com" },
        });

        expect(encodedPayload).toBe(
            btoa(JSON.stringify({
                token: "session-token",
                data: { email: "admin@liquidsaio.com" },
            })),
        );
        expect(encodedPayload).not.toContain("setupToken");
    });
});

describe("readSetupAuthFlowPayloadFromSearchParams", () => {
    it("reads and decodes the setup token search param", () => {
        const encodedPayload = encodeSetupAuthFlowPayload({
            setupToken: "setup-token",
            data: { email: "admin@liquidsaio.com" },
        });
        const searchParams = new URLSearchParams(`token=${encodeURIComponent(encodedPayload)}`);

        expect(readSetupAuthFlowPayloadFromSearchParams(searchParams)).toEqual({
            setupToken: "setup-token",
            data: { email: "admin@liquidsaio.com" },
        });
    });

    it("returns null for verify payloads", () => {
        const encodedPayload = encodeVerifyAuthFlowPayload({ token: "session-token" });
        const searchParams = new URLSearchParams(`token=${encodeURIComponent(encodedPayload)}`);

        expect(readSetupAuthFlowPayloadFromSearchParams(searchParams)).toBeNull();
    });
});

describe("readVerifyAuthFlowPayloadFromSearchParams", () => {
    it("reads and decodes the verify token search param", () => {
        const encodedPayload = encodeVerifyAuthFlowPayload({
            token: "session-token",
            data: { email: "admin@liquidsaio.com" },
        });
        const searchParams = new URLSearchParams(`token=${encodeURIComponent(encodedPayload)}`);

        expect(readVerifyAuthFlowPayloadFromSearchParams(searchParams)).toEqual({
            token: "session-token",
            data: { email: "admin@liquidsaio.com" },
        });
    });

    it("returns null for setup payloads", () => {
        const encodedPayload = encodeSetupAuthFlowPayload({
            setupToken: "setup-token",
            data: { email: "admin@liquidsaio.com" },
        });
        const searchParams = new URLSearchParams(`token=${encodeURIComponent(encodedPayload)}`);

        expect(readVerifyAuthFlowPayloadFromSearchParams(searchParams)).toBeNull();
    });
});

describe("mergeAuthFlowWithSetupData", () => {
    it("merges login payload data with authenticator setup API data", () => {
        const mergedViewData = mergeAuthFlowWithSetupData(
            {
                setupToken: "setup-token",
                data: { email: "admin@liquidsaio.com", requiresTwoFactorSetup: true },
            },
            {
                qrCodeImageUrl: "https://example.com/qr.png",
                manualEntryCode: "ABCD-1234",
            },
        );

        expect(mergedViewData).toEqual({
            qrCodeImageUrl: "https://example.com/qr.png",
            manualEntryCode: "ABCD-1234",
            data: {
                email: "admin@liquidsaio.com",
                requiresTwoFactorSetup: true,
                qrCodeImageUrl: "https://example.com/qr.png",
                manualEntryCode: "ABCD-1234",
            },
        });
    });
});
