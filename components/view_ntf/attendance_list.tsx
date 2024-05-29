"use client";

import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

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
    attFormsCertofParticipation: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ atIdentifier, atIdentifier2 }) => {
    const supabase = createClientComponentClient();
    const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
    const [filteredAttendanceList, setFilteredAttendanceList] = useState<Attendance[]>([]);
    const [totalHours, setTotalHours] = useState<number>(0);
    const [totalEventCount, setTotalEventCount] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [uniqueYears, setUniqueYears] = useState<number[]>([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const queryEmail = supabase
                    .from("attendance_forms")
                    .select("attFSubEventID, attDateSubmitted, attFormsCertofParticipation")
                    .eq('attFormsStaffEmail', atIdentifier);

                let attendanceFormsID: any[] = [];
                if (atIdentifier2 && atIdentifier2 != '0') {
                    const queryID = supabase
                        .from("attendance_forms")
                        .select("attFSubEventID, attDateSubmitted, attFormsCertofParticipation")
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
                // Filter attendance forms based on the selected year
                const filteredAttendanceForms = selectedYear
                    ? attendanceForms.filter((form) => {
                        const formDate = new Date(form.attDateSubmitted);
                        return formDate.getFullYear() === selectedYear;
                    })
                    : attendanceForms;

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
                const combinedData = filteredAttendanceForms.map((form) => {
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
                        attFormsCertofParticipation: form.attFormsCertofParticipation
                    };
                });

                const sumTotalHours = combinedData.reduce((total, att) => total + parseFloat(att.intFTotalHours), 0);
                setTotalHours(sumTotalHours);

                setAttendanceList(combinedData);
                // Get unique years from the attendance list
                const years = Array.from(new Set(combinedData.map((att) => new Date(att.attDateSubmitted).getFullYear())));
                setUniqueYears(years);
                setAttendanceList(combinedData);
                setFilteredAttendanceList(combinedData);
            } catch (e) {
                // console.error('Error in fetchData:', e);
            }
        };
        fetchData();
    }, [atIdentifier]);

    useEffect(() => {
        // Filter attendance forms based on the selected year
        const filteredData = selectedYear
            ? attendanceList.filter((form) => {
                const formDate = new Date(form.attDateSubmitted);
                return formDate.getFullYear() === selectedYear;
            })
            : attendanceList;

        setFilteredAttendanceList(filteredData);

        // Calculate total hours for the filtered data
        const sumTotalHours = filteredData.reduce((total, att) => total + parseFloat(att.intFTotalHours), 0);
        setTotalHours(sumTotalHours);
        // Update the total event count
        const totalEventCount = filteredData.length;
        setTotalEventCount(totalEventCount);
    }, [selectedYear, attendanceList]);

    useEffect(() => {
        // Get unique years from the original attendance list
        const years = Array.from(new Set(attendanceList.map((att) => new Date(att.attDateSubmitted).getFullYear())));
        setUniqueYears(years);
    }, [attendanceList]);

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
                <p className="text-[16px] italic">Total Event(s) Attended Count: {totalEventCount}</p>
                <p className="text-[16px] italic">Total Hours: {totalHours}</p>
            </div>

            <div className="mt-5 flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="dark:text-dark_text">
                            Year <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => {
                                setSelectedYear(null);
                            }}
                        >
                            View All
                        </DropdownMenuItem>
                        {uniqueYears.map((year) => (
                            <DropdownMenuItem
                                key={year}
                                onClick={() => {
                                    setSelectedYear(year);
                                }}
                            >
                                {year}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mt-5">
                {filteredAttendanceList.length > 0 && (
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
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/6">
                                        Certificate of Participation
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendanceList.map((att, index) => (
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
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {att.attFormsCertofParticipation ? (
                                                <div>
                                                    <Button>
                                                        <a
                                                            href={`https://chyamrnpbrtxhsvkqpry.supabase.co/storage/v1/object/public/attFormsCertofParticipation/${att.attFormsCertofParticipation}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >View</a>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div> N/A</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AttendanceList;
