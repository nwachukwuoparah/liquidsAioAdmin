"use client";

import { FloatingMenuPortal } from "@/components/floating-menu-portal";
import { LogoutConfirmationModal } from "@/components/modals/logout-confirmation-modal";
import Typography from "@/components/typography";
import { ProfileAvatar } from "@/components/profile-avatar";
import {
  ListIcon,
  ProfileUserIcon,
  SignOutIcon,
  UsersIcon,
} from "@/components/vector";
import { useModal } from "@/context/modal-provider";
import type { AdminSessionProfile } from "@/lib/auth/utilities/resolve-admin-session-profile";
import { useFloatingMenu } from "@/lib/hooks/use-floating-menu";
import { COMPLIANCE_REVIEW_MODAL_PANEL_CLASS } from "@/lib/modal/constants/modal.constant";
import Link from "next/link";
import { useState } from "react";

type UserProfileMenuProps = {
  variant?: "default" | "avatar-only";
  menuAlign?: "left" | "right";
  className?: string;
  sessionProfile: AdminSessionProfile | null;
  isSessionProfileReady: boolean;
};

export default function UserProfileMenu({
  variant = "default",
  menuAlign = "right",
  className = "",
  sessionProfile,
  isSessionProfileReady,
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { showModal } = useModal();
  const { triggerRef, menuRef, menuStyle, isMounted } = useFloatingMenu({
    isOpen,
    onClose: () => setIsOpen(false),
    placement: "bottom",
    align: menuAlign,
    offset: 8,
  });

  const isAvatarOnly = variant === "avatar-only";

  const handleLogoutClick = () => {
    setIsOpen(false);
    showModal({
      content: <LogoutConfirmationModal />,
      panelClassName: COMPLIANCE_REVIEW_MODAL_PANEL_CLASS,
      dismissOnOverlayClick: false,
    });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={
          isAvatarOnly
            ? "flex shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
            : "flex items-center gap-2 rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] px-2 py-1.5 shadow-card transition-colors hover:bg-slate-50"
        }
        aria-label="Open user menu"
        aria-expanded={isOpen}
      >
        {!isAvatarOnly && <ListIcon className="h-5 w-5 text-[#0B0E05]" />}
        <ProfileAvatar
          name={sessionProfile?.displayName ?? ""}
          initials={sessionProfile?.initials}
          imageUrl={sessionProfile?.profileImageUrl}
          isLoading={!isSessionProfileReady}
        />
      </button>

      <FloatingMenuPortal
        isOpen={isOpen}
        isMounted={isMounted}
        menuRef={menuRef}
        menuStyle={menuStyle}
        className="w-72 rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] p-4 shadow-card ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3">
          <ProfileAvatar
            size="lg"
            name={sessionProfile?.displayName ?? ""}
            initials={sessionProfile?.initials}
            imageUrl={sessionProfile?.profileImageUrl}
            isLoading={!isSessionProfileReady}
          />
          <div className="flex min-w-0 flex-col">
            <Typography type="text16" fontWeight={600} className="truncate text-[#0B0E05]">
              {sessionProfile?.displayName ?? ""}
            </Typography>
            {sessionProfile?.email ? (
              <Typography type="text14" fontWeight={400} className="truncate text-[#0B0E05A3]">
                {sessionProfile.email}
              </Typography>
            ) : null}
            <Typography type="text12" fontWeight={700} className="mt-0.5 text-[#518300]">
              {sessionProfile?.roleLabel ?? ""}
            </Typography>
          </div>
        </div>

        <hr className="my-4 border-[#0B0E0514]" />

        <div className="space-y-1">
          <Link
            href="/settings/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50"
          >
            <ProfileUserIcon className="h-5 w-5 text-[#0B0E05]" />
            <Typography type="text16" fontWeight={500} className="text-[#0B0E05]">
              Profile
            </Typography>
          </Link>

          <Link
            href="/settings/teams"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50"
          >
            <UsersIcon className="h-5 w-5 text-[#0B0E05]" />
            <Typography type="text16" fontWeight={500} className="text-[#0B0E05]">
              Teams & permission
            </Typography>
          </Link>
        </div>

        <hr className="my-4 border-[#0B0E0514]" />

        <button
          type="button"
          onClick={handleLogoutClick}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-red-50"
        >
          <SignOutIcon className="h-5 w-5 text-[#CC2929]" />
          <Typography type="text16" fontWeight={500} className="text-[#CC2929]">
            Logout
          </Typography>
        </button>
      </FloatingMenuPortal>
    </div>
  );
}
