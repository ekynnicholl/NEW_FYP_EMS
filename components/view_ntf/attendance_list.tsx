"use client";

import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AttendanceListProps {
    atIdentifier: string | null;
    atIdentifier2: string | null;
}

interface Attendance {
    attFSubEventID: string;
    attDateSubmitted: string;
    sub_eventsID: string;
    sub_eventsName: string;
    sub_eventsMainID: string;
    intFEventName: string;
    intFID: string;
    intFTotalHours: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ atIdentifier, atIdentifier2 }) => {
    const supabase = createClientComponentClient();
    const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
    const [totalHours, setTotalHours] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const queryEmail = supabase
                    .from("attendance_forms")
                    .select("attFSubEventID, attDateSubmitted")
                    .eq('attFormsStaffEmail', atIdentifier);

                let attendanceFormsID: any[] = [];
                if (atIdentifier2 && atIdentifier2 != '0') {
                    const queryID = supabase
                        .from("attendance_forms")
                        .select("attFSubEventID, attDateSubmitted")
                        .eq('attFormsStaffID', atIdentifier2);
                    const { data: attendanceFormsIDData, error: errorID } = await queryID.order("attDateSubmitted");
                    if (errorID) {
                        // Handle errors
                        return;
                    }
                    attendanceFormsID = attendanceFormsIDData || [];
                }

                const { data: attendanceFormsEmail, error: errorEmail } = await queryEmail.order("attDateSubmitted");

                if (errorEmail) {
                    // Handle errors
                    return;
                }

                // Combine the results
                const attendanceForms = [
                    ...attendanceFormsEmail,
                    ...attendanceFormsID.filter(formID =>
                        !attendanceFormsEmail.some(formEmail => formEmail.attFSubEventID === formID.attFSubEventID)
                    )
                ];

                // console.log(attendanceForms);

                // Fetch data from sub_events
                const subEventIDs = attendanceForms.map((form) => form.attFSubEventID);
                const { data: subEvents, error: subEventsError } = await supabase
                    .from("sub_events")
                    .select("sub_eventsID, sub_eventsMainID, sub_eventsName")
                    .in("sub_eventsID", subEventIDs);

                if (subEventsError) {
                    // Handle error
                    return;
                }

                // Fetch data from internal_events
                const subEventMainIDs = subEvents.map((subEvent) => subEvent.sub_eventsMainID);
                const { data: internalEvents, error: internalEventsError } = await supabase
                    .from("internal_events")
                    .select("intFID, intFEventName, intFTotalHours")
                    .in("intFID", subEventMainIDs);

                if (internalEventsError) {
                    // Handle error
                    return;
                }

                // Combine data based on conditions
                const combinedData = attendanceForms.map((form) => {
                    const subEvent = subEvents.find((sub) => sub.sub_eventsID === form.attFSubEventID);
                    const intEvent = internalEvents.find((int) => int.intFID === subEvent?.sub_eventsMainID);

                    return {
                        attFSubEventID: form.attFSubEventID,
                        attDateSubmitted: form.attDateSubmitted,
                        sub_eventsID: subEvent?.sub_eventsID || '',
                        sub_eventsMainID: subEvent?.sub_eventsMainID || '',
                        sub_eventsName: subEvent?.sub_eventsName || '',
                        intFID: intEvent?.intFID || '',
                        intFEventName: intEvent?.intFEventName || '',
                        intFTotalHours: intEvent?.intFTotalHours.toString() || '0',
                    };
                });

                const sumTotalHours = combinedData.reduce((total, att) => total + parseFloat(att.intFTotalHours), 0);
                setTotalHours(sumTotalHours);

                setAttendanceList(combinedData);
            } catch (e) {
                // console.error('Error in fetchData:', e);
            }
        };

        fetchData();
    }, [atIdentifier]);

    const formatDate = (timestamp: string) => {
        const dateObj = new Date(timestamp);
        const date = dateObj.toDateString();
        const time = dateObj.toLocaleTimeString();
        return { date, time };
    };

    return (
        <div>
            <div className="text-justify pr-5">
                <p className="text-[20px] font-bold">Past Attended Event(s)</p>
                <p className="text-[16px] italic">Total Event(s) Attended Count: {attendanceList.length}</p>
                <p className="text-[16px] italic">Total Hours: {totalHours}</p>
            </div>

            <div className="mt-5">
                {attendanceList.length > 0 && (
                    <div className="max-w-screen-lg max-h-[400px] overflow-x-auto">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        No.
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Event Name
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Date
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Hour(s) Spent
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceList.map((att, index) => (
                                    <tr key={index}>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {index + 1}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {att.intFEventName} - {att.sub_eventsName}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {formatDate(att.attDateSubmitted).date}, {formatDate(att.attDateSubmitted).time}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {att.intFTotalHours}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
};

export default AttendanceList;