"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle, IoMdArrowDropdownCircle } from "react-icons/io";
import React, { useEffect, useState } from "react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const ExternalSettings = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [settingsData, setSettingsData] = useState<any[]>([])
    const [applicantDuration, setApplicantDuration] = useState(1);
    const [aaoDuration, setAAODuration] = useState(3);
    const [showContent, setShowContent] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
        setTimeout(() => {
            setShowContent(!showContent);
        }, 500); // Adjust the delay time as needed
    };

    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchExternalReminderSettings();
    }, [])

    const fetchExternalReminderSettings = async () => {
        const { data, error } = await supabase
            .from("external_reminder")
            .select("extSID, extSType, extSDays")

        if (error) {
            toast.error("There was an error fetching the times.")
        } else {
            const applicantData = data.find(item => item.extSType === "Applicant");
            const aaoData = data.find(item => item.extSType === "AAO");

            if (applicantData) {
                setApplicantDuration(applicantData.extSDays);
            }

            if (aaoData) {
                setAAODuration(aaoData.extSDays);
            }

            setSettingsData(data);
        }
    }

    const handleApplicantDurationChange = (event: { target: { value: any; }; }) => {
        setApplicantDuration(Number(event.target.value));
    };

    const handleAAODurationChange = (event: { target: { value: any; }; }) => {
        setAAODuration(Number(event.target.value));
    };

    const handleSaveChanges = async () => {
        const applicantData = settingsData.find(item => item.extSType === "Applicant");
        const aaoData = settingsData.find(item => item.extSType === "AAO");

        if (applicantData && (settingsData.find(item => item.extSType === "Applicant").extSDays !== applicantData)) {
            await supabase
                .from("external_reminder")
                .update({ extSDays: applicantDuration })
                .eq("extSID", applicantData.extSID);
        }

        if (aaoData && (settingsData.find(item => item.extSType === "AAO").extSDays !== aaoData)) {
            await supabase
                .from("external_reminder")
                .update({ extSDays: aaoDuration })
                .eq("extSID", aaoData.extSID);
        }

        toast.success("Reminder timeframe updated successfully.");
        fetchExternalReminderSettings();
    };

    return (
        <div>
            <div onClick={toggleExpansion} className="flex cursor-pointer">
                <div className="mr-2">
                    {isExpanded ? (
                        <IoMdArrowDropdownCircle className="text-[27px] lg:text-[30px] dark:text-dark_text" />
                    ) : (
                        <IoMdArrowDroprightCircle className="text-[27px] lg:text-[30px] dark:text-dark_text" />
                    )}
                </div>
                <h1 className="font-bold dark:text-dark_text text-[18px] lg:text-[20px]">Nominations/ Travelling Forms Reminder</h1>
            </div>

            {isExpanded ? (
                <div className="transition-max-h duration-300 ease-linear w-full">
                    <div className="overflow-y-auto max-h-fit flex flex-col justify-between mt-1 space-y-4 pl-10">
                        <div className="pr-10">
                            <div className="text-slate-900 dark:text-dark_text mb-3 text-justify text-sm lg:text-base">
                                <p className="font-bold underline text-[15px] lg:text-[18px] mt-2 lg:mt-0">Applicants</p>
                                <p className="mt-1 lg:mt-0">
                                    For applicants, the duration takes into consideration of only the weekends. For instance, if the last updated date of the form is 19 April 2024 (Friday),
                                    the applicant will only be able to remind the Academic Administration Office Staff after 3 working days (or the number of days you have selected)
                                    excluding Saturday and Sunday, which will be on 23 April 2024 (Tuesday).
                                </p>
                                <br />
                                <p>You can disable this feature by setting it to 0 days. Please ensure that the days you input are integers i.e., 1, 2, 3, 4...</p>
                            </div>
                            <div className="flex">
                                <label htmlFor="durationInput" className="text-slate-800 dark:text-dark_text font-bold text-sm lg:text-base mt-2">
                                    Duration
                                </label>
                                <input
                                    id="durationInput"
                                    type="number"
                                    className="border border-gray-300 p-[6px] lg:p-2 rounded-md ml-10 text-sm lg:text-base mr-3"
                                    value={applicantDuration}
                                    onChange={handleApplicantDurationChange}
                                    min={0}
                                    max={365}
                                />
                                <span className="mt-2">day(s)</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-900 dark:text-dark_text mb-3 text-justify text-sm lg:text-base">
                                <p className="font-bold underline text-[18px] mt-1 lg:mt-0">Academic Administration Office</p>
                                <p className="mt-1 lg:mt-0">
                                    For this, you may navigate to the Nominations/ Travelling Forms Page and look for the <span className="italic">Important</span> tab.
                                    This option allows you to specify how many day(s) later will you be able to remind the relevant party.
                                </p>
                                <br />
                                <p>You can disable this feature by setting it to 0 days. Please ensure that the days you input are integers i.e., 1, 2, 3, 4...</p>
                            </div>
                            <div className="flex">
                                <label htmlFor="durationInputAAO" className="text-slate-800 dark:text-dark_text font-bold text-sm lg:text-base mt-2">
                                    Duration
                                </label>
                                <input
                                    id="durationInputAAO"
                                    type="number"
                                    className="border border-gray-300 p-[6px] lg:p-2 rounded-md ml-10 text-sm lg:text-base mr-3"
                                    value={aaoDuration}
                                    onChange={handleAAODurationChange}
                                    min={0}
                                    max={365}
                                />
                                <span className="mt-2">day(s)</span>
                            </div>
                        </div>
                        <Button className="mt-4 lg:self-end" onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="ml-[38px]">
                    <p className="text-slate-800 dark:text-dark_text text-sm lg:text-base">Change the timeframe of when applicant&apos;s or Academic Administration Office Staff can send a reminder.</p>
                </div>
            )}
        </div>
    );
};

export default ExternalSettings;
