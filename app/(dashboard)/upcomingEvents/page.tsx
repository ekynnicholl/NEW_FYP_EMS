"use client";

import Image from "next/image";
import EventListModal from "@/components/Event_List_Modal";
import filterBar from "@/public/images/filter_bar_black.png";
import exportCSV from "@/public/images/export_csv.png";
import arrowLeft from "@/public/images/arrow_left.png";
import arrowRight from "@/public/images/arrow_right.png";
import skipLeft from "@/public/images/skip_left.png";
import skipRight from "@/public/images/skip_right.png";

import { FaSortAlphaUp, FaCalendarAlt } from "react-icons/fa";
import { IoMdRefresh, IoIosArrowBack } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { AiOutlineFieldTime } from "react-icons/ai";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MdFilterListAlt, MdKeyboardDoubleArrowLeft, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { LiaQrcodeSolid } from "react-icons/lia";
import ViewAttendance_Modal from "@/components/ViewAttendance_Modal";
import DoubleRightArrow from "@/components/icons/DoubleRightArrow";
import RightArrow from "@/components/icons/RightArrow";
import LeftArrow from "@/components/icons/LeftArrow";
import DoubleLeftArrow from "@/components/icons/DoubleLeftArrow";
import FeedbackList from "@/components/feedback/feedback_list";
import ViewEventFeedback from "@/components/ViewEventFeedback";
import Modal from "@/components/QR_Codes_Modal";
import QRCodeModal from "@/components/EditSubEvent_Modal";
import AttendanceList from "@/components/attendance/attendance_list";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import Link from "next/link";

