"use client";

import Suggestion from '@/components/suggestions/suggestion';
import UpdateLogs from '@/components/suggestions/update_logs';
import cookie from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
                <div className="flex-1 mx-auto px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg">
                    <Suggestion />
                    <UpdateLogs />
                </div>
            </div>
        </div>
    )
};