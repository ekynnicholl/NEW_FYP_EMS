"use client";

import Image from "next/image";
import { Fragment, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { map } from "zod";

type Form = {
    formID: string;
    email: string;
    full_name: string;
    staff_id: string;
    course: string;
    faculty: string;
    transport: string;
    travelling: string;
    other_members: string[];
    program_title: string;
    program_description: string;
    commencement_date: string;
    completion_date: string;
    organiser: string;
    venue: string;
    hrdf_claimable: string;
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
    others_fee: string;
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
    applicant_declaration_posision_title: string;
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
};

export default function Home({ id }: { id: string }) {

    const supabase = createClientComponentClient();
    const [formDetails, setFormDetails] = useState<Form[]>([]);

    useEffect(() => {
        const fetchFormInfos = async () => {
            const { data: external, error: externalError } = await supabase
                .from("external_forms")
                .select("*")
                .eq("id", id);

            if (externalError) {
                console.error("Error fetching staff external form data:", externalError);
                return;
            }
            setFormDetails(external || []);
        };
        fetchFormInfos();
    }, [supabase]);

    const handlePrint = () => {
        window.print();
    }

    return (
        <div className="bg-white w-full h-screen">
            <div className="p-4 m-auto bg-white w-a4 h-a4">
                <div>
                    <span className="float-left mr-4">
                        <Image
                            src="/images/swinburne_logo_black_and_white.png"
                            alt=""
                            width={130}
                            height={30}
                        />
                    </span>
                    <div className="text-left">
                        <p className="text-[15px] mt-2 py-1 font-semibold font-arial-narrow">Human Resources</p>
                        <p className="text-[24px] font-bold font-arial-narrow">Nomination / Travelling Application Form</p>
                    </div>
                </div>
                <div className="text-[10px] mt-1 leading-3">
                    <p>&#8226;Before completing this form, please refer tot eh separate document on "General Instructions for completing Nomination / Travelling Application Form", which is available on SharePoint.</p>
                    <p>&#8226;All fields are amndatory to compplete as required for each applicable section.</p>
                    <p>&#8226;This form is also to be used for any contracted individual as consultant, and is to be completed where applicable.</p>
                </div>

                <div>
                    {formDetails.map((details, index) =>
                        <form>
                            {/* Section 1: Personal details */}
                            <fieldset className="p-[0.5px] bg-slate-950 text-[12px]"><span className="text-slate-50 font-semibold uppercase ml-2">Section 1: Personal Details</span></fieldset>
                            <div className="grid grid-cols-8 text-[11px] font-bold bg-gray-200 leading-3">
                                <label className="col-start-1 col-span-2 p-1 border border-slate-950 border-t-0">Full Name in CAPITAL LETTERS &#40;as per I.C. / Passport&#41;</label>
                                <input typeof="text" className="col-span-2 border-b border-slate-950 p-2" value={details.full_name} />
                                <label className="col-span-2 p-1 border border-slate-950 border-t-0">Staff ID / Student No.</label>
                                <input typeof="text" className="col-span-2 border-r border-b border-slate-950 p-2" value={details.staff_id} />
                                <label className="col-start-1 col-span-2 p-1 border border-slate-950 border-t-0">Designation / Course</label>
                                <input typeof="text" className="col-span-2 border-b border-slate-950 p-2" value={details.course} />
                                <label className="col-span-2 p-1 border border-slate-950 border-t-0">Faculty / School / Unit</label>
                                <input typeof="text" className="col-span-2 border-b border-r border-slate-950 p-2" value={details.faculty} />
                                <label className="col-start-1 col-span-2 p-1 border border-slate-950 border-t-0">Type of Transportation</label>
                                <input typeof="text" className="col-span-2 border-b border-slate-950 p-2" value={details && details.transport === "None" ? "-" : details.transport} />
                                <label className="col-span-2 p-1 border border-slate-950 border-t-0">Traveling in</label>
                                <input typeof="text" className="col-span-2 border-b border-r border-slate-950 p-2" value={details.travelling} />
                                <label className="col-start-1 col-span-2 p-1 border-r border-l border-slate-950">Name of other staff / student travelling together in group<sup>1</sup></label>
                                <input typeof="text" className="col-span-6 border-r border-slate-950 p-2" value={details && details.other_members.length > 0 ? "-" : details.other_members} />
                            </div>

                            {/* Section 2: Travel details */}
                            <fieldset className="p-[0.5px] text-[12px] bg-slate-950"><span className="text-slate-50 font-semibold uppercase ml-2">Section 2: Travel Details</span></fieldset>
                            <div className="grid grid-cols-8 normal-case text-[11px] font-bold leading-3 bg-gray-200">
                                <label className="col-start-1 col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0">Program title / Event</label>
                                <input typeof="text" className="col-span-6 border-r border-b border-slate-950 p-2" value={details.program_title} />
                                <label className="col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0">Description</label>
                                <input typeof="text" className="col-span-6 border-b border-r border-slate-950 p-2" value={details && details.program_description === 'None' ? "-" : details.program_description} />
                                <label className="col-start-1 col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0">Commencement date of event</label>
                                <input typeof="text" className="col-span-2 border-b border-slate-950 p-2" value={details.commencement_date} />
                                <label className="col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0">Completion date of event</label>
                                <input typeof="text" className="col-span-2 border-b border-r border-slate-950 p-2" value={details.completion_date} />
                                <label className="col-start-1 col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0">Organiser</label>
                                <input typeof="text" className="col-span-2 border-b border-slate-950 p-2" value={details && details.organiser === 'None' ? "-" : details.organiser} />
                                <label className="col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0">Venue</label>
                                <input typeof="text" className="col-span-2 border-b border-r border-slate-950 p-2" value={details.venue} />
                                <label className="col-start-1 col-span-2 p-1 bg-gray-200 border-l border-r border-slate-950">HRDF Claimable</label>
                                <label className="flex col-span-6 items-center justify-center bg-slate-50 border-r border-slate-950">
                                    <input type="checkbox" className="-ml-28" checked={details.hrdf_claimable && details.hrdf_claimable === "Yes" ? true : false} />
                                    <label className="px-2">Yes</label>
                                    <input type="checkbox" className="ml-6" checked={details.hrdf_claimable && details.hrdf_claimable === "None" ? true : false} />
                                    <label className="px-2">No</label>
                                    <input type="checkbox" className="ml-6" checked={details.hrdf_claimable && details.hrdf_claimable === "Not indicated" ? true : false} />
                                    <label className="whitespace-nowrap px-2">Not indicated in event brochure / registration form</label>
                                </label>
                            </div>

                            {/* Section 3: Logistic Arragement */}
                            <fieldset className=" text-[12px] bg-slate-950 h-[155px]"><span className="text-slate-50 font-semibold uppercase ml-2">Section 3: Logistic Arragement<sup>2</sup></span>
                                <div className="grid grid-cols-2 grid-rows-5 normal-case bg-gray-200 font-bold leading-3">
                                    <label className="col-start-1 col-span-1 row-span-1 p-1 flex items-center justify-center border border-slate-950 border-t-0">Tentative / Planned Flight Arrangement</label>
                                    <label className="col-span-1 p-1 row-span-1 text-center border-r border-b border-slate-950">Tentative / Planned Accommodation Arrangement <br /><span className="italic font-normal">&#40;with or without receipt&#41;</span></label>
                                    <div className="col-span-1 row-span-4 grid grid-cols-5 grid-rows-5">
                                        <label className="col-span-1 row-span-2 flex items-center justify-center border border-slate-950 border-t-0">Date</label>
                                        <label className="col-span-1 row-span-2 flex items-center justify-center border-b border-r border-slate-950">Time</label>
                                        <label className="col-span-1 row-span-2 flex justify-center items-center text-center border-b border-r border-slate-950">Flight <br />Number</label>
                                        <label className="col-span-2 row-span-1 flex items-center justify-center border-b border-r border-slate-950">Destination</label>
                                        <label className="col-span-1 row-span-1 flex items-center justify-center border-b border-r border-slate-950">From</label>
                                        <label className="col-span-1 row-span-1 flex items-center justify-center border-b border-r border-slate-950">To</label>
                                        <input typeof="text" className="col-span-1 border border-t-0 border-slate-950 p-1 text-center" value={details.flight_date} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={details.flight_time} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={details.flight_number} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={details.destination_from} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={details.destination_to} />
                                        <input typeof="text" className="col-span-1 border border-t-0 border-slate-950 p-1 text-center" value={""} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={""} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={""} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={""} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={""} />
                                    </div>
                                    <div className="col-span-1 row-span-4 grid grid-cols-4 grid-rows-5">
                                        <label className="col-span-2 row-span-1  flex items-center justify-center border-b border-r border-slate-950">Date</label>
                                        <label className="col-span-1 row-start-2 row-span-1  flex items-center justify-center border-b border-r border-slate-950">Check-in</label>
                                        <label className="col-span-1 row-start-2 row-span-1  flex items-center justify-center border-b border-r border-slate-950">Check-out</label>
                                        <label className="col-span-2 row-span-2  flex items-center justify-center border-b border-r border-slate-950">Hotel / Lodging Place</label>
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={details.check_in_date} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={details.check_out_date} />
                                        <input typeof="text" className="col-span-2 border-b border-r border-slate-950 p-1 text-center" value={details.hotel_name} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={""} />
                                        <input typeof="text" className="col-span-1 border-b border-r border-slate-950 p-1 text-center" value={""} />
                                        <input typeof="text" className="col-span-2 border-b border-r border-slate-950 p-1 text-center" value={""} />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Section 4: Funding */}
                            <fieldset className="p-[0.5px]  text-[12px] bg-slate-950"><span className="text-slate-50 font-semibold uppercase ml-2">Section 4: Funding</span></fieldset>
                            <div className="grid grid-cols-5 normal-case font-bold leading-3 text-[11px]">
                                <div className="col-span-2 grid grid-cols-2 grid-rows-10">
                                    <label className="col-span-2 row-span-1 font-normal p-1 bg-gray-200 border border-slate-950 border-t-0">Please indicate estimated cost</label>
                                    <label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">Funding Particulars</label>
                                    <label className="col-span-1 row-span-1 p-1 text-center bg-gray-200 border-b border-r border-slate-950">Amount &#40;RM&#41;</label>
                                    <label className="col-start-1 col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">1&#41; Course Fees</label>
                                    <input typeof="text" className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.course_fee > "0" ? details.course_fee : 0} />
                                    <label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">2&#41; Airfare</label>
                                    <input typeof="text" className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.airfare_fee} />
                                    <label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">3&#41; <span className="underline">Accommodation</span></label>
                                    <input typeof="text" className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.accommodation_fee > "0" ? details.accommodation_fee : 0} />
                                    <label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">4&#41; <span className="underline">Per Diem</span></label>
                                    <input typeof="text" className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.per_diem_fee > "0" ? details.per_diem_fee : 0} />
                                    <label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">5&#41; <span className="underline">Transportation</span></label>
                                    <input typeof="text" className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.transportation_fee > "0" ? details.transportation_fee : 0} />
                                    <label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">6&#41; Travel Insurance</label>
                                    <input typeof="text" className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.travel_insurance_fee > "0" ? details.travel_insurance_fee : 0} />
                                    <label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">7&#41; Others<sup>4</sup></label>
                                    <input typeof="text" className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.others_fee > "0" ? details.others_fee : 0} />
                                    <label className="col-span-1 row-span-1 p-1 bg-gray-200 uppercase border-r border-l border-slate-950">Grand Total</label>
                                    <input typeof="text" className="col-span-1 row-span-1 p-1 border-r border-slate-950 text-center" value={details && details.grand_total_fees > "0" ? details.others_fee : 0} />
                                </div>
                                <div className="col-span-3 grid grid-cols-3 grid-rows-10 bg-slate-50">
                                    <label className="col-span-3 row-start-1 row-span-2  p-[9.4px] bg-gray-200 border-r border-b border-slate-950">Source of Fund - <span className="font-normal">Details of account&#40;s&#41; to be debited. </span><span className="italic font-normal">&#40;It is encouraged to have a single source of funding&#41;</span></label>
                                    <label className="col-span-2 border-b border-r border-slate-950">
                                        <span className="border-r border-slate-950 pb-[4.5px] pt-[1px] px-1 text-xs"><input type="checkbox" /></span>
                                        <span className="ml-2">Staff Development Fund</span>
                                    </label>

                                    <input typeof="text" className="col-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.staff_development_fund === "None" ? 0 : details.staff_development_fund} />

                                    <label className="col-span-2 border-b border-r border-slate-950">
                                        <span className="border-r border-slate-950 pb-[4.5px] pt-1 px-1"><input type="checkbox" checked={details && details.staff_development_fund === "None" ? false : true} /></span>
                                        <span className="ml-2">Consolidated Pool Fund</span>
                                    </label>

                                    <input typeof="text" className="col-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.consolidated_pool_fund === "None" ? 0 : details.consolidated_pool_fund} />

                                    <label className="col-span-2 border-b border-r border-slate-950">
                                        <span className="border-r border-slate-950 pb-[4.5px] pt-1 px-1"><input type="checkbox" checked={details && details.consolidated_pool_fund === "None" ? false : true} /></span>
                                        <span className="ml-2">Research Fund</span>
                                    </label>

                                    <input typeof="text" className="col-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.research_fund === "None" ? 0 : details.research_fund} />

                                    <label className="col-span-2 border-b border-r border-slate-950">
                                        <span className="border-r border-slate-950 pb-[4.5px] pt-1 px-1"><input type="checkbox" checked={details && details.research_fund === "None" ? false : true} /></span>
                                        <span className="ml-2">Travel / Accommodation Fund</span>
                                    </label>

                                    <input typeof="text" className="col-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.travel_fund === "None" ? 0 : details.travel_fund} />

                                    <label className="col-span-2 whitespace-nowrap border-b border-r border-slate-950">
                                        <span className="border-r border-slate-950 pb-[4.5px] px-1 pt-1"><input type="checkbox" checked={details && details.travel_fund === "None" ? false : true} /></span>
                                        <span className="ml-2">Student Council / Student Welfare Fund</span>
                                    </label>

                                    <input typeof="text" className="col-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.student_council_fund === "None" ? 0 : details.student_council_fund} />

                                    <label className="col-span-2 border-b border-r border-slate-950">
                                        <span className="border-r border-slate-950 pb-[4.5px] pt-1 px-1"><input type="checkbox" checked={details && details.student_council_fund === "None" ? false : true} /></span>
                                        <span className="ml-2">Others<sup>3</sup></span>
                                    </label>

                                    <input typeof="text" className="col-span-1 p-1 border-b border-r border-slate-950 text-center" value={details && details.other_funds === "None" ? 0 : details.other_funds} />

                                    <label className="col-span-3 p-1 flex items-center border-b border-r border-slate-950">
                                        Any expenditure cap?
                                        <input type="checkbox" className="ml-2" checked={details && details.expenditure_cap === "No" ? true : false} />
                                        <label className="ml-2">No</label>
                                        <input type="checkbox" className="ml-4" checked={details && details.expenditure_cap === "Yes" ? true : false} />
                                        <label className="ml-2">Yes</label>
                                        <p className="italic text-xs font-normal ml-20">if yes, please specify below</p>
                                    </label>
                                    <label className="col-span-1 row-span-1 p-1 border-r border-slate-950">Capped Amount &#40;RM&#41;</label>
                                    <input typeof="text" className="col-span-2 row-span-1 p-1 border-r border-slate-950" value={details.expenditure_cap_amount} />
                                </div>
                            </div>

                            {/* Section 5: Applicant Declaration */}
                            <div className="grid grid-cols-2">
                                <fieldset className="p-[0.5px] border-r border-slate-50 text-[12px] bg-slate-950"><span className="text-slate-50 font-semibold uppercase ml-2">Section 5: Applicant Declaration</span></fieldset>
                                <fieldset className="p-[0.5px]  text-[12px] bg-slate-950"><span className="text-slate-50 font-semibold uppercase ml-2">Section 6: Verification<sup>5</sup></span></fieldset>

                                <div className="col-span-1 normal-case text-[10.5px] bg-gray-200 leading-3 border-r border-l border-slate-950">
                                    <p className="mx-2 p-1 text-justify">I &#40;or acting as representative of group travelling&#41; hereby confirm the accuracy of the information &#40;including any attachments&#41; provided for this application.</p>
                                    <div className="ml-6 mt-1">
                                        <label>Signature<span className="ml-8">:</span><img src={details.applicant_declaration_posision_title} alt="" /></label>
                                        <input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" /><br />
                                        <label>Name<span className="ml-[48px]">:</span></label>
                                        <input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" value={details.applicant_declaration_posision_title} /><br />
                                        <label>Position Title<span className="ml-[16px]">:</span></label>
                                        <input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" value={details.applicant_declaration_date} /><br />
                                        <label>Date<span className="ml-[54px]">:</span></label>
                                        <input type="text" className="bg-gray-200 ml-2 w-60" value={details.applicant_declaration_date} /><br />
                                    </div>
                                </div>

                                <div className="col-span-1 normal-case text-[10.5px] bg-gray-200 leading-3 border-r border-slate-950">
                                    <p className="ml-2 p-1">I have verified and support of this application.</p>
                                    <div className="mx-4 mt-4">
                                        <label>Signature<span className="ml-8">:</span></label>
                                        <input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" /><br />
                                        <label>Name<span className="ml-[48px]">:</span></label>
                                        <input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" value={details.verification_name} /><br />
                                        <label>Position Title<span className="ml-[16px]">:</span></label>
                                        <input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" value={details.verification_position_title} /><br />
                                        <label>Date<span className="ml-[54px]">:</span></label>
                                        <input type="text" className="bg-gray-200 ml-2 w-60" value={details.verification_date} /><br />
                                    </div>
                                </div>
                            </div>
                            {/* section 7: approval */}
                            <fieldset className=" p-[0.5px] text-[12px] bg-slate-950"><span className="text-slate-50 font-semibold uppercase ml-2">Section 7: Approval</span> <span className="italic normal-case">&#40;HMU / Dean / Director / DVC & CEO&#41;</span></fieldset>
                            <div className="pb-[0.5px] normal-case text-[10.5px] bg-gray-200 border border-slate-950 border-t-0">
                                <p className="mx-2">I have reviewed, and approve this application.</p>
                                <div className="mx-4 my-2">
                                    <label>Name<span className="ml-[48px]">:</span></label>
                                    <input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" value={details.approval_name} /><br />
                                    <label>Position Title<span className="ml-[16px]">:</span></label>
                                    <input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" value={details.approval_position_title} />
                                    <input type="text" className="border-b border-slate-950 ml-2 w-72 float-right mr-5 bg-gray-200" value={details.approval_date} />
                                    <br />
                                    <label>Date<span className="ml-[54px]">:</span></label>
                                    <input type="text" className="bg-gray-200 ml-2 w-60" />
                                    <label className="float-right mr-[135px]">Signature</label>
                                </div>
                            </div>

                            <div className="mt-3 text-[10px]">
                                <div className="border-b-[1.5px] border-slate-950 w-48"></div>
                                <p className="mt-1"><sup>1,2,3,4</sup> Please attach additional information / page(s), where necessary.</p>
                                <p><sup>5</sup> Verification done by Associate Dean, Research / School of Research Office, where relevant, for academic / reseach related trips.</p>
                                <div className="border-b border-slate-950 w-44 mt-2"></div>
                                <p className="ml-2">Human Resources - Nomination / Travelling Application Form</p>
                                <p className="ml-2">Version 8.1: February 2020</p>
                                <p className="float-right">Page <span className="font-bold">1</span> of <span className="font-bold">1</span></p>
                            </div>

                            <button
                                onClick={handlePrint}
                                className="bg-red-500 hover:bg-blue-700 duration-300 text-white font-semibold py-2 px-4 text-sm mt-2 rounded print-button"
                            >Print
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}