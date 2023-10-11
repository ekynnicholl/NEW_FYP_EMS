"use client";

import SideBarDesktop from "@/components/layouts/SideBarDesktop"
import SideBarMobile from "@/components/layouts/SideBarMobile"
import TopBar from "@/components/layouts/TopBar"
import React from "react";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [viewMode, setViewMode] = useState(1);

    // Define a function to change the view mode
    const handleViewModeChange = (newViewMode: number) => {
        setViewMode(newViewMode);
        console.log(children);
    };

    return (
        <div className="h-screen max-w-full flex flex-row justify-start bg-slate-100">
            <div className="sm:hidden">
                <SideBarMobile />
            </div>

            <div className="hidden sm:flex">
                <SideBarDesktop />
            </div>
            <div className="w-full">
                <div className="hidden sm:block">
                    <TopBar onViewModeChange={handleViewModeChange} />
                </div>
                {React.cloneElement(children as React.ReactElement, { viewMode })}
            </div>
        </div>
    );
}
