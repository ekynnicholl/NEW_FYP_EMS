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
    program_description: string;
    commencement_date: string;
    completion_date: string;
    organiser: string;
    venue: string;
    formStage: number;
    hrdf_claimable: string;

    full_name: string;
    staff_id: string;
    course: string;
    faculty: string;
    transport: string;
    travelling: string;
    other_members: string;

    flight_number: string;
    flight_date: string;
    flight_time: string;
    destination_from: string;
    destination_to: string;
    hotel_name: string;
    check_in_date: string;
    check_out_date: string;
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
    const [course, setCourse] = useState<string>("");
    const [faculty, setFaculty] = useState<string>("");
    const [transport, setTransport] = useState<string>("");
    const [travelling, setTravelling] = useState<string>("");
    const [other_members, setOtherMembers] = useState<string>("");
    const [program_title, setProgramTitle] = useState<string>("");
    const [program_description, setProgramDescription] = useState<string>("");
    const [commencement_date, setCommencementDate] = useState<string>("");
    const [completion_date, setCompletionDate] = useState<string>("");
    const [organiser, setOrganiser] = useState<string>("");
    const [venue, setVenue] = useState<string>("");
    const [hrdf_claimable, setHrdfClaimable] = useState<string>("");
    const [flight_number, setFlightNumber] = useState<string>("");
    const [flight_date, setFlightDate] = useState<string>("");
    const [flight_time, setFlightTime] = useState<string>("");
    const [destination_from, setDestinationFrom] = useState<string>("");
    const [destination_to, setDestinationTo] = useState<string>("");
    const [hotel_name, setHotelName] = useState<string>("");
    const [check_in_date, setCheckInDate] = useState<string>("");
    const [check_out_date, setCheckOutDate] = useState<string>("");

    const handleViewForm = (formId: string) => {
        setSelectedFormId(formId);
        setShowModalViewNTF(true);
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
                            .select('id, email, program_title, program_description, commencement_date, completion_date, organiser, venue, hrdf_claimable, formStage, full_name, staff_id, course, faculty, transport, travelling, other_members, total_members, flight_number, flight_date, flight_time, destination_from, destination_to, hotel_name, check_in_date, check_out_date')
                            .eq('email', searchQuery)
                            .order('formStage')
                        : supabase
                            .from('external_forms')
                            .select('id, email, program_title, program_description, commencement_date, completion_date, organiser, venue, hrdf_claimable, formStage, full_name, staff_id, course, faculty, transport, travelling, other_members, total_members, flight_number, flight_date, flight_time, destination_from, destination_to, hotel_name, check_in_date, check_out_date')
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
                        setCourse(firstFormData.course);
                        setFaculty(firstFormData.faculty);
                        setTransport(firstFormData.transport);
                        setTravelling(firstFormData.travelling);
                        setOtherMembers(firstFormData.other_members);
                        setProgramTitle(firstFormData.program_title);
                        setProgramDescription(firstFormData.program_description);
                        setCommencementDate(firstFormData.commencement_date);
                        setCompletionDate(firstFormData.completion_date);
                        setOrganiser(firstFormData.organiser);
                        setVenue(firstFormData.venue);
                        setHrdfClaimable(firstFormData.hrdf_claimable);
                        setFlightNumber(firstFormData.flight_number);
                        setFlightDate(firstFormData.flight_date);
                        setDestinationFrom(firstFormData.destination_from);
                        setDestinationTo(firstFormData.destination_to);
                        setHotelName(firstFormData.hotel_name);
                        setCheckInDate(firstFormData.check_in_date);
                        setCheckOutDate(firstFormData.check_out_date);
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
                        <div className="ml-10">
                            <div className="flex ml-[13px]">
                                <div>
                                    <Image
                                        src="/swinburne_logo.png"
                                        alt=""
                                        width={200}
                                        height={300}
                                    />
                                </div>
                                <div className="ml-8 mt-2">
                                    <p className="font-medium">Human Resources</p>
                                    <h1 className="text-3xl font-bold text-slate-800 mb-4 mt-4 -ml-[1px]">
                                        Nomination / Travelling Application Form
                                    </h1>
                                </div>
                            </div>

                            <div className="mb-4 text-slate-800 mt-2">
                                <p className="mb-2">
                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
                                        *
                                    </span>
                                    <span>
                                        Before completing this form, please refer to the separate
                                        document on “General Instructions for completing Nomination /
                                        Travelling Application Form”, which is available on
                                        SharePoint.
                                    </span>
                                </p>
                                <p className="mb-2">
                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
                                        *
                                    </span>
                                    <span>
                                        All fields are mandatory to complete as required for each
                                        applicable section.
                                    </span>
                                </p>
                                <p>
                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
                                        *
                                    </span>
                                    <span>
                                        This form is also to be used for any contracted individual as
                                        consultant, and is to be completed where applicable.
                                    </span>
                                </p>
                            </div>
                        </div>

                        <hr className="mt-8" />

                        <div className="flex justify-between">
                            <form className="mt-6 w-full ml-[100px] mx-24">
                                <div>
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

                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Designation / Course
                                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                        *
                                                    </span>
                                                </p>
                                                <div>
                                                    <input
                                                        type="text"
                                                        id="full_name"
                                                        placeholder="Designation / Course"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.course || ""
                                                                : course
                                                        }
                                                        readOnly // make the input read-only
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Faculty / School / Unit
                                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                        *
                                                    </span>
                                                </p>
                                                <div>
                                                    <input
                                                        type="text"
                                                        id="staff_id"
                                                        placeholder="Faculty / School / Unit"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.faculty || ""
                                                                : faculty
                                                        }
                                                        readOnly // make the input read-only
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">
                                                    Type of Transportation{" "}
                                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
                                                </p>
                                                <div>
                                                    <input
                                                        type="text"
                                                        id="transportation"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[6px] hover:bg-slate-100 text-slate-800"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.transport || ""
                                                                : transport
                                                        }
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Traveling in
                                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                        *
                                                    </span>
                                                </p>
                                                <div>
                                                    <input
                                                        id="traveling"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[10px]  hover:bg-slate-100 text-slate-800"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.travelling || ""
                                                                : travelling
                                                        }
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Name of other staff / student traveling together in group
                                                <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                    *
                                                </span>
                                            </p>
                                            <div>
                                                <input
                                                    type="text"
                                                    id="full_name"
                                                    placeholder="Name of other staff"
                                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                    value={
                                                        selectedFormId
                                                            ? forms.find(form => form.id === selectedFormId)?.other_members || ""
                                                            : other_members
                                                    }
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="mt-10" />

                                    <div className="mt-[30px]">
                                        <div>
                                            <p id="travel_details" className="text-2xl font-bold mb-5 block">
                                                2. Travel Details
                                            </p>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium">Program title / Event
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="program_title"
                                                            placeholder="Program title"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.program_title || ""
                                                                    : program_title
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium">Description
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <textarea
                                                            id="description"
                                                            placeholder="Description"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.program_description || ""
                                                                    : program_description
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium mt-5">Commencement Date
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="date"
                                                            id="commencement_date"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.commencement_date || ""
                                                                    : commencement_date
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium mt-5">Completion Date
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="date"
                                                            id="completion_date"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.completion_date || ""
                                                                    : completion_date
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium mt-5">Organiser
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="organizer"
                                                            placeholder="Organizer"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.organiser || ""
                                                                    : organiser
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium mt-5">Venue
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="venue"
                                                            placeholder="Venue"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.venue || ""
                                                                    : venue
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 w-1/2 pr-[10px]">
                                                <p className="text-sm text-slate-800 font-medium">HDRF Claimable
                                                    <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
                                                </p>
                                                <div className="mt-2">
                                                    <input id="hdrf_claimable"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.hrdf_claimable || ""
                                                                : hrdf_claimable
                                                        }
                                                        readOnly // make the input read-only
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <hr className="mt-10" />

                                    <div className="mt-[30px]">
                                        <div>
                                            <p id="logistic_arrangement" className="text-2xl font-bold mb-5 block text-slate-900">
                                                3. Logistic Arrangement
                                            </p>

                                            <div className="grid grid-cols-2 gap-5 mt-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">
                                                        Flight Date
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="date"
                                                            id="flight_date"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.flight_date || ""
                                                                    : flight_date
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium">Flight Time
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="time"
                                                            id="flight_time"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.flight_time || ""
                                                                    : flight_time
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-slate-800 font-medium ml-[1px] mt-5">Flight Number
                                                </p>
                                                <div>
                                                    <input
                                                        type="text"
                                                        id="flight_number"
                                                        placeholder="Flight number"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.flight_number || ""
                                                                : flight_number
                                                        }
                                                        readOnly // make the input read-only
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <p className="text-base text-slate-800 font-medium ml-[1px]">Destination
                                                </p>

                                                <div className="grid grid-cols-2 gap-5 mt-3">
                                                    <div>
                                                        <p className="text-sm text-slate-800 font-medium ml-[1px]">From
                                                        </p>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                id="from"
                                                                placeholder="From"
                                                                className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                                value={
                                                                    selectedFormId
                                                                        ? forms.find(form => form.id === selectedFormId)?.destination_from || ""
                                                                        : destination_from
                                                                }
                                                                readOnly // make the input read-only
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-slate-800 font-medium ml-[1px]">To
                                                        </p>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                id="to"
                                                                placeholder="To"
                                                                className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                                value={
                                                                    selectedFormId
                                                                        ? forms.find(form => form.id === selectedFormId)?.destination_to || ""
                                                                        : destination_to
                                                                }
                                                                readOnly // make the input read-only
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <p className="text-sm text-slate-800 font-medium ml-[1px]">Hotel Name
                                                </p>
                                                <div>
                                                    <input
                                                        type="text"
                                                        id="hotel_name"
                                                        placeholder="Hotel Name"
                                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                        value={
                                                            selectedFormId
                                                                ? forms.find(form => form.id === selectedFormId)?.hotel_name || ""
                                                                : hotel_name
                                                        }
                                                        readOnly // make the input read-only
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium mt-5">Check-in
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="date"
                                                            id="check_in_date"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.check_in_date || ""
                                                                    : check_in_date
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium mt-5">Check-out
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="date"
                                                            id="check_out_date"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.check_out_date || ""
                                                                    : check_out_date
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>










                                </div>

                            </form>
                        </div>
                    </div>
                </div >
            </ViewNTF_Modal >

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
        </div >
    )
};

export default NTFList;