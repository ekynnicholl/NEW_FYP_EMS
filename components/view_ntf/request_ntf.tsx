"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";
import toast from 'react-hot-toast';
import { sendNTFAccess } from "@/lib/api";

const RequestNTF = () => {
    const supabase = createClientComponentClient();
    const [submissionStatus, setSubmissionStatus] = useState(false);
    const [staffEmailID, setStaffEmailID] = useState('');
    const [captcha, setCaptcha] = useState<string | null>();
    const isCompact = typeof window !== 'undefined' && window.innerWidth <= 640;

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!staffEmailID) {
            // Empty input,
            return;
        } else if (staffEmailID == '0') {
            toast.error("If you're a visitor, you may only opt to use the email that you've used in the attence forms.")
            return;
        }


        if (!captcha) {
            toast.error('Please verify you are not a robot... Are you... a... robot?!');
            return;
        }

        try {
            const isEmail = /@/.test(staffEmailID);
            let searchQuery = staffEmailID;

            // if (!isEmail) {
            //     searchQuery = staffEmailID.startsWith('SS') ? staffEmailID : `SS${staffEmailID}`;
            // }

            const { data: externalFormsData, error: externalFormsError } = await supabase
                .from('external_forms')
                .select('*')
                .ilike(isEmail ? 'email' : 'staff_id', `${searchQuery}`);

            if (externalFormsError) {
                toast.error('Technical error. Please contact the developers of the website...');
                return;
            }

            const { data: attendanceFormsData, error: attendanceFormsError } = await supabase
                .from('attendance_forms')
                .select('*')
                .ilike(isEmail ? 'attFormsStaffEmail' : 'attFormsStaffID', `${searchQuery}`);

            if (attendanceFormsError) {
                toast.error('Technical error. Please contact the developers of the website...');
                return;
            }

            setSubmissionStatus(true);
            setCaptcha(null);

            if ((externalFormsData && externalFormsData.length > 0) || (attendanceFormsData && attendanceFormsData.length > 0)) {
                let matchingRecord;

                // Set the external forms as matching record if it exists,
                if (externalFormsData && externalFormsData.length > 0) {
                    matchingRecord = externalFormsData[0];
                    // Set the attendance forms as matching record if it exists,
                } else {
                    matchingRecord = attendanceFormsData[0];
                }

                // Different naming conventions for columns for different tables,
                const staffIDColumnName = matchingRecord.staff_id ? 'staff_id' : 'attFormsStaffID';
                const emailColumnName = matchingRecord.attFormsStaffEmail ? 'attFormsStaffEmail' : 'email';

                if (/@/.test(matchingRecord[emailColumnName])) {
                    // The matching record has a valid email address,
                    const currentDateTime = new Date();
                    const newTime = new Date(currentDateTime.getTime() + 4 * 60 * 60 * 1000);

                    const { data: insertData, error: insertError } = await supabase
                        .from('access_tokens')
                        .insert([
                            {
                                atUsage: "View Past Events Attended",
                                atIdentifier: matchingRecord[emailColumnName],
                                atIdentifier2: matchingRecord[staffIDColumnName],
                                atExpiredAt: newTime,
                            },
                        ])
                        .select();

                    if (insertError) {
                        // console.error('Error inserting into access_tokens:', insertError);
                    } else {
                        // Successfully inserted, now fetch the inserted row for updated data before submitting for emailing,
                        const { data: insertedRow, error: fetchError } = await supabase
                            .from('access_tokens')
                            .select('*')
                            .eq('atID', insertData[0].atID);

                        if (fetchError) {
                            // console.error('Error fetching inserted row from access_tokens:', fetchError);
                        } else {
                            sendNTFAccess(insertedRow);
                        }
                    }
                } else {
                    // console.error('The fetched record does not have a valid email address.');
                }
            } else {
                // console.error('No matching record found in external_forms.');
            }
        } catch (e) {
            // console.error('Error in handleSubmit:', e);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="lg:p-4 p-0 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card lg:w-1/2 w-11/12">
                {!submissionStatus ? (
                    <div className="p-5">
                        <div className="text-left pl-5 pr-5">
                            <p className="text-[20px] font-bold">
                                Request to View Nominations/ Travelling Forms Status & Staff Attendance Summary
                            </p>
                            <div className="border-t border-gray-300 my-2"></div>
                            <div className="text-justify">
                                <p>
                                    View the status of your current or previous Nominations/ Travelling Forms application or the summary of your Attendance Record for past events below.
                                    You will receive an email notification including an access token for additional authorization purposes.
                                </p>
                            </div>
                            <p className="text-base font-bold mt-3 underline">
                                Please follow the guidelines below when filling out the form, if you are logging in via:
                            </p>
                            <div className="text-justify">
                                <p>
                                    <span className="font-bold">Staff/ Student Access Card ID: </span> Please ensure that you have entered your ID correctly including all the alphanumerical as how it is shown in your Staff/ Student access card.
                                    <br />
                                    <span className="font-bold">Email Address:</span> Please ensure that you have entered your email address in the correct format and based on what you have entered in the event registration form previously.
                                </p>
                            </div>
                            <p className="text-base italic mt-3 text-red-600">
                                Invalid or mistyped information will result in email delivery failure; therefore, please abide to the above guidelines. <br></br>Thank you for your cooperation.
                            </p>
                        </div>
                        <div className="pl-5 pr-5">
                            <form onSubmit={handleSubmit}>
                                <div className="mt-3">
                                    <label htmlFor="staffEmailID" className="block text-gray-700 text-sm lg:text-base font-medium mb-2 dark:text-dark_text">Staff ID/ Student ID/ Email:</label>
                                    <input
                                        type="text"
                                        id="staffEmailID"
                                        name="staffEmailID"
                                        placeholder="123456789/ SS001/ abc@swinburne.edu.my/ 12345678@students.swinburne.edu.my"
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
                                        size={isCompact ? "compact" : "normal"}
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
                            <div className="lg:w-96">
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