"use client";

import Image from "next/image";

import EventModal from "@/components/Event_List_Modal";

import filterBar from "@/public/images/filter_bar_black.png";
import exportCSV from "@/public/images/export_csv.png";

import { FaSortAlphaDown, FaSortNumericDown, FaSortAmountUp } from "react-icons/fa";
import { IoMdRefresh, IoIosArrowBack } from "react-icons/io";
import { MdKeyboardDoubleArrowLeft, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowRight, MdAccessTimeFilled } from "react-icons/md";
import { Fragment, useState, useEffect, SetStateAction, useRef, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ExpenditureUser from "@/components/tables/expenditureUser";
import * as XLSX from 'xlsx';
import { Info } from "lucide-react";
import Link from "next/link";

type Info = {
	staffID: string;
	staffName: string;
	staffEmail: string;
	staffFaculty: string;
	totalSubEvents: number;
	allEventsAttended: {
		programName: string;
		totalHours: number;
		startDate: string;
		endDate: string;
		subEventStartTime?: string;
		subEventEndTime?: string;
	}[];
	grandTotalHours: number;
}

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

	const [dataResults, setDataResults] = useState<Info[]>([]);
	const [aggregatedInfo, setAggregatedInfo] = useState<Info[]>([]);

	const PAGE_SIZE = 1000;

	const fetchInfos = async () => {
		let staffData: any[] = [];
		let page = 0;
		let hasMore = true;

		while (hasMore) {
			const { data: fetchedData, error } = await supabase
				.from("attendance_forms")
				.select("*")
				.not('attFormsStaffID', 'eq', 0)
				.not('attFormsStaffID', 'eq', 1)
				.not('attFormsStaffID', 'eq', 2)
				.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

			if (error) {
				// console.error("Error fetching staff attendance data:", error);
				return;
			}

			if (fetchedData.length < PAGE_SIZE) {
				hasMore = false;
			}

			staffData = [...staffData, ...fetchedData];
			page++;
		}

		// Fetch other data as usual
		const { data: subEvents, error: subEventsError } = await supabase
			.from("sub_events")
			.select("*")
			.eq("sub_eventsIsHidden", 0);

		if (subEventsError) {
			console.error("Error fetching sub_events:", subEventsError);
			return;
		}

		const { data: mainEvents, error: mainEventsError } = await supabase
			.from("internal_events")
			.select("*")
			.eq("intFEventHidden", false)
			.eq("intFIsHidden", 0);

		if (mainEventsError) {
			console.error("Error fetching internal_events:", mainEventsError);
			return;
		}

		const { data: externalEvents, error: externalEventsError } = await supabase
			.from("external_forms")
			.select("*")
			.eq("isHidden", 0);

		if (externalEventsError) {
			console.error("Error fetching external_forms:", externalEventsError);
			return;
		}

		// Main Event = 90ee4244-92b4-4dd3-889a-c1226e639419
		// Sub Event = 7089bb42-865f-4aa8-a88a-b449cc46c81d

		// Create a set of visible internal event IDs
		const visibleInternalEventIDs = new Set(mainEvents.map(event => event.intFID));

		// Filter sub-events to include only those linked to visible internal events
		const visibleSubEvents = subEvents.filter(subEvent =>
			visibleInternalEventIDs.has(subEvent.sub_eventsMainID)
		);

		// Filter attendance forms to include only those linked to visible sub-events
		const visibleAttendanceForms = staffData.filter(staffDataFilter =>
			visibleSubEvents.some(subEvent => subEvent.sub_eventsID === staffDataFilter.attFSubEventID)
		);

		// Log filtered data for debugging
		console.log("Visible Sub Events:", visibleSubEvents);
		console.log("Visible Events:", visibleInternalEventIDs);
		// console.log("Visible Attendance Forms:", visibleAttendanceForms);

		// Group the attendance forms by staff ID
		const groupedData = visibleAttendanceForms.reduce((result, form) => {
			const uniqueStaffID = form.attFormsStaffID;

			if (!result[uniqueStaffID]) {
				result[uniqueStaffID] = {
					staffID: form.attFormsStaffID,
					staffName: form.attFormsStaffName,
					staffEmail: form.attFormsStaffEmail,
					staffFaculty: form.attFormsFacultyUnit,
					totalSubEvents: 0,
					allEventsAttended: [],
					grandTotalHours: 0,
				};

				// Add external events (NTFs)
				result[uniqueStaffID].allEventsAttended.push(
					...externalEvents
						.filter(event => event.staff_id === uniqueStaffID)
						.map(event => ({
							programName: event.program_title,
							totalHours: event.total_hours,
							startDate: event.commencement_date,
							endDate: event.completion_date,
						}))
				);
			}

			result[uniqueStaffID].totalSubEvents++;

			// Find matching sub-events
			const matchingSubEvents = visibleSubEvents.filter(e => e.sub_eventsID === form.attFSubEventID);

			if (uniqueStaffID == 'SS282') {
				console.log(matchingSubEvents);
				// console.log(form);
			}

			if (matchingSubEvents.length > 0) {
				// Find related visible main events
				const relatedMainEvents = mainEvents.filter(event =>
					event.intFID === matchingSubEvents[0].sub_eventsMainID
				);

				result[uniqueStaffID].allEventsAttended.push(
					...relatedMainEvents.map(event => ({
						programName: event.intFEventName,
						totalHours: event.intFTotalHours,
						startDate: event.intFEventStartDate,
						endDate: event.intFEventEndDate,
						subEventStartTime: matchingSubEvents.find(e => e.sub_eventsMainID === event.intFID)?.sub_eventsStartTime ?? null,
						subEventEndTime: matchingSubEvents.find(e => e.sub_eventsMainID === event.intFID)?.sub_eventsEndTime ?? null,
					}))
				);
			}

			const totalHours = result[uniqueStaffID].allEventsAttended.reduce((total: any, event: { totalHours: any; }) => total + event.totalHours, 0);
			result[uniqueStaffID].grandTotalHours = totalHours;

			return result;
		}, {});

		// Log grouped data for debugging
		// console.log("Grouped Data:", groupedData);

		setAggregatedInfo(Object.values(groupedData));
	};


	// Fetch data from database
	useEffect(() => {
		fetchInfos();
	}, [supabase]);

	const [eventsAttended, setEventsAttended] = useState<{ programName: string; totalHours: number; startDate: string; endDate: string; }[]>([]);
	const [filteredEventResults, setFilteredEventResults] = useState<{ programName: string; totalHours: number; startDate: string; endDate: string; }[]>([]);

	//display the sub event attended modal
	const openModal = async (allEvents: { programName: string; totalHours: number; startDate: string; endDate: string; }[]) => {
		setEventsAttended(allEvents || []);
		setShowModal(true);
	}

	// Refresh data from database
	const refreshData = () => {
		setActiveTab('all');
		setSearchQuery("");
		setSelectedFacultyUnit("");
		setSelectedFilterStaff("");
		setSelectedFilterStudent("");
	};

	const [activeTab, setActiveTab] = useState<'all' | 'staff' | 'student'>('staff');

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (currentPage >= 1) {
			setCurrentPage(1);
		}
		filterUserData(activeTab, query);
	};

	type ColumnMapping = {
		[key: string]: string;
	};

	const columnMapping: ColumnMapping = {
		staffID: 'Staff/ Student ID',
		staffName: 'Full Name',
		staffFaculty: 'Faculty / Unit',
		eventProgramName: 'Event Program Name',
		eventStartDate: 'Event Start Date',
		eventEndDate: 'Event End Date',
		subEventStartTime: 'Event Start Time',
		subEventEndTime: 'Event End Time',
		// subEventsCount: 'Event Count',
		totalHours: 'Training Hours (H)',
		grandTotalHours: 'Total Hours (H)',
		totalSubEvents: 'Total Event(s) Attended',
	};

	const convertToXLSX = (data: Info[], columnMapping: ColumnMapping) => {
		const header = Object.keys(columnMapping).map((key) => columnMapping[key]);
		console.log(data);

		// Prepare the body with events included
		const body: any[] = [];
		const staffMap = new Map<string, boolean>(); // To track if staff details have been added for a staffID

		data.forEach((row) => {
			const { staffID, staffName, staffFaculty, totalSubEvents, grandTotalHours, allEventsAttended } = row;

			allEventsAttended.forEach((event) => {
				// Create a new row for each event
				const newRow: any = {
					staffID: staffMap.has(staffID) ? null : staffID, // Include staffID only once
					staffName: staffMap.has(staffID) ? null : staffName, // Include staffName only once
					staffFaculty: staffMap.has(staffID) ? null : staffFaculty, // Include staffFaculty only once
					// subEventsCount: '1',
					totalHours: event.totalHours,
					eventProgramName: event.programName,
					eventStartDate: event.startDate,
					eventEndDate: event.endDate,
					subEventStartTime: event.subEventStartTime,
					subEventEndTime: event.subEventEndTime,
					grandTotalHours: staffMap.has(staffID) ? null : grandTotalHours, // Include grandTotalHours only once
					totalSubEvents: staffMap.has(staffID) ? null : totalSubEvents,
				};

				// Mark that staff details and grandTotalHours have been included for this staffID
				if (!staffMap.has(staffID)) {
					staffMap.set(staffID, true);
				}

				// Handle the attFormsStaffID mapping
				newRow.attFormsStaffID = staffID === '0' ? 'External Visitor' :
					staffID === '1' ? 'Secondary Student' :
						staffID === '2' ? 'Teacher' :
							staffID;

				body.push(newRow);
			});
		});

		// Map each row to the order specified in columnMapping
		const formattedBody = body.map((row) => Object.keys(columnMapping).map((key) => row[key as keyof typeof row]));

		const ws = XLSX.utils.aoa_to_sheet([header, ...formattedBody]);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, `Staff Attendance Data`);

		const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }); // Change type to 'array'

		return wbout;
	};

	const downloadXLSX = (data: Info[]) => {
		const xlsxContent = convertToXLSX(data, columnMapping);
		const blob = new Blob([xlsxContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'staff_attendance_data.xlsx';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= Math.ceil(dataResults.length / entriesToShow)) {
			setCurrentPage(page);
		}
	};

	useEffect(() => {
		setCurrentPage(1);
	}, [entriesToShow]);

	const pageCount = Math.ceil(dataResults.length / entriesToShow);

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
	}, [aggregatedInfo])

	const [facultyOptions, setFacultyOptions] = useState<string[]>([]);
	const [categories, setCategories] = useState<{ id: number; category: number; name: string; subcategories: { name: string; facultyUnit: number }[]; }[]>([]);
	const [selectedFacultyUnit, setSelectedFacultyUnit] = useState("");
	const [selectedFilterStaff, setSelectedFilterStaff] = useState("");
	const [selectedFilterStudent, setSelectedFilterStudent] = useState("");
	const [facultyStudents, setFacultyStudents] = useState<{ facultyName: string; facultyCategory: number; }[]>([]);

	useEffect(() => {
		// Function to fetch data from Supabase
		const fetchFacultyOptions = async () => {
			try {
				const { data, error } = await supabase
					.from('attendance_settings')
					.select('attsName')
					.eq('attsType', 1)
					.order('attsName', { ascending: true });

				if (error) {
					// console.error('Error fetching faculty options:', error.message);
					return;
				}

				// Extracting only the 'attsName' values from the data
				const facultyNames = data.map((item) => item.attsName);

				setFacultyOptions(facultyNames);
			} catch (error) {
				// console.error('Error:', error);
			}
		};

		// Fetch the faculty options when the component mounts
		fetchFacultyOptions();
	}, [])

	useEffect(() => {
		const fetchFacultyStudent = async () => {
			const { data, error } = await supabase
				.from('attendance_settings')
				.select('attsCategory, attsName')
				.eq('attsType', 0)
				.order('attsName', { ascending: true });

			if (error) {
				// console.error('Error fetching faculty units:', error);
				return;
			}

			// const facultyStudents = data.map((item) => item.attsName);
			const facultyStudentsData = data.map((item: any) => ({
				facultyName: item.attsName,
				facultyCategory: item.attsCategory,
			}));

			setFacultyStudents(facultyStudentsData);
		};

		fetchFacultyStudent();
	}, []);

	// retrieve units according categories
	useEffect(() => {
		const fetchFacultyUnits = async () => {
			const { data, error } = await supabase
				.from('attendance_settings')
				.select('attsID, attsName, attsCategory, attsSubcategory, attsType, attsPosition, attsFacultyUnit')
				.eq('attsType', 2)
				.order('attsCategory, attsName');

			if (error) {
				// console.error('Error fetching faculty units:', error);
				return;
			}

			if (data) {
				// Extract unique categories and subcategories
				const uniqueCategories = Array.from(new Set(data
					.filter(unit => unit.attsCategory > 0)));

				const uniqueSubcategories = Array.from(new Set(data
					.filter(unit => unit.attsSubcategory > 0)));

				// Create categories array with subcategories
				const categoriesArray = uniqueCategories.map((category) => ({
					id: category.attsCategory,
					category: category.attsPosition,
					name: category.attsName,
					subcategories: uniqueSubcategories
						.filter((subcategory) => category.attsCategory === subcategory.attsSubcategory)
						.map(subcategory => ({
							name: subcategory.attsName,
							facultyUnit: subcategory.attsFacultyUnit
						}))
				}));

				setCategories(categoriesArray);
			}
		};

		fetchFacultyUnits();
	}, []);

	const [selectedYear, setSelectedYear] = useState("");
	const [selectedYearForReport, setSelectedYearForReport] = useState("");

	const generateYearOptions = () => {
		let startYear = 2023;
		let currentYear = new Date().getFullYear();

		const options = [];
		for (let year = startYear; year <= currentYear; year++) {
			options.push(<option key={year} value={year}>{year}</option>);
		}
		return options;
	}

	const filterUserData = (tab: 'all' | 'staff' | 'student' | 'visitor' | 'secondary', query: string) => {

		// Clear the data results
		setDataResults([]);

		const filterByFacultyUnit = (facultyUnit: string) => {
			if (facultyUnit !== 'all') {
				filteredUserData = filteredUserData.filter((item) => facultyUnit === item.staffFaculty);
			}
		}

		const filterByYear = (year: string) => {
			if (year && year !== 'all') {
				console.log('testing called', year);

				// Filter the data while excluding null values
				filteredUserData = filteredUserData
					.map((item) => {
						if (!item) return null;

						// Create a copy of the item to avoid mutating the original data
						const newItem = { ...item };

						// Filter events for the selected year
						newItem.allEventsAttended = newItem.allEventsAttended.filter((event) => {
							const eventYear = new Date(event.startDate).getFullYear().toString();
							return eventYear === year;
						});

						// Recalculate grandTotalHours and totalSubEvents after filtering
						newItem.grandTotalHours = newItem.allEventsAttended.reduce((total: number, event: { totalHours: number }) => total + event.totalHours, 0);
						newItem.totalSubEvents = newItem.allEventsAttended.length;

						// Return the item only if it has events in the selected year
						return newItem.allEventsAttended.length > 0 ? newItem : null;
					})
					.filter((item): item is Info => item !== null);
			}
		};

		let filteredUserData = aggregatedInfo;

		if (tab === 'staff') {
			filteredUserData = filteredUserData.filter((item) => item.staffID.startsWith('SS'));
			if (selectedFilterStaff.length > 0) {
				filterByFacultyUnit(selectedFilterStaff);
			}
			setSelectedFacultyUnit('');
			setSelectedFilterStudent('');
			setCurrentPage(1);

		} else if (tab === 'student') {
			filteredUserData = filteredUserData.filter((item) => item.staffID !== '0' && item.staffID !== '1' && !item.staffID.startsWith('SS'));
			if (selectedFilterStudent.length > 0) {
				filterByFacultyUnit(selectedFilterStudent);
			}
			setSelectedFacultyUnit('');
			setSelectedFilterStaff('');
			setCurrentPage(1);

		}
		else if (tab === 'visitor') {
			filteredUserData = filteredUserData.filter((item) => item.staffID === '0');
			setCurrentPage(1);

		} else if (tab === 'secondary') {
			filteredUserData = filteredUserData.filter((item) => item.staffID === '1');
			setCurrentPage(1);

		}
		else if (tab === 'all') {
			filteredUserData = aggregatedInfo;
			if (selectedFacultyUnit.length > 0) {
				filterByFacultyUnit(selectedFacultyUnit);
			}
			setSelectedFilterStaff('');
			setSelectedFilterStudent('');
			setCurrentPage(1);
		}

		if (query) {
			filteredUserData = filteredUserData.filter(
				info => {
					return (
						info.staffName.toLowerCase().includes(query.toLowerCase()) ||
						info.staffID.toLowerCase().toString().includes(query.toLowerCase()) ||
						info.staffFaculty.toLowerCase().includes(query.toLowerCase())
					);
				}
			);
		}

		filterByYear(selectedYearForReport);

		const sortedData = filteredUserData.sort((a, b) => {
			if (sortBy === "staffid") {
				if (sortOrder === "asc") {
					return a.staffID.localeCompare(b.staffID, undefined, { sensitivity: 'base' });
				} else {
					return b.staffID.localeCompare(a.staffID, undefined, { sensitivity: 'base' });
				}
			} else if (sortBy === "name") {
				if (sortOrder === "asc") {
					return b.staffName.localeCompare(a.staffName, undefined, { sensitivity: 'base' });
				} else {
					return a.staffName.localeCompare(b.staffName, undefined, { sensitivity: 'base' });
				}
			} else if (sortBy === "eventattended") {
				if (sortOrder === "asc") {
					return b.totalSubEvents - a.totalSubEvents;
				} else {
					return a.totalSubEvents - b.totalSubEvents;
				}
			} else if (sortBy === "totalhours") {
				if (sortOrder === "asc") {
					return b.grandTotalHours - a.grandTotalHours;
				} else {
					return a.grandTotalHours - b.grandTotalHours;
				}
			}
			return 0;
		});

		setDataResults(sortedData);

		// console.log("filter:", filteredUserData);
	};

	useEffect(() => {
		filterUserData(activeTab, searchQuery);
		// setCurrentPage(1);
	}, [activeTab, searchQuery, selectedFacultyUnit, selectedFilterStudent, selectedFilterStaff, aggregatedInfo, selectedYearForReport]);

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
		{ label: "Grand Total Hours", value: "totalhours" },
	];

	// Modify the sorting logic based on the selected option and sort order
	// const sortedData = (dataResults.length > 0 ? dataResults : aggregatedInfo)
	// const sortedData = (dataResults)
	// 	.sort((a, b) => {
	// 		if (sortBy === "staffid") {
	// 			// Sort by ID
	// 			if (sortOrder === "asc") {
	// 				return a.staffID.localeCompare(b.staffID, undefined, { sensitivity: 'base' });
	// 			} else {
	// 				return b.staffID.localeCompare(a.staffID, undefined, { sensitivity: 'base' });
	// 			}
	// 		} else if (sortBy === "name") {
	// 			if (sortOrder === "asc") {
	// 				return b.staffName.localeCompare(a.staffName, undefined, { sensitivity: 'base' });
	// 			} else {
	// 				return a.staffName.localeCompare(b.staffName, undefined, { sensitivity: 'base' });
	// 			}
	// 		} else if (sortBy === "eventattended") {
	// 			if (sortOrder === "asc") {
	// 				return b.totalSubEvents - a.totalSubEvents;
	// 			} else {
	// 				return a.totalSubEvents - b.totalSubEvents;
	// 			}
	// 		} else if (sortBy === "totalhours") {
	// 			if (sortOrder === "asc") {
	// 				return b.grandTotalHours - a.grandTotalHours;
	// 			} else {
	// 				return a.grandTotalHours - b.grandTotalHours;
	// 			}
	// 		}
	// 		return 0;
	// 	});

	const filterEventByYear = () => {
		if (eventsAttended.length > 0) {
			let filteredEventsAttended = [...eventsAttended];
			if (selectedYear.length > 0 && selectedYear !== 'all') {
				filteredEventsAttended = eventsAttended.filter(
					event => {
						return (
							event.startDate.includes(selectedYear)
						);
					}
				);
			}

			setFilteredEventResults(filteredEventsAttended || []);
		}
	}

	useEffect(() => {
		filterEventByYear();
	}, [selectedYear, eventsAttended])

	// const filterReportByYear = () => {
	// 	if (dataResults.length > 0) {
	// 		let filteredEventsAttended = [...dataResults];
	// 		if (selectedYearForReport.length > 0 && selectedYearForReport !== 'all') {
	// 			filteredEventsAttended = dataResults.filter(
	// 				event => {
	// 					return (
	// 						event..includes(selectedYear)
	// 					);
	// 				}
	// 			);
	// 		}

	// 		setFilteredEventResults(filteredEventsAttended || []);
	// 	}
	// }

	// useEffect(() => {
	// 	filterReportByYear();
	// }, [selectedYear, eventsAttended])

	return (
		<div>
			<div className="">
				<div className="flex-1">
					<div className="flex-1 mx-auto px-4 sm:px-[26px] py-[26px] bg-slate-100 dark:bg-dark_mode_bg">
						<div className="bg-white rounded p-8 dark:bg-dark_mode_card">
							<div className="inline-flex">
								<span className="mt-[7px]"><Link href="/dashboard"><IoIosArrowBack className="text-2xl -mt-[1.5px] mr-[6px] text-slate-800 -ml-1 dark:text-dark_text" /></Link></span>
								<h1 className="text-xl font-bold lg:text-2xl"><span className="ml-[5px] text-slate-800 dark:text-dark_text">Reports</span></h1>
							</div>
							<Fragment>
								<div className="flex-1 items-center justify-left mb-8">

								</div>
							</Fragment>
							<div>
								<h1 className="text-xl font-bold lg:text-2xl mb-8 text-slate-800 dark:text-dark_text">Staff Attendance & Training Hours</h1>
							</div>

							<div className="flex items-center justify-between mb-8">
								{/* Refresh Button */}
								<button
									type="button"
									className="items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden dark:bg-[#242729]"
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
												className="text-slate-800"
											/>
											<span className="ml-2 text-slate-800 dark:text-dark_text">Sort By</span>
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
																{option.value === "totalhours" && (
																	<MdAccessTimeFilled className="mr-3 ml-2 text-md text-slate-800 whitespace-nowrap" />
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
										onClick={() => downloadXLSX(dataResults)}>
										<img
											src={exportCSV.src}
											alt=""
											width={20}
											className="text-slate-800"
										/>
										<span className="ml-2 text-slate-800 dark:text-dark_text">Export to Excel (XLSX)</span>
									</button>
								</div>
							</div>

							<div className="flex flex-col lg:flex-row justify-between">
								<div className="flex flex-row">
									<button
										className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-slate-300 dark:hover:bg-[#2F3335] mb-3.5 shadow-sm md:inline-flex ${activeTab === 'all' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'
											}`}
										onClick={() => setActiveTab('all')}
									>
										All
									</button>
									<button
										className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-slate-300 dark:hover:bg-[#2F3335] mb-3.5 shadow-sm md:inline-flex ${activeTab === 'staff' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'
											}`}
										onClick={() => { setActiveTab('staff') }}
									>
										Staff
									</button>
									<button
										className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-red-200 dark:hover:bg-[#2F3335] mb-3.5 shadow-sm md:inline-flex ${activeTab === 'student' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'
											}`}
										onClick={() => { setActiveTab('student') }}
									>
										Student
									</button>
									{/*
									<button
										className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-red-200 dark:hover:bg-[#2F3335] mb-3.5 shadow-sm md:inline-flex ${activeTab === 'visitor' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'
											}`}
										onClick={() => { setActiveTab('visitor') }}
									>
										Visitor
									</button>
									<button
										className={`flex rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-red-200 dark:hover:bg-[#2F3335] mb-3.5 shadow-sm md:inline-flex ${activeTab === 'secondary' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'
											}`}
										onClick={() => { setActiveTab('secondary') }}
									>
										Secondary
									</button> 
									*/}
								</div>

								<div className="flex flex-row">

									{activeTab === "all" && (
										<div className="flex space-x-2">
											<div>
												<select
													className="px-4 py-4 border border-gray-300 focus:outline-none text-xs lg:text-base"
													id="year"
													defaultValue=""
													onChange={event => setSelectedYearForReport(event.target.value)}
												>
													<option value="" disabled>Year</option>
													<option value="all">View All</option>
													{generateYearOptions()}
												</select>
											</div>
											<select
												name="facultyUnit"
												id="facultyUnit"
												value={selectedFacultyUnit}
												className="px-4 py-2 border border-gray-300 focus:outline-none text-xs lg:text-base w-full lg:w-96"
												required
												onChange={event => setSelectedFacultyUnit(event.target.value)}
											>
												<option value="" disabled>
													Faculty/ Unit
												</option>
												<option value="all">
													View All
												</option>
												{facultyOptions.map((faculty, index) => (
													<option key={index} value={faculty}>
														{faculty}
													</option>
												))}
												{facultyStudents.map((faculty) => (
													categories
														.filter(category => category.category === faculty.facultyCategory || (category.category === 0 && (faculty.facultyCategory === 1 || faculty.facultyCategory === 2)))
														.map((cat) => (
															cat.subcategories
																.filter(subcategory => faculty.facultyCategory === subcategory.facultyUnit || subcategory.facultyUnit === 3)
																.map((subcategory, index) => (
																	<option key={index} value={`${faculty.facultyName} - ${subcategory.name}`}>
																		{subcategory.name}
																	</option>
																))))

												))}
											</select>
										</div>
									)}

									{activeTab === "staff" && (
										<div>
											<div>
												<select
													className="px-4 py-4 border border-gray-300 focus:outline-none text-xs lg:text-base"
													id="year"
													defaultValue=""
													onChange={event => setSelectedYearForReport(event.target.value)}
												>
													<option value="" disabled>Year</option>
													<option value="all">View All</option>
													{generateYearOptions()}
												</select>
											</div>
											<select
												name="facultyUnit"
												id="facultyUnit"
												value={selectedFilterStaff}
												className="px-4 py-2 border border-gray-300 focus:outline-none text-xs lg:text-base w-full lg:w-96"
												required
												onChange={event => setSelectedFilterStaff(event.target.value)}
											>
												<option value="" disabled>
													Faculty/ Unit (Staff)
												</option>
												<option value="all">
													View All
												</option>
												{facultyOptions.map((faculty, index) => (
													<option key={index} value={faculty}>
														{faculty}
													</option>
												))}
											</select>
										</div>
									)}

									{activeTab === "student" && (
										<div className="flex flex-row">
											<div>
												<select
													className="px-4 py-4 border border-gray-300 focus:outline-none text-xs lg:text-base"
													id="year"
													defaultValue=""
													onChange={event => setSelectedYearForReport(event.target.value)}
												>
													<option value="" disabled>Year</option>
													<option value="all">View All</option>
													{generateYearOptions()}
												</select>
											</div>
											<select
												name="studentFacultyUnit"
												id="studentFacultyUnit"
												value={selectedFilterStudent}
												className="px-4 py-2 border-[1px] rounded-md border-gray-300 focus:outline-none text-xs lg:text-base w-full lg:w-96"
												required
												onChange={event => setSelectedFilterStudent(event.target.value)}
											>
												<option value="" disabled>Faculty/ Unit (Student)</option>
												<option value="all">
													View All
												</option>
												{facultyStudents.map((faculty) => (
													categories
														.filter(category => category.category === faculty.facultyCategory || (category.category === 0 && (faculty.facultyCategory === 1 || faculty.facultyCategory === 2)))
														.map((cat) => (
															cat.subcategories
																.filter(subcategory => faculty.facultyCategory === subcategory.facultyUnit || subcategory.facultyUnit === 3)
																.map((subcategory, index) => (
																	<option key={index} value={`${faculty.facultyName} - ${subcategory.name}`}>
																		{subcategory.name}
																	</option>
																))))

												))}
											</select>
										</div>
									)}
								</div>
							</div>

							<div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
								<div className="inline-block lg:w-full shadow rounded-sm ">
									<table className="lg:w-full w-auto overflow-x-auto min-h-[500px] cursor-pointer">
										{/* Table Header */}
										<thead>
											<tr className="flex border-b-2 border-gray-200 bg-gray-100">
												<th className="w-20 flex-1 px-12 lg:px-2 py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold whitespace-nowrap text-gray-600 uppercase tracking-wider text-left dark:bg-[#1D2021] dark:border-[#363B3D] dark:text-[#B0AA9F]">
													<div className="ml-2 lg:ml-10">No</div>
												</th>
												<th className="flex-1 px-12 lg:px-2 py-3 border-b-2 lg:-ml-24 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold whitespace-nowrap text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:border-[#363B3D] dark:text-[#B0AA9F]">
													<div className="ml-11 lg:ml-0">Name</div>
												</th>
												<th className="flex-1 px-12 lg:px-2 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold whitespace-nowrap text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:border-[#363B3D] dark:text-[#B0AA9F]">
													<div className="ml-16 lg:ml-1">Staff / Student ID</div>
												</th>

												<th className="flex-1 px-12 lg:px-2 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold whitespace-nowrap text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:border-[#363B3D] dark:text-[#B0AA9F]">
													<div className="ml-1">Faculty / Unit</div>
												</th>

												<th className="flex-1 px-12 lg:px-2 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold whitespace-nowrap text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:border-[#363B3D] dark:text-[#B0AA9F]">
													<div className="lg:ml-10">Training Hours</div>
												</th>
											</tr>
										</thead>

										{/* Table Body */}
										<tbody>
											{dataResults.length === 0 ? (
												<span className="lg:text-lg ml-4 mt-4">No data available.</span>
											) : (
												dataResults
													.slice(
														(currentPage - 1) * entriesToShow,
														currentPage * entriesToShow,
													)
													.map((info, index) => (
														// (info.staffID !== "0" && info.staffID !== "1" && info.staffID !== "2") ? (
														<tr
															key={info.staffEmail}
															className="flex"
															onClick={() => {
																openModal(info.allEventsAttended);
															}}
														>
															<td className="w-20 flex-1 px-6 lg:px-6 py-5 border-b border-gray-200 bg-white text-sm text-left dark:bg-dark_mode_card dark:border-[#363B3D]">
																<div className="flex items-center">
																	<div className="ml-6">
																		<p className="text-gray-900 whitespace-no-wrap dark:text-dark_text text-left">
																			{(currentPage - 1) * entriesToShow + index + 1}
																		</p>
																	</div>
																</div>
															</td>
															<td className="flex-1 px-6 lg:-ml-28 lg:px-10 py-5 border-b border-gray-200 bg-white text-sm text-left dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																<div className="-ml-3 lg:-ml-5">{info.staffName}</div>
															</td>
															<td className="flex-1 px-6 lg:-ml-9 lg:px-6 py-5 border-b border-gray-200 bg-white text-sm text-left dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																<div className="-ml-5 lg:-ml-0">
																	{info.staffID == '0' ? 'Visitor' : info.staffID == '1' ? 'Secondary Student' : info.staffID}
																</div>
															</td>
															<td className="flex-1 px-6 lg:px-6 py-5 border-b border-gray-200 bg-white text-sm text-left dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																<div className="lg:-ml-1">{info.staffFaculty}</div>
															</td>
															<td className="flex-1 px-6 lg:px-6 py-5 border-b border-gray-200 bg-white text-sm text-left whitespace-nowrap dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																<div className="-ml-5 lg:ml-7">{info.grandTotalHours}</div>
															</td>
														</tr>
														// ) : null
													))
											)}

											{/* pagination */}
											{Array.from({
												length: entriesToShow - aggregatedInfo.length,
											}).map((_, index) => (
												<tr className="flex invisible" key={index}>
													<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
														<div className="flex items-center">
															<div className="ml-[14px]">
																<div className="text-gray-900 whitespace-no-wrap"></div>
															</div>
														</div>											</td>
													<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
														<div className="text-gray-900 whitespace-no-wrap ml-3"></div>
													</td>
													<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
														<div className="text-gray-900 whitespace-no-wrap"></div>
													</td>
													<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm">
														<div className="text-gray-900 whitespace-no-wrap ml-1"></div>
													</td>
													<td
														className={`flex-1 px-5 py-5 border-b border-gray-200 bg-white text-sm`}>
														<div
															className={`relative inline-block px-3 py-2 font-semibold text-gray-900 leading-tight`}>
															<div
																aria-hidden
																className={`absolute inset-0 opacity-0 rounded-full`}></div>
															<div className="relative"></div>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>

									<div className="px-5 py-5 bg-white border-t flex items-center justify-between dark:bg-dark_mode_card dark:border-[#363B3D]">
										<div className=" items-center text-[14px] text-base hidden lg:flex">
											<div className="mr-2 ml-3">
												<span className="text-sm lg:text-base text-slate-800 dark:text-dark_text">Show</span>
											</div>

											{/* Filter By How Many Entries */}
											<div className="relative mr-2">
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
												<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-dark_text">
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
										<div className="ems-center hidden lg:flex">
											<span className="text-sm mt-6 lg:text-base lg:text-[14px] lg:text-gray-900 lg:mr-2 hidden md:inline">
												1-{entriesToShow} of {dataResults?.length} entries
											</span>

											<div className="pagination justify-end mt-5 pb-5 ems-center hidden lg:flex">
												<button
													className={`px-1 ml-5 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
													onClick={() => handlePageChange(1)}
													disabled={currentPage === 1}
												>
													<MdKeyboardDoubleArrowLeft className="text-3xl" />
												</button>
												<button
													onClick={() => handlePageChange(currentPage - 1)}
													disabled={currentPage === 1}
													className={`px-1 ml-1 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
												>
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

												<button
													onClick={() => handlePageChange(currentPage + 1)}
													disabled={currentPage === pageCount}
													className={`px-1 ml-5 ${currentPage === pageCount ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
												>
													<MdKeyboardArrowRight className="text-3xl" />
												</button>
												<button
													className={`px-1 ml-1 ${currentPage === pageCount ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
													onClick={() => handlePageChange(pageCount)}
													disabled={currentPage === pageCount}
												>
													<MdKeyboardDoubleArrowRight className="text-3xl" />
												</button>
											</div>
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
					</div>

					<EventModal isVisible={showModal}
						onClose={() => {
							setShowModal(false);
							setSelectedYear('');
						}}>
						<div>
							<div className="flex items-center mb-4 mr-20">
								<p className='font-semibold text-lg text-gray-600 p-2 dark:text-dark_text'>Event(s) Attended (including Nominations/ Travelling Forms)</p>
								<div className="flex items-center ml-auto">
									<select
										className="px-4 py-2 border border-gray-300 focus:outline-none text-xs lg:text-base"
										id="year"
										defaultValue=""
										onChange={event => setSelectedYear(event.target.value)}
									>
										<option value="" disabled>Year</option>
										<option value="all">View All</option>
										{generateYearOptions()}
									</select>
								</div>
							</div>

							<div className="bg-white h-[520px] w-[360px] lg:w-full lg:h-11/12 overflow-x-auto dark:bg-dark_mode_bg pb-5">
								<table className="leading-normal lg:w-full mx-auto dark:bg-[#1D2021]">
									<thead>
										<tr className="flex">
											<th className="flex-1 lg:pl-[33px] lg:px-[10px] py-3 border-b-2 border-gray-200 bg-gray-100 lg:text-left text-sm lg:text-sm font-semibold text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:text-dark_text dark:border-[#363B3D]">
												NO.
											</th>
											<th className="flex-1 ml-6 lg:ml-0 px-[33px] lg:pr-[120px] py-3 border-b-2 border-gray-200 bg-gray-100 lg:text-left text-sm whitespace-nowrap lg:text-sm font-semibold text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:text-dark_text dark:border-[#363B3D]">
												Program Name
											</th>
											<th className="flex-1 px-[33px] lg:pr-[120px] py-3 border-b-2 border-gray-200 bg-gray-100 lg:text-left text-sm whitespace-nowrap lg:text-sm font-semibold text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:text-dark_text dark:border-[#363B3D]">
												Start Date
											</th>
											<th className="flex-1 px-[33px] lg:pr-[120px] py-3 border-b-2 border-gray-200 bg-gray-100 lg:text-left text-sm whitespace-nowrap lg:text-sm font-semibold text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:text-dark_text dark:border-[#363B3D]">
												End Date
											</th>
											<th className="flex-1 px-[33px] lg:pr-[120px] py-3 border-b-2 border-gray-200 bg-gray-100 lg:text-left text-sm whitespace-nowrap lg:text-sm font-semibold text-gray-600 uppercase tracking-wider dark:bg-[#1D2021] dark:text-dark_text dark:border-[#363B3D]">
												Total Hour (H)
											</th>
										</tr>
									</thead>
									<tbody>
										{/* {subEventsAttended */}
										{/* {eventsAttended */}
										{filteredEventResults.length === 0 ? (
											<div className="lg:text-lg ml-4 lg:ml-0 lg:text-center mt-4">No data available.</div>
										) : (
											filteredEventResults
												.map((event, index) => (
													<tr className="flex border-b border-gray-200 bg-white dark:bg-dark_mode_card dark:border-[#363B3D]" key={index}>
														<td className="flex-1 py-5 text-sm mt-1 lg:text-sm ml-5">
															<div>
																<div className="ml-2">
																	<div className="ml-2 text-gray-900 dark:text-dark_text">
																		{(currentPage - 1) *
																			entriesToShow +
																			index +
																			1
																		}
																	</div>
																</div>
															</div>
														</td>
														<td className="flex-1 px-3 py-5 text-sm lg:text-sm dark:bg-dark_mode_card dark:border-[#363B3D]">
															<div className="text-gray-900 -ml-16 dark:text-dark_text w-60">
																{event.programName}
															</div>
														</td>

														<td className="flex-1 px-3 py-5 text-sm lg:text-sm dark:bg-dark_mode_card dark:border-[#363B3D]">
															<div className="text-gray-900 -ml-10 dark:text-dark_text">
																{event.startDate}
															</div>
														</td>

														<td className="flex-1 px-3 py-5 text-sm lg:text-sm dark:bg-dark_mode_card dark:border-[#363B3D]">
															<div className="text-gray-900 -ml-6 dark:text-dark_text">
																{event.endDate}
															</div>
														</td>

														<td className="flex-1 px-3 py-5 text-sm lg:text-sm dark:bg-dark_mode_card dark:border-[#363B3D]">
															<div className="text-gray-900  ml-11 whitespace-nowrap dark:text-dark_text">
																{event.totalHours ?? 0}
															</div>
														</td>
													</tr>
												)))}
									</tbody>
								</table>
							</div>
						</div>
					</EventModal>
				</div>
			</div>

			<div className="flex flex-row">
				<div className="flex-1 mx-auto px-4 sm:px-[26px] py-[26px] bg-slate-100 dark:bg-dark_mode_bg">
					<div className="bg-white rounded p-8 dark:bg-dark_mode_card">
						<div className="inline-flex mb-5">
							<h1 className="text-xl font-bold lg:text-2xl"><span className="ml-[3px] text-slate-800 dark:text-dark_text">Staff Expenditure Report</span></h1>
						</div>
						<ExpenditureUser />
					</div>
				</div>
			</div>
		</div>
	);
}
