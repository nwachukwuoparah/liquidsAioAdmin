"use client";

import Typography from "@/components/typography";
import {
  ListIcon,
  ProfileUserIcon,
  SignOutIcon,
  UsersIcon,
} from "@/components/vector";
import { getInitialsFromName, PROFILE_AVATAR_CLASS } from "@/lib/profile-avatar";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const PROFILE_NAME = "Samuel Nathaniel";

type UserProfileMenuProps = {
  variant?: "default" | "avatar-only";
  menuAlign?: "left" | "right";
  className?: string;
};

function UserAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const dimensions = size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs lg:h-8 lg:w-8";

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#0B0E0514] font-bold ${PROFILE_AVATAR_CLASS}`}
    >
      {getInitialsFromName(PROFILE_NAME)}
    </div>
  );
}

export default function UserProfileMenu({
  variant = "default",
  menuAlign = "right",
  className = "",
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAvatarOnly = variant === "avatar-only";

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
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
        <UserAvatar />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-72 rounded-2xl border border-[#0B0E0514] bg-[#FFFFFF] p-4 shadow-card ring-1 ring-black/5 ${
            menuAlign === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <UserAvatar size="lg" />
            <div className="flex min-w-0 flex-col">
              <Typography type="text16" fontWeight={600} className="truncate text-[#0B0E05]">
                {PROFILE_NAME}
              </Typography>
              <Typography type="text14" fontWeight={400} className="truncate text-[#0B0E05A3]">
                samuelnath@email.com
              </Typography>
              <Typography type="text12" fontWeight={700} className="mt-0.5 text-[#518300]">
                ADMIN
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
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-red-50"
          >
            <SignOutIcon className="h-5 w-5 text-[#CC2929]" />
            <Typography type="text16" fontWeight={500} className="text-[#CC2929]">
              Logout
            </Typography>
          </button>
        </div>
      )}
    </div>
  );
}
