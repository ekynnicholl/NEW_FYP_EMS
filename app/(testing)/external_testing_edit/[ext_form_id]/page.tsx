"use client";

import React, { useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import cookie from 'js-cookie';
import { Router } from 'lucide-react';

type FormDetails = {
    fundSourceName: string,
    fundAmount: number,
    expenditureCapped: boolean,
    cappedAmount: number,
    hosEmail: string,
    formStage: number,
    revertComment: string,
    hosName: string,
    deanEmail: string
}

export default function page() {
    const supabase = createClientComponentClient();
    const [formDetails, setFormDetails] = useState<FormDetails>({} as FormDetails)
    const { ext_form_id } = useParams();
    const authToken = cookie.get('authToken');
    const router = useRouter();

    // Keep track of the revert comment,
    const [showCommentInput, setShowCommentInput] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from('external_testing')
                .select('*')
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error fetching data:", error);
                router.push("/error-404")
            } else {
                const row = data[0];
                if (row) {
                    setFormDetails(row);
                }
            }
            console.log(data);
        }

        fetchData();
    }, []);

    // 1 - form exists (revert), 2 - AAO, 3 - HOS, 4 - Dean, 5 - approved, 6 - rejected

    const handleSubmit = async () => {
        // Only update specific fields if they click on submit.
        if (formDetails.formStage === 2) {
            const { data, error } = await supabase
                .from('external_testing')
                .update([
                    {
                        expenditureCapped: formDetails.expenditureCapped,
                        fundAmount: formDetails.fundAmount,
                        formStage: 3
                    }
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error updating data:", error);
            } else {
                console.log("Data updated successfully:", data);
            }
        } else if (formDetails.formStage === 1) {
            const { data, error } = await supabase
                .from("external_testing")
                .update([
                    {
                        fundSourceName: formDetails.fundSourceName,
                        fundAmount: formDetails.fundAmount,
                        formStage: 2,
                        hosEmail: formDetails.hosEmail,
                        deanEmail: formDetails.deanEmail
                    },
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error inserting data:", error);
            } else {
                console.log("Data inserted successfully:", data);
                setFormDetails({} as FormDetails);
            }
        } else if (formDetails.formStage === 2) {
            const { data, error } = await supabase
                .from("external_testing")
                .update([
                    {
                        formStage: 4,
                    },
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error inserting data:", error);
            } else {
                console.log("Data inserted successfully:", data);
                setFormDetails({} as FormDetails);
            }
        }
        else if (formDetails.formStage === 3) {
            const { data, error } = await supabase
                .from("external_testing")
                .update([
                    {
                        formStage: 5,
                        hosName: formDetails.hosName
                    },
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error inserting data:", error);
            } else {
                console.log("Data inserted successfully:", data);
                setFormDetails({} as FormDetails);
            }
        }
    };

    const handleRevert = async () => {
        if (formDetails.formStage === 3) {
            const { data, error } = await supabase
                .from('external_testing')
                .update([
                    {
                        formStage: 6,
                        hosName: formDetails.hosName
                    }
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error updating data:", error);
            } else {
                console.log("Data updated successfully:", data);
                window.location.reload();
            }
        }

        if (formDetails.formStage === 2 && (showCommentInput == true || formDetails.revertComment != "None")) {
            const { data, error } = await supabase
                .from('external_testing')
                .update([
                    {
                        formStage: 1,
                        revertComment: formDetails.revertComment,
                        expenditureCapped: formDetails.expenditureCapped,
                        cappedAmount: formDetails.cappedAmount
                    }
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error updating data:", error);
            } else {
                console.log("Data updated successfully:", data);
                window.location.reload();
            }
        }
        else if (showCommentInput == false) {
            setShowCommentInput(true);
        }
    };

    return (
        <div>
            {(formDetails.formStage !== 5 && formDetails.formStage !== 6) ? (
                <form>
                    <div className="p-10">
                        {formDetails.formStage === 1 ? (
                            <p>Current View: Reverted to Staff</p>
                        ) : formDetails.formStage === 2 ? (
                            <p>Current View: AAO</p>
                        ) : formDetails.formStage === 3 ? (
                            <p>Current View: HOS/ ADCR/ MGR</p>
                        ) : (
                            <p></p>
                        )}
                        <p className="text-[15px] text-slate-800 font-medium ml-[1px] mt-8">Source of Fund <br></br><span className="text-slate-800 text-sm font-normal">Details of account(s) to be debited. (It is encouraged to have a single source of funding)</span>.
                        </p>

                        <div className="grid grid-cols-2 gap-5 mt-4">
                            <div>
                                <p className="text-sm text-slate-800 font-medium ml-[1px]">Name
                                </p>

                                <div>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formDetails.fundSourceName}
                                        placeholder="Fund Source Name"
                                        className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage !== 1 ? "cursor-not-allowed" : ""}`}
                                        disabled={formDetails.formStage !== 1}
                                        onChange={event =>
                                            setFormDetails({ ...formDetails, fundSourceName: event.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-slate-800 font-medium ml-[1px]">Consolidated Pool Fund
                                </p>

                                <div>
                                    <input
                                        type="number"
                                        id="consolidated_pool_fund"
                                        placeholder="Amount (RM)"
                                        value={formDetails.fundAmount}
                                        className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage !== 1 ? "cursor-not-allowed" : ""}`}
                                        disabled={formDetails.formStage !== 1}
                                        onChange={event =>
                                            setFormDetails({ ...formDetails, fundAmount: parseFloat(event.target.value) })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={`mt-5 ${formDetails.formStage === 2 ? "" : "cursor-not-allowed"}`}>
                            <p className="text-sm text-slate-800 font-medium">Any Expenditure Cap?
                            </p>
                            <div className="mt-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="expenditure_cap"
                                        value="yes"
                                        disabled={formDetails.formStage != 2}
                                        checked={formDetails.expenditureCapped === true}
                                        onChange={event =>
                                            setFormDetails({ ...formDetails, expenditureCapped: true })
                                        }
                                        className={`form-checkbox h-4 w-4 text-slate-800 ${formDetails.formStage !== 2 ? "cursor-not-allowed" : ""}`}
                                    />
                                    <span className="text-slate-800 text-[15px]">Yes</span>
                                </label>
                            </div>
                            <div className="mt-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="expenditure_cap"
                                        value="no"
                                        disabled={formDetails.formStage != 2}
                                        checked={formDetails.expenditureCapped === false}
                                        onChange={event =>
                                            setFormDetails({ ...formDetails, expenditureCapped: false })
                                        }
                                        className={`form-checkbox h-4 w-4 text-slate-800 ${formDetails.formStage !== 2 ? "cursor-not-allowed" : ""}`}
                                    />
                                    <span className="text-slate-800 text-[15px]">No</span>
                                </label>
                            </div>

                            <div className={`mt-5 ${formDetails.formStage === 2 ? "" : "cursor-not-allowed"}`}>
                                <p className="text-sm text-slate-800 font-medium ml-[1px]">Capped Amount
                                </p>

                                <div>
                                    <input
                                        type="number"
                                        id="capped_amount"
                                        placeholder="Amount (RM)"
                                        value={formDetails.cappedAmount}
                                        onChange={event =>
                                            setFormDetails({ ...formDetails, cappedAmount: parseFloat(event.target.value) })
                                        }
                                        className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage === 2 ? "" : "cursor-not-allowed"}`}
                                        disabled={formDetails.formStage !== 2}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">HOS Email
                                </p>
                                <div>
                                    {formDetails.formStage === 1 ? (
                                        <select
                                            id="hos"
                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[6px]  hover:bg-slate-100 text-slate-800"
                                            onChange={event =>
                                                setFormDetails({ ...formDetails, hosEmail: event.target.value })
                                            }
                                            value={formDetails.hosEmail}
                                        >
                                            <option value="" className="text-slate-800">Please select an option</option>
                                            <option value="hos@gmail.com" className="text-slate-800">hos@gmail.com</option>
                                        </select>
                                    ) : formDetails.formStage === 2 ? (
                                        <input
                                            type="text"
                                            id="hos"
                                            placeholder=""
                                            value={formDetails.hosEmail}
                                            className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage === 2 ? "cursor-not-allowed" : ""}`}
                                            disabled={formDetails.formStage === 2}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            id="hos"
                                            placeholder=""
                                            value={formDetails.hosEmail}
                                            className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage !== 2 ? "cursor-not-allowed" : ""}`}
                                            disabled={formDetails.formStage !== 1}
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Dean Email
                                </p>
                                <div>
                                    {formDetails.formStage === 1 ? (
                                        <select
                                            id="dean"
                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[10px]  hover:bg-slate-100 text-slate-800"
                                            onChange={event =>
                                                setFormDetails({ ...formDetails, deanEmail: event.target.value })
                                            }
                                            value={formDetails.deanEmail}
                                        >
                                            <option value="" className="text-slate-800">Choose an item</option>
                                            <option value="dean@gmail.com" className="text-slate-800">dean@gmail.com</option>
                                        </select>
                                    ) : formDetails.formStage === 2 ? (
                                        <input
                                            type="text"
                                            id="dean"
                                            placeholder=""
                                            value={formDetails.deanEmail}
                                            className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage === 2 ? "cursor-not-allowed" : ""}`}
                                            disabled={formDetails.formStage === 2}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            id="dean"
                                            placeholder=""
                                            value={formDetails.deanEmail}
                                            className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage !== 2 ? "cursor-not-allowed" : ""}`}
                                            disabled={formDetails.formStage !== 1}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {formDetails.formStage === 2 && (
                            <div>
                                <button
                                    onClick={handleSubmit}
                                    className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover-bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[120px] mt-5"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRevert}
                                    className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover-bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[120px] mt-5 ml-5"
                                >
                                    Revert
                                </button>
                            </div>
                        )}

                        {(formDetails.formStage === 1 && !authToken) && (
                            <div>
                                {formDetails.revertComment !== "None" && (
                                    <div className="mt-5">
                                        <p className="text-sm text-slate-800 font-medium">Comment</p>
                                        <input
                                            type="text"
                                            id="comment"
                                            onChange={event =>
                                                setFormDetails({ ...formDetails, revertComment: event.target.value })
                                            }
                                            value={formDetails.revertComment}
                                            disabled
                                            className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] cursor-not-allowed"
                                        />
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px] bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover-bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[120px] mt-5"
                                >
                                    Submit
                                </button>
                            </div>
                        )}

                        {formDetails.formStage === 3 && (
                            <div>
                                <div className="mt-5">
                                    <p className="text-sm text-slate-800 font-medium">HOS/ ADCR/ MGR Section
                                    </p>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Your Name"
                                        value={formDetails.hosName}
                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                        onChange={event =>
                                            setFormDetails({ ...formDetails, hosName: event.target.value })
                                        }
                                    />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover-bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[120px] mt-5"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRevert}
                                    className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover-bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[120px] mt-5 ml-5"
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        {(showCommentInput || formDetails.revertComment != "None" && formDetails.formStage == 2) && (
                            <div className="mt-5">
                                <p className="text-sm text-slate-800 font-medium">Comment</p>
                                <input
                                    type="text"
                                    id="comment"
                                    onChange={event =>
                                        setFormDetails({ ...formDetails, revertComment: event.target.value })
                                    }
                                    value={formDetails.revertComment}
                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                />
                            </div>
                        )}
                    </div>
                </form>
            ) : (
                <div>
                    <p>Show PDF!</p>
                    {formDetails.formStage === 5 ? (
                        <p className="bg-green-500">Status: Approved</p>
                    ) : formDetails.formStage === 6 ? (
                        <p className="bg-red-500">Status: Rejected</p>
                    ) : null}
                </div>

            )}
        </div>

    )
}
