"use client";

import Image from "next/image";

import Modal from "@/components/QR_Codes_Modal";

import filterBar from "@/public/images/filter_bar_black.png";
import exportCSV from "@/public/images/export_csv.png";
import arrowLeft from "@/public/images/arrow_left.png";
import arrowRight from "@/public/images/arrow_right.png";
import skipLeft from "@/public/images/skip_left.png";
import skipRight from "@/public/images/skip_right.png";
import { useParams, useRouter } from "next/navigation";
// npm install react-router-dom@latest

import qr_codes from "@/public/images/qr_codes.png";

// Import icons from react-icons
import { FaSortAlphaDown, FaSortAlphaUp, FaCalendarAlt, FaCheck } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import { SiGoogleforms } from "react-icons/si";
import { BsBoxArrowUpRight } from "react-icons/bs";

import { Fragment, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SideBarDesktop from "@/components/layouts/SideBarDesktop";
import SideBarMobile from "@/components/layouts/SideBarMobile";
import TopBar from "@/components/layouts/TopBar";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

type Info = {
	attFormsStaffName: string;
	attFormsStaffID: string;
	attFormsFacultyUnit: string;
};

type subEvent = {
	sub_eventsID: string;
	sub_eventsName: string;
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
	const [attendance_id, setAttendanceID] = useState<string[]>([]);
	const [selectedSubEventID, setSelectedSubEventID] = useState<string>("");

	// Get the Event ID from the link,
	const { event_id } = useParams();
	const router = useRouter();
	console.log("Event ID captured in URL:" + event_id);

	const [subEventsData, setSubEventsData] = useState<subEvent[]>([]);

	// Fetch data from database
	useEffect(() => {
		const fetchInfos = async () => {
			const { data: subEventsData, error: subEventsError } = await supabase
				.from("sub_events")
				.select("sub_eventsID")
				.eq("sub_eventsMainID", event_id);

			if (subEventsError) {
				console.error("Error fetching sub_events data:", subEventsError);
				router.push('/error-404');
				return;
			}

			const subEventIDs = subEventsData.map(item => item.sub_eventsID);
			setAttendanceID(subEventIDs);

			const { data: attendanceFormsData, error: attendanceFormError } = await supabase
				.from("attendance_forms")
				.select("*")
				.in("attFSubEventID", subEventIDs);

			if (attendanceFormError) {
				console.error("Error fetching attendance forms data:", attendanceFormError);
				return;
			}

			setInfos(attendanceFormsData);
		};
		fetchInfos();
	}, [event_id, router, supabase]);

	useEffect(() => {
		// Fetch sub_events with the same event_id
		async function fetchSubEvents() {
			try {
				const { data, error } = await supabase
					.from('sub_events')
					.select('*')
					.eq('sub_eventsMainID', event_id);

				if (error) {
					console.error('Error fetching sub_events:', error);
					return;
				}

				setSubEventsData(data);
			} catch (error) {
				console.error('Error fetching sub_events:', error);
			}
		}

		fetchSubEvents();
	}, [event_id, supabase]);

	// Refresh data from database
	const refreshData = async () => {
		const { data: subEventsData, error: subEventsError } = await supabase
			.from("sub_events")
			.select("sub_eventsID")
			.eq("sub_eventsMainID", event_id);

		if (subEventsError) {
			console.error("Error fetching sub_events data:", subEventsError);
			return;
		}

		const subEventIDs = subEventsData.map(item => item.sub_eventsID);
		setAttendanceID(subEventIDs);

		const { data: attendanceFormsData, error: attendanceFormError } = await supabase
			.from("attendance_forms")
			.select("*")
			.in("attFSubEventID", subEventIDs);

		if (attendanceFormError) {
			console.error("Error fetching attendance forms data:", attendanceFormError);
			return;
		}

		setInfos(attendanceFormsData);
		console.log("Data refreshed successfully.");

		if (attendanceFormError) {
			console.log("Error fetching data: ", attendanceFormError);
		}
	};

	// Handle search input
	const handleSearch = (query: string) => {
		setSearchQuery(query);

		const filteredData = infos.filter(info => {
			const staffName =
				typeof info.attFormsStaffName === "string" ? info.attFormsStaffName : "";
			const staffID =
				info.attFormsStaffID !== undefined ? info.attFormsStaffID.toString() : "";
			const facultyUnit =
				typeof info.attFormsFacultyUnit === "string"
					? info.attFormsFacultyUnit
					: "";
			return (
				staffName.toLowerCase().includes(query.toLowerCase()) ||
				staffID.toLowerCase().includes(query.toLowerCase()) ||
				facultyUnit.toLowerCase().includes(query.toLowerCase())
			);
		});

		setInfos(filteredData);
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
		if (sortBy === "id") {
			// If it's already sorted by name, toggle between 'asc' and 'desc'
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			// Set the sorting option to name and default to 'asc'
			setSortBy("id");
			setSortOrder("asc");
		}
		setShowSortOptions(false);
	};

	// Copy text to clipboard,
	const copyToClipboard = (text: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				alert("Link copied to clipboard!");
			})
			.catch(error => {
				console.error("Copy failed:", error);
			});
	};

	// An array of sorting options
	const sortOptions = [
		{ label: "ID", value: "id" },
		{ label: "Role", value: "role" },
		{ label: "Created At", value: "createdAt" },
		{ label: "Status", value: "status" },
	];

	// Modify the sorting logic based on the selected option and sort order
	const sortedData = infos.slice().sort((a, b) => {
		if (sortBy === "id") {
			// Sort by ID
			if (sortOrder === "asc") {
				return a.attFormsStaffName.localeCompare(b.attFormsStaffName);
			} else {
				return b.attFormsStaffName.localeCompare(a.attFormsStaffName);
			}
		}
		return 0;
	});

	return (
		<div className="flex-1 mx-auto px-5 py-5 bg-slate-100">
			{/* <div className="bg-white rounded p-8">
				<div>
					<h3 className="font-bold">Attendance Forms</h3>
					<div className="border-t border-gray-300 my-2"></div>
				</div>
				<div className="flex flex-wrap">
					{subEventsData.map((subEvent) => (
						<Fragment key={subEvent.sub_eventsID}>
							<div className="w-1/3 mb-8">
								<h3 className="text-left mb-3"> {subEvent.sub_eventsName}</h3>
								<Link
									href={`https://new-fyp-ems.vercel.app/form/${subEvent.sub_eventsID}`}
									passHref
									legacyBehavior={true}
								>
									<a className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex">
										<SiGoogleforms className="text-xl text-slate-800" />
										<span className="ml-2 mt-[1.3px] text-slate-800">Forms</span>
									</a>
								</Link>

								<button
									type="button"
									className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex ml-5"
									onClick={() => {
										setSelectedSubEventID(subEvent.sub_eventsID);
										setShowQRCodesAttendance(true);
									}}
								>
									<BsBoxArrowUpRight className="text-xl text-slate-800" />
									<span className="ml-2 mt-[1.3px] text-slate-800">QR Codes</span>
								</button>
							</div>
						</Fragment>
					))}
				</div>
			</div> */}
			{/* <div className="bg-white rounded p-8 mt-5">
				<div>
					<h3 className="font-bold">Feedback Forms</h3>
					<div className="border-t border-gray-300 my-2"></div>
				</div>
				<div className="flex flex-wrap">
					{subEventsData.map((subEvent) => (
						<Fragment key={subEvent.sub_eventsID}>
							<div className="w-1/3 mb-8">
								<h4 className="text-left mb-3">{subEvent.sub_eventsName}</h4>
								<Link
									href={`https://new-fyp-ems.vercel.app/form/feedback/${subEvent.sub_eventsID}`}
									passHref
									legacyBehavior={true}
								>
									<a className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex">
										<SiGoogleforms className="text-xl text-slate-800" />
										<span className="ml-2 mt-[1.3px] text-slate-800">Forms</span>
									</a>
								</Link>

								<button
									type="button"
									className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex ml-5"
									onClick={() => {
										setSelectedSubEventID(subEvent.sub_eventsID);
										setShowQRCodesFeedback(true);
									}}
								>
									<BsBoxArrowUpRight className="text-xl text-slate-800" />
									<span className="ml-2 mt-[1.3px] text-slate-800">QR Codes</span>
								</button>
							</div>
						</Fragment>
					))}

					<Modal isVisible={showQRCodesAttendance} onClose={() => setShowQRCodesAttendance(false)}>
						<div className="ml-2 p-5">
							<h3 className="lg:text-2xl font-medium text-gray-600 mb-2 text-center">
								QR Code
							</h3>
							<QRCodeSVG
								value={`https://new-fyp-ems.vercel.app/form/${selectedSubEventID}`}
							/>
							<button
								onClick={() =>
									copyToClipboard(
										`https://new-fyp-ems.vercel.app/form/${selectedSubEventID}`
									)
								}
								className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg p-2 px-[26px]"
							>
								Copy Link
							</button>
						</div>
					</Modal>

					<Modal isVisible={showQRCodesFeedback} onClose={() => setShowQRCodesFeedback(false)}>
						<div className="ml-2 p-5">
							<h3 className="lg:text-2xl font-medium text-gray-600 mb-2 text-center">
								QR Code
							</h3>
							<QRCodeSVG
								value={`https://new-fyp-ems.vercel.app/form/feedback/${selectedSubEventID}`}
							/>
							<button
								onClick={() =>
									copyToClipboard(
										`https://new-fyp-ems.vercel.app/form/feedback/${selectedSubEventID}`
									)
								}
								className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg p-2 px-[26px]"
							>
								Copy Link
							</button>
						</div>
					</Modal>
				</div>
			</div> */}

			<div className="bg-white rounded p-8 mt-5">
				<div>
					<h3 className="font-bold">Attendance Details</h3>
					<div className="border-t border-gray-300 my-2 mb-5"></div>
				</div>
				<div className="flex items-center justify-between mb-8">
					{/* Refresh Button */}
					<button
						type="button"
						className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden"
						onClick={refreshData}>
						<IoMdRefresh className="text-xl text-slate-800" />
						<span className="ml-2 -mt-[1.25px] text-slate-800">Refresh</span>
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

						{/* Sort By Button */}
						<button
							type="button"
							className="flex items-center justify-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 mr-3 shadow-sm md:inline-flex hidden"
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
							className={`absolute top-[150px] right-0 transform translate-x-0 translate-y-0 transition-transform duration-300 ease-in-out ${showSortOptions ? "translate-x-0" : ""
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
												{option.value === "name" && (
													<FaSortAlphaDown className="mr-3 ml-2 text-slate-800" />
												)}
												{option.value === "role" && (
													<FaSortAlphaUp className="mr-3 ml-2 text-slate-800" />
												)}
												{option.value === "createdAt" && (
													<FaCalendarAlt className="mr-3 ml-2 text-slate-800" />
												)}
												{option.value === "status" && (
													<FaCheck className="mr-3 ml-2 text-slate-800" />
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

						{/* Export Button */}
						<button
							type="button"
							className="flex items-center justify-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden"
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
									<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
										ID
									</th>
									<th className="flex-1 px-[21px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
										<span className="ml-1">Staff Name</span>
									</th>
									<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
										<span className="-ml-[1px]">Staff ID</span>
									</th>
									<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
										<span className="-ml-[3px]">Faculty/ Unit</span>
									</th>
									{/* <th className="flex-1 px-8 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
			Status
			</th> */}
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
										<tr className="flex" key={index}>
											<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
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
											<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
												<p className="text-gray-900 whitespace-no-wrap ml-3">
													{info.attFormsStaffName}
												</p>
											</td>
											<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
												<p className="text-gray-900 whitespace-no-wrap">
													{info.attFormsStaffID}
												</p>
											</td>
											<td className="flex-1 px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm">
												<p className="text-gray-900 whitespace-no-wrap ml-1">
													{info.attFormsFacultyUnit}
												</p>
											</td>
											{/* <td className={`flex-1 px-5 py-5 border-b border-gray-200 bg-white text-xs lg:text-sm`}>
<span className={`relative inline-block px-3 py-2 font-semibold text-${item.status === 'Completed' ? 'green' : item.status === 'On-going' ? 'orange' : 'red'}-900 leading-tight`}>
	<span aria-hidden className={`absolute inset-0 bg-${item.status === 'Completed' ? 'green' : item.status === 'On-going' ? 'orange' : 'red'}-200 opacity-50 rounded-full`}></span>
	<span className="relative">{item.status}</span>
</span>
</td> */}
										</tr>
									))}

								{Array.from({
									length: entriesToShow - infos.length,
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
									<span className="text-sm lg:text-base">entries</span>
								</div>
							</div>
							<div className="flex items-center">
								<span className="text-sm lg:text-base lg:text-[14px] lg:text-gray-900 lg:mr-2 hidden md:inline">
									1-{entriesToShow} of {infos.length} entries
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
															infos.length / entriesToShow,
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
											Math.ceil(infos.length / entriesToShow)
										}
										style={{
											opacity:
												currentPage ===
													Math.ceil(infos.length / entriesToShow)
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
											Math.ceil(infos.length / entriesToShow)
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
	);

	{
		/* dont delete this, it will have funny bugs if you delete it */
	}
	{
		/* <tbody>
	<tr>
	<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
	  <div className="flex items-center">
	
		<div className="ml-3">
		  <p className="text-gray-900 whitespace-no-wrap">
			Blake Bowman
		  </p>
		</div>
	  </div>
	</td>
	<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
	  <p className="text-gray-900 whitespace-no-wrap">Editor</p>
	</td>
	<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
	  <p className="text-gray-900 whitespace-no-wrap">
		Jan 01, 2020
	  </p>
	</td>
	<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
	  <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
		<span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
		<span className="relative">Completed</span>
	  </span>
	</td>
	</tr>
	<tr>
	<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
	  <div className="flex items-center">
	
		<div className="ml-3">
		  <p className="text-gray-900 whitespace-no-wrap">
			Dana Moore
		  </p>
		</div>
	  </div>
	</td>
	<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
	  <p className="text-gray-900 whitespace-no-wrap">Editor</p>
	</td>
	<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
	  <p className="text-gray-900 whitespace-no-wrap">
		Jan 10, 2020
	  </p>
	</td>
	<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
	  <span className="relative inline-block px-3 py-1 font-semibold text-orange-900 leading-tight">
		<span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
		<span className="relative">On-going</span>
	  </span>
	</td>
	</tr>
	<tr>
	<td className="px-5 py-5 bg-white text-sm">
	  <div className="flex items-center">
	
		<div className="ml-3">
		  <p className="text-gray-900 whitespace-no-wrap">
			Alonzo Cox
		  </p>
		</div>
	  </div>
	</td>
	<td className="px-5 py-5 bg-white text-sm">
	  <p className="text-gray-900 whitespace-no-wrap">Admin</p>
	</td>
	<td className="px-5 py-5 bg-white text-sm">
	  <p className="text-gray-900 whitespace-no-wrap">Jan 18, 2020</p>
	</td>
	<td className="px-5 py-5 bg-white text-sm">
	  <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
		<span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
		<span className="relative">Canceled</span>
	  </span>
	</td>
	</tr>
	</tbody>  */
	}
}
