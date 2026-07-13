import { describe, expect, it } from "vitest";
import {
    buildTwoFactorOtpAuthUrl,
    buildTwoFactorQrCodeImageUrl,
} from "@/lib/auth/utilities/build-two-factor-otp-auth-url";

describe("buildTwoFactorOtpAuthUrl", () => {
    it("builds an otpauth URL for the account email", () => {
        const otpAuthUrl = buildTwoFactorOtpAuthUrl("admin@liquidsaio.com");

        expect(otpAuthUrl).toContain("otpauth://totp/");
        expect(otpAuthUrl).toContain("admin%40liquidsaio.com");
        expect(otpAuthUrl).toContain("secret=LQUIDSAIOADMIN2FASECRET");
    });
});

describe("buildTwoFactorQrCodeImageUrl", () => {
    it("builds a QR code image URL for the otpauth payload", () => {
        const qrCodeImageUrl = buildTwoFactorQrCodeImageUrl("otpauth://totp/demo");

        expect(qrCodeImageUrl).toContain("api.qrserver.com");
        expect(qrCodeImageUrl).toContain(encodeURIComponent("otpauth://totp/demo"));
    });
});
