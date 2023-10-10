"use client";

import Image from "next/image";
import Link from 'next/link';
import ViewEvent_Modal from "@/components/ViewEvent_Modal";

import filterBar from "@/public/images/filter_bar_black.png";
import exportCSV from "@/public/images/export_csv.png";
import arrowLeft from "@/public/images/arrow_left.png";
import arrowRight from "@/public/images/arrow_right.png";
import skipLeft from "@/public/images/skip_left.png";
import skipRight from "@/public/images/skip_right.png";

import { FaSortAlphaUp, FaCalendarAlt } from "react-icons/fa";
import { IoMdRefresh, IoIosArrowBack } from "react-icons/io";
import { AiOutlineFieldTime } from "react-icons/ai";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";
import { MdPeople } from "react-icons/md";
import { MdAirlineSeatReclineNormal } from "react-icons/md";

import { Fragment, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SideBarDesktop from "@/components/layouts/SideBarDesktop";
import SideBarMobile from "@/components/layouts/SideBarMobile";
import TopBar from "@/components/layouts/TopBar";
import PencilNoteIcon from "@/components/icons/PencilNoteIcon";
import ViewAttendance_Modal from "@/components/ViewAttendance_Modal";

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatTime = (timeString: string): string => {
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', options);

    // Convert to lowercase and remove the space
    return formattedTime.replace(' ', '').toLowerCase();
};

type Info = {
    intFID: number;
    intFEventName: string;
    intFDescription: string;
    intFVenue: string;
    intFMaximumSeats: number;
    intFStartDate: string;
    intFStartTime: string;
    intFEndTime: string;
    intFOrganizer: string;
    intFFaculty: string;
};

type AttendanceDataType = {
    attFormsID: string;
    attFormsStaffID: string;
    attFormsStaffName: string;
    attFormsFacultyUnit: string;
}

export default function Home() {
    const supabase = createClientComponentClient();
    const [infos, setInfos] = useState<Info[]>([] as Info[]);
    const [entriesToShow, setEntriesToShow] = useState(10); // Show the entries
    const [searchQuery, setSearchQuery] = useState(""); // Search queries for search bar
    const [currentPage, setCurrentPage] = useState(1); // Define state for current page
    const [activePage, setActivePage] = useState(1); // Define state for active page
    const [sortBy, setSortBy] = useState(""); // Initialize state for sorting
    const [sortOrder, setSortOrder] = useState("asc"); // Initialize sort order (asc or desc)
    const [showSortOptions, setShowSortOptions] = useState(false); // State to control dropdown visibility
    const [showModalViewEvent, setShowModalViewEvent] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState({ 
        intFID: '', 
        intFName: '', 
        intFDescription: '', 
        intFStartDate: '', 
        intFStartTime: '', 
        intFEndTime: '', 
        intFVenue: '', 
        intFMaximumSeats: '', 
        intFOrganizer: '', 
        intFFaculty: '' });

    const [selectedEventImage, setSelectedEventImage] = useState("");
    // This is for attendance modal,
    const [attendanceData, setAttendanceData] = useState<AttendanceDataType[]>([]);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [numberOfAttendees, setNumberOfAttendees] = useState<number>(0);

    useEffect(() => {
        const fetchInfos = async () => {
            // Get the current date
            const currentDate = new Date().toISOString();
            // Fetch events where the start date is in the future
            const { data, error } = await supabase
                .from("internal_events")
                .select("*")
                .lt('intFStartDate', currentDate)
                .order("intFStartDate", { ascending: true });
            setInfos(data || []);
            
        };
        fetchInfos();
    }, [supabase]);

    //This is for view event modal
    const openModal = async (
        imageSrc: string,
        event_id: string,
        event_name: string,
        event_description: string,
        event_start_date: string,
        event_start_time: string,
        event_end_time: string,
        event_venue: string,
        event_maximum_seats: string,
        event_organizer: string,
        event_faculty: string
    ) => {
        setSelectedEventImage(imageSrc);
        setSelectedEvent({
            intFID: event_id,
            intFName: event_name,
            intFDescription: event_description,
            intFStartDate: event_start_date,
            intFStartTime: event_start_time,
            intFEndTime: event_end_time,
            intFVenue: event_venue,
            intFMaximumSeats: event_maximum_seats,
            intFOrganizer: event_organizer,
            intFFaculty: event_faculty,
        });

        // Fetch the attendance list for that event,
        const { data: attendanceList, error } = await supabase
            .from('attendance_list')
            .select()
            .eq('attListEventID', event_id);

        if (error) {
            console.error('Error fetching attendance list:', error);
            return;
        }

        attendanceList.forEach(async (entry) => {
            const { data: attendanceForms, error: formsError } = await supabase
                .from('attendance_forms')
                .select('attFormsListID')
                .eq('attFormsListID', entry.attListID);

            if (formsError) {
                console.error('Error fetching attendance forms:', formsError);
                return;
            }

            setNumberOfAttendees(attendanceForms.length);
        });

        setShowModalViewEvent(true);
    };

    
    // This is for attendance modal,
    const openAttendanceModal = async (event_id: string) => {
        try {
            const { data: attendanceListData, error: attendanceListError } = await supabase
                .from('attendance_list')
                .select('attListID')
                .eq('attListEventID', event_id);

            if (attendanceListError) {
                console.error('Error fetching attendance list data:', attendanceListError);
                return;
            }

            const attListIDs = attendanceListData.map((item) => item.attListID);

            const { data: attendanceFormData, error: attendanceFormError } = await supabase
                .from('attendance_forms')
                .select('*')
                .in('attFormsListID', attListIDs);

            if (attendanceFormError) {
                console.error('Error fetching attendance forms data:', attendanceFormError);
                return;
            }

            setAttendanceData(attendanceFormData);
            setSelectedEvent({
                intFID: event_id,
                intFName: '',
                intFDescription: '',
                intFStartDate: '',
                intFStartTime: '',
                intFEndTime: '',
                intFVenue: '',
                intFMaximumSeats: '',
                intFOrganizer: '',
                intFFaculty: '',
            });
            console.log('Attendance forms data:', attendanceFormData);
        } catch (error) {
            const typedError = error as Error;
            console.error('Error:', typedError.message);
        }

        setShowAttendanceModal(true);
    };

    // Refresh data from database
    const refreshData = async () => {
        const { data, error } = await supabase
            .from("internal_events")
            .select("intFID, intFEventName, intFDescription, intFMaximumSeats, intFVenue, intFStartDate, intFStartTime, intFEndTime, intFOrganizer, intFFaculty");

        setInfos(data!);
        console.log("Data refreshed successfully.");

        if (error) {
            console.log("Error fetching data: ", error.message);
        }
    };


    // Handle search input
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const filteredData = infos.filter(
            info =>
                info.intFEventName.toLowerCase().includes(query.toLowerCase()) ||
                info.intFVenue.toLowerCase().includes(query.toLowerCase()) ||
                info.intFStartDate.toLowerCase().includes(query.toLowerCase()) ||
                info.intFFaculty.toLowerCase().includes(query.toLowerCase()) ||
                info.intFOrganizer.toLowerCase().includes(query.toLowerCase()) ,
        );
        setInfos(filteredData);
    };

    const handleArrowLeftClick = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setActivePage(currentPage - 1);
        }
    };

    // go to next page
    const handleArrowRightClick = () => {
        if (currentPage < Math.ceil(infos.length / entriesToShow)) {
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
        const lastPage = Math.ceil(infos.length / entriesToShow);
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
        const header = Object.keys(infos[0]).join(",");
        const dataRows = infos.map(e => Object.values(e).join(",")).join("\n");

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
    const sortedData = infos.slice().sort((a, b) => {
        if (sortBy === "event") {
            if (sortOrder === "asc") {
                return b.intFEventName.localeCompare(a.intFEventName, undefined, { sensitivity: 'base' });
            } else {
                return a.intFEventName.localeCompare(b.intFEventName, undefined, { sensitivity: 'base' });
            }
        } else if (sortBy === "date") {
            const dateA = new Date(a.intFStartDate);
            const dateB = new Date(b.intFStartDate);
    
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
                        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                            <div className="inline-block min-w-full shadow rounded-sm overflow-hidden">
                                <table className="min-w-full leading-normal">
                                    {/* Table Header */}
                                    <thead>
                                        <tr className="flex">
                                            <th className="flex-1 pr-[2px] pl-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                No.
                                            </th>
                                            <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="-ml-2">Event Title</span>
                                            </th>
                                            <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="-ml-[1px]">Venue</span>
                                            </th>
                                            <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="-ml-4">Start Date</span>
                                            </th>
                                            <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="-ml-[3px]">Organizer</span>
                                            </th>
                                            <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="-ml-[3px]">Faculty</span>
                                            </th>
                                            <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                <span className="-ml-[3px]">Status</span>
                                            </th>
                                            <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                <span className="-ml-[3px]">Action</span>
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
                                            .map((info, index) => (
                                                <tr className="flex " key={index}>
                                                    <td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-xs mt-1 lg:text-sm">
                                                        <div className="flex items-center">
                                                            <div className="ml-[14px]">
                                                                <p className="text-gray-900 whitespace-no-wrap">
                                                                    {(currentPage - 1) *
                                                                        entriesToShow +
                                                                        index +
                                                                        1}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="flex-1 px-3 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
                                                        <p className="text-gray-900 whitespace-no-wrap -ml-8">
                                                            {info.intFEventName}
                                                        </p>
                                                    </td>
                                                    <td className="flex-1 px-3 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm ">
                                                        <p className="text-gray-900 whitespace-no-wrap -ml-1">
                                                            {info.intFVenue}
                                                        </p>
                                                    </td>
                                                    <td className="flex-1 px-3 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
                                                        <p className="text-gray-900 whitespace-no-wrap  -ml-4">
                                                            {info.intFStartDate}
                                                        </p>
                                                    </td>
                                                    <td className="flex-1 px-3 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
                                                        <p className="text-gray-900 whitespace-no-wrap ml-2">
                                                            {info.intFOrganizer}
                                                        </p>
                                                    </td>
                                                    <td className="flex-1 px-3 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm" >
                                                        <p className="text-gray-900 whitespace-no-wrap ml-6">
                                                            {info.intFFaculty}
                                                        </p>
                                                    </td>
                                                    <td className="flex-1 px-3 py-5 border-b border-gray-200">
                                                        <div className="flex items-end">
                                                            <span className="relative px-3 py-[5px] font-semibold text-slate-800 text-xs flex items-center">
                                                                <span aria-hidden className="absolute inset-0 bg-green-500 opacity-50 rounded-full"></span>
                                                                <AiOutlineFieldTime className=" text-2xl font-bold relative" />
                                                                <span className="relative mt-[1px] leading-3 tracking-wider ">Completed</span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="relative flex-1 px-3 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
                                                        <p className="text-sky-600 font-medium whitespace-no-wrap cursor-pointer ml-6 hover:text-slate-800" onClick={() => openModal("https://source.unsplash.com/600x300?party", info.intFID.toString(), info.intFEventName, info.intFDescription, info.intFStartDate, info.intFStartTime, info.intFEndTime, info.intFVenue, info.intFMaximumSeats.toString(), info.intFOrganizer, info.intFFaculty)}>
                                                            View Details
                                                        </p>
                                                        <p className="mt-3 text-sky-600 font-medium whitespace-no-wrap cursor-pointer ml-6 hover:text-slate-800" onClick={() => openAttendanceModal(info.intFID.toString())}>
                                                            Attendance
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}

                                            <ViewEvent_Modal isVisible={showModalViewEvent} onClose={() => setShowModalViewEvent(false)}>
                                                <div className="py-[30px] lg:py-[100px] relative">
                                                    <img
                                                        src={selectedEventImage}
                                                        alt="Random"
                                                        className="absolute h-[200px] lg:h-[258px] object-cover -mt-[38px] lg:-mt-[100px] rounded-t-lg -ml-[0.25px] lg:ml-2 transform hover:scale-110 hover:rotate-1 scale-[1.063] lg:scale-[1.068] transition duration-300 shadow-sm"
                                                    />
                                                    <div className="ml-[7px] lg:ml-[10px]">

                                                        <h3 className="text-[16px] lg:text-[19px] font-semibold text-slate-800 mb-1 mt-[190px] lg:mt-[183px]">About this event</h3>
                                                        <p className="text-[12px] lg:text-[14px] text-mb-7 -mb-1 lg:mb-5 font-normal text-slate-500 mt-[10px]">
                                                            {selectedEvent.intFDescription}
                                                        </p>

                                                        <div className="flex items-center mt-4">
                                                            <HiMiniCalendarDays className="text-[32px] lg:text-2xl mr-2 text-slate-800 -mt-[2px]" />
                                                            <p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px] mt-[0.5px]">{formatDate(selectedEvent.intFStartDate)}</p>
                                                            <span className="mx-2 text-slate-800 ml-[15px] lg:ml-[38px] mr-6">|</span>
                                                            <FiClock className="text-[30px] lg:text-[21px] mr-2 text-slate-800 -mt-[1px]" />
                                                            <p className="text-slate-600 text-[12px] lg:text-[13px]">{formatTime(selectedEvent.intFStartTime)}</p>
                                                            <span className="mx-2 text-slate-800 -mt-[2px]">-</span>
                                                            <p className="text-slate-600 text-[12px] lg:text-[13px]">{formatTime(selectedEvent.intFEndTime)}</p>
                                                        </div>
                                                        <div className="flex items-center mt-[10px] lg:mt-[14px]">
                                                            <FaLocationDot className="text-xl lg:text-2xl -ml-[0.5px] lg:ml-0 mr-2 text-slate-800" />
                                                            <p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px]">{selectedEvent.intFVenue}</p>
                                                        </div>
                                                        <div className="flex items-center mt-[11px] lg:mt-[14px]">
                                                            <MdPeople className="text-2xl mr-2 text-slate-800 -ml-[1px] lg:ml-[1px]" />
                                                            <p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] -ml-[2px] lg:ml-0">5 attendees</p>
                                                        </div>
                                                        <div className="flex items-center mt-[15px] lg:mb-0 mb-[3px]">
                                                            <MdAirlineSeatReclineNormal className="text-2xl mr-2 text-slate-800 lg:ml-[2px]" />
                                                            <p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] lg:-ml-[1px]">{selectedEvent.intFMaximumSeats} seats</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ViewEvent_Modal>

                                            <ViewAttendance_Modal isVisible={showAttendanceModal} onClose={() => setShowAttendanceModal(false)}>
                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-center justify-center text-text text-[20px] text-center -mt-8">
                                                        <PencilNoteIcon /> <span className="ml-2.5">Attendance List</span>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <Link href={`/attendance/${selectedEvent.intFID}`} passHref legacyBehavior={true}>
                                                            <a className="flex items-center bg-slate-200 rounded-lg text-[15px] hover:bg-slate-300 focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm mb-3.5">
                                                                <span className="text-slate-800 p-[5px]">View More</span>
                                                            </a>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="text-left text-black text-[13px] pl-9 pb-5 -mt-[28px]">
                                                    Total Attendees: 5
                                                </div>
                                                {attendanceData && attendanceData.length > 0 ? (
                                                    <div className="overflow-y-auto max-h-[500px]">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr>
                                                                    <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">
                                                                        Staff ID
                                                                    </th>
                                                                    <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                                        Staff Name
                                                                    </th>
                                                                    <th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                                        Faculty/ Unit
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {attendanceData.map((attendanceItem) => (
                                                                    <tr key={attendanceItem.attFormsID}>
                                                                        <td className="flex-1 px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                                            {attendanceItem.attFormsStaffID}
                                                                        </td>
                                                                        <td className="flex-1 px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                                            {attendanceItem.attFormsStaffName}
                                                                        </td>
                                                                        <td className="flex-1 px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                                            {attendanceItem.attFormsFacultyUnit}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-gray-600 mt-4">No attendance data available.</div>
                                                )}
                                            </ViewAttendance_Modal>



                                        {Array.from({
                                            length: entriesToShow - infos?.length,
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
                                            1-{entriesToShow} of {infos?.length} entries
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
                                                                    infos.length /
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
                                                    Math.ceil(infos?.length / entriesToShow)
                                                }
                                                style={{
                                                    opacity:
                                                        currentPage ===
                                                            Math.ceil(
                                                                infos?.length / entriesToShow,
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
                                                    Math.ceil(infos?.length / entriesToShow)
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
                    </div>
                </div>
            </div>
        </div>
    )
};
