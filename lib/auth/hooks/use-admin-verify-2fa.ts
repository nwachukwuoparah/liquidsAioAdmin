"use client";

import { useMutation } from "@tanstack/react-query";
import { adminVerify2FaCode } from "@/lib/auth/services/admin-auth.service";

/** TanStack Query mutation hook for admin 2FA verification. */
export function useAdminVerify2Fa() {
    const verify2FaMutation = useMutation({
        mutationKey: ["verify-2fa-code"],
        mutationFn: (otpCode: string) => adminVerify2FaCode(otpCode),
        retry: 0,
    });

    return {
        verify2FaMutation,
    };
}
