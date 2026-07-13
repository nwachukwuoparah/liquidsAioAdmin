"use client";

import UserProfileMenu from "@/components/user-profile-menu";
import { NotificationBellIcon } from "@/components/vector";
import { useAdminSessionProfile } from "@/lib/auth/hooks/use-admin-session-profile";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Overview" }: HeaderProps) {
  const sessionProfileState = useAdminSessionProfile();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#0B0E0514] bg-[#FFFFFF] px-4 lg:h-18 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <UserProfileMenu
          variant="avatar-only"
          menuAlign="left"
          className="lg:hidden"
          sessionProfile={sessionProfileState.sessionProfile}
          isSessionProfileReady={sessionProfileState.isSessionProfileReady}
        />
        <h1 className="truncate text-xl font-bold tracking-tight text-[#0B0E05] lg:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3 lg:gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] shadow-card transition-all hover:bg-slate-50 active:scale-95 focus:outline-none"
          aria-label="View notifications"
        >
          <NotificationBellIcon className="h-[17px] w-[15px] text-[#0B0E05]" />
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white bg-[#CC2929] text-[10px] font-bold text-white shadow-card">
            1
          </span>
        </button>

        <UserProfileMenu
          className="hidden lg:block"
          sessionProfile={sessionProfileState.sessionProfile}
          isSessionProfileReady={sessionProfileState.isSessionProfileReady}
        />
      </div>
    </header>
  );
}
