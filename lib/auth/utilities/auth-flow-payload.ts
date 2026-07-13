/** Payload for the setup-2fa auth route. */
export interface SetupAuthFlowPayload {
    setupToken: string;
    data: unknown;
}

/** Payload for the verify auth route — session token only, no setup token. */
export interface VerifyAuthFlowPayload {
    token: string;
    data?: unknown;
}

/** Combined login payload data and authenticator setup API data for rendering. */
export interface SetupTwoFactorViewData {
    qrCodeImageUrl: string;
    manualEntryCode: string;
    data: Record<string, unknown>;
}

/**
 * Encodes a setup auth flow payload as a base64 JSON string for URL transport.
 * @param payload - Setup token and login response data for the setup-2fa screen.
 */
export function encodeSetupAuthFlowPayload(payload: SetupAuthFlowPayload): string {
    return encodeAuthFlowPayloadValue(payload);
}

/**
 * Encodes a verify auth flow payload as a base64 JSON string for URL transport.
 * @param payload - Session token and optional metadata for the verify screen.
 */
export function encodeVerifyAuthFlowPayload(payload: VerifyAuthFlowPayload): string {
    return encodeAuthFlowPayloadValue(payload);
}

/**
 * Reads and decodes the setup auth flow payload from URL search params.
 * @param searchParams - Current page search params.
 */
export function readSetupAuthFlowPayloadFromSearchParams(
    searchParams: URLSearchParams,
): SetupAuthFlowPayload | null {
    const encodedPayload = searchParams.get("token");

    if (!encodedPayload) {
        return null;
    }

    const decodedPayload = decodeAuthFlowPayloadValue(encodedPayload);

    if (!decodedPayload || typeof decodedPayload !== "object" || !("setupToken" in decodedPayload)) {
        return null;
    }

    const setupToken = (decodedPayload as SetupAuthFlowPayload).setupToken;

    if (typeof setupToken !== "string" || !setupToken) {
        return null;
    }

    return decodedPayload as SetupAuthFlowPayload;
}

/**
 * Reads and decodes the verify auth flow payload from URL search params.
 * @param searchParams - Current page search params.
 */
export function readVerifyAuthFlowPayloadFromSearchParams(
    searchParams: URLSearchParams,
): VerifyAuthFlowPayload | null {
    const encodedPayload = searchParams.get("token");

    if (!encodedPayload) {
        return null;
    }

    const decodedPayload = decodeAuthFlowPayloadValue(encodedPayload);

    if (!decodedPayload || typeof decodedPayload !== "object" || !("token" in decodedPayload)) {
        return null;
    }

    const sessionToken = (decodedPayload as VerifyAuthFlowPayload).token;

    if (typeof sessionToken !== "string" || !sessionToken) {
        return null;
    }

    return decodedPayload as VerifyAuthFlowPayload;
}

/**
 * Merges decoded login payload data with authenticator setup API data.
 * @param authFlowPayload - Decoded setup auth flow payload from login.
 * @param setupData - Parsed authenticator setup response from the API.
 */
export function mergeAuthFlowWithSetupData(
    authFlowPayload: SetupAuthFlowPayload,
    setupData: { qrCodeImageUrl: string; manualEntryCode: string },
): SetupTwoFactorViewData {
    const loginData =
        typeof authFlowPayload.data === "object" && authFlowPayload.data !== null
            ? (authFlowPayload.data as Record<string, unknown>)
            : {};

    return {
        qrCodeImageUrl: setupData.qrCodeImageUrl,
        manualEntryCode: setupData.manualEntryCode,
        data: {
            ...loginData,
            qrCodeImageUrl: setupData.qrCodeImageUrl,
            manualEntryCode: setupData.manualEntryCode,
        },
    };
}

/** Encodes any auth flow payload as a base64 JSON string. */
function encodeAuthFlowPayloadValue(payload: SetupAuthFlowPayload | VerifyAuthFlowPayload): string {
    const jsonPayload = JSON.stringify(payload);
    const utf8Bytes = new TextEncoder().encode(jsonPayload);
    let binaryString = "";

    for (const utf8Byte of utf8Bytes) {
        binaryString += String.fromCharCode(utf8Byte);
    }

    return btoa(binaryString);
}

/** Decodes a base64 auth flow payload from URL transport. */
function decodeAuthFlowPayloadValue(encodedPayload: string): unknown | null {
    try {
        const binaryString = atob(encodedPayload);
        const utf8Bytes = Uint8Array.from(binaryString, (character) => character.charCodeAt(0));
        const jsonPayload = new TextDecoder().decode(utf8Bytes);

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}
