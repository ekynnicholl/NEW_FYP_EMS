"use client";

import React, { useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from 'react';
import { sendContactForm } from "@/lib/api";
import { toast } from 'react-hot-toast';

type FormDetails = {
    fundSourceName: string,
    fundAmount: number,
    expenditureCapped: boolean,
    formStage: number,
    hosEmail: string,
    deanEmail: string,
    formID: string
}

export default function Page() {
    const supabase = createClientComponentClient();
    const [formDetails, setFormDetails] = useState<FormDetails>({} as FormDetails)

    useEffect(() => {
        console.log(formDetails);
        sendContactForm(formDetails);
    }, [formDetails.formStage]);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!formDetails.fundSourceName || !formDetails.fundAmount || !formDetails.hosEmail || !formDetails.deanEmail) {
            return;
        }

        const { data, error } = await supabase
            .from("external_testing")
            .upsert([
                {
                    fundSourceName: formDetails.fundSourceName,
                    fundAmount: formDetails.fundAmount,
                    expenditureCapped: null,
                    formStage: 2,
                    hosEmail: formDetails.hosEmail,
                    deanEmail: formDetails.deanEmail
                },
            ])
            .select();

        if (error) {
            console.error("Error inserting data:", error);
        } else {
            console.log("Data inserted successfully:", data);
            toast.success('Your form has been submitted successfully. You should receive a confirmation email.', {
                duration: 3500,
                style: {
                    border: '1px solid #86DC3D',
                    padding: '16px',
                    color: '#000000',
                    textAlign: 'justify',
                },
                iconTheme: {
                    primary: '#86DC3D',
                    secondary: '#FFFAEE',
                },
            });
            setFormDetails({
                ...formDetails,
                formID: data[0].formID,
                formStage: data[0].formStage
            });
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-10">
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
                                placeholder="Fund Source Name"
                                className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
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
                                className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
                                onChange={event =>
                                    setFormDetails({ ...formDetails, fundAmount: parseFloat(event.target.value) })
                                }
                            />
                        </div>
                    </div>
                </div>

                <fieldset disabled>
                    <div className="mt-5 cursor-not-allowed">
                        <p className="text-sm text-slate-800 font-medium">Any Expenditure Cap?
                        </p>
                        <div className="mt-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="expenditure_cap"
                                    value="yes"
                                    className="form-checkbox h-4 w-4 text-slate-800 cursor-not-allowed"
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
                                    className="form-checkbox h-4 w-4 text-slate-800 cursor-not-allowed"
                                />
                                <span className="text-slate-800 text-[15px]">No</span>
                            </label>
                        </div>

                        <div className="mt-5 cursor-not-allowed">
                            <p className="text-sm text-slate-800 font-medium ml-[1px]">Capped Amount
                            </p>

                            <div>
                                <input
                                    type="number"
                                    id="capped_amount"
                                    placeholder="Amount (RM)"
                                    className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">HOS Email
                        </p>
                        <div>
                            <select
                                id="hos"
                                className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[6px]  hover:bg-slate-100 text-slate-800"
                                onChange={event =>
                                    setFormDetails({ ...formDetails, hosEmail: event.target.value })
                                }
                            >
                                <option value="" className="text-slate-800">Please select an option</option>
                                <option value="hos@gmail.com" className="text-slate-800">hos@gmail.com</option>
                                <option value="jadpichoo@outlook.com" className="text-slate-800">jadpichoo@outlook.com</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Dean Email
                        </p>
                        <div>
                            <select
                                id="dean"
                                className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[10px]  hover:bg-slate-100 text-slate-800"
                                onChange={event =>
                                    setFormDetails({ ...formDetails, deanEmail: event.target.value })
                                }
                            >
                                <option value="" className="text-slate-800">Choose an item</option>
                                <option value="dean@gmail.com" className="text-slate-800">dean@gmail.com</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[120px] mt-5">
                    Submit
                </button>

            </div>
        </form>

    )
}
