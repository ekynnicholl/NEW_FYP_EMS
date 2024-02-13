"use client";

import SideBarDesktop from "@/components/layouts/SideBarDesktop"
import SideBarMobile from "@/components/layouts/SideBarMobile"
import TopBar from "@/components/layouts/TopBar"
import React, { useEffect, useState } from "react";
import useViewModeStore from '@/components/zustand/viewModeStorage';
import darkLightStorage from '@/components/zustand/darkLightStorage';
import cookie from 'js-cookie';
import loadingGIF from "@/public/loading.gif";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const setViewMode = useViewModeStore((state) => state.setViewMode);
    const setIsDarkMode = darkLightStorage((state) => state.toggleDarkMode);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkIsUserLoggedIn = () => {
            try {
                const authToken = cookie.get('authToken');
                setIsAuthenticated(!!authToken);

                if (!authToken) {
                    router.push("/unauthorizedAccess");
                }
            } finally {
                // Set loading to false after the authentication check is complete
                setIsLoading(false);
            }
        };

        checkIsUserLoggedIn();
    }, [router]);

    useEffect(() => {
        // console.log('Current viewMode:', useViewModeStore.getState().viewMode);
        // console.log('Current viewMode:', darkLightStorage.getState().isDarkMode);
    }, []);

    // Define a function to change the view mode
    const handleViewModeChange = (newViewMode: number) => {
        setViewMode(newViewMode);
        // console.log(children);
    };

    const handeIsDarkModeChange = () => {
        setIsDarkMode();
    }

    return (
        <>
            {isLoading && (
                // Loading state, you can customize this as needed
                <div className="flex justify-center items-center h-screen bg-white">
                    <img src={loadingGIF.src} alt="" className="w-[300px] lg:w-[420px]" />
                </div>
            )}
            {!isLoading && isAuthenticated !== null && (
                <div className="flex justify-start bg-slate-100">
                    <div className="sm:hidden">
                        <SideBarMobile />
                    </div>

                    <div className="hidden sm:flex">
                        <SideBarDesktop />
                    </div>

                    <div className="w-full">
                        <div>
                            <TopBar onViewModeChange={handleViewModeChange} onIsDarkModeChange={handeIsDarkModeChange} />
                        </div>
                        {isAuthenticated && children}
                    </div>
                </div>
            )}
        </>
    );
}
