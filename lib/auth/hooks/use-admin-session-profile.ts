"use client";

import { useEffect, useState } from "react";
import { ADMIN_SESSION_PROFILE_CHANGED_EVENT } from "@/lib/auth/utilities/admin-session-profile-events";
import {
    resolveAdminSessionProfile,
    type AdminSessionProfile,
} from "@/lib/auth/utilities/resolve-admin-session-profile";
import { getAccessToken } from "@/lib/auth/utilities/auth-token-storage";

interface AdminSessionProfileState {
    sessionProfile: AdminSessionProfile | null;
    isSessionProfileReady: boolean;
}

/**
 * Reads the stored access token cookie after mount to avoid SSR/client hydration mismatches.
 * Re-resolves when the access token is updated (e.g. after profile picture save).
 */
export function useAdminSessionProfile(): AdminSessionProfileState {
    const [sessionProfile, setSessionProfile] = useState<AdminSessionProfile | null>(null);

    useEffect(() => {
        const syncSessionProfile = () => {
            setSessionProfile(resolveAdminSessionProfile(getAccessToken()));
        };

        syncSessionProfile();
        window.addEventListener(ADMIN_SESSION_PROFILE_CHANGED_EVENT, syncSessionProfile);

        return () => {
            window.removeEventListener(ADMIN_SESSION_PROFILE_CHANGED_EVENT, syncSessionProfile);
        };
    }, []);

    return {
        sessionProfile,
        isSessionProfileReady: sessionProfile !== null,
    };
}
