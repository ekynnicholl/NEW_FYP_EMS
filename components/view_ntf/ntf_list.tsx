"use client";

import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface NTFListProps {
    atIdentifier: string | null;
}

interface Form {
    id: string;
    email: string;
    program_title: string;
    commencement_date: string;
    completion_date: string;
    organiser: string;
    venue: string;
    formStage: number;
}

const NTFList: React.FC<NTFListProps> = ({ atIdentifier }) => {
    const supabase = createClientComponentClient();
    const [forms, setForms] = useState<Form[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (atIdentifier) {
                    const isEmail = /@/.test(atIdentifier);
                    let searchQuery = atIdentifier;

                    if (!isEmail) {
                        searchQuery = atIdentifier.startsWith('SS') ? atIdentifier : `SS${atIdentifier}`;
                    }

                    const { data, error } = await (isEmail
                        ? supabase
                            .from('external_forms')
                            .select('id, email, program_title, commencement_date, completion_date, organiser, venue, formStage')
                            .eq('email', searchQuery)
                            .order('formStage')
                        : supabase
                            .from('external_forms')
                            .select('id, email, program_title, commencement_date, completion_date, organiser, venue, formStage')
                            .eq('staff_id', searchQuery)
                            .order('formStage'));

                    if (error) {
                        console.error('Error querying external_forms:', error);
                        toast.error('Error fetching forms');
                        return;
                    }

                    console.log(data);

                    setForms(data || []);
                }
            } catch (e) {
                // console.error('Error in fetchData:', e);
            }
        };

        fetchData();
    }, [atIdentifier]);

    return (
        <div>
            <div className="text-justify pr-5">
                <p className="text-[20px] font-bold">Past Nominations/ Travelling Forms - {atIdentifier}</p>
            </div>

            <div className="mt-5">
                {forms.length > 0 && (
                    <div className="max-w-screen-lg max-h-[400px] overflow-x-auto">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Program Title
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Commencement Date
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Completion Date
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Organiser
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Venue
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Status
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Action
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
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {(() => {
                                                switch (form.formStage) {
                                                    case 1:
                                                        return <div className="uppercase text-red-500">Reverted to Staff</div>;
                                                    case 2:
                                                        return <div className="uppercase text-blue-500">Reviewing by AAO</div>;
                                                    case 3:
                                                        return <div className="uppercase text-blue-500">Reviewing by HOS/ ADCR/ MGR</div>;
                                                    case 4:
                                                        return <div className="uppercase text-blue-500">Reviewing by HMU/ Dean</div>;
                                                    case 5:
                                                        return <div className="uppercase text-green-500">Approved</div>;
                                                    case 6:
                                                        return <div className="uppercase text-red-500">Rejected</div>;
                                                    default:
                                                        return <div className="uppercase">Unknown</div>;
                                                }
                                            })()}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            View
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
};

export default NTFList;