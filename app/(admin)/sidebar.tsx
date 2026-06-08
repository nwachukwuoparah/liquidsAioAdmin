"use main";
import Typography from "@/components/typography";
import { LogoIcon } from "@/components/vector";
import { ADMIN_NAV_ITEMS, isAdminNavItemActive } from "@/lib/admin-nav-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#0B0E0514] bg-[#FFFFFF] py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-6 pb-6">
        <div className="relative h-9 shrink-0">
          <LogoIcon className="h-9 w-auto" aria-hidden />
        </div>
        <span className="text-[21px] font-bold tracking-tight text-slate-900 font-sans">
          LiquidsAIO
        </span>
      </div>

      <nav className="relative mt-2 flex-1 space-y-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = isAdminNavItemActive(pathname, item.pathname);
          const Icon = item.Icon;

          return (
            <React.Fragment key={item.pathname}>
              <div className="group relative w-full px-4">
                {isActive && (
                  <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-r-md bg-[#4D7C0F]" />
                )}

                <Link
                  href={item.pathname}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-150 ${
                    isActive
                      ? "bg-[#E2F5C8] text-[#4D7C0F]"
                      : "text-[#0B0E05A3] hover:bg-slate-50 hover:text-[#0B0E05]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      className={`h-5.5 w-5.5 shrink-0 ${isActive ? "text-[#4D7C0F]" : "text-slate-500 group-hover:text-slate-800"}`}
                    />

                    <Typography
                      fontWeight={isActive ? 600 : 500}
                      className={`${isActive ? "text-[#518300]" : "!text-[#0B0E05A3]"} text-[17px] tracking-wide`}
                    >
                      {item.label}
                    </Typography>
                  </div>

                  {item.badge && (
                    <span className="min-w-[24px] rounded-full bg-[#CC2929] px-2.5 py-0.5 text-center text-[11px] font-bold text-white shadow-card">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>

              {item.dividerAfter && (
                <div className="px-4 py-3">
                  <hr className="border-[#0B0E0514]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
}
