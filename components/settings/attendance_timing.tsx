"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle } from "react-icons/io";
import React, { useEffect, useState } from "react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";

const AttendanceTiming = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [timingData, setTimingData] = useState({ timID: "", timStartTime: 15, timEndTime: 15 });
    const [selectedStartTime, setSelectedStartTime] = useState(15);
    const [selectedEndTime, setSelectedEndTime] = useState(15);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
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
            className={`pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left transition-max-w duration-300 ease-in-out ${isExpanded ? "lg:max-w-[40%]" : "max-w-[400px]"
                }`}
        >
            <div className="flex items-center">
                <h1 className="font-bold text-[20px] dark:text-dark_text">Attendance Timing</h1>

                <div onClick={toggleExpansion} className="ml-auto cursor-pointer">
                    {isExpanded ? (
                        <IoMdArrowDropleftCircle className="text-[30px] dark:text-dark_text" />
                    ) : (
                        <IoMdArrowDroprightCircle className="text-[30px] dark:text-dark_text" />
                    )}
                </div>
            </div>
            <div className="border-t border-gray-300 my-2"></div>
            {isExpanded ? (
                <div className="overflow-y-auto max-h-80 flex flex-col justify-between">
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
                    <button className="mt-4 bg-slate-800 text-gray-100 font-semibold text-[15px] lg:text-base px-3 lg:px-4 py-[6px] lg:py-2 rounded-md hover:bg-slate-900 self-center lg:self-end" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-slate-800 dark:text-dark_text text-sm lg:text-base">Change how early an attendance forms should open or delay it from closing.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceTiming;
