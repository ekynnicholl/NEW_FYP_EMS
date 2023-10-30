"use client";

import React, { useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import cookie from 'js-cookie';
import { sendContactForm } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

type FormDetails = {
    fundSourceName: string,
    fundAmount: number,
    expenditureCapped: boolean,
    cappedAmount: number,
    hosEmail: string,
    formStage: number,
    securityKey: string,
    revertComment: string,
    hosName: string,
    deanEmail: string
}

export default function Page() {
    const supabase = createClientComponentClient();
    const [formDetails, setFormDetails] = useState<FormDetails>({
        fundSourceName: '',
        fundAmount: 0,
        expenditureCapped: false,
        cappedAmount: 0,
        hosEmail: '',
        formStage: 0,
        securityKey: '',
        revertComment: '',
        hosName: '',
        deanEmail: '',
    });
    const { ext_form_id } = useParams();
    const authToken = cookie.get('authToken');
    const router = useRouter();
    const [fetchedFormStage, setFetchedFormStage] = useState<number>(0);

    // Keep track of the revert comment,
    const [showCommentInput, setShowCommentInput] = useState(false);

    useEffect(() => {
        if (formDetails.formStage != fetchedFormStage) {
            console.log(formDetails);
            sendContactForm(formDetails);
        }
    }, [formDetails.formStage])

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from('external_testing')
                .select('*')
                .eq('formID', ext_form_id);

            if (error || data.length === 0) {
                console.error("Error fetching data:", error);
                router.push("/notFound?from=ext_forms")
            } else {
                const row = data[0];
                if (row) {
                    setFormDetails(row);
                    setFetchedFormStage(row.formStage);
                }
            }
        }

        fetchData();
    }, []);

    // This is for the security key input validation,
    const [inputMatchesSecurityKey, setInputMatchesSecurityKey] = useState(false);

    const handleInputValidation = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        console.log(formDetails.securityKey);
        console.log(inputValue);
        setInputMatchesSecurityKey(inputValue === formDetails.securityKey);
    };

    // const showSuccessToast = (message: string) => {
    //     toast.success(message, {
    //         duration: 3500,
    //         style: {
    //             border: '1px solid #86DC3D',
    //             padding: '16px',
    //             color: '#000000',
    //             textAlign: 'justify',
    //         },
    //         iconTheme: {
    //             primary: '#86DC3D',
    //             secondary: '#FFFAEE',
    //         },
    //     });
    // };

    // 1 - form exists (revert), 2 - AAO, 3 - HOS, 4 - Dean, 5 - approved, 6 - rejected
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        // Generate the security key,
        const securityKeyUID = uuidv4();
        e.preventDefault();

        // Only update specific fields if they click on submit. This part is from AAO to HOS/ ADCR/ MGR,
        if (formDetails.formStage === 2) {
            const { data, error } = await supabase
                .from('external_testing')
                .update([
                    {
                        expenditureCapped: formDetails.expenditureCapped,
                        fundAmount: formDetails.fundAmount,
                        revertComment: "None",
                        securityKey: securityKeyUID,
                        formStage: 3
                    }
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error updating data:", error);
            } else {
                console.log("Data updated successfully:", data);

                // showSuccessToast('Your form has successfully been submitted for review.');

                setFormDetails({
                    ...formDetails,
                    revertComment: '',
                    expenditureCapped: formDetails.expenditureCapped,
                    fundAmount: formDetails.fundAmount,
                    securityKey: securityKeyUID,
                    formStage: 3,
                });
                window.location.reload();
            }

            // This part is when the staff re-submits the form to the AAO after being reverted,
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

                // showSuccessToast('Your form has been submitted successfully. You should receive a confirmation email.');

                setFormDetails({
                    ...formDetails,
                    formStage: 2
                });
                window.location.reload();
            }

            // } else if (formDetails.formStage === 2) {
            //     const { data, error } = await supabase
            //         .from("external_testing")
            //         .update([
            //             {
            //                 formStage: 4,
            //             },
            //         ])
            //         .eq('formID', ext_form_id);

            //     if (error) {
            //         console.error("Error inserting data:", error);
            //     } else {
            //         console.log("Data inserted successfully:", data);

            //         // showSuccessToast('Your form has successfully been submitted for review.');

            //         setFormDetails({
            //             ...formDetails,
            //             formStage: 4
            //         });
            //         window.location.reload();
            //     }
        }
        // This is for approving the forms, stage 5 by the HOS/ MGR/ ADCR.
        else if (formDetails.formStage === 3) {
            const { data, error } = await supabase
                .from("external_testing")
                .update([
                    {
                        formStage: 5,
                        securityKey: null,
                        hosName: formDetails.hosName
                    },
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error inserting data:", error);
            } else {
                console.log("Data inserted successfully:", data);

                // showSuccessToast('You have successfully approved the form. Emails have been sent out.');

                setFormDetails({
                    ...formDetails,
                    formStage: 5
                });
                window.location.reload();
            }
        }
    };

    const handleRevert = async () => {
        // This is for rejecting the forms by HOS/ ADCR/ MGR,
        if (formDetails.formStage === 3) {
            const { data, error } = await supabase
                .from('external_testing')
                .update([
                    {
                        formStage: 6,
                        securityKey: null,
                        hosName: formDetails.hosName
                    }
                ])
                .eq('formID', ext_form_id);

            if (error) {
                console.error("Error updating data:", error);
            } else {
                console.log("Data updated successfully:", data);

                // showSuccessToast('You have successfully rejected the form. Emails have been sent out.');

                setFormDetails({
                    ...formDetails,
                    formStage: 6
                });

                window.location.reload();
            }
        }

        // This is for the AAO to revert to the staff with the comments,
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

                // showSuccessToast('You have successfully reverted the form. Emails have been sent out.');

                setFormDetails({
                    ...formDetails,
                    formStage: 1
                });

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
                                        value={formDetails.fundSourceName || ''}
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
                                        value={formDetails.fundAmount || 0}
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
                                        value={formDetails.cappedAmount || 0.00}
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
                                            value={formDetails.hosEmail || ''}
                                        >
                                            <option value="" className="text-slate-800">Please select an option</option>
                                            <option value="hos@gmail.com" className="text-slate-800">hos@gmail.com</option>
                                            <option value="jadpichoo@outlook.com" className="text-slate-800">jadpichoo@outlook.com</option>
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
                                            value={formDetails.deanEmail || ''}
                                        >
                                            <option value="" className="text-slate-800">Choose an item</option>
                                            <option value="dean@gmail.com" className="text-slate-800">dean@gmail.com</option>
                                        </select>
                                    ) : formDetails.formStage === 2 ? (
                                        <input
                                            type="text"
                                            id="dean"
                                            placeholder=""
                                            value={formDetails.deanEmail || ''}
                                            className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage === 2 ? "cursor-not-allowed" : ""}`}
                                            disabled={formDetails.formStage === 2}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            id="dean"
                                            placeholder=""
                                            value={formDetails.deanEmail || ''}
                                            className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${formDetails.formStage !== 2 ? "cursor-not-allowed" : ""}`}
                                            disabled={formDetails.formStage !== 1}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* This is what the AAO sees, */}
                        {(formDetails.formStage === 2) && (
                            <div>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className={`rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover-bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[120px] mt-5 ${showCommentInput === true ? 'hidden' : 'visible'}`}
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

                        {/* This is what a staff will see after it is reverted. The AAO cannot have the submit button. */}
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
                                            value={formDetails.revertComment || ''}
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

                        {/* This is what the HOS/ ADCR/ MGR sees, */}
                        {formDetails.formStage === 3 && (
                            <div>
                                <div className="mt-5">
                                    <p className="text-sm text-slate-800 font-medium">HOS/ ADCR/ MGR Section
                                    </p>
                                    <input
                                        type="text"
                                        id="hos_name"
                                        placeholder="Your Name"
                                        value={formDetails.hosName || ''}
                                        className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                        onChange={event =>
                                            setFormDetails({ ...formDetails, hosName: event.target.value })
                                        }
                                    />
                                </div>
                                <p className="text-sm text-slate-800 font-medium">
                                </p>
                                <div className="">
                                    <div className="group relative w-max">
                                        Security Key <button className="bg-slate-100 rounded-lg p-1 font-bold">!</button>
                                        <span
                                            className="bg-slate-100 pointer-events-none absolute ml-2 rounded-md w-[200px] text-justify opacity-0 transition-opacity group-hover:opacity-100 p-3 border-2"
                                        >
                                            This is to ensure that you are the appropriate individual for the authorization or rejection of this form. It can be found in your email.
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    id="securityKey"
                                    placeholder="Security Key"
                                    className={`border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] ${inputMatchesSecurityKey ? '' : 'border-red-500'
                                        }`}
                                    onChange={(event) => {
                                        handleInputValidation(event);
                                    }}
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={!inputMatchesSecurityKey}
                                    className={`rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px] text-slate-100 text-[13px] lg:text-[15px] hover-bg-slate-900 p-4 w-[120px] mt-5 ${inputMatchesSecurityKey ? 'bg-slate-800' : 'bg-gray-400'}`}
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRevert}
                                    disabled={!inputMatchesSecurityKey}
                                    className={`rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px] text-slate-100 text-[13px] lg:text-[15px] hover-bg-slate-900 p-4 w-[120px] mt-5 ml-5 ${inputMatchesSecurityKey ? 'bg-slate-800' : 'bg-gray-400'}`}
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
                                    value={formDetails.revertComment || ''}
                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                />
                            </div>
                        )}
                    </div>
                </form>
            ) : (
                // This is the final stage of the form,
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
