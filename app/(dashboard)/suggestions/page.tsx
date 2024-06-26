"use client";

import Suggestion from '@/components/suggestions/suggestion';
import UpdateLogs from '@/components/suggestions/update_logs';
import ToDo from '@/components/suggestions/to_do';
import SuggestList from '@/components/suggestions/suggest_list';

export default function Home() {
    return (
        <div className="">
            <div className="flex-1">
                <div className="flex-1 mx-auto px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg mt-7 lg:mt-0">
                    <div className="flex flex-col lg:flex-row lg:space-x-4">
                        <Suggestion />
                        <SuggestList />
                    </div>
                    <div className="flex flex-col lg:flex-row lg:space-x-4">
                        <UpdateLogs />
                        <ToDo />
                    </div>
                </div>
            </div>
        </div>
    )
};