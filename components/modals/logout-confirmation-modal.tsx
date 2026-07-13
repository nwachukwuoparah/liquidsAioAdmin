"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
} from "@/components/modals/compliance-review-dialog";
import { SignOutIcon } from "@/components/vector";
import { useAdminLogout } from "@/lib/auth/hooks/use-admin-logout";

/** Confirms signing out of the admin dashboard. */
export function LogoutConfirmationModal() {
    const logoutMutation = useAdminLogout();

    const handleConfirm = () => {
        logoutMutation.mutate();
    };

    return (
        <ComplianceReviewDialog
            title="Logging out?"
            description="You'll be signed out of your account and will need to login again to continue."
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={logoutMutation.isPending} />
                    <button
                        type="button"
                        disabled={logoutMutation.isPending}
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-2 rounded-[13px] bg-[#CC2929] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B42318] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <SignOutIcon className="h-4 w-4" />
                        {logoutMutation.isPending ? "Logging out..." : "Log Out"}
                    </button>
                </>
            }
        />
    );
}
