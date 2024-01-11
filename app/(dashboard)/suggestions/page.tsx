"use client";

import Suggestion from '@/components/suggestions/suggestion';
import UpdateLogs from '@/components/suggestions/update_logs';
import ToDo from '@/components/suggestions/to_do';
import SuggestList from '@/components/suggestions/suggest_list';
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
                    <div className="flex flex-row space-x-4">
                        <Suggestion />
                        <SuggestList />
                    </div>
                    <div className="flex flex-row space-x-4">
                        <UpdateLogs />
                        <ToDo />
                    </div>
                </div>
            </div>
        </div>
    )
};