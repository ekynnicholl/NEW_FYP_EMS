"use client";

import ViewAttendance_Modal from "@/components/ViewAttendance_Modal";
import PencilNoteIcon from "@/components/icons/PencilNoteIcon";
import { ChangeEvent, ReactNode, useEffect, useRef, useState, MouseEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Chart, { registerables } from "chart.js/auto";
import AttendanceTable from "@/components/tables/attendanceTable";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ImportAttendanceComponent from "./import_attendance";

type SubEventsDataType = {
    sub_eventsMainID: string;
    sub_eventsID: string;
    sub_eventsName: string;
    sub_eventsVenue: string;
    sub_eventsStartDate: string;
    sub_eventsEndDate: string;
    sub_eventsStartTime: string;
    sub_eventsEndTime: string;
    sub_eventsOrganizer: string;
    sub_eventsFaculty: string;
    sub_eventsMaxSeats: string;
}

type AttendanceDataType = {
    attFormsCertofParticipation: string;
    attFormsID: string;
    attFSubEventID: string;
    attFormsStaffID: string;
    attFormsStaffName: string;
    attFormsFacultyUnit: string;
    attDateSubmitted: string;
    sub_eventName: string;
    sub_eventVenue: string;
    attFormsStaffEmail: string;
    attFormsYearofStudy: string;
};

interface Props {
    event_id: string;
};

const AttendanceList: React.FC<Props> = ({ event_id }) => {
    Chart.register(ChartDataLabels);
    const supabase = createClientComponentClient();

    // This is for attendance modal,
    const [attendanceData, setAttendanceData] = useState<AttendanceDataType[]>([]);
    const [attendanceMainEventID, setAttendanceMainEventID] = useState("");
    const [subEventsForAttendance, setSubEventsForAttendance] = useState<SubEventsDataType[]>([]);
    const [filteredAttendanceData, setFilteredAttendanceData] = useState<AttendanceDataType[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'staff' | 'student' | 'visitor' | 'secondary' | 'teacher'>('all');
    const [searchAttendanceQuery, setSearchAttendanceQuery] = useState("");

    // This is for attendance table in homepage pagination,
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
    };

    // This is for the pie chart,
    const [selectedSubEvent, setSelectedSubEvent] = useState<string>("");
    const chartContainer = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart<"bar", number[], string> | null>(null);
    const [isAllButtonActive, setIsAllButtonActive] = useState(true);

    useEffect(() => {
        openAttendanceModal(event_id);
    }, []);

    // This is for attendance modal,
    const openAttendanceModal = async (event_id: string) => {
        try {
            // Fetch sub-events for the given event,
            const { data: subEvents, error: subEventsError } = await supabase
                .from("sub_events")
                .select()
                .eq("sub_eventsMainID", event_id)
                .eq("sub_eventsIsHidden", 0);

            if (subEventsError) {
                // console.error("Error fetching sub_events:", subEventsError);
                return;
            }

            const subEventNameMap: { [key: string]: string } = {};
            const subEventVenueMap: { [key: string]: string } = {};
            subEvents.forEach(subEvent => {
                subEventNameMap[subEvent.sub_eventsID] = subEvent.sub_eventsName;
                subEventVenueMap[subEvent.sub_eventsID] = subEvent.sub_eventsVenue;
            });

            // Set the main ID for the, 
            setAttendanceMainEventID(event_id);
            setSubEventsForAttendance(subEvents);

            // Extract the subEventID values from the fetched sub_events
            const subEventIDs = subEvents.map((subEvent) => subEvent.sub_eventsID);

            // Fetch all attendance_forms related to those sub_events
            const { data: attendanceForms, error: formsError } = await supabase
                .from("attendance_forms")
                .select()
                .in("attFSubEventID", subEventIDs)
                .order("attDateSubmitted", { ascending: true });

            if (formsError) {
                // console.error("Error fetching attendance forms:", formsError);
                return;
            }

            const attendanceDataWithSubEventNames = attendanceForms.map(attendanceItem => ({
                ...attendanceItem,
                sub_eventName: subEventNameMap[attendanceItem.attFSubEventID],
                sub_eventVenue: subEventVenueMap[attendanceItem.attFSubEventID],
            }));

            // Set the attendance data for the main event,
            setAttendanceData(attendanceDataWithSubEventNames);

            // Fetch the attendance list for that event,
            fetchAttendanceList(event_id);

            // console.log("Attendance forms data lalalala:", attendanceDataWithSubEventNames);
        } catch (error) {
            // const typedError = error as Error;
            // console.error("Error:", typedError.message);
        }
    };

    useEffect(() => {
        const suggestionsSubscription = supabase
            .channel('attendance_forms')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_forms' }, handleInserts)
            .subscribe()

        fetchAttendanceList(event_id);

        return () => {
            suggestionsSubscription?.unsubscribe();
        };
    }, []);

    const handleInserts = (payload: any) => {
        setAttendanceData((attendanceData) => [...attendanceData, payload.new]);
    }

    const fetchAttendanceList = async (event_id: string) => {
        const { data: subEvents, error: subEventsError } = await supabase
            .from("sub_events")
            .select()
            .eq("sub_eventsMainID", event_id);

        if (subEventsError) {
            console.error("Error fetching sub_events:", subEventsError);
            return;
        }

        const subEventNameMap: { [key: string]: string } = {};
        const subEventVenueMap: { [key: string]: string } = {};
        subEvents.forEach(subEvent => {
            subEventNameMap[subEvent.sub_eventsID] = subEvent.sub_eventsName;
            subEventVenueMap[subEvent.sub_eventsID] = subEvent.sub_eventsVenue;
        });

        // Extract the subEventID values from the fetched sub_events
        const subEventIDs = subEvents.map(subEvent => subEvent.sub_eventsID);

        // Now, fetch the attendance_forms related to those sub_events
        const { data: attendanceForms, error: formsError } = await supabase
            .from("attendance_forms")
            .select()
            .in("attFSubEventID", subEventIDs)
            .order("attDateSubmitted", { ascending: true });

        if (formsError) {
            console.error("Error fetching attendance forms:", formsError);
            return;
        } else {
            const attendanceDataWithSubEventNames = attendanceForms.map(attendanceItem => ({
                ...attendanceItem,
                sub_eventName: subEventNameMap[attendanceItem.attFSubEventID],
                sub_eventVenue: subEventVenueMap[attendanceItem.attFSubEventID],
            }));

            setAttendanceData(attendanceDataWithSubEventNames);
            setSelectedSubEvent("");

            const facultyCounts: { [key: string]: number } = {};

            attendanceForms.forEach(attendanceItem => {
                const faculty = attendanceItem.attFormsFacultyUnit;
                if (facultyCounts[faculty]) {
                    facultyCounts[faculty]++;
                } else {
                    facultyCounts[faculty] = 1;
                }
            });

            const facultyLabels = Object.keys(facultyCounts);
            const facultyData = facultyLabels.map(label => facultyCounts[label]);

            const canvas = chartContainer.current;
            createHorizontalBarChart(canvas, facultyLabels, facultyData);
        }
    };

    useEffect(() => {
        if (filteredAttendanceData && filteredAttendanceData.length > 0) {
            // Calculate labels (faculty/unit) and label data (counts)
            const facultyCounts: { [key: string]: number } = {};

            filteredAttendanceData.forEach(attendanceItem => {
                const faculty = attendanceItem.attFormsFacultyUnit;
                if (facultyCounts[faculty]) {
                    facultyCounts[faculty]++;
                } else {
                    facultyCounts[faculty] = 1;
                }
            });

            const facultyLabels = Object.keys(facultyCounts);
            const facultyData = facultyLabels.map(label => facultyCounts[label]);

            const canvas = chartContainer.current;

            if (canvas) {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                createHorizontalBarChart(canvas, facultyLabels, facultyData);
            }
        }
    }, [filteredAttendanceData]);

    // Bar chart,
    const createHorizontalBarChart = (
        chartContainer: HTMLCanvasElement | null,
        labels: string[],
        data: number[]
    ) => {
        if (chartContainer) {
            const ctx = chartContainer.getContext('2d');
            // console.log("test");

            if (ctx) {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                Chart.register(...registerables);

                const getRandomColor = () => {
                    const letters = '0123456789ABCDEF';
                    let color = '#';
                    for (let i = 0; i < 6; i++) {
                        color += letters[Math.floor(Math.random() * 16)];
                    }
                    return color;
                };

                const backgroundColor = [];
                const borderColor = [];
                const colorSet = new Set();

                while (backgroundColor.length < 21) {
                    const color = getRandomColor();
                    if (!colorSet.has(color)) {
                        backgroundColor.push(color);
                        borderColor.push(color);
                        colorSet.add(color);
                    }
                }

                const modifiedLabels = labels.map((label) => label.split(' - '));
                const maxDataValue = Math.max(...data) + 1;

                //@ts-ignore
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: modifiedLabels,
                        datasets: [
                            {
                                data: data,
                                backgroundColor: backgroundColor,
                                borderColor: borderColor,
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            datalabels: {
                                color: '#000000',
                                align: 'end',
                                anchor: 'end',
                                formatter: (value: number) => {
                                    return value.toString();
                                },
                            },
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    stepSize: 1,
                                },
                                suggestedMax: maxDataValue,
                            },
                            y: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                    },
                });
            }
        }
    };

    const handleSubEventClick = async (subEvent: SubEventsDataType, type: number) => {
        if (type == 1) {
            try {
                // Fetch attendance data for the selected sub-event
                setSelectedSubEvent(subEvent.sub_eventsID);
                const { data: attendanceForms, error: formsError } = await supabase
                    .from("attendance_forms")
                    .select()
                    .eq("attFSubEventID", subEvent.sub_eventsID);

                if (formsError) {
                    console.error("Error fetching attendance forms:", formsError);
                    return;
                }

                // Fetch the sub-event name,
                const { data: subEvents, error: subEventsError } = await supabase
                    .from("sub_events")
                    .select()
                    .eq("sub_eventsID", subEvent.sub_eventsID);

                if (subEventsError) {
                    console.error("Error fetching sub_events:", subEventsError);
                    return;
                } else {
                    const subEventNameMap: { [key: string]: string } = {};
                    subEvents.forEach(subEvent => {
                        subEventNameMap[subEvent.sub_eventsID] = subEvent.sub_eventsName;
                    });

                    const attendanceDataWithSubEventNames = attendanceForms.map(attendanceItem => ({
                        ...attendanceItem,
                        sub_eventName: subEventNameMap[attendanceItem.attFSubEventID],
                    }));

                    setAttendanceData(attendanceDataWithSubEventNames);
                }
            } catch (error) {
                const typedError = error as Error;
                console.error("Error:", typedError.message);
            }
        }
    };

    const handleAttendanceSearch = (query: string) => {
        setSearchAttendanceQuery(query);
        filterAttendanceData(activeTab, query);
    };

    const filterAttendanceData = (tab: 'all' | 'staff' | 'student' | 'visitor' | 'secondary' | 'teacher', query: string) => {
        let filteredData = attendanceData;

        if (tab === 'staff') {
            filteredData = attendanceData.filter((item) => item.attFormsStaffID.startsWith('SS'));
        } else if (tab === 'student') {
            filteredData = attendanceData.filter((item) => item.attFormsStaffID !== '0' && !item.attFormsStaffID.startsWith('SS') && item.attFormsStaffID !== '1' && item.attFormsStaffID !== '2');
        } else if (tab === 'visitor') {
            filteredData = attendanceData.filter((item) => item.attFormsStaffID === '0');
        } else if (tab === 'secondary') {
            filteredData = attendanceData.filter((item) => item.attFormsStaffID === '1');
        } else if (tab === 'teacher') {
            filteredData = attendanceData.filter((item) => item.attFormsStaffID === '2');
        }

        // Apply search filter
        if (query) {
            filteredData = filteredData.filter((item) => {
                return (
                    item.attFormsStaffName.toLowerCase().includes(query.toLowerCase()) ||
                    item.attFormsStaffID.toLowerCase().includes(query.toLowerCase())
                );
            });
        }

        setFilteredAttendanceData(filteredData);
    };

    useEffect(() => {
        filterAttendanceData(activeTab, searchAttendanceQuery);
    }, [activeTab, searchAttendanceQuery, attendanceData]);

    useEffect(() => {
        setActiveTab('all');
    }, [selectedSubEvent, isAllButtonActive])

    let dynamicHeight;

    if (itemsPerPage == 5) {
        dynamicHeight = 'h-[1050px]'
    } else if (itemsPerPage == 10) {
        dynamicHeight = 'h-[1900px]'
    } else if (itemsPerPage == 20) {
        dynamicHeight = 'h-[2500px]'
    }

    return (
        <div>
            <div className="lg:flex lg:flex-row h-[90vh] overflow-y-auto">
                <div className={`${attendanceData && attendanceData.length > 0 ? 'lg:w-full lg:h-[700px] h-[1650px]' : 'w-full lg:h-[450px] h-[300px]'}`}>
                    <div className="flex items-start justify-start text-text text-[20px] text-center">
                        <PencilNoteIcon />{" "}
                        <span className="ml-5 lg:-mt-1 lg:text-[20px] text-[16px]">Attendance List</span>
                    </div>
                    <div className="text-left text-black lg:text-[13px] text-[12px] pb-5 ml-11">
                        Total Attendees: {attendanceData.length}
                    </div>
                    <div className="flex flex-wrap">
                        <button
                            className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 ${isAllButtonActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                }`}
                            onClick={() => {
                                setIsAllButtonActive(true);
                                fetchAttendanceList(attendanceMainEventID);
                            }}
                        >
                            All
                        </button>
                        {subEventsForAttendance.map((subEvent) => (
                            <div
                                key={subEvent.sub_eventsID}
                                className={`font-bold items-center rounded-lg hover:bg-red-200 lg:text-[15px] text-[12px] shadow-sm mb-3.5 p-2 mr-2 ${selectedSubEvent === subEvent.sub_eventsID ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}
                            >
                                <button
                                    onClick={() => {
                                        setIsAllButtonActive(false);
                                        handleSubEventClick(subEvent, 1);
                                    }}
                                >
                                    {subEvent.sub_eventsName}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2 pb-5">
                        <button
                            onClick={() => {
                                // Handle the refresh button click here
                                fetchAttendanceList(attendanceMainEventID);
                                setIsAllButtonActive(true);
                            }}
                            className="font-bold hidden lg:flex items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 shadow-sm px-4 py-2 bg-slate-200 text-slate-800"
                        >
                            Refresh
                        </button>

                        {selectedSubEvent != null && selectedSubEvent !== '' && <ImportAttendanceComponent selectedSubEvent={selectedSubEvent} />}
                    </div>

                    {/* This is to loop through the attendance data. */}
                    {attendanceData && attendanceData.length > 0 ? (
                        <div className="lg:text-[16px] text-[12px]">
                            <div className="flex flex-row">
                                <button
                                    className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-slate-300 mb-3.5 shadow-sm md:inline-flex ${activeTab === 'all' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                        }`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-slate-300 mb-3.5 shadow-sm md:inline-flex ${activeTab === 'staff' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                        }`}
                                    onClick={() => setActiveTab('staff')}
                                >
                                    Staff
                                </button>
                                <button
                                    className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-red-200 mb-3.5 shadow-sm md:inline-flex ${activeTab === 'student' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                        }`}
                                    onClick={() => setActiveTab('student')}
                                >
                                    Student
                                </button>
                                <button
                                    className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-red-200 mb-3.5 shadow-sm md:inline-flex ${activeTab === 'visitor' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                        }`}
                                    onClick={() => setActiveTab('visitor')}
                                >
                                    Visitor
                                </button>
                                <button
                                    className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-red-200 mb-3.5 shadow-sm md:inline-flex ${activeTab === 'secondary' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                        }`}
                                    onClick={() => setActiveTab('secondary')}
                                >
                                    Secondary
                                </button>
                                <button
                                    className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-red-200 mb-3.5 shadow-sm md:inline-flex ${activeTab === 'teacher' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                        }`}
                                    onClick={() => setActiveTab('teacher')}
                                >
                                    Teacher
                                </button>
                            </div>
                            <div className="hidden lg:block">
                                <label htmlFor="itemsPerPageSelect">Show entries:</label>
                                <select
                                    id="itemsPerPageSelect"
                                    name="itemsPerPage"
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                    className="ml-2 h-full rounded-l border bg-white border-gray-400 mb-5 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                </select>
                            </div>

                            {/* Search Input */}
                            <div className="max-w-full relative float-right shadow hover:shadow-sm border border-slate-300 rounded mr-3 hover:transition duration-300 transform hover:scale-105">
                                <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4 fill-current text-gray-500">
                                        <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                                    </svg>
                                </span>
                                <input
                                    placeholder="Search here..."
                                    className="appearance-none rounded-md block pl-8 pr-6 py-2 bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none dark:bg-dark_mode_card dark:border-[#2E3E50] dark:placeholder:text-[#484945]"
                                    value={searchAttendanceQuery}
                                    onChange={e => handleAttendanceSearch(e.target.value)}
                                />
                            </div>
                            <div className="h-[450px]">
                                {/* {filteredAttendanceData && searchAttendanceQuery.length > 0 ? (
                                    <AttendanceTable attendanceData={filteredAttendanceData} itemsPerPage={itemsPerPage} isAllTabActive={isAllButtonActive} attendanceMainEventID={attendanceMainEventID}/>
                                ) : (
                                    <AttendanceTable attendanceData={filteredAttendanceData} itemsPerPage={itemsPerPage} isAllTabActive={isAllButtonActive} />
                                )} */}
                                <AttendanceTable attendanceData={filteredAttendanceData} itemsPerPage={itemsPerPage} isAllTabActive={isAllButtonActive} attendanceMainEventID={attendanceMainEventID} categoryTab={activeTab} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-600 mt-4">
                            No attendance data available.
                        </div>
                    )}
                </div>
                {filteredAttendanceData && filteredAttendanceData.length > 0 ? (
                    <div className="lg:flex lg:flex-col lg:items-center lg:justify-center mt-24 pr-5 pl-5">
                        <div className="text-center font-bold lg:text-[16px] text-[14px]">Number of Attendees Each Faculty/ Unit</div>
                        <div className="w-[400px] h-[400px] lg:w-[650px] lg:h-[750px] mt-5">
                            <canvas id="attendanceFacultyPieChart" ref={chartContainer} />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AttendanceList;