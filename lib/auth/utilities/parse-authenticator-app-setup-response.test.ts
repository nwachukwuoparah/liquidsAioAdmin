import { describe, expect, it } from "vitest";
import { parseAuthenticatorAppSetupResponse } from "@/lib/auth/utilities/parse-authenticator-app-setup-response";

describe("parseAuthenticatorAppSetupResponse", () => {
    it("parses qrcode and setupKey from the API payload", () => {
        expect(
            parseAuthenticatorAppSetupResponse({
                status: "success",
                data: {
                    qrcode: "https://example.com/qr.png",
                    setupKey: "ABCD-1234",
                },
            }),
        ).toEqual({
            qrCodeImageUrl: "https://example.com/qr.png",
            manualEntryCode: "ABCD-1234",
        });
    });

    it("builds a QR image URL from otpauthUrl when qrcode is absent", () => {
        const parsedSetupData = parseAuthenticatorAppSetupResponse({
            status: "success",
            data: {
                otpauthUrl: "otpauth://totp/LiquidsAIO:admin@example.com?secret=SECRET",
                setupKey: "SECRET",
            },
        });

        expect(parsedSetupData.manualEntryCode).toBe("SECRET");
        expect(parsedSetupData.qrCodeImageUrl).toContain("create-qr-code");
    });

    it("throws when setup data is incomplete", () => {
        expect(() =>
            parseAuthenticatorAppSetupResponse({
                status: "success",
                data: {},
            }),
        ).toThrow("Authenticator setup details are missing from the server response.");
    });
});
