"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ViewNTF_Modal from "@/components/ViewNTF_Modal";

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

    full_name: string;
    staff_id: string;
}

const NTFList: React.FC<NTFListProps> = ({ atIdentifier }) => {
    const supabase = createClientComponentClient();
    const [forms, setForms] = useState<Form[]>([]);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
    const [showModalViewNTF, setShowModalViewNTF] = useState(false);

    const [id, setID] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [full_name, setFullName] = useState<string>("");
    const [staff_id, setStaffID] = useState<string>("");

    const handleViewForm = (formId: string) => {
        setSelectedFormId(formId);
        setShowModalViewNTF(true);

        console.log(formId);
    };

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
                            .select('id, email, program_title, commencement_date, completion_date, organiser, venue, formStage, full_name, staff_id')
                            .eq('email', searchQuery)
                            .order('formStage')
                        : supabase
                            .from('external_forms')
                            .select('id, email, program_title, commencement_date, completion_date, organiser, venue, formStage, full_name, staff_id')
                            .eq('staff_id', searchQuery)
                            .order('formStage'));

                    if (error) {
                        console.error('Error querying external_forms:', error);
                        toast.error('Error fetching forms');
                        return;
                    }

                    setForms(data || []);

                    // If data is not empty, set the corresponding values for each form
                    if (data && data.length > 0) {
                        // Assuming only the first form is selected initially
                        const firstFormData = data[0];

                        setID(firstFormData.id);
                        setEmail(firstFormData.email);
                        setFullName(firstFormData.full_name);
                        setStaffID(firstFormData.staff_id);
                    }
                }
            } catch (e) {
                // console.error('Error in fetchData:', e);
            }
        };

        fetchData();
    }, [atIdentifier, supabase]);

    return (
        <div>
            <ViewNTF_Modal isVisible={showModalViewNTF}
                formId={selectedFormId} onClose={() => setShowModalViewNTF(false)}>

                <div>
                    <div className="mx-auto max-w-6xl px-8 my-8 mt-6 mb-[200px]">

                        <div className="flex justify-between">

                            <form className="mt-6 w-full ml-[100px] mx-24">

                                <div>
                                    <div>
                                        <a href="#personal_details" className="text-2xl font-bold mb-5 block text-slate-900">
                                            1. Personal Details {
                                                        selectedFormId
                                                            ? forms.find(form => form.id === selectedFormId)?.id || ""
                                                            : id
                                                    }
                                                    
                                        </a>
                                        <div>
                                            <p className="text-sm text-slate-800 font-medium ml-[1px]">Email
                                                <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                    *
                                                </span>
                                            </p>
                                            <div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    placeholder="Email"
                                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                    value={
                                                        selectedFormId
                                                            ? forms.find(form => form.id === selectedFormId)?.email || ""
                                                            : email
                                                    }
                                                    readOnly // make the input read-only
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                            <div>
                                                <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Full name (Same as I.C / Passport)
                                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                        *
                                                    </span>
                                                </p>
                                                <div>
                                                    <input
                                                        type="text"
                                                        id="full_name"
                                                        placeholder="Full name"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.full_name || ""
                                                                : full_name
                                                        }
                                                        readOnly // make the input read-only
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Staff ID / Student No.
                                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                        *
                                                    </span>
                                                </p>
                                                <div>
                                                    <input
                                                        type="text"
                                                        id="staff_id"
                                                        placeholder="Staff ID"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.staff_id || ""
                                                                : staff_id
                                                        }
                                                        readOnly // make the input read-only
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>






                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </ViewNTF_Modal>

            <div className="text-justify pr-5">
                <p className="text-[20px] font-bold">Past Nominations/ Travelling Form(s)</p>
                <p className="text-[16px] italic">Total Event(s) Attended Count: {forms.length}</p>
                <p className="text-[16px] italic">Total Hours: 0</p>
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
                                            <button onClick={() => handleViewForm(form.id)}>View</button>
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