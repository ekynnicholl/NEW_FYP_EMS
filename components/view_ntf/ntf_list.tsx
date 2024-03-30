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

    course_fee: string;
    airfare_fee: string;
    accommodation_fee: string;
    per_diem_fee: string;
    transportation_fee: string;
    travel_insurance_fee: string;
    other_fees: string;
    grand_total_fees: string;
    staff_development_fund: string;
    consolidated_pool_fund: string;
    research_fund: string;
    travel_fund: string;
    student_council_fund: string;
    other_funds: string;
    expenditure_cap: string;
    expenditure_cap_amount: string;

    applicant_declaration_name: string;
    applicant_declaration_position_title: string;
    applicant_declaration_date: string;
    applicant_declaration_signature: string;

    verification_name: string;
    verification_position_title: string;
    verification_date: string;
    verification_signature: string;

    approval_name: string;
    approval_position_title: string;
    approval_date: string;
    approval_signature: string;

    revertComment: string;
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

    const [course_fee, setCourseFee] = useState<string>("");
    const [airfare_fee, setAirFareFee] = useState<string>("");
    const [accommodation_fee, setAccommodationFee] = useState<string>("");
    const [per_diem_fee, setPerDiemFee] = useState<string>("");
    const [transportation_fee, setTransportationFee] = useState<string>("");
    const [travel_insurance_fee, setTravelInsuranceFee] = useState<string>("");
    const [other_fees, setOtherFees] = useState<string>("");
    const [grand_total_fees, setGrandTotalFees] = useState<string>("");
    const [staff_development_fund, setStaffDevelopmentFund] = useState<string>("");
    const [consolidated_pool_fund, setConsolidatedPoolFund] = useState<string>("");
    const [research_fund, setResearchFund] = useState<string>("");
    const [travel_fund, setTravelFund] = useState<string>("");
    const [student_council_fund, setStudentCouncilFund] = useState<string>("");
    const [other_funds, setOtherFunds] = useState<string>("");
    const [expenditure_cap, setExpenditureCap] = useState<string>("");
    const [expenditure_cap_amount, setExpenditureCapAmount] = useState<string>("");

    const [applicant_declaration_name, setApplicantDeclarationName] = useState<string>("");
    const [applicant_declaration_position_title, setApplicantDeclarationPositionTitle] = useState<string>("");
    const [applicant_declaration_date, setApplicantDeclarationDate] = useState<string>("");
    const [applicant_declaration_signature, setApplicantDeclarationSignature] = useState<string>("");

    const [verification_name, setVerificationName] = useState<string>("");
    const [verification_position_title, setVerificationPositionTitle] = useState<string>("");
    const [verification_date, setVerificationDate] = useState<string>("");
    const [verification_signature, setVerificationSignature] = useState<string>("");

    const [approval_name, setApprovalName] = useState<string>("");
    const [approval_position_title, setApprovalPositionTitle] = useState<string>("");
    const [approval_date, setApprovalDate] = useState<string>("");
    const [approval_signature, setApprovalSignature] = useState<string>("");

    const [revertComment, setRevertComment] = useState<string>("");


    const applicant_declaration_signature_image = selectedFormId
        ? forms.find(form => form.id === selectedFormId)?.applicant_declaration_signature || ""
        : applicant_declaration_signature;

    const verification_signature_image = selectedFormId
        ? forms.find(form => form.id === selectedFormId)?.verification_signature || ""
        : verification_signature;

    const approval_signature_image = selectedFormId
        ? forms.find(form => form.id === selectedFormId)?.approval_signature || ""
        : approval_signature;

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
                            .select('id, email, program_title, program_description, commencement_date, completion_date, organiser, venue, hrdf_claimable, formStage, full_name, staff_id, course, faculty, transport, travelling, other_members, total_members, flight_number, flight_date, flight_time, destination_from, destination_to, hotel_name, check_in_date, check_out_date, course_fee, airfare_fee, accommodation_fee, per_diem_fee, transportation_fee, travel_insurance_fee, other_fees, grand_total_fees, staff_development_fund, consolidated_pool_fund, research_fund, travel_fund, student_council_fund, other_funds, expenditure_cap, expenditure_cap_amount, applicant_declaration_name, applicant_declaration_position_title, applicant_declaration_date, applicant_declaration_signature, verification_name, verification_position_title, verification_date, verification_signature, approval_name, approval_position_title, approval_date, approval_signature, revertComment')
                            .eq('email', searchQuery)
                            .order('formStage')
                        : supabase
                            .from('external_forms')
                            .select('id, email, program_title, program_description, commencement_date, completion_date, organiser, venue, hrdf_claimable, formStage, full_name, staff_id, course, faculty, transport, travelling, other_members, total_members, flight_number, flight_date, flight_time, destination_from, destination_to, hotel_name, check_in_date, check_out_date, course_fee, airfare_fee, accommodation_fee, per_diem_fee, transportation_fee, travel_insurance_fee, other_fees, grand_total_fees, staff_development_fund, consolidated_pool_fund, research_fund, travel_fund, student_council_fund, other_funds, expenditure_cap, expenditure_cap_amount, applicant_declaration_name, applicant_declaration_position_title, applicant_declaration_date, applicant_declaration_signature, verification_name, verification_position_title, verification_date, verification_signature, approval_name, approval_position_title, approval_date, approval_signature, revertComment')
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
                        setCourseFee(firstFormData.course_fee);
                        setAirFareFee(firstFormData.airfare_fee);
                        setAccommodationFee(firstFormData.accommodation_fee);
                        setPerDiemFee(firstFormData.per_diem_fee);
                        setTransportationFee(firstFormData.transportation_fee);
                        setTravelInsuranceFee(firstFormData.travel_insurance_fee);
                        setOtherFees(firstFormData.other_fees);
                        setGrandTotalFees(firstFormData.grand_total_fees);
                        setStaffDevelopmentFund(firstFormData.staff_development_fund);
                        setConsolidatedPoolFund(firstFormData.consolidated_pool_fund);
                        setResearchFund(firstFormData.research_fund);
                        setTravelFund(firstFormData.travel_fund);
                        setStudentCouncilFund(firstFormData.student_council_fund);
                        setOtherFunds(firstFormData.other_funds);
                        setExpenditureCap(firstFormData.expenditure_cap);
                        setExpenditureCapAmount(firstFormData.expenditure_cap_amount);

                        setApplicantDeclarationName(firstFormData.applicant_declaration_name);
                        setApplicantDeclarationPositionTitle(firstFormData.applicant_declaration_position_title);
                        setApplicantDeclarationDate(firstFormData.applicant_declaration_date);
                        setApplicantDeclarationSignature(firstFormData.applicant_declaration_signature);

                        setVerificationName(firstFormData.verification_name);
                        setVerificationPositionTitle(firstFormData.verification_position_title);
                        setVerificationDate(firstFormData.verification_date);
                        setVerificationSignature(firstFormData.verification_signature);

                        setApprovalName(firstFormData.approval_name);
                        setApprovalPositionTitle(firstFormData.approval_position_title);
                        setApprovalDate(firstFormData.approval_date);
                        setApprovalSignature(firstFormData.approval_signature);

                        setRevertComment(firstFormData.revertComment);
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

                                    <hr className="mt-10" />

                                    <div className="mt-[30px]">
                                        <div>
                                            <p id="funding" className="text-2xl font-bold mb-5 block text-slate-900">
                                                4. Funding
                                            </p>

                                            <p className="text-[15px] text-slate-800 font-medium ml-[1px]">Please indicate estimated cost.
                                            </p>

                                            <div className="grid grid-cols-2 gap-5 mt-4">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Course Fee
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="number"
                                                            id="course_fee"
                                                            placeholder="Amount (RM)"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.course_fee || "0"
                                                                    : course_fee
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Airfare Fee
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="number"
                                                            id="airfare_fee"
                                                            placeholder="Amount (RM)"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.airfare_fee || "0"
                                                                    : airfare_fee
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5 mt-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Accomodation Fee
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="number"
                                                            id="accomodation_fee"
                                                            placeholder="Amount (RM)"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.accommodation_fee || "0"
                                                                    : accommodation_fee
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Per Diem Fee
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="number"
                                                            id="per_diem_fee"
                                                            placeholder="Amount (RM)"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.per_diem_fee || "0"
                                                                    : per_diem_fee
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5 mt-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Transportation Fee
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="number"
                                                            id="transportation_fee"
                                                            placeholder="Amount (RM)"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.transportation_fee || "0"
                                                                    : transportation_fee
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Travel Insurance Fee
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="number"
                                                            id="travel_insurance_fee"
                                                            placeholder="Amount (RM)"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.travel_insurance_fee || "0"
                                                                    : travel_insurance_fee
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5 mt-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Others
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="number"
                                                            id="others"
                                                            placeholder="Amount (RM)"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.other_fees || "0"
                                                                    : other_fees
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Total Fee
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="number"
                                                            id="total_fee"
                                                            placeholder="0"
                                                            disabled
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.grand_total_fees || "0"
                                                                    : grand_total_fees
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-[15px] text-slate-800 font-medium ml-[1px] mt-8">Source of Fund -<span className="text-slate-500 text-sm font-bold">Details of account(s) to be debited. (It is encouraged to have a single source of funding)</span>.
                                            </p>

                                            <div className="grid grid-cols-2 gap-5 mt-4">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Staff Development Fund
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="staff_development_fund"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.staff_development_fund || "0"
                                                                    : staff_development_fund
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Consolidated Pool Fund
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="consolidated_pool_fund"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.consolidated_pool_fund || "0"
                                                                    : consolidated_pool_fund
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5 mt-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Research Fund
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="research_fund"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.research_fund || "0"
                                                                    : research_fund
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Travel Fund
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="travel_fund"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.travel_fund || "0"
                                                                    : travel_fund
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5 mt-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Student Welfare Fund
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="student_welfare_fund"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.student_council_fund || "0"
                                                                    : student_council_fund
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium ml-[1px]">Other Funds
                                                    </p>

                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="other_fund"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.other_funds || "0"
                                                                    : other_funds
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <fieldset disabled>
                                                <div className="mt-5 cursor-not-allowed">
                                                    <p className="text-sm text-slate-800 font-medium">Any expenditure cap? If yes, please specify below,
                                                    </p>
                                                    <div className="mt-2 flex items-center space-x-4">
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                name="expenditure_cap"
                                                                className="form-radio h-4 w-4 text-slate-800 cursor-not-allowed"
                                                                disabled
                                                                value={
                                                                    selectedFormId
                                                                        ? forms.find(form => form.id === selectedFormId)?.expenditure_cap || ""
                                                                        : expenditure_cap
                                                                }
                                                            />
                                                            <span className="text-slate-800 text-[15px]">Yes</span>
                                                        </label>
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                name="expenditure_cap"
                                                                className="form-radio h-4 w-4 text-slate-800 cursor-not-allowed"
                                                                disabled
                                                                value={
                                                                    selectedFormId
                                                                        ? forms.find(form => form.id === selectedFormId)?.expenditure_cap || ""
                                                                        : expenditure_cap
                                                                }
                                                            />
                                                            <span className="text-slate-800 text-[15px]">No</span>
                                                        </label>

                                                    </div>

                                                    <div className="mt-5 cursor-not-allowed">
                                                        <p className="text-sm text-slate-800 font-medium ml-[1px]">Expenditure Cap Amount
                                                        </p>

                                                        <div>
                                                            <input
                                                                type="number"
                                                                id="capped_amount"
                                                                disabled
                                                                className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] cursor-not-allowed"
                                                                value={
                                                                    selectedFormId
                                                                        ? forms.find(form => form.id === selectedFormId)?.expenditure_cap_amount || ""
                                                                        : expenditure_cap_amount
                                                                }
                                                                readOnly // make the input read-only
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>

                                        </div>
                                    </div>

                                    <hr className="mt-10" />

                                    <div className="mt-[30px]">
                                        <p id="additional_files" className="text-2xl font-bold block text-slate-900">
                                            5. Supporting Documents
                                            <span className="text-[25px] text-red-500 ml-[5px]">
                                                *
                                            </span>
                                        </p>
                                    </div>

                                    <hr className="mt-10" />

                                    <div className="mt-[30px]">
                                        <div>
                                            <p id="applicant_declaration" className="text-2xl font-bold mb-4 block text-slate-900">
                                                6. Applicant Declaration
                                            </p>

                                            <p className="text-slate-500 text-base font-normal ml-[1px]">I (or acting as representative of group travelling) hereby confirm the accuracy of the information (including any attachments) provided for this application.
                                            </p>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Name
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="applicant_declaration_name"
                                                            placeholder="Name"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.applicant_declaration_name || ""
                                                                    : applicant_declaration_name
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Position Title
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="applicant_declaration_position_title"
                                                            placeholder="Position title"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.applicant_declaration_position_title || ""
                                                                    : applicant_declaration_position_title
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-800 font-medium mt-5">Declaration Date
                                                <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                    *
                                                </span>
                                            </p>
                                            <div>
                                                <input
                                                    type="date"
                                                    id="applicant_declaration_date"
                                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                    value={
                                                        selectedFormId
                                                            ? forms.find(form => form.id === selectedFormId)?.applicant_declaration_date || ""
                                                            : applicant_declaration_date
                                                    }
                                                    readOnly // make the input read-only
                                                />
                                            </div>

                                            <p className="text-sm text-slate-800 font-medium mt-5">Signature
                                                <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                    *
                                                </span>

                                                <div className="border-2 border-gray-300 p-2 mt-3 flex justify-center">
                                                    <Image src={applicant_declaration_signature_image} alt="Applicant Declaration Signature Image" width={300} height={150} className="mt-3" />
                                                </div>
                                            </p>
                                        </div>
                                    </div>

                                    {verification_signature_image ? (

                                        <div>
                                            <hr className="mt-10" />

                                            <div className="mt-[30px]">
                                                <div>
                                                    <p id="applicant_declaration" className="text-2xl font-bold mb-4 block text-slate-900">
                                                        7. Verification Declaration
                                                    </p>

                                                    <p className="text-slate-500 text-base font-normal ml-[1px]">I (or acting as representative of group travelling) hereby confirm the accuracy of the information (including any attachments) provided for this application.
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-5">
                                                        <div>
                                                            <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Name
                                                                <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                                    *
                                                                </span>
                                                            </p>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    id="verification_name"
                                                                    placeholder="Name"
                                                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                                    value={
                                                                        selectedFormId
                                                                            ? forms.find(form => form.id === selectedFormId)?.verification_name || ""
                                                                            : verification_name
                                                                    }
                                                                    readOnly // make the input read-only
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Position Title
                                                                <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                                    *
                                                                </span>
                                                            </p>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    id="verification_position_title"
                                                                    placeholder="Position title"
                                                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                                    value={
                                                                        selectedFormId
                                                                            ? forms.find(form => form.id === selectedFormId)?.verification_position_title || ""
                                                                            : verification_position_title
                                                                    }
                                                                    readOnly // make the input read-only
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-800 font-medium mt-5">Declaration Date
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="date"
                                                            id="verification_date"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.verification_date || ""
                                                                    : verification_date
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>

                                                    <p className="text-sm text-slate-800 font-medium mt-5">Signature
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>

                                                        <div className="border-2 border-gray-300 p-2 mt-3 flex justify-center">
                                                            <Image src={verification_signature_image} alt="Verification Signature Image" width={300} height={150} className="mt-3" />
                                                        </div>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    ) : null}

                                    {approval_signature_image ? (

                                        <div>
                                            <hr className="mt-10" />

                                            <div className="mt-[30px]">
                                                <div>
                                                    <p id="applicant_declaration" className="text-2xl font-bold mb-4 block text-slate-900">
                                                        8. Approval Declaration
                                                    </p>

                                                    <p className="text-slate-500 text-base font-normal ml-[1px]">I (or acting as representative of group travelling) hereby confirm the accuracy of the information (including any attachments) provided for this application.
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-5">
                                                        <div>
                                                            <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Name
                                                                <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                                    *
                                                                </span>
                                                            </p>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    id="approval_name"
                                                                    placeholder="Name"
                                                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                                    value={
                                                                        selectedFormId
                                                                            ? forms.find(form => form.id === selectedFormId)?.approval_name || ""
                                                                            : approval_name
                                                                    }
                                                                    readOnly // make the input read-only
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Position Title
                                                                <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                                    *
                                                                </span>
                                                            </p>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    id="approval_position_title"
                                                                    placeholder="Position title"
                                                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                                    value={
                                                                        selectedFormId
                                                                            ? forms.find(form => form.id === selectedFormId)?.approval_position_title || ""
                                                                            : approval_position_title
                                                                    }
                                                                    readOnly // make the input read-only
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-800 font-medium mt-5">Declaration Date
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>
                                                    </p>
                                                    <div>
                                                        <input
                                                            type="date"
                                                            id="approval_date"
                                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                                            value={
                                                                selectedFormId
                                                                    ? forms.find(form => form.id === selectedFormId)?.approval_date || ""
                                                                    : approval_date
                                                            }
                                                            readOnly // make the input read-only
                                                        />
                                                    </div>

                                                    <p className="text-sm text-slate-800 font-medium mt-5">Signature
                                                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
                                                            *
                                                        </span>

                                                        <div className="border-2 border-gray-300 p-2 mt-3 flex justify-center">
                                                            <Image src={approval_signature_image} alt="Approval Signature Image" width={300} height={150} className="mt-3" />
                                                        </div>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    ) : null}



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