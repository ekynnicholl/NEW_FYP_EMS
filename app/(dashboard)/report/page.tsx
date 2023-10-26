"use client";

import Image from "next/image";

import EventModal from "@/components/Event_List_Modal";

import filterBar from "@/public/images/filter_bar_black.png";
import exportCSV from "@/public/images/export_csv.png";
import arrowLeft from "@/public/images/arrow_left.png";
import arrowRight from "@/public/images/arrow_right.png";
import skipLeft from "@/public/images/skip_left.png";
import skipRight from "@/public/images/skip_right.png";

import { FaSortAlphaDown, FaSortNumericDown, FaSortAmountUp } from "react-icons/fa";
import { IoMdRefresh, IoIosArrowBack } from "react-icons/io";

import { Fragment, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import RightArrow from "@/components/icons/RightArrow";
import DoubleRightArrow from "@/components/icons/DoubleRightArrow";
import DoubleLeftArrow from "@/components/icons/DoubleLeftArrow";
import LeftArrow from "@/components/icons/LeftArrow";

type Info = {
    attFormsStaffID: string;
	attFormsStaffName: string;
	attFormsFacultyUnit: string;
	attFSubEventID: string;
};

type subEvents = {
    sub_eventsID: string;
	sub_eventsMainID: string;
	sub_eventsName: string;
	sub_eventsStartDate: string;
	sub_eventsStartTime: string;
};

export default function Home() {
	const supabase = createClientComponentClient();
    const [entriesToShow, setEntriesToShow] = useState(10); // Show the entries
    const [searchQuery, setSearchQuery] = useState(""); // Search queries for search bar
    const [currentPage, setCurrentPage] = useState(1); // Define state for current page
    const [activePage, setActivePage] = useState(1); // Define state for active page
    const [sortBy, setSortBy] = useState(""); // Initialize state for sorting
    const [sortOrder, setSortOrder] = useState("asc"); // Initialize sort order (asc or desc)
    const [showSortOptions, setShowSortOptions] = useState(false); // State to control dropdown visibility

	const [showModal, setShowModal] = useState(false);
	const [infos, setInfos] = useState<Info[]>([] as Info[]);
	const [subEventsAttended, setSubEventsAttended] = useState<subEvents[]>([]);
	const [mainEventAttended, setMainEventAttended] = useState<{intFEventName: string[];}[]>([]);
	const [aggregatedInfo, setAggregatedInfo] = useState<{ 
		staffID: number; 
		staffName: string;
		staffFaculty: string;
		totalSubEvents: number;
		eventsAttended: string[];
	}[]>([]);
	
	// Fetch data from database
	useEffect(() => {
		const fetchInfos = async () => {
			const { data: staffData, error: attendedEventError } = await supabase
				.from("attendance_forms")
				.select("*");
		
			if (attendedEventError) {
				console.error("Error fetching staff attendance data:", attendedEventError);
				return;
			}
		
			// Group the attendance forms by staff ID, store staff names, and calculate the total subevents attended
			const groupedData = staffData.reduce((result, form) => {
				const staffID = form.attFormsStaffID;
				if (!result[staffID]) {
				result[staffID] = {
					staffID,
					staffName: form.attFormsStaffName,
					staffFaculty: form.attFormsFacultyUnit,
					totalSubEvents: 0,
					eventsAttended: [],
				};
				}
				result[staffID].totalSubEvents++;
				result[staffID].eventsAttended.push(form.attFSubEventID);
				return result;
				
			}, {});
			
			// Set the aggregated data in the state
			setAggregatedInfo(Object.values(groupedData));
		
			};
		fetchInfos();
	}, [supabase]);
	
	//this is use to fetch sub event data of staff attended
	const fetchSubEventList = async (event_id: string[]) => {
		const { data: subEvents, error: subEventsError } = await supabase
			.from("sub_events")
			.select("*")
			.in("sub_eventsID", event_id);

		if (subEventsError) {
			console.error("Error fetching sub_events:", subEventsError);
			return;
		}

		setSubEventsAttended(subEvents || []);

		const mainEventIDs = subEvents.map((subEvent) => subEvent.sub_eventsMainID);

		//extract the main event title
		const {data: mainEvent, error: mainEventError} = await supabase
			.from("internal_events")
			.select("intFEventName")
			.in("intFID", mainEventIDs)

			if (mainEventError) {
				console.error("Error fetching sub_events:", mainEventError);
				return;
			}

			console.log("main event: ", mainEvent);			
			setMainEventAttended(mainEvent || []);
	}

	//display the sub event attended modal
	const openModal = async (staff_event_id: string[]) => {		
		fetchSubEventList(staff_event_id);
		setShowModal(true);
	}
	
	// Refresh data from database
	const refreshData = async () => {
		const fetchInfos = async () => {
			const { data: staffData, error: attendedEventError } = await supabase
				.from("attendance_forms")
				.select("*");
		
			if (attendedEventError) {
				console.error("Error fetching staff attendance data:", attendedEventError);
				return;
			}
		
			// Group the attendance forms by staff ID, store staff names, and calculate the total subevents attended
			const groupedData = staffData.reduce((result, form) => {
				const staffID = form.attFormsStaffID;
				if (!result[staffID]) {
				result[staffID] = {
					staffID,
					staffName: form.attFormsStaffName,
					staffFaculty: form.attFormsFacultyUnit,
					totalSubEvents: 0,
					eventsAttended: [],
				};
				}
				result[staffID].totalSubEvents++;
				result[staffID].eventsAttended.push(form.attFSubEventID);
				return result;
				
			}, {});
			
			// Set the aggregated data in the state
			setAggregatedInfo(Object.values(groupedData));
		
			};
		fetchInfos();
    };

	
	// Handle search input
	const handleSearch = (query:string) => {
		setSearchQuery(query);
		const filteredData = aggregatedInfo.filter(
			info =>
				info.staffName.toLowerCase().includes(query.toLowerCase()) ||
				info.staffID ||
				info.staffFaculty.toLowerCase().includes(query.toLowerCase()),
		);
		setAggregatedInfo(filteredData);
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

	// go to previous page
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
		if (sortBy === "staffid" || sortBy == "name" || sortBy == "eventattended") {
			// If it's already sorted by name, toggle between 'asc' and 'desc'
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			// Set the sorting option to name and default to 'asc'
			setSortBy("staffid");
			setSortOrder("asc");
		}
		setShowSortOptions(false);
	};

	// An array of sorting options
	const sortOptions = [
		{ label: "Staff Name", value: "name" },
		{ label: "Staff ID", value: "staffid" },
		{ label: "Number of Event Attended", value: "eventattended" },
		
	];

	// Modify the sorting logic based on the selected option and sort order
	const sortedData = aggregatedInfo.slice().sort((a, b) => {
		if (sortBy === "staffid") {
			// Sort by ID
			if (sortOrder === "asc") {
				return a.staffID - b.staffID;
			} else {
				return b.staffID - a.staffID;
			}
		}else if(sortBy === "name")
		{
			if(sortOrder === "asc"){
                return b.staffName.localeCompare(a.staffName, undefined, {sensitivity: 'base'}); 
            }else{
                return a.staffName.localeCompare(b.staffName, undefined, {sensitivity: 'base'}); 
            }  
		}
		else if(sortBy === "eventattended")
		{
			if(sortOrder === "asc"){
                return b.totalSubEvents - a.totalSubEvents;
            }else{
                return a.totalSubEvents - b.totalSubEvents;
            }  
		}
		return 0;
	});

	return (
		<div className="h-screen flex flex-row justify-start">
			<div className="flex-1 container mx-auto px-4 sm:px-8 py-8 bg-slate-100">
				<div className="bg-white rounded p-8">
					<div className="inline-flex">
						<span className="mt-[5px]"><a href="/homepage"><IoIosArrowBack className="text-2xl -mt-[1.5px] mr-[6px] text-slate-800 -ml-1" /></a></span>
						<h1 className="text-xl font-bold lg:text-2xl"><span className="ml-[5px]">Reports</span></h1>
					</div>
					<Fragment>
						<div className="flex-1 items-center justify-left mb-8">
							
						</div>
					</Fragment>

					<div className="flex items-center justify-between mb-8">
						{/* Refresh Button */}
						<button
							type="button"
							className="items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden"
							onClick={refreshData}>
							<IoMdRefresh className="text-xl text-slate-800" />
							<span className="ml-2 -mt-[1.25px] text-slate-800">
								Refresh
							</span>
						</button>

						<div className="flex items-center">
							{/* Search Input */}
							<div className="max-w-full relative shadow hover:shadow-sm border border-slate-300 rounded mr-3">
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
                                        <div className="bg-white border-l border-t border-r border-gray-200 shadow-md w-72 rounded-lg">
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
													{option.value === "name" && (
														<FaSortAlphaDown className="mr-3 ml-2 text-slate-800" />
													)}
													{option.value === "staffid" && (
														<FaSortNumericDown className="mr-3 ml-2 text-slate-800" />
													)}
													{option.value === "eventattended" && (
														<FaSortAmountUp className="mr-3 ml-2 text-slate-800 whitespace-nowrap" />
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
									<tr className="flex">
										<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
											NO.
										</th>
										<th className="flex-1 px-[21px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
											<span className="ml-1">Staff Name</span>
										</th>
										<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
											<span className="-ml-[1px]">Staff ID</span>
										</th>
										<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
											<span className="-ml-[1px]">Faculty / Unit</span>
										</th>
										<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
											<span className="-ml-[3px]">Event Attended</span>
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
											<tr className="flex" key={info.staffID} 
												onClick={() => {openModal(info.eventsAttended);}}>
												<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
													<div className="flex items-center">
														<div className="ml-[14px]">
															<p className="text-gray-900 whitespace-no-wrap">
																{(currentPage - 1) * entriesToShow + index + 1}
															</p>
														</div>
													</div>
												</td>
												<td className="flex-1 -ml-16 lg:ml-0 lg:px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
													<p className="text-gray-900 whitespace-no-wrap lg:ml-3">
														{info.staffName}
													</p>
												</td>
												<td className="flex-1 -ml-2 lg:ml-0 lg:px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
													<p className="text-gray-900 whitespace-no-wrap">
														{info.staffID}
													</p>
												</td>
												<td className="flex-1 lg:px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
													<p className="text-gray-900 whitespace-no-wrap -ml-6 lg:ml-1">
														{info.staffFaculty}
													</p>
												</td>

												<td className="flex-1 lg:px-5 py-5 border-b border-gray-200 bg-white cursor-pointer hover:bg-slate-200 text-xs lg:text-sm">
													<p className="text-gray-900 whitespace-no-wrap ml-1">
														{info.totalSubEvents}
													</p>
												</td>
                                                												
											</tr>
										))}

									

									{/* pagination */}
									{Array.from({
										length: entriesToShow - aggregatedInfo.length,
									}).map((_, index) => (
										<tr className="flex invisible" key={index}>
											<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
												<div className="flex items-center">
													<div className="ml-[14px]">
														<p className="text-gray-900 whitespace-no-wrap"></p>
													</div>
												</div>											</td>
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
                                    <div className=" items-center text-[14px] text-base hidden lg:flex">
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
                                    <div className="ems-center hidden lg:flex">
                                        <span className="text-sm lg:text-base lg:text-[14px] lg:text-gray-900 lg:mr-2 hidden md:inline">
                                            1-{entriesToShow} of {aggregatedInfo?.length} entries
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
                                                                    aggregatedInfo.length /
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
                                                    Math.ceil(aggregatedInfo?.length / entriesToShow)
                                                }
                                                style={{
                                                    opacity:
                                                        currentPage ===
                                                            Math.ceil(
                                                                aggregatedInfo?.length / entriesToShow,
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
                                                    Math.ceil(aggregatedInfo?.length / entriesToShow)
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

					{/* mobile view table*/}
					<div className="grid grid-cols-1 gap-4 mb-12 lg:hidden">
                            {sortedData                                
                                .map((info, index) => (
                                    <div key={info.staffID} className="bg-slate-100 p-4 rounded-lg shadow">
                                        <table className="w-full">
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    No.
                                                </th>
                                                <td className="float-right flex text-xs mt-3 px-4">
                                                    {(currentPage - 1) * 3 + index + 1}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                    Staff Name
                                                </th>
                                                <td className="float-right text-xs mt-3 px-4">
                                                    {info.staffName}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                    Staff ID
                                                </th>
                                                <td className="float-right text-xs mt-3 px-4">
                                                    {info.staffID}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                    Faculty / Unit
                                                </th>
                                                <td className="float-right text-xs mt-3 px-4">
                                                    {info.staffFaculty}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-gray-200 bg-gray-100">
                                                <th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                                    Event Attended
                                                </th>
                                                <td className="float-right text-xs py-1 mr-4">
                                                    {info.totalSubEvents}
                                                </td>
                                            </tr> 

											<tr className="bg-gray-100">
												<span className="text-sky-800 float-right border bg-slate-200 rounded-full p-2 mt-2">
													<p onClick={() => {openModal(info.eventsAttended)}}>View</p>
												</span>                                                
                                            </tr>      
                                        </table>
                                    </div>
                                ))}											
                    </div>		

					{/*mobile view pagination */}
					 <div className="pagination flex justify-center items-center mt-5 pb-24 lg:hidden">
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
						</button>

						 {/* Pagination Buttons */}
						 <div className="flex">
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
                                        aggregatedInfo.length /
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
								Math.ceil(aggregatedInfo?.length / entriesToShow)
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
					</div>
				</div>
			</div>
			
			{/* mobile view event attended modal */}
			<EventModal isVisible={showModal} onClose={() => setShowModal(false)}>
				<p className='font-semibold text-md text-gray-600 p-2 ml-2'>Sub-Events Attended</p>
				<div className="p-5 bg-slate-100 h-[520px] lg:w-[1160px] lg:h-[420px] ml-1 overflow-auto">
                    <table className="leading-normal w-[1090px] ml-4 hidden lg:table">
						<thead>
							<tr className="flex">
								<th className="flex-1 pl-[33px] px-[10px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
									NO.
								</th>
								<th className="flex-1 pr-[120px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
									Main Event
								</th>
								<th className="flex-1 pr-[120px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
									Sub-Event Session
								</th>
								<th className="flex-1 pr-[120px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
									Start Date
								</th>
							</tr>
						</thead>
					<tbody>
						{subEventsAttended																
							.map((subEvent, index) => (
							<tr className="flex" 
								key={subEvent.sub_eventsID} 
								onClick={() => setShowModal(true)}>
									<td className="flex-1 pl-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
										<div className="flex items-center">
											<div className="ml-[14px]">
												<p className="text-gray-900 whitespace-nowrap">
													{(currentPage - 1) * entriesToShow + index + 1}
												</p>
											</div>
										</div>
									</td>
									<td className="flex-1 pr-[120px] py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
										<p className="text-gray-900 whitespace-nowrap ml-4">
											{mainEventAttended[index]?.intFEventName || "N/A"}
										</p>
									</td>

									<td className="flex-1 pr-[120px] py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
										<p className="text-gray-900 whitespace-nowrap ml-4">
											{subEvent.sub_eventsName}
										</p>
									</td>

									<td className="flex-1 pr-[120px] py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
										<p className="text-gray-900 whitespace-nowrap ml-2">
											{subEvent.sub_eventsStartDate} {subEvent.sub_eventsStartTime}
										</p>
									</td>
								</tr>
							))}
						</tbody>
					</table>	

					{/* mobile view */}											
					<div className="grid grid-cols-1 gap-4 lg:hidden">
						{subEventsAttended
							.map((subEvent, index) => (
								<div className="bg-slate-100 p-4 rounded-lg overflow-auto shadow">
									<table className="w-full overflow-auto"> 
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
												Main Event
											</th>
											<td className="float-right flex text-xs mt-3 px-4">
												{mainEventAttended[index]?.intFEventName || "N/A"}
											</td>
										</tr>
										<tr className="border-b-2 border-gray-200 bg-gray-100">
											<th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Sub-Event Session
											</th>
											<td className="float-right flex text-xs mt-3 px-4">
												{subEvent.sub_eventsName}
											</td>
										</tr>															
										<tr className="bg-gray-100">
											<th className="py-3 float-left text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Start Date
											</th>
											<td className="float-right flex text-xs mt-3 px-4">
												{subEvent.sub_eventsStartDate} {subEvent.sub_eventsStartTime}
											</td>
										</tr>																
									</table>
								</div>
							))}
					</div>
				</div>
			</EventModal>
		</div>	
	);
}
