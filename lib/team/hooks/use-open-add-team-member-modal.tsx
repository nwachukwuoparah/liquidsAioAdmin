"use client";

import { AddTeamMemberModal } from "@/components/modals/add-team-member-modal";
import { useModal } from "@/context/modal-provider";
import { useCallback } from "react";

/** Opens the add-team-member modal using the shared modal provider. */
export function useOpenAddTeamMemberModal() {
    const { showModal } = useModal();

    return useCallback(() => {
        showModal({
            content: (closeModal) => <AddTeamMemberModal onClose={closeModal} />,
            panelClassName: "w-full md:max-w-lg !rounded-2xl overflow-hidden shadow-xl",
            dismissOnOverlayClick: false,
        });
    }, [showModal]);
}
