"use client";

import React, { useEffect } from "react";
import AttendanceSettings from "@/components/settings/attendance_settings";
import CreateAdminAccount from "@/components/settings/create_account";
import cookie from 'js-cookie';
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const checkIsUserLoggedIn = () => {
            const authToken = cookie.get('authToken');
            if (!authToken) {
                router.push("/unauthorizedAccess");
            }
        };

        checkIsUserLoggedIn();
    });

    return (
        <div className="">
            <div className="flex-1">
                <div className="flex-1 mx-auto px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg h-screen">
                    <div className="flex flex-col space-y-4">
                        <div className="flex-1">
                            <CreateAdminAccount />
                        </div>
                        <div className="flex-1">
                            <AttendanceSettings />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}