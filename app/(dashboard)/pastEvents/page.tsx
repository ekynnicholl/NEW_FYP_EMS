"use client";

import Image from "next/image";
import Link from 'next/link';
import EventListModal from "@/components/Event_List_Modal";
import filterBar from "@/public/images/filter_bar_black.png";
import exportCSV from "@/public/images/export_csv.png";
import arrowLeft from "@/public/images/arrow_left.png";
import arrowRight from "@/public/images/arrow_right.png";
import skipLeft from "@/public/images/skip_left.png";
import skipRight from "@/public/images/skip_right.png";

import { FaSortAlphaUp, FaCalendarAlt } from "react-icons/fa";
import { IoMdRefresh, IoIosArrowBack } from "react-icons/io";
import { AiOutlineFieldTime } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { Chart } from 'chart.js/auto';

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PencilNoteIcon from "@/components/icons/PencilNoteIcon";
import ViewAttendance_Modal from "@/components/ViewAttendance_Modal";
import useViewModeStore from '@/components/zustand/viewModeStorage';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AttendanceTable from "@/components/tables/attendanceTable";

type mainEvent = {
	intFID: string;
	intFEventName: string;
	intFEventDescription: string;
	intFEventStartDate: string;
	intFEventEndDate: string;
};

type subEvents = {
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
	attFormsID: string;
	attFSubEventID: string;
	attFormsStaffID: string;
	attFormsStaffName: string;
	attFormsFacultyUnit: string;
};

