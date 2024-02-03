"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";
import toast from 'react-hot-toast';

const RequestNTF = () => {
    const supabase = createClientComponentClient();
    const [submissionStatus, setSubmissionStatus] = useState(false);
    const [staffEmailID, setStaffEmailID] = useState('');
    const [captcha, setCaptcha] = useState<string | null>();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!staffEmailID) {
            // Empty input,
            return;
        }

        if (!captcha) {
            toast.error('Please verify you are not a robot... Are you... a... robot?!');
            return;
        }

        try {
            const isEmail = /@/.test(staffEmailID);
            let searchQuery = staffEmailID;

            if (!isEmail) {
                searchQuery = staffEmailID.startsWith('SS') ? staffEmailID : `SS${staffEmailID}`;
            }

            const { data, error } = await supabase
                .from('external_forms')
                .select('*')
                .ilike(isEmail ? 'email' : 'staff_id', `${searchQuery}`);

            if (error) {
                // console.error('Error querying external_forms:', error);
                return;
            }

            setSubmissionStatus(true);
            setCaptcha(null);

            if (data && data.length > 0) {
                // Do something when their NTFs exist,
            } else {
                // Don't exist,
            }
        } catch (e) {
            console.error('Error in handleSubmit:', e);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card">
                {!submissionStatus ? (
                    <div className="p-5">
                        <div className="text-center pl-5 pr-5">
                            <p className="text-[20px] font-bold">Please enter your staff ID or email.</p>
                            <p>If there are records of any Nominations/ Travelling Forms for the given staff ID/ email, we will send you a link to the said email.</p>
                        </div>
                        <div className="pl-5 pr-5">
                            <form onSubmit={handleSubmit}>
                                <div className="mt-3">
                                    <label htmlFor="staffEmailID" className="block text-gray-700 text-sm lg:text-base font-medium mb-2 dark:text-dark_text">Staff ID/ Email:</label>
                                    <input
                                        type="text"
                                        id="staffEmailID"
                                        name="staffEmailID"
                                        placeholder="Name"
                                        value={staffEmailID}
                                        onChange={(e) => setStaffEmailID(e.target.value)}
                                        className="w-full border-[1px] p-3 rounded-md focus:outline-none text-sm lg:text-base dark:text-black-500"
                                        required
                                    />
                                </div>
                                <div className="mt-3">
                                    <ReCAPTCHA
                                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                        onChange={setCaptcha}
                                    />
                                </div>
                                <div className="mt-3 text-right">
                                    <button
                                        type="submit"
                                        disabled={!staffEmailID}
                                        className={`${staffEmailID ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`} >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="p-5">
                        <div>
                            <Image
                                src="/images/tick_mark.png"
                                alt="cross_mark"
                                width={200}
                                height={250}
                                className="mx-auto -mt-[39px] lg:-mt-[45px]"
                            />
                            <h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
                                Please check your email.
                            </h3>
                            <div className="w-96">
                                <p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-justify">
                                    If there are records of any Nominations/ Travelling Forms for the given staff ID/ email, we will send you a link to the said email. <br /> <br />Please check your junk/ spam folder as well.
                                </p>
                            </div>
                            <div className="w-1/6 items-center flex justify-center mx-auto">
                                <div className="rounded-lg px-[16px] py-[10px] lg:px-[18px] lg:py-[11px] bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                                    <button
                                        onClick={() => setSubmissionStatus(false)}>
                                        Return
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div >
                )}
            </div >
        </div >
    )
};

export default RequestNTF;