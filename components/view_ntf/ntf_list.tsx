"use client";

import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface NTFListProps {
    atIdentifier: string | null;
    atCreatedAt: string | null;
}

interface Form {
    id: string;
    email: string;
    program_title: string;
    commencement_date: string;
    completion_date: string;
    organiser: string;
    venue: string;
}

const NTFList: React.FC<NTFListProps> = ({ atIdentifier, atCreatedAt }) => {
    const supabase = createClientComponentClient();
    const [forms, setForms] = useState<Form[]>([]);
    const [timeRemaining, setTimeRemaining] = useState<string | null>('Processing...');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (atIdentifier) {
                    const { data, error } = await supabase
                        .from('external_forms')
                        .select('id, email, program_title, commencement_date, completion_date, organiser, venue')
                        .eq('email', atIdentifier);

                    if (error) {
                        console.error('Error querying external_forms:', error);
                        toast.error('Error fetching forms');
                        return;
                    }
                    setForms(data || []);
                }
            } catch (e) {
                // console.error('Error in fetchData:', e);
            }
        };

        fetchData();
    }, [atIdentifier]);

    useEffect(() => {
        if (atCreatedAt) {
            const expirationTime = new Date(atCreatedAt);
            expirationTime.setHours(expirationTime.getHours() + 4);

            const interval = setInterval(() => {
                const now = new Date();
                const remaining = expirationTime.getTime() - now.getTime();

                if (remaining > 0) {
                    const hours = Math.floor(remaining / (60 * 60 * 1000));
                    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

                    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
                } else {
                    clearInterval(interval);
                    setTimeRemaining("Expired");
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [atCreatedAt]);

    const formattedDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZoneName: 'short',
        };

        return date.toLocaleString('en-US', options);
    };

    return (
        <div>
            <div className="text-justify pr-5">
                <p className="text-[20px] font-bold">Past Nominations/ Travelling Forms</p>
                <p className="text-sm italic mt-1">Take note that your access tokens have a life span of 4 hours. After 4 hours, you will need to request for a new access token to be able to access this list.</p>
            </div>

            {atCreatedAt && (
                <p className="text-sm mt-2">
                    Access token generated at: {formattedDate(atCreatedAt)} (Expires in: {timeRemaining})
                </p>
            )}

            <div className="mt-5">
                {forms.length > 0 && (
                    <table className="table-auto">
                        <thead>
                            <tr>
                                <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4">
                                    Program Title
                                </th>
                                <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4">
                                    Commencement Date
                                </th>
                                <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4">
                                    Completion Date
                                </th>
                                <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4">
                                    Organiser
                                </th>
                                <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4">
                                    Venue
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {forms.map((form) => (
                                <tr key={form.id}>
                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        {form.program_title}
                                    </td>
                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        {form.commencement_date}
                                    </td>
                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        {form.completion_date}
                                    </td>
                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        {form.organiser}
                                    </td>
                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        {form.venue}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
};

export default NTFList;