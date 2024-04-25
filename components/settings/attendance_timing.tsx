"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle, IoMdArrowDropdownCircle } from "react-icons/io";
import React, { useEffect, useState } from "react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const AttendanceTiming = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [timingData, setTimingData] = useState({ timID: "", timStartTime: 15, timEndTime: 15 });
    const [selectedStartTime, setSelectedStartTime] = useState(15);
    const [selectedEndTime, setSelectedEndTime] = useState(15);
    const [showContent, setShowContent] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
        setTimeout(() => {
            setShowContent(!showContent);
        }, 500); // Adjust the delay time as needed
    };

    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchAttendanceTiming();
    }, [])

    const fetchAttendanceTiming = async () => {
        const { data, error } = await supabase
            .from("attendance_timing")
            .select("timID, timStartTime, timEndTime")

        if (error) {
            toast.error("There was an error fetching the times.")
        } else {
            const { timID, timStartTime, timEndTime } = data[0];
            setTimingData({ timID, timStartTime, timEndTime });
            setSelectedStartTime(timStartTime);
            setSelectedEndTime(timEndTime);
        }
    }

    const handleStartTimeChange = (event: { target: { value: any; }; }) => {
        setSelectedStartTime(Number(event.target.value));
    };

    const handleEndTimeChange = (event: { target: { value: any; }; }) => {
        setSelectedEndTime(Number(event.target.value));
    };

    const handleSaveChanges = async () => {
        // Update the timing in the database
        const { error } = await supabase
            .from("attendance_timing")
            .update({ timStartTime: selectedStartTime, timEndTime: selectedEndTime })
            .eq("timID", timingData.timID);

        if (error) {
            toast.error("Error updating timing.");
        } else {
            toast.success("Timing updated successfully.");
            fetchAttendanceTiming();
        }
    };

    return (
        <div
            className="text-left transition-max-h duration-300 ease-in-out w-full"
        >
            <div className="flex">
                <div onClick={toggleExpansion} className="mr-2 cursor-pointer">
                    {isExpanded ? (
                        <IoMdArrowDropdownCircle className="text-[27px] lg:text-[30px] dark:text-dark_text" />
                    ) : (
                        <IoMdArrowDroprightCircle className="text-[27px] lg:text-[30px] dark:text-dark_text" />
                    )}
                </div>
                <h1 className="font-bold dark:text-dark_text text-[18px] lg:text-[20px]">Attendance Timing</h1>
            </div>

            {isExpanded ? (
                <div className="transition-max-h duration-300 ease-linear w-full">
                    <div className="overflow-y-auto max-h-80 flex flex-col justify-between mt-1">
                        <div className="text-slate-900 dark:text-dark_text mb-3 text-justify text-sm lg:text-base">
                            <p>Please take note,</p>
                            <br />
                            <p>
                                Start time means how early it will open before the event start time i.e., if you select 15 minutes and you have set your event at 9:00AM, the attendance
                                forms will open at 8:45AM. This is true for all events. Same goes to end time.
                            </p>
                        </div>
                        <div className="flex">
                            <label htmlFor="startTime" className="text-slate-800 dark:text-dark_text font-bold text-sm lg:text-base">
                                Start Time:
                            </label>
                            <select id="startTime" className="border border-gray-300 p-[6px] lg:p-2 rounded-md ml-10 text-sm lg:text-base" value={selectedStartTime} onChange={handleStartTimeChange}>
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>1 hour</option>
                            </select>
                        </div>
                        <div className="flex mt-3 lg:mt-2">
                            <label htmlFor="endTime" className="text-slate-800 dark:text-dark_text font-bold text-sm lg:text-base">
                                End Time:
                            </label>
                            <select id="endTime" className="border border-gray-300 p-[6px] lg:p-2 rounded-md ml-12 text-sm lg:text-base" value={selectedEndTime} onChange={handleEndTimeChange}>
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>1 hour</option>
                            </select>
                        </div>
                        {/* <button className="mt-4 bg-slate-800 text-gray-100 font-semibold text-[15px] lg:text-base px-3 lg:px-4 py-[6px] lg:py-2 rounded-md hover:bg-slate-900 self-center lg:self-end" onClick={handleSaveChanges}>
                        Save Changes
                    </button> */}
                        <Button className="mt-4 lg:self-end" onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="ml-[38px]">
                    <p className="text-slate-800 dark:text-dark_text text-sm lg:text-base">Change how early an attendance forms should open or delay it from closing.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceTiming;
