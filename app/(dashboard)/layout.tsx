"use client";

import SideBarDesktop from "@/components/layouts/SideBarDesktop"
import SideBarMobile from "@/components/layouts/SideBarMobile"
import TopBar from "@/components/layouts/TopBar"
import React, { useEffect } from "react";
import useViewModeStore from '@/components/zustand/viewModeStorage';
import darkLightStorage from '@/components/zustand/darkLightStorage';
// npm install zustand

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const setViewMode = useViewModeStore((state) => state.setViewMode);
    const setIsDarkMode = darkLightStorage((state) => state.toggleDarkMode)

    useEffect(() => {
        console.log('Current viewMode:', useViewModeStore.getState().viewMode);
        console.log('Current viewMode:', darkLightStorage.getState().isDarkMode);
    }, []);

    // Define a function to change the view mode
    const handleViewModeChange = (newViewMode: number) => {
        setViewMode(newViewMode);
        console.log(children);
    };

    const handeIsDarkModeChange = () => {
        setIsDarkMode();
    }

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
                    <TopBar onViewModeChange={handleViewModeChange} onIsDarkModeChange={handeIsDarkModeChange} />
                </div>
                {children}
            </div>
        </div>
    );
}