export default function Home() {
    const supabase = createClientComponentClient();
    
    const [entriesToShow, setEntriesToShow] = useState(10); // Show the entries
    const [searchQuery, setSearchQuery] = useState(""); // Search queries for search bar
    const [searchAttendanceQuery, setSearchAttendanceQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // Define state for current page
    const [activePage, setActivePage] = useState(1); // Define state for active page
    const [sortBy, setSortBy] = useState(""); // Initialize state for sorting
    const [sortOrder, setSortOrder] = useState("asc"); // Initialize sort order (asc or desc)
    const [showSortOptions, setShowSortOptions] = useState(false); // State to control dropdown visibility
    
    const [subEvents, setSubEvents] = useState<subEvents[]>([]);
    
    const [mainEvent, setMainEvent] = useState<mainEvent>({} as mainEvent);
	const [mainEvents, setMainEvents] = useState<mainEvent[]>([] as mainEvent[]);
    
    const [selectedEvent, setSelectedEvent] = useState({
		intFID: "",
		intFEventName: "",
		intFEventDescription: "",
		intFEventStartDate: "",
		intFEventEndDate: "",
		sub_eventsID: "",
		sub_eventsMainID: "",
		sub_eventsName: "",
		sub_eventsVenue: "",
		sub_eventsStartDate: "",
		sub_eventsEndDate: "",
		sub_eventsStartTime: "",
		sub_eventsEndTime: "",
		sub_eventsMaxSeats: "",
		sub_eventsOrganizer: "",
		sub_eventsFaculty: "",
	});


    // This is for attendance modal,
	const [attendanceData, setAttendanceData] = useState<AttendanceDataType[]>([]);
	const [showAttendanceModal, setShowAttendanceModal] = useState(false);
	const [attendanceMainEventID, setAttendanceMainEventID] = useState("");
	const [subEventsForAttendance, setSubEventsForAttendance] = useState<subEvents[]>([]);
    const [filteredAttendanceData, setFilteredAttendanceData] = useState<AttendanceDataType[]>([]);

	// This is for the pie chart,
	const [selectedSubEvent, setSelectedSubEvent] = useState<string>("");
	const chartContainer = useRef<HTMLCanvasElement | null>(null);
	const chartInstanceRef = useRef<Chart<"pie", number[], string> | null>(null);
	const [isAllButtonActive, setIsAllButtonActive] = useState(true);
	const viewMode = useViewModeStore((state) => state.viewMode);


    const [showSubEventModal, setShowSubEventModal] = useState(false);

    useEffect(() => {
        const fetchMainEvents = async () => {
            // Get the current date
            const currentDate = new Date().toISOString();

            // Fetch events where the start date is in the future
            const { data: mainEventData, error: internalError } = await supabase
                .from("internal_events")
                .select("*")
                .lt('intFEventEndDate', currentDate)
                .order("intFEventStartDate", { ascending: true })
                .select();

            if (internalError) {
                console.error("Error fetching past event:", internalError);
                return;
            }

            setMainEvents(mainEventData || []);
            
            // Fetch data from sub_events table where sub_eventsMainID equals intFID
			const subEventQuery = await supabase
                .from("sub_events")
                .select(
                    "*",
                )
                .in("sub_eventsMainID", mainEventData.map(event => event.intFID));
                
                if (subEventQuery.error) {
                    console.error("Error fetching sub_events:", subEventQuery.error);
                    return;
                }

                setSubEvents(subEventQuery.data);
            };

        fetchMainEvents();

    }, [supabase]);

    const openModal = async (
		event_id: string,
		event_name: string,
		event_description: string,
		event_start_date: string,
		event_end_date: string,
		sub_event_id: string,
		sub_eventMain_id: string,
		sub_event_name: string,
		sub_event_venue: string,
		sub_event_start_date: string,
		sub_event_end_date: string,
		sub_event_start_time: string,
		sub_event_end_time: string,
		sub_event_maximum_seats: string,
		sub_event_organizer: string,
		sub_event_faculty: string,
	) => {
		setSelectedEvent({
			intFID: event_id,
			intFEventName: event_name,
			intFEventDescription: event_description,
			intFEventStartDate: event_start_date,
			intFEventEndDate: event_end_date,
			sub_eventsID: sub_event_id,
			sub_eventsMainID: sub_eventMain_id,
			sub_eventsName: sub_event_name,
			sub_eventsVenue: sub_event_venue,
			sub_eventsStartDate: sub_event_start_date,
			sub_eventsEndDate: sub_event_end_date,
			sub_eventsStartTime: sub_event_start_time,
			sub_eventsEndTime: sub_event_end_time,
			sub_eventsMaxSeats: sub_event_maximum_seats,
			sub_eventsOrganizer: sub_event_organizer,
			sub_eventsFaculty: sub_event_faculty,
		});

		// Fetch the attendance list for that event,
		// fetchAttendanceList(event_id);
        console.log("open view event modals");
		setShowSubEventModal(true);
	};

    // This is for attendance modal,
	const openAttendanceModal = async (event_id: string) => {
		console.log("testing" + event_id);
		try {
			// Fetch sub-events for the given event
			const { data: subEvents, error: subEventsError } = await supabase
				.from("sub_events")
				.select()
				.eq("sub_eventsMainID", event_id);

			if (subEventsError) {
				console.error("Error fetching sub_events:", subEventsError);
				return;
			}
			// Set the main ID for the 
			setAttendanceMainEventID(event_id);
			fetchAttendanceList(event_id)
			setSubEventsForAttendance(subEvents);

			// Extract the subEventID values from the fetched sub_events
			const subEventIDs = subEvents.map((subEvent) => subEvent.sub_eventsID);

			// Fetch all attendance_forms related to those sub_events
			const { data: attendanceForms, error: formsError } = await supabase
				.from("attendance_forms")
				.select()
				.in("attFSubEventID", subEventIDs);

			if (formsError) {
				console.error("Error fetching attendance forms:", formsError);
				return;
			}

			// Set the attendance data for the main event
			setAttendanceData(attendanceForms);
			
			fetchAttendanceList(event_id);

			console.log("Attendance forms data:", attendanceForms);
		} catch (error) {
			const typedError = error as Error;
			console.error("Error:", typedError.message);
		}

		setShowAttendanceModal(true);
	};

    // This is for attendance table in homepage pagination,
	const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setItemsPerPage(Number(e.target.value));
	};


    useEffect(() => {
		if (attendanceData && attendanceData.length > 0) {
			// Calculate labels (faculty/unit) and label data (counts)
			const facultyCounts: { [key: string]: number } = {};

			attendanceData.forEach(attendanceItem => {
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

				createPieChart(canvas, facultyLabels, facultyData);
			}
		}
	}, [attendanceData]);

    const handleSubEventClick = async (subEvent: subEvents) => {
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

			// Set the attendance data for the selected sub-event
			setAttendanceData(attendanceForms);

		} catch (error) {
			const typedError = error as Error;
			console.error("Error:", typedError.message);
		}
	};


	const fetchAttendanceList = async (event_id: string) => {
		const { data: subEvents, error: subEventsError } = await supabase
			.from("sub_events")
			.select()
			.eq("sub_eventsMainID", event_id);

		if (subEventsError) {
			console.error("Error fetching sub_events:", subEventsError);
			return;
		}

		// Extract the subEventID values from the fetched sub_events
		const subEventIDs = subEvents.map(subEvent => subEvent.sub_eventsID);

		// Now, fetch the attendance_forms related to those sub_events
		const { data: attendanceForms, error: formsError } = await supabase
			.from("attendance_forms")
			.select()
			.in("attFSubEventID", subEventIDs);

		if (formsError) {
			console.error("Error fetching attendance forms:", formsError);
			return;
		} else {
			setAttendanceData(attendanceForms);
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
			createPieChart(canvas, facultyLabels, facultyData);
		}
	}

	// Pie chart,
	const createPieChart = (
		chartContainer: HTMLCanvasElement | null,
		labels: string[],
		data: number[]) => {
		if (chartContainer) {
			const ctx = chartContainer.getContext('2d');

			if (ctx) {
				if (chartInstanceRef.current) {
					chartInstanceRef.current.destroy();
				}

				Chart.register(ChartDataLabels);

				chartInstanceRef.current = new Chart(ctx, {
					type: 'pie',
					data: {
						labels: labels,
						datasets: [
							{
								data: data,
								backgroundColor: [
									'red',
									'blue',
									'green',
									'orange',
									'purple',
									'pink',
									'yellow',
									'teal',
									'brown',
									'cyan',
									'lime',
									'indigo',
									'violet',
									'magenta',
									'amber',
									'lightblue',
									'deeporange',
									'lightgreen',
									'bluegrey',
								],
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: {
								position: 'bottom',
							},
							datalabels: {
								color: '#000000',
								font: {
									weight: 'bold'
								},
								formatter: (value: number, context: any) => {
									const total = context.dataset.data.reduce((acc: number, current: number) => acc + current, 0);
									const percentage = ((value / total) * 100).toFixed(2);

									return `${percentage}%\n(${value}/${total})`;
								},
							},
						},
					},
				});
			}
		}
	};

    // Refresh data from database
    const refreshData = async () => {
        // Get the current date
        const currentDate = new Date().toISOString();

        // Fetch events where the start date is in the future
        const { data: mainEventData, error: internalError } = await supabase
            .from("internal_events")
            .select("*")
            .lt('intFEventEndDate', currentDate)
            .order("intFEventStartDate", { ascending: true })
            .select();

        if (internalError) {
            console.error("Error fetching past event:", internalError);
            return;
        }

        setMainEvents(mainEventData || []);                
    };

    const refreshAttendanceData = async () => {
        setSearchAttendanceQuery("");
        setAttendanceData(attendanceData);
    }

    // Handle search input
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filteredData = mainEvents.filter(
            event =>
                event.intFEventName.toLowerCase().includes(query.toLowerCase()) ||
                event.intFEventStartDate.toLowerCase().includes(query.toLowerCase())
        );
        setMainEvents(filteredData);
    };

    const handleAttendanceSearch = (query: string) => {
        setSearchAttendanceQuery(query);
        const filteredStaffData = attendanceData.filter(
            staff =>
                staff.attFormsStaffName.toLowerCase().includes(query.toLowerCase()) ||
                staff.attFormsFacultyUnit.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredAttendanceData(filteredStaffData);
        console.log("filter data: ",filteredAttendanceData);
    }

    const handleArrowLeftClick = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setActivePage(currentPage - 1);
        }
    };

    // go to next page
    const handleArrowRightClick = () => {
        if (currentPage < Math.ceil(mainEvents.length / entriesToShow)) {
            setCurrentPage(currentPage + 1);
            setActivePage(currentPage + 1);
        }
    };

    // skip to the first page
    const handleSkipToFirstPage = () => {
        setCurrentPage(1);
        setActivePage(1);
    };

    // skip to the last page
    const handleSkipToLastPage = () => {
        const lastPage = Math.ceil(mainEvents.length / entriesToShow);
        setCurrentPage(lastPage);
        setActivePage(lastPage);
    };

    // Function to handle pagination button click
    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        setActivePage(pageNumber);
    };

    // Show Sort Options
    const handleSortButtonClick = () => {
        setShowSortOptions(!showSortOptions); // Toggle dropdown visibility
    };

    // Toggle sort order between 'asc' and 'desc' when ID is selected
    const handleSortButtonMenuClick = () => {
        if (sortBy === "date" || sortBy === "event") {
            // If it's already sorted by name, toggle between 'asc' and 'desc'
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // Set the sorting option to name and default to 'asc'
            setSortBy("date");
            setSortOrder("asc");
        }
        setShowSortOptions(false);
    };

   // export to CSV format
    const exportToCSV = () => {
        // Generate header row
        const header = Object.keys(mainEvents[0]).join(",");
        const dataRows = mainEvents.map(e => Object.values(e).join(",")).join("\n");

        // Combine header and data rows
        const csvContent = `${header}\n${dataRows}`;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "attendance_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // An array of sorting options
    const sortOptions = [
        { label: "Event Title", value: "event" },
        { label: "Start Date", value: "date" },
    ];

    // Modify the sorting logic based on the selected option and sort order
    const sortedData = mainEvents.slice().sort((a, b) => {
        if (sortBy === "event") {
            if (sortOrder === "asc") {
                return b.intFEventName.localeCompare(a.intFEventName, undefined, { sensitivity: 'base' });
            } else {
                return a.intFEventName.localeCompare(b.intFEventName, undefined, { sensitivity: 'base' });
            }
        } else if (sortBy === "date") {
            const dateA = new Date(a.intFEventStartDate);
            const dateB = new Date(b.intFEventStartDate);
    
            const compareResult = dateA.getTime() - dateB.getTime(); // Cast the result to number
            return sortOrder === "asc" ? compareResult : -compareResult;
        } else {
            return 0;
        }
    });

    return (
        <div className="h-screen flex flex-row justify-start bg-slate-100">
            
            <div className="flex-1">
               
                <div className="flex-1 mx-auto px-5 py-5">
                    <div className="bg-white rounded p-8">
                        <div className="inline-flex">
                            <span className="mt-[5px]"><a href="/homepage"><IoIosArrowBack className="text-2xl -mt-[1.5px] mr-[6px] text-slate-800 -ml-1" /></a></span>
                            <h1 className="text-2xl font-bold"><span className="ml-[5px] text-slate-800">Past Events</span></h1>
                        </div>

                        <div className="flex items-center justify-between mb-8 mt-5">
                            {/* Refresh Button */}
                            <button
                                type="button"
                                className="items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden hover:transition duration-300 transform hover:scale-105"
                                onClick={refreshData}>
                                <IoMdRefresh className="text-xl text-slate-800" />
                                <span className="ml-2 -mt-[1.25px] text-slate-800">
                                    Refresh
                                </span>
                            </button>

                            <div className="flex items-center">
                                {/* Search Input */}
                                <div className="max-w-full relative shadow hover:shadow-sm border border-slate-300 rounded mr-3 hover:transition duration-300 transform hover:scale-105">
                                    <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-4 w-4 fill-current text-gray-500">
                                            <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                                        </svg>
                                    </span>
                                    <input
                                        placeholder="Search here..."
                                        className="appearance-none rounded-md block pl-8 pr-6 py-2 bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                                        value={searchQuery}
                                        onChange={e => handleSearch(e.target.value)}
                                    />
                                </div>

                                {/* mobile view */}
                                <button
                                    type="button"
                                    className="items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:hidden lg:hidden hover:transition duration-300 transform hover:scale-105"
                                    onClick={refreshData}>
                                    <IoMdRefresh className="text-xl text-slate-800" />
                                </button>

                                {/* Sort By Button */}
                                <div className="relative">
                                <button
                                    type="button"
                                    className="items-center justify-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 mr-3 shadow-sm md:inline-flex hidden hover:transition duration-300 transform hover:scale-105"
                                    onClick={handleSortButtonClick}>
                                    <Image
                                        src={filterBar.src}
                                        alt=""
                                        width={20}
                                        height={20}
                                        className="text-slate-800"
                                    />
                                    <span className="ml-2 text-slate-800">Sort By</span>
                                </button>

                                {/* Dropdown Menu */}
                                <div
                                    className={`absolute top-[45px] transform translate-x-0 translate-y-0 transition-transform duration-300 ease-in-out ${showSortOptions ? "translate-x-0" : ""
                                        }`}
                                    style={{ zIndex: 999 }}>
                                    {showSortOptions && (
                                        <div className="bg-white border-l border-t border-r border-gray-200 shadow-md w-56 rounded-lg">
                                            <ul>
                                                <li className="px-4 py-2 cursor-pointer flex items-center text-gray-600">
                                                    <span className="font-bold text-slate-800">
                                                        Sort By:
                                                    </span>
                                                </li>
                                                {sortOptions.map(option => (
                                                    <li
                                                        key={option.value}
                                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center transition-all duration-200 ease-in-out font-medium"
                                                        onClick={() => {
                                                            handleSortButtonMenuClick(); // Hide the dropdown when an option is selected
                                                            setSortBy(option.value); // Set the sorting option
                                                        }}>
                                                        {option.value === "event" && (
                                                            <FaSortAlphaUp className="mr-3 ml-2 text-slate-800" />
                                                        )}
                                                        {option.value === "date" && (
                                                            <FaCalendarAlt className="mr-3 ml-2 text-slate-800" />
                                                        )}
                                                        <span className="text-slate-500 ">
                                                            {option.label}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                </div>

                                {/* Export Button */}
                                <button
                                    type="button"
                                    className="items-center justify-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden"
                                    onClick={exportToCSV}>
                                    <img
                                        src={exportCSV.src}
                                        alt=""
                                        width={20}
                                        className="text-slate-800"
                                    />
                                    <span className="ml-2 text-slate-800">Export to CSV</span>
                                </button>
                            </div>
                        </div>
                        <div className="-mx-4 hidden sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto lg:block">
                            <div className="inline-block min-w-full shadow rounded-sm overflow-hidden">
                                <table className="min-w-full leading-normal">
                                    {/* Table Header */}
                                    <thead>
                                        <tr className="flex justify-between  border-b-2 border-gray-200 bg-gray-100">
                                            <th className="flex-1 pl-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                No.
                                            </th>
                                            <th className="flex-1 py-3 -ml-[58px] text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="">Event Title</span>
                                            </th>
                                            <th className="flex-1 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="ml-5">Description</span>
                                            </th>
                                            <th className="flex-1 py-3 ml-28 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="ml-[52px]">Start Date</span>
                                            </th>
                                            <th className="flex-1 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="ml-[76px]">Status</span>
                                            </th>
                                            <th className="flex-1 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                <span className="ml-20">Action</span>
                                            </th>
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody>
                                        {sortedData
                                            .slice(
                                                (currentPage - 1) * entriesToShow,
                                                currentPage * entriesToShow,
                                            )
                                            .map((event, index) => (
                                                <tr className="flex border-b border-gray-200 bg-white text-xs lg:text-sm" key={index}>
                                                    <td className="flex-1 py-5 mt-1">
                                                        <div className="flex items-center">
                                                            <div className="ml-4">
                                                                <p className="text-gray-900">
                                                                    {(currentPage - 1) *
                                                                        entriesToShow +
                                                                        index +
                                                                        1}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="flex-1 py-5">
                                                        <p className="text-gray-900 -ml-10">
                                                            {event.intFEventName}
                                                        </p>
                                                    </td>

                                                    <td className="flex-1 py-5 -ml-3">
                                                        <p className="text-gray-900 -ml-1">
                                                            {event.intFEventDescription}
                                                        </p>
                                                    </td>
                                                    
                                                    <td className="flex-1 py-5 ml-12">
                                                        <p className="text-gray-900 whitespace-nowrap ml-[94px]">
                                                            {event.intFEventStartDate}
                                                        </p>
                                                    </td>
                                                    
                                                    <td className="flex-1 py-5 ml-12">
                                                        <div className="flex items-end">
                                                            <span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center ml-10">
                                                                <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                                                <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                                <span className="relative mt-[1px] leading-3 tracking-wider ">Upcoming</span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="flex-1 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div className="rounded-full bg-slate-100 p-2 opacity-80 hover:bg-slate-200 mt-[3px] cursor-pointer w-8 ml-[86px]">
                                                                    <BsThreeDots />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="-mt-1">
                                                                <DropdownMenuItem 
                                                                    className="cursor-pointer" 
                                                                    onClick={e => {
															        e.stopPropagation();

                                                                    const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === event.intFID);

                                                                    if (filteredSubEvent) {
                                                                        openModal(
                                                                            event.intFID,
                                                                            event.intFEventName,
                                                                            event.intFEventDescription,
                                                                            event.intFEventStartDate,
                                                                            event.intFEventEndDate,
                                                                            filteredSubEvent.sub_eventsID,
                                                                            filteredSubEvent.sub_eventsMainID,
                                                                            filteredSubEvent.sub_eventsName,
                                                                            filteredSubEvent.sub_eventsVenue,
                                                                            filteredSubEvent.sub_eventsStartDate,
                                                                            filteredSubEvent.sub_eventsEndDate,
                                                                            filteredSubEvent.sub_eventsStartTime,
                                                                            filteredSubEvent.sub_eventsEndTime,
                                                                            filteredSubEvent.sub_eventsMaxSeats,
                                                                            filteredSubEvent.sub_eventsOrganizer,
                                                                            filteredSubEvent.sub_eventsFaculty
                                                                        );
                                                                    }

                                                                }}                                                                
                                                                >Sub-Events Details</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer" 
                                                                    onClick={e => {
                                                                        e.stopPropagation()
                                                                        openAttendanceModal(event.intFID);}}
                                                                >Attendance List
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        
                                        {/* pagination */}
                                        {Array.from({
                                            length: entriesToShow - mainEvents?.length,
                                        }).map((_, index) => (
                                            <tr className="flex invisible" key={index}>
                                                <td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                    <div className="flex items-center">
                                                        <div className="ml-[14px]">
                                                            <p className="text-gray-900 whitespace-no-wrap"></p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap ml-3"></p>
                                                </td>
                                                <td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap"></p>
                                                </td>
                                                <td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-900 whitespace-no-wrap ml-1"></p>
                                                </td>
                                                <td
                                                    className={`flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm`}>
                                                    <span
                                                        className={`relative inline-block px-3 py-2 font-semibold text-gray-900 leading-tight`}>
                                                        <span
                                                            aria-hidden
                                                            className={`absolute inset-0 opacity-0 rounded-full`}></span>
                                                        <span className="relative"></span>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="px-5 py-5 bg-white border-t flex items-center justify-between">
                                    <div className="flex items-center text-[14px] text-base">
                                        <div className="mr-2 ml-3">
                                            <span className="text-sm lg:text-base">Show</span>
                                        </div>

                                        {/* Filter By How Many Entries */}
                                        <div className="relative mr-2">
                                            <select
                                                value={entriesToShow}
                                                onChange={e =>
                                                    setEntriesToShow(parseInt(e.target.value))
                                                }
                                                className="appearance-none h-full rounded-l border block bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base">
                                                <option
                                                    value={5}
                                                    className="text-sm lg:text-base">
                                                    5
                                                </option>
                                                <option
                                                    value={10}
                                                    className="text-sm lg:text-base">
                                                    10
                                                </option>
                                                <option
                                                    value={20}
                                                    className="text-sm lg:text-base">
                                                    20
                                                </option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                <svg
                                                    className="fill-current h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20">
                                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-sm lg:text-base">
                                                entries
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm lg:text-base lg:text-[14px] lg:text-gray-900 lg:mr-2 hidden md:inline">
                                            1-{entriesToShow} of {mainEvents?.length} entries
                                        </span>

                                        <div className="flex">
                                            {/* Skip To First Page Button */}
                                            <button
                                                type="button"
                                                className="py-2 px-1 ml-8"
                                                onClick={handleSkipToFirstPage}
                                                disabled={currentPage === 1}
                                                style={{
                                                    cursor:
                                                        currentPage === 1
                                                            ? "not-allowed"
                                                            : "pointer",
                                                    opacity: currentPage === 1 ? 0.5 : 1,
                                                }}>
                                                <img
                                                    src={skipLeft.src}
                                                    alt=""
                                                    width={20}
                                                    className="lg:w-[22px]"
                                                />
                                            </button>

                                            {/* Arrow Previous Page Button */}
                                            <button
                                                type="button"
                                                className="py-2 px-1 ml-5"
                                                onClick={handleArrowLeftClick}
                                                disabled={currentPage === 1}
                                                style={{
                                                    opacity: currentPage === 1 ? 0.5 : 1,
                                                }}>
                                                <img
                                                    src={arrowLeft.src}
                                                    alt=""
                                                    width={12}
                                                    className="lg:w-[13px]"
                                                />
                                            </button>

                                            {/* Pagination Buttons */}
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(pageNumber => (
                                                    <button
                                                        type="button"
                                                        className={`py-1 px-3 ml-5 rounded font-medium text-sm lg:text-[15px] ${pageNumber === activePage
                                                            ? "text-slate-100 bg-slate-900"
                                                            : "text-slate-800 bg-slate-200"
                                                            }`}
                                                        key={pageNumber}
                                                        onClick={() => {
                                                            if (
                                                                pageNumber <=
                                                                Math.ceil(
                                                                    mainEvents.length /
                                                                    entriesToShow,
                                                                )
                                                            ) {
                                                                handlePageClick(pageNumber);
                                                            }
                                                        }}>
                                                        {pageNumber}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Arrow Next Page Button */}
                                            <button
                                                type="button"
                                                className="py-2 px-1 ml-5"
                                                onClick={handleArrowRightClick}
                                                disabled={
                                                    currentPage ===
                                                    Math.ceil(mainEvents?.length / entriesToShow)
                                                }
                                                style={{
                                                    opacity:
                                                        currentPage ===
                                                            Math.ceil(
                                                                mainEvents?.length / entriesToShow,
                                                            )
                                                            ? 0.5
                                                            : 1,
                                                }}>
                                                <img
                                                    src={arrowRight.src}
                                                    alt=""
                                                    width={12}
                                                    className="lg:w-[13px]"
                                                />
                                            </button>

                                            {/* Skip To Last Page Button */}
                                            <button
                                                type="button"
                                                className={`py-2 px-1 ml-5 ${currentPage ===
                                                    Math.ceil(mainEvents?.length / entriesToShow)
                                                    ? "pointer-events-none opacity-50"
                                                    : ""
                                                    }`}
                                                onClick={handleSkipToLastPage}>
                                                <img
                                                    src={skipRight.src}
                                                    alt=""
                                                    width={17}
                                                    className="lg:w-[18px]"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <EventListModal isVisible={showSubEventModal} onClose={() => setShowSubEventModal(false)}>
                            <p className='font-semibold text-md text-gray-600 p-2 ml-2'>Sub-Events Details</p>
                            <div className="p-5 bg-slate-100 h-[520px] lg:w-[1160px] lg:h-[420px] ml-1 overflow-auto">
                                <table className="leading-normal w-[1090px] ml-4 hidden lg:block">
                                    <thead>
                                        <tr className="flex border-b-2 border-gray-200 bg-gray-100 justify-between">
                                            <th className="ml-5 py-3 text-left text-sm lg:text-md font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                NO.
                                            </th>
                                            <th className="py-3 text-left text-sm lg:text-md font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                Events Name
                                            </th>
                                            <th className="py-3 text-left text-sm lg:text-md font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                Organizer
                                            </th>
                                            <th className="py-3 text-left text-sm lg:text-md font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                Venue
                                            </th>
                                            <th className="py-3 text-left text-sm lg:text-md font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                Start Time
                                            </th>
                                            <th className="py-3 text-left text-sm lg:text-md font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                End Time
                                            </th>
                                            <th className="py-3 text-left text-sm lg:text-md font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                Maximum Seats
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subEvents
                                            .filter(subEvent => subEvent.sub_eventsMainID === selectedEvent.intFID)
                                            .map((subEvent, index) => (
                                                <tr className="flex border-b border-gray-200 bg-white" key={index}>
                                                    <td className="flex-1 py-5 text-xs mt-1 lg:text-xs ml-5">
                                                        <div>
                                                            <div className="ml-[2px]">
                                                                <p className="text-gray-900">
                                                                    {(currentPage - 1) *
                                                                    entriesToShow +
                                                                    index +
                                                                    1
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="flex-1 px-3 py-5 text-xs lg:text-md ">
                                                        <p className="text-gray-900 -ml-8">
                                                            {subEvent.sub_eventsName}
                                                        </p>
                                                    </td>
                                                                    
                                                    <td className="flex-1 px-3 py-5 text-xs lg:text-md ">
                                                        <p className="text-gray-900 ml-1">
                                                            {subEvent.sub_eventsOrganizer}
                                                        </p>
                                                    </td>
                                                                    
                                                    <td className="flex-1 px-3 py-5 text-xs lg:text-md">
                                                        <p className="text-gray-900 ml-6">
                                                            {subEvent.sub_eventsVenue}
                                                        </p>
                                                    </td>
                                                                    
                                                    <td className="flex-1 px-3 py-5 text-xs lg:text-md">
                                                        <p className="text-gray-900 whitespace-nowrap">
                                                            {subEvent.sub_eventsStartDate} {subEvent.sub_eventsStartTime}
                                                        </p>
                                                    </td>
                                                                    
                                                    <td className="flex-1 px-3 py-5 text-xs lg:text-md">
                                                        <p className="text-gray-900 whitespace-nowrap ml-4">
                                                            {subEvent.sub_eventsEndDate} {subEvent.sub_eventsEndTime}
                                                        </p>
                                                    </td>

                                                    <td className="flex-1 px-3 py-5 text-xs lg:text-md">
                                                        <p className="text-gray-900 ml-5">
                                                            {subEvent.sub_eventsMaxSeats}
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>                                    
                                    </table>	
                                {/* mobile view */}
                                <div className="grid grid-cols-1 gap-4 lg:hidden">
                                    {subEvents
                                        .filter(subEvent => subEvent.sub_eventsMainID === selectedEvent.intFID)
                                        .map((subEvent, index) => (
                                            <div className="bg-slate-100 p-4 rounded-lg shadow">
                                                <table className="w-full"> 
                                                    <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                        <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            No.
                                                        </th>
                                                        <td className="float-right flex text-xs mt-3 px-4">
                                                            {(currentPage - 1) * entriesToShow + index + 1}
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                        <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            Event Name
                                                        </th>
                                                        <td className="float-right flex text-xs mt-3 px-4">
                                                            {subEvent.sub_eventsName}
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                        <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            Organizer
                                                        </th>
                                                        <td className="float-right flex text-xs mt-3 px-4">
                                                            {subEvent.sub_eventsOrganizer}
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                        <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            Venue
                                                        </th>
                                                        <td className="float-right flex text-xs mt-3 px-4">
                                                            {subEvent.sub_eventsVenue}
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                        <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            Start Date
                                                        </th>
                                                        <td className="float-right flex text-xs mt-3 px-4">
                                                            {subEvent.sub_eventsStartDate} {subEvent.sub_eventsStartTime}
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                        <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            End Date
                                                        </th>
                                                        <td className="float-right flex text-xs mt-3 px-4">
                                                            {subEvent.sub_eventsEndDate} {subEvent.sub_eventsEndTime}
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                        <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                            Maximum Seats
                                                        </th>
                                                        <td className="float-right flex text-xs mt-3 px-4">
                                                            {subEvent.sub_eventsMaxSeats}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        ))}
                                </div>
                            </div>                            
                        </EventListModal>

                        <ViewAttendance_Modal
                            isVisible={showAttendanceModal}
                             onClose={() => setShowAttendanceModal(false)}>
                            <div className="flex flex-col lg:flex-row h-[600px] lg:h-[700px] overflow-y-auto">
                                <div className={`w-${attendanceData && attendanceData.length > 0 ? '1/2' : 'full'} lg:h-[700px] h-[600px] w-full`}>
                                    <div className="flex items-start justify-start text-text text-[20px] text-center">
                                        <PencilNoteIcon />{" "}
                                        <span className="ml-5 -mt-1">Attendance List</span>
                                    </div>
                                    <div className="text-left text-black text-[13px] pb-5 ml-11">
                                         Total Attendees: {attendanceData.length}
                                    </div>
                                    <div className="flex flex-wrap">
                                        <button
                                            className={`font-bold flex items-center rounded-lg text-[15px] hover:bg-red-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 ${isAllButtonActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
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
                                                    className={`font-bold flex items-center bg-slate-200 rounded-lg text-[15px] hover:bg-red-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm mb-3.5 p-2 ml-3 ${selectedSubEvent === subEvent.sub_eventsID ? 'bg-red-400 text-white' : ''
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setIsAllButtonActive(false);
                                                        // COMMENT HERE
                                                        handleSubEventClick(subEvent);
                                                    }}
                                                >
                                                    {subEvent.sub_eventsName}
                                                </button>
                                            </div>
                                            ))}
                                            </div>
                                            {/* This is to loop through the attendance data. */}
                                            {attendanceData && attendanceData.length > 0 ? (
                                                <div>
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
                                                            className="appearance-none rounded-md block pl-8 pr-6 py-2 bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                                                            value={searchAttendanceQuery}
                                                            onChange={e => handleAttendanceSearch(e.target.value)}
                                                        />
                                                    </div>

                                                    <button 
                                                        type="button"
                                                        className="items-center relative float-right mr-2 bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden hover:transition duration-300 transform hover:scale-105"
                                                        onClick={refreshAttendanceData}>
                                                        <IoMdRefresh className="text-xl text-slate-800" />
                                                        <span className="ml-2 -mt-[1.25px] text-slate-800">
                                                            Refresh
                                                        </span>
                                                    </button>
                                                             
                                                    <div className="h-[500px] overflow-y-auto">
                                                        {filteredAttendanceData && searchAttendanceQuery.length > 0 ?(
                                                            <AttendanceTable attendanceData={filteredAttendanceData} itemsPerPage={itemsPerPage} />
                                                                    
                                                            ):(
                                                            <AttendanceTable attendanceData={attendanceData} itemsPerPage={itemsPerPage} />
                                                            )
                                                        }                                                                
                                                        </div>
                                                    </div>
                                            ) : (
                                                <div className="text-center text-gray-600 mt-4">
                                                    No attendance data available.
                                                </div>    
                                            )}
                                            </div>
                                            {attendanceData && attendanceData.length > 0 ? (
                                                <div className="w-full lg:flex flex-col items-center justify-center mt-5 lg:mt-0">
                                                    <div className="text-center font-bold">Number of Attendees Each Faculty/ Unit</div>
                                                    <div className="w-[325px] h-[325px] lg:w-[500px] lg:h-[500px] flex items-center justify-center mt-5">
                                                    <canvas id="attendanceFacultyPieChart" ref={chartContainer} />
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>                                            
                        </ViewAttendance_Modal>

                        {/* mobile view table*/}
                        <div className="grid grid-cols-1 gap-4 lg:hidden">
                        {sortedData
                            .slice(
                            (currentPage - 1) * entriesToShow,
                             currentPage * entriesToShow,
                            )
                            .map((event, index) => (
                                <div className="bg-slate-100 p-4 rounded-lg shadow">
                                    <table className="w-full">                                        
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    No.
                                                </th>
                                                <td className="float-right flex text-xs mt-3 px-4">
                                                    {(currentPage - 1) * entriesToShow + index + 1}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                    Event Title
                                                </th>
                                                <td className="float-right text-xs mt-3 px-4">
                                                    {event.intFEventName}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                    Description
                                                </th>
                                                <td className="float-right text-xs mt-3 px-4">
                                                    {event.intFEventDescription}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                    Start Date
                                                </th>
                                                <td className="float-right text-xs mt-3 px-4">
                                                    {event.intFEventStartDate}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                    Status
                                                </th>
                                                <td className="float-right text-xs py-1">
                                                    <div className="flex items-end">
                                                        <span className="relative px-3 py-[5px] font-semibold text-slate-800 text-xs flex items-center ml-10">
                                                            <span aria-hidden className="absolute inset-0 bg-green-500 opacity-50 rounded-full"></span>
                                                            <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                            <span className="relative mt-[1px] leading-3 tracking-wider ">Completed</span>
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="">
                                                <th className="py-3 float-left text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                    Action
                                                </th>
                                                <td className="float-right text-xs mt-1 px-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <div className="rounded-full bg-slate-100 p-2 opacity-80 hover:bg-slate-200 mt-[3px] cursor-pointer w-8 ml-[86px]">
                                                                <BsThreeDots />
                                                            </div>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="-mt-1">
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer" 
                                                                onClick={e => {
															    e.stopPropagation();

                                                                const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === event.intFID);

                                                                if (filteredSubEvent) {
                                                                    openModal(
                                                                        event.intFID,
                                                                        event.intFEventName,
                                                                        event.intFEventDescription,
                                                                        event.intFEventStartDate,
                                                                        event.intFEventEndDate,
                                                                        filteredSubEvent.sub_eventsID,
                                                                        filteredSubEvent.sub_eventsMainID,
                                                                        filteredSubEvent.sub_eventsName,
                                                                        filteredSubEvent.sub_eventsVenue,
                                                                        filteredSubEvent.sub_eventsStartDate,
                                                                        filteredSubEvent.sub_eventsEndDate,
                                                                        filteredSubEvent.sub_eventsStartTime,
                                                                        filteredSubEvent.sub_eventsEndTime,
                                                                        filteredSubEvent.sub_eventsMaxSeats,
                                                                        filteredSubEvent.sub_eventsOrganizer,
                                                                        filteredSubEvent.sub_eventsFaculty
                                                                    );
                                                                }

                                                            }}                                                                
                                                            >Sub-Events Details</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="cursor-pointer" 
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    openAttendanceModal(event.intFID);}}
                                                            >Attendance List
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                    </table>
                                </div>          
                            ))}
                        </div>
                        {/* mobile view paginagtion */}
                        <div className="flex mt-10 lg:hidden justify-center -ml-10 pb-6">
                            {/* Skip To First Page Button */}
                            <button
                                type="button"
                                className="py-2 px-1 ml-8"
                                onClick={handleSkipToFirstPage}
                                disabled={currentPage === 1}
                                style={{
                                    cursor:
                                        currentPage === 1
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                }}>
                                    <img
                                        src={skipLeft.src}
                                        alt=""
                                        width={20}
                                        className="lg:w-[22px]"
                                    />
                                </button>

                                {/* Arrow Previous Page Button */}
                                <button
                                    type="button"
                                    className="py-2 px-1 ml-5"
                                    onClick={handleArrowLeftClick}
                                    disabled={currentPage === 1}
                                    style={{
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                    }}>
                                    <img
                                    src={arrowLeft.src}
                                        alt=""
                                        width={12}
                                        className="lg:w-[13px]"
                                    />
                                </button>

                                {/* Pagination Buttons */}
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(pageNumber => (
                                            <button
                                                type="button"
                                                className={`py-1 px-3 ml-5 rounded font-medium text-sm lg:text-[15px] ${pageNumber === activePage
                                                ? "text-slate-100 bg-slate-900"
                                                : "text-slate-800 bg-slate-200"
                                                }`}
                                                key={pageNumber}
                                                onClick={() => {
                                                    if (
                                                        pageNumber <=
                                                        Math.ceil(
                                                            mainEvents.length /
                                                            entriesToShow,
                                                        )
                                                    ) {
                                                        handlePageClick(pageNumber);
                                                    }
                                                }}>
                                                {pageNumber}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Arrow Next Page Button */}
                                    <button
                                        type="button"
                                        className="py-2 px-1 ml-5"
                                        onClick={handleArrowRightClick}
                                        disabled={
                                                currentPage ===
                                                Math.ceil(mainEvents?.length / entriesToShow)
                                            }
                                            style={{
                                            opacity:
                                                currentPage ===
                                                    Math.ceil(
                                                        mainEvents?.length / entriesToShow,
                                                    )
                                                    ? 0.5
                                                    : 1,
                                            }}>
                                            <img
                                                src={arrowRight.src}
                                                alt=""
                                                width={12}
                                                className="lg:w-[13px]"
                                            />
                                        </button>

                                        {/* Skip To Last Page Button */}
                                        <button
                                            type="button"
                                            className={`py-2 px-1 ml-5 ${currentPage ===
                                                Math.ceil(mainEvents?.length / entriesToShow)
                                                ? "pointer-events-none opacity-50"
                                                : ""
                                                }`}
                                            onClick={handleSkipToLastPage}>
                                            <img
                                                src={skipRight.src}
                                                alt=""
                                                width={17}
                                                className="lg:w-[18px]"
                                            />
                                        </button>
                                    </div>                        
                    </div>                    
                </div>                
            </div>
        </div>
    )
};