"use client";
import { getAdminPageTitle } from "@/lib/admin-page-title";
import React from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./bottom-nav";
import Sidebar from "./sidebar";
import Header from "./header";

export default function DashboardLayout({ children }: { children: React.ReactNode; }): React.ReactNode {
    const pathname = usePathname();
    const isSettingsRoute = pathname.startsWith("/settings");

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#FFFFFF]">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <div className={isSettingsRoute ? "hidden lg:block" : undefined}>
                    <Header title={getAdminPageTitle(pathname)} />
                </div>
                <main className="flex-1 overflow-y-auto pb-[4.75rem] bg-[#0B0E050A] lg:pb-0">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