type mainEvent = {
    intFID: string;
    intFEventName: string;
    intFEventDescription: string;
    intFEventStartDate: string;
    intFEventEndDate: string;
    intFDurationCourse: string;
    intFTrainerName: string;
    intFTrainingProvider: string;
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

type FeedbackDataType = {
    fbID: string;
    fbSubEventID: string;
    fbCourseName: string;
    fbCommencementDate: string;
    fbCompletionDate: string;
    fbDuration: string;
    fbTrainersName: string;
    fbTrainingProvider: string;
    fbSectionA1: string;
    fbSectionA2: string;
    fbSectionA3: string;
    fbSectionA4: string;
    fbSectionA5: string;
    fbSectionB1: string;
    fbSectionB2: string;
    fbSectionB3: string;
    fbSectionB4: string;
    fbSectionC1: string;
    fbSectionD1: string;
    fbSectionESuggestions: string;
    fbSectionEChanges: string;
    fbSectionEAdditional: string;
    fbFullName: string;
    fbEmailAddress: string;
}


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

    const [mainEventForFeedback, setMainEventForFeedback] = useState<mainEvent>({
        intFID: '',
        intFEventName: '',
        intFEventDescription: '',
        intFEventStartDate: '',
        intFEventEndDate: '',
        intFDurationCourse: '',
        intFTrainerName: '',
        intFTrainingProvider: ''
    });
    const [mainEvents, setMainEvents] = useState<mainEvent[]>([] as mainEvent[]);
    const [dataResults, setDataResults] = useState<mainEvent[]>([] as mainEvent[]);

    const [selectedEvent, setSelectedEvent] = useState({
        intFID: "",
        intFEventName: "",
        intFEventDescription: "",
        intFEventStartDate: "",
        intFEventEndDate: "",
        intFTrainerName: "",
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

    // 
    const [showSubEventModal, setShowSubEventModal] = useState(false);

    useEffect(() => {
        const fetchMainEvents = async () => {
            // Get the current date
            const currentDate = new Date().toISOString();

            // Fetch events where the start date is in the future
            const { data: mainEventData, error: internalError } = await supabase
                .from("internal_events")
                .select("*")
                .filter('intFEventEndDate', 'gte', currentDate)
                .order("intFEventStartDate", { ascending: true })
                .eq("intFIsHidden", 0);

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
        event_trainer_name: string,
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
            intFTrainerName: event_trainer_name,
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

        setShowSubEventModal(true);
    };

    // This is needed for the attendance data to show,
    const [attendanceID, setAttendanceID] = useState<string>("");
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    // This is for attendance modal,
    const openAttendanceModal = async (event_id: string) => {
        setAttendanceID(event_id);
        setShowAttendanceModal(true);
    };

    // Refresh data from database
    const refreshData = async () => {
        setSearchQuery("");
    };

    // Handle search input
    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if(searchQuery.length != 0){
			setCurrentPage(1);
		}

        //Clear the data results
        setDataResults([]);

        const filteredData = mainEvents.filter(
            event =>
                event.intFEventName.toLowerCase().includes(query.toLowerCase()) ||
                event.intFEventStartDate.toLowerCase().includes(query.toLowerCase())
        );

        setDataResults(filteredData);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(mainEvents.length / entriesToShow)) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [entriesToShow]);

    const pageCount = Math.ceil(mainEvents.length / entriesToShow);

    const generatePageNumbers = (): number[] => {
        const displayedPages = 5;
        const halfDisplayed = Math.floor(displayedPages / 2);

        if (pageCount <= displayedPages) {
            return Array.from({ length: pageCount }, (_, index) => index + 1);
        }

        const start = Math.max(currentPage - halfDisplayed, 1);
        const end = Math.min(start + displayedPages - 1, pageCount);

        const pages: number[] = [];

        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push(-1);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < pageCount) {
            if (end < pageCount - 1) {
                pages.push(-1);
            }
            pages.push(pageCount);
        }

        return pages.slice(0, displayedPages);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [mainEvents])

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

    const convertToXLSX = (data: mainEvent[], columnMapping: ColumnMapping) => {
		const header = Object.keys(columnMapping).map((key) => columnMapping[key]);
		const body = data.map((row) => {
			const newRow: any = {...row};
			return Object.keys(columnMapping).map((key) => newRow[key as keyof mainEvent]);
		});

		const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Upcoming Events Data');

		const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }); // Change type to 'array'

		return wbout;
	};

	const downloadXLSX = (data: mainEvent[]) => {
		const xlsxContent = convertToXLSX(data, columnMapping);
		const blob = new Blob([xlsxContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'Upcoming Events Data.xlsx';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	};

	type ColumnMapping = {
		[key: string]: string;
	}

	const columnMapping: ColumnMapping = {
		intFEventName: 'Event Title',
		intFEventDescription: 'Description',
		intFEventStartDate: 'Start Date',
		intFEventEndDate: 'End Date',
		intFDurationCourse: 'Duration Course',
		intFTrainerName: 'Trainer Name',
		intFTrainingProvider: 'Training Provider', 
		intFTotalHours: 'Total Hour(s)',
	};

    // An array of sorting options
    const sortOptions = [
        { label: "Event Title", value: "event" },
        { label: "Start Date", value: "date" },
    ];

    // Modify the sorting logic based on the selected option and sort order
    const sortedData = (dataResults.length > 0 ? dataResults : mainEvents)
        .slice()
        .sort((a, b) => {
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

    // This is needed for the feedback data to show,
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackID, setFeedbackID] = useState<string>("");

    // This function fetches ALL the feedback forms,
    const openFeedbackModal = async (event_id: string) => {
        setFeedbackID(event_id);
        setShowFeedbackModal(true);
    };

    // For QR codes,
    const [showQRCodesFeedback, setShowQRCodesFeedback] = useState(false);
    const [selectedSubEventID, setSelectedSubEventID] = useState<string>("");

    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toast.success("Link copied to clipboard!");
            })
            .catch(error => {
                toast.error("Copy failed:", error);
            });
    };

    // For QR codes,
    const [showQRCodesAttendance, setShowQRCodesAttendance] = useState(false);
    const [selectedMainEventID, setSelectedMainEventID] = useState<string>("");

    //show qr codes for each session
    const [showQRCodeModal, setShowQRCodeModal] = useState(false);

    const openQRCodeModal = async (event_id: string) => {
        setSelectedMainEventID(event_id);
        setShowQRCodeModal(true);
    }

    return (
        <div className="">
            <div className="flex-1">
                <div className="flex-1 mx-auto px-4 sm:px-[26px] py-[26px] bg-slate-100 dark:bg-dark_mode_bg">
                    <div className="bg-white rounded p-8 dark:bg-dark_mode_card">
                        <div className="inline-flex">
                            <span className="mt-[7px]">
                                <Link href="/dashboard">
                                    <IoIosArrowBack className="text-2xl -mt-[1.5px] mr-[6px] text-slate-800 -ml-1 dark:text-dark_text" />
                                </Link>
                            </span>
                            <h1 className="text-xl lg:text-2xl font-bold"><span className="ml-[5px] text-slate-800 dark:text-dark_text">Upcoming Events</span></h1>
                        </div>

                        <div className="flex items-center justify-between mb-8 mt-5">
                            {/* Refresh Button */}
                            <button
                                type="button"
                                className="items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden hover:transition duration-300 transform hover:scale-105 dark:bg-[#242729]"
                                onClick={refreshData}>
                                <IoMdRefresh className="text-xl text-slate-800 dark:text-dark_text" />
                                <span className="ml-2 -mt-[1.25px] text-slate-800 dark:text-dark_text">
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
                                        className="appearance-none rounded-md block pl-8 pr-6 py-2 bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none dark:bg-dark_mode_card dark:border-[#2E3E50] dark:placeholder:text-[#484945]"
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
                                        className="items-center justify-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 mr-3 shadow-sm md:inline-flex hidden hover:transition duration-300 transform hover:scale-105 dark:bg-[#242729]"
                                        onClick={handleSortButtonClick}>
                                        <Image
                                            src={filterBar.src}
                                            alt=""
                                            width={20}
                                            height={20}
                                            className="text-slate-800 dark:text-dark_text"
                                        />
                                        <span className="ml-2 text-slate-800 dark:text-dark_text">Sort By</span>
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
                                    className="items-center justify-center bg-slate-200 rounded-lg py-2 px-4 ml-2 lg:ml-0 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm inline-flex dark:bg-[#242729]"
                                    onClick={() => downloadXLSX(mainEvents)}>
                                    <Image 
                                        height={200} 
                                        src={exportCSV.src}
                                        alt=""
                                        width={20}
                                        className="text-slate-800"
                                    />
                                    <span className="ml-2 text-slate-800 dark:text-dark_text">Export to Excel (XLSX)</span>
                                </button>
                            </div>
                        </div>

                        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto lg:block">
                            <div className="inline-block min-w-full shadow rounded-sm">
                                <table className="lg:w-full w-auto min-h-screen">
                                    <thead>
                                        <tr>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider whitespace-nowrap text-left">
                                                <div className="ml-2 lg:ml-0">NO</div>
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider whitespace-nowrap text-left">
                                                <div className="-ml-36 lg:-ml-20">Event Title</div>
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider whitespace-nowrap text-left">
                                                Description
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider whitespace-nowrap">
                                                <div className="ml-12 lg:-ml-2">Start Date</div>
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider whitespace-nowrap">
                                                <div className="ml-20 lg:ml-16">Status</div>
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider whitespace-nowrap">
                                                <div className="ml-5 lg:ml-5">Action</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchQuery.length > 0 && dataResults.length === 0 ? (
                                            <p className="text-lg ml-4 mt-4">No data available.</p>
                                        ) : (
                                            sortedData.slice((currentPage - 1) * entriesToShow, currentPage * entriesToShow).map((event, index) => (
                                                <tr key={index}>
                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        <div className="flex items-center">
                                                            <div className="ml-1">
                                                                <p className="text-gray-900 dark:text-dark_text">
                                                                    {(currentPage - 1) * entriesToShow + index + 1}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        <div className="-ml-36 lg:-ml-20">{event.intFEventName}</div>
                                                    </td>
                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text lg:w-[450px]">
                                                        <div className="">{event.intFEventDescription}</div>
                                                    </td>
                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text whitespace-nowrap">
                                                        <span className="ml-12 lg:-ml-0">{event.intFEventStartDate} </span>
                                                    </td>
                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        <div className="flex items-end ml-2 lg:ml-0">
                                                            <span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center ml-10 dark:text-orange-200">
                                                                <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full dark:bg-orange-900"></span>
                                                                <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                                <span className="relative mt-[1px] leading-3 tracking-wider">
                                                                    Upcoming
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        <div className="-ml-16 lg:-ml-12">
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
                                                                                    event.intFTrainerName,
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
                                                                    >Sub-Events Details
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator />

                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer"
                                                                        onClick={e => {
                                                                            e.stopPropagation()
                                                                            openAttendanceModal(event.intFID);
                                                                        }}
                                                                    >Attendance List
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator />

                                                                    <DropdownMenuItem onClick={e => {
                                                                        e.stopPropagation();
                                                                        setMainEventForFeedback(event);
                                                                        openFeedbackModal(event.intFID);
                                                                    }}>Event Feedback
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator />

                                                                    <DropdownMenuItem onClick={e => {
                                                                        e.stopPropagation();
                                                                        const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === event.intFID);

                                                                        if (filteredSubEvent) {
                                                                            openQRCodeModal(event.intFID);
                                                                        }
                                                                    }}>Feedback &amp; Attendance Form
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}

                                        {/* pagination */}
                                        {sortedData.length < entriesToShow && (
                                            [...Array(entriesToShow - sortedData.length)]
                                                .map((_, index) => (
                                                <tr className="flex invisible" key={index}>
                                                    <td className="flex-1 px-5 py-5 bg-white text-sm dark:text-[#B0AA9F]">
                                                        <div className="flex items-center">
                                                            <div className="ml-[14px]">
                                                                <p className="text-gray-900 whitespace-no-wrap"></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="flex-1 px-5 py-5 bg-white text-sm dark:text-[#B0AA9F]">
                                                        <p className="text-gray-900 whitespace-no-wrap ml-3"></p>
                                                    </td>
                                                    <td className="flex-1 px-5 py-5 bg-white text-sm dark:text-[#B0AA9F]">
                                                        <p className="text-gray-900 whitespace-no-wrap"></p>
                                                    </td>
                                                    <td className="flex-1 px-5 py-5 bg-white text-sm dark:text-[#B0AA9F]">
                                                        <p className="text-gray-900 whitespace-no-wrap ml-1"></p>
                                                    </td>
                                                    <td
                                                        className={`flex-1 px-5 py-5 bg-white text-sm dark:text-[#B0AA9F]`}>
                                                        <span
                                                            className={`relative inline-block px-3 py-2 font-semibold text-gray-900 leading-tight`}>
                                                            <span
                                                                aria-hidden
                                                                className={`absolute inset-0 opacity-0 rounded-full`}></span>
                                                            <span className="relative"></span>
                                                        </span>
                                                    </td>
                                                    <td className="flex-1 px-5 py-5 bg-white text-sm dark:text-[#B0AA9F]">
                                                        <p className="text-gray-900 whitespace-no-wrap ml-3"></p>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                <div className="px-5 py-5 bg-white border-t hidden lg:flex items-center justify-between dark:bg-dark_mode_card dark:border-[#363B3D]">
                                    <div className="flex items-center text-[14px] text-base">
                                        <div className="mr-2 ml-3">
                                            <span className="text-sm lg:text-base dark:text-dark_text">Show</span>
                                        </div>

                                        {/* Filter By How Many Entries */}
                                        <div className="relative mr-2 ">
                                            <select
                                                value={entriesToShow}
                                                onChange={e =>
                                                    setEntriesToShow(parseInt(e.target.value))
                                                }
                                                className="appearance-none h-full rounded-l border block bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:bg-dark_mode_card dark:border-[#484E51] dark:text-dark_text">
                                                <option
                                                    value={5}
                                                    className="text-sm lg:text-base dark:text-dark_text">
                                                    5
                                                </option>
                                                <option
                                                    value={10}
                                                    className="text-sm lg:text-base dark:text-dark_text">
                                                    10
                                                </option>
                                                <option
                                                    value={20}
                                                    className="text-sm lg:text-base dark:text-dark_text">
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
                                            <span className="text-sm lg:text-base dark:text-dark_text">
                                                entries
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {dataResults.length > 0 ? (
                                            <span className="text-sm lg:text-base lg:text-[14px] lg:text-gray-900 lg:mr-2 hidden md:inline">
                                                1-{entriesToShow} of {dataResults?.length} entries
                                            </span>
                                        ) : (
                                            <span className="text-sm lg:text-base lg:text-[14px] lg:text-gray-900 lg:mr-2 hidden md:inline">
                                                1-{entriesToShow} of {mainEvents?.length} entries
                                            </span>
                                        )}
                                        

                                        <div className="flex">
                                            {/* Skip To First Page Button */}
                                            <button
                                                type="button"
                                                className="px-1 ml-8"
                                                onClick={handleSkipToFirstPage}
                                                disabled={currentPage === 1}
                                                style={{
                                                    cursor:
                                                        currentPage === 1
                                                            ? "not-allowed"
                                                            : "pointer",
                                                    opacity: currentPage === 1 ? 0.5 : 1,
                                                }}>
                                                <MdKeyboardDoubleArrowLeft className="text-3xl" />
                                            </button>

                                            {/* Arrow Previous Page Button */}
                                            <button
                                                type="button"
                                                className="px-1 ml-1"
                                                onClick={handleArrowLeftClick}
                                                disabled={currentPage === 1}
                                                style={{
                                                    opacity: currentPage === 1 ? 0.5 : 1,
                                                }}>
                                                <MdKeyboardArrowLeft className="text-3xl" />
                                            </button>

                                            {/* Pagination Buttons */}
                                            {generatePageNumbers().map((pageNumber, index) => (
                                                <button
                                                    key={index}
                                                    className={`py-1 px-3 ml-5 rounded font-medium text-sm lg:text-[15px] ${currentPage === pageNumber ? "text-slate-100 bg-slate-900" : "text-slate-800 bg-slate-200"
                                                        }`}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                >
                                                    {pageNumber === -1 ? '...' : pageNumber}
                                                </button>
                                            ))}

                                            {/* Arrow Next Page Button */}
                                            <button
                                                type="button"
                                                className="px-1 ml-5"
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
                                                <MdKeyboardArrowRight className="text-3xl" />
                                            </button>

                                            {/* Skip To Last Page Button */}
                                            <button
                                                type="button"
                                                className={`px-1 ml-1 ${currentPage ===
                                                    Math.ceil(mainEvents?.length / entriesToShow)
                                                    ? "pointer-events-none opacity-50"
                                                    : ""
                                                    }`}
                                                onClick={handleSkipToLastPage}>
                                                <MdKeyboardDoubleArrowRight className="text-3xl" />
                                            </button>
                                        </div>
                                    </div>                                    
                                </div>
                            </div>
                            {/*mobile view pagination */}
                            <div className="pagination flex justify-center items-center mt-5 pb-24 lg:hidden">
                                <button
                                    className="opacity-70"
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                >
                                    <MdKeyboardDoubleArrowLeft className="text-3xl" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="opacity-70"
                                >
                                    <MdKeyboardArrowLeft className="text-3xl" />
                                </button>

                                {/* Pagination Buttons */}
                                <div className="flex">
                                    <button
                                        className={`py-1 px-3 lg:ml-1 lg:mr-1 ml-2 mr-2 rounded font-medium text-sm lg:text-[15px] text-slate-100 bg-slate-900`}
                                        onClick={() => handlePageChange(currentPage)}
                                    >
                                        {currentPage}/ {pageCount}
                                    </button>
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pageCount}
                                    className="opacity-70"
                                >
                                    <MdKeyboardArrowRight className="text-3xl" />
                                </button>
                                <button
                                    className="opacity-70"
                                    onClick={() => handlePageChange(pageCount)}
                                    disabled={currentPage === pageCount}
                                >
                                    <MdKeyboardDoubleArrowRight className="text-3xl" />
                                </button>
                            </div>
                        </div>

                        <EventListModal isVisible={showSubEventModal} onClose={() => setShowSubEventModal(false)}>
                            <p className='font-semibold text-lg text-gray-600 p-2 dark:text-dark_text mb-4'>Sub-Event(s) Details</p>
                            <div className="bg-white h-[520px] w-auto lg:w-full lg:h-11/12 overflow-x-auto dark:bg-dark_mode_bg pb-5">
                                <table className="leading-normal lg:w-full mx-auto dark:bg-[#1D2021]">
                                    <thead>
                                        <tr>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                NO.
                                            </th>											
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                Event Name
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                Organizer
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                Venue
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                Start Time
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                End Time
                                            </th>
                                            <th className="flex-1 px-6 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                Maximum Seats
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subEvents
                                            .filter(subEvent => subEvent.sub_eventsMainID === selectedEvent.intFID)
                                            .map((subEvent, index) => (
                                                <tr key={index}>
                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        {(currentPage - 1) * entriesToShow + index + 1 }
                                                    </td>
                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                            {subEvent.sub_eventsName}
                                                    </td>

                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        {subEvent.sub_eventsOrganizer}
                                                    </td>

                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        {subEvent.sub_eventsVenue}
                                                    </td>

                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        {subEvent.sub_eventsStartDate} {subEvent.sub_eventsStartTime}
                                                    </td>

                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        {subEvent.sub_eventsStartDate} {subEvent.sub_eventsStartTime}
                                                    </td>

                                                    <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                        {subEvent.sub_eventsMaxSeats}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </EventListModal>

                        <ViewEventFeedback
                            isVisible={showFeedbackModal}
                            onClose={() => setShowFeedbackModal(false)}>
                            <FeedbackList event_id={feedbackID} mainEvent={mainEventForFeedback} />
                        </ViewEventFeedback>

                        <ViewAttendance_Modal
                            isVisible={showAttendanceModal}
                            onClose={() => setShowAttendanceModal(false)}>
                            <AttendanceList event_id={attendanceID} />
                        </ViewAttendance_Modal>

                        <QRCodeModal isVisible={showQRCodeModal} onClose={() => setShowQRCodeModal(false)}>
                            <div className="p-5">
                                {subEvents
                                    .filter(subEvent => subEvent.sub_eventsMainID === selectedMainEventID)
                                    .map((subEvent, index) => (
                                        <div key={index} className="mt-2">
                                            <span className="ml-12 text-lg font-semibold">‣ Session {index + 1}</span>
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ml-2 lg:ml-3 px-[5px] dark:bg-[#242729]"
                                                    onClick={e => {
                                                        setSelectedSubEventID(subEvent.sub_eventsID);
                                                        setShowQRCodesAttendance(true);
                                                        setShowQRCodeModal(false);
                                                    }}>
                                                    <span className="ml-2 text-slate-800 flex items-center mr-2">
                                                        <LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
                                                        <span className="ml-[3px] lg:ml-[5px] -mt-[1px] text-[11px] lg:text-[14px] dark:text-[#C1C7C1]">
                                                            Attendance
                                                        </span>
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex items-center bg-slate-200 rounded-lg py-2 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ml-2 lg:ml-9 px-[9px] dark:bg-[#242729]"
                                                    onClick={e => {
                                                        setSelectedSubEventID(subEvent.sub_eventsID);
                                                        setShowQRCodesFeedback(true);
                                                        setShowQRCodeModal(false);
                                                    }}>
                                                    <span className="ml-2 text-slate-800 flex items-center mr-2">
                                                        <LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
                                                        <span className="ml-[3px] lg:ml-[5px] -mt-[1px] text-[11px] lg:text-[14px] dark:text-[#C1C7C1]">
                                                            Feedback
                                                        </span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </QRCodeModal>


                        <Modal isVisible={showQRCodesAttendance} onClose={() => { setShowQRCodeModal(true); setShowQRCodesAttendance(false); }}>
                            <div className="ml-2 p-5 z-[999]">
                                <h3 className="lg:text-2xl font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
                                    Attendance Forms
                                </h3>
                                <div className="flex flex-col items-center justify-center">
                                    <QRCodeCanvas
                                        className="bg-white p-1"
                                        value={`${window.location.origin}/form/${selectedSubEventID}`}
                                        size={256}
                                    />
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                `${window.location.origin}/form/${selectedSubEventID}`
                                            )
                                        }
                                        className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        <Modal isVisible={showQRCodesFeedback} onClose={() => { setShowQRCodeModal(true); setShowQRCodesFeedback(false); }}>
                            <div className="ml-2 p-5 z-[999]">
                                <h3 className="lg:text-2xl font-medium text-gray-600 -ml-[9px] mb-3 mt-1 text-center dark:text-slate-200">
                                    Feedback Forms
                                </h3>
                                <div className="flex flex-col items-center justify-center">
                                    <QRCodeCanvas
                                        className="bg-white p-1"
                                        value={`${window.location.origin}/form/feedback/${selectedSubEventID}`}
                                        size={256}
                                    />
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                `${window.location.origin}/form/feedback/${selectedSubEventID}`
                                            )
                                        }
                                        className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px] dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        {/* mobile view pagination */}
                        {/* <div className="pagination flex justify-center items-center mt-5 pb-24 lg:hidden">
                            <button
                                className="opacity-70"
                                onClick={() => handleSkipToFirstPage}
                                disabled={currentPage === 1}
                            >
                                <DoubleLeftArrow />
                            </button>
                            <button
                                onClick={() => handleArrowLeftClick}
                                disabled={currentPage === 1}
                                className="opacity-70"
                            >
                                <LeftArrow />
                            </button> */}

                            {/* Pagination Buttons */}
                            {/* <div className="flex">
                                {[1, 2, 3].map(pageNumber => (
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

                            <button
                                onClick={handleArrowRightClick}
                                disabled={
                                    currentPage ===
                                    Math.ceil(mainEvents?.length / entriesToShow)
                                }
                                className="opacity-70"
                            >
                                <RightArrow />
                            </button>
                            <button
                                className="opacity-70"
                                onClick={handleSkipToLastPage}
                            >
                                <DoubleRightArrow />
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
};
