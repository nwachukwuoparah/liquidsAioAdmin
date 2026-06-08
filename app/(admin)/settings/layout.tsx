"use client";

import Typography from "@/components/typography";
import { ArrowLeftIcon } from "@/components/vector";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { label: "General", href: "/settings/general" },
  { label: "Teams & permission", href: "/settings/teams" },
  { label: "My profile", href: "/settings/profile" },
] as const;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="bg-[#FFFFFF] lg:bg-transparent lg:p-4">
      {/* Mobile header + tabs */}
      <div className="bg-[#FFFFFF] lg:hidden">
        <div className="flex items-center gap-3 px-4 pb-5 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex shrink-0 items-center justify-center text-[#0B0E05]"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <Typography type="text20" fontWeight={700} className="text-[#0B0E05]">
            Settings
          </Typography>
        </div>

        <div className="flex gap-10 overflow-x-auto border-b border-[#0B0E0514] px-4 pb-px pl-[3rem] scrollbar-none">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative inline-flex shrink-0 flex-col pb-3 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-[#518300]"
                    : "font-semibold text-[#0B0E05A3] hover:text-[#0B0E05]"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#518300]"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop tabs */}
      <div className="mb-4 hidden border-b border-[#0B0E0514] lg:flex">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-[3px] px-5 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-[#518300] text-[#518300]"
                  : "border-transparent text-[#0B0E05A3] hover:text-[#0B0E05]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="h-full w-full">{children}</div>
    </div>
  );
}
