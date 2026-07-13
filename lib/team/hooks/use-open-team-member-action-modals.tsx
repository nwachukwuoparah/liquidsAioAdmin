"use client";

import { CancelInvitationModal } from "@/components/modals/cancel-invitation-modal";
import { RevokeTeamAccessModal } from "@/components/modals/revoke-team-access-modal";
import { useModal } from "@/context/modal-provider";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";
import type { AdminTeamMemberApiRecord } from "@/lib/team/types/admin-team-members.types";
import { getTeamMemberDisplayName } from "@/lib/team/utilities/team-member-display";
import { useCallback } from "react";
import { toast } from "sonner";

/** Opens Cancel Invitation / Revoke access confirmation modals for team members. */
export function useOpenTeamMemberActionModals() {
    const { showModal } = useModal();

    const openCancelInvitationModal = useCallback(
        (member: AdminTeamMemberApiRecord) => {
            if (!member.id) {
                toast.error("Unable to cancel invitation. Missing admin id.");
                return;
            }

            showModal({
                content: <CancelInvitationModal adminId={member.id} />,
                panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
                dismissOnOverlayClick: false,
            });
        },
        [showModal],
    );

    const openRevokeAccessModal = useCallback(
        (member: AdminTeamMemberApiRecord) => {
            if (!member.id) {
                toast.error("Unable to revoke access. Missing admin id.");
                return;
            }

            showModal({
                content: (
                    <RevokeTeamAccessModal
                        adminId={member.id}
                        memberName={getTeamMemberDisplayName(member)}
                    />
                ),
                panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
                dismissOnOverlayClick: false,
            });
        },
        [showModal],
    );

    return {
        openCancelInvitationModal,
        openRevokeAccessModal,
    };
}
