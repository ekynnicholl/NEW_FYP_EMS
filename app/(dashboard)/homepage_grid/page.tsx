"use client";

import SideBarDesktop from "@/components/layouts/SideBarDesktop";
import SideBarMobile from "@/components/layouts/SideBarMobile";
import TopBar from "@/components/layouts/TopBar";
import CreateEvent_Modal from "@/components/CreateEvent_Modal";
import ViewEvent_Modal from "@/components/ViewEvent_Modal";
import EditEvent_Modal from "@/components/EditEvent_Modal";
import Success_Modal from "@/components/Modal";
import Delete_Event_Confirmation_Modal from "@/components/Modal";

import Image from "next/image";
import { useState, useEffect, SyntheticEvent } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faUsers, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { IoIosAddCircleOutline } from "react-icons/io";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";
import { AiOutlineFieldTime } from "react-icons/ai";
import { MdPeople } from "react-icons/md";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import PencilNoteIcon from "@/components/icons/PencilNoteIcon";
import ViewAttendance_Modal from "@/components/ViewAttendance_Modal";

// import {Calendar} from "@/components/layouts/calendar";

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString("en-US", {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
});

const formatDate = (dateString: string): string => {
	const options: Intl.DateTimeFormatOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return new Date(dateString).toLocaleDateString("en-US", options);
};

const formatTime = (timeString: string): string => {
	const options: Intl.DateTimeFormatOptions = {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	};
	const formattedTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
		"en-US",
		options,
	);

	// Convert to lowercase and remove the space
	return formattedTime.replace(" ", "").toLowerCase();
};

type Info = {
	intFID: string;
	intFEventName: string;
	intFDescription: string;
	intFVenue: string;
	intFMaximumSeats: string;
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
};

export default function Homepage() {
	const supabase = createClientComponentClient();
	const malaysiaTimezone = "Asia/Kuala_Lumpur";

	const [info, setInfo] = useState<Info>({} as Info);
	const [infos, setInfos] = useState<Info[]>([] as Info[]);
	// const [latestEvent, setLatestEvent] = useState<Info | null>(null);
	const [latestEvent, setLatestEvent] = useState<Info[]>([]);
	const [numberOfAttendees, setNumberOfAttendees] = useState<number>(0);
	const [selectedEvent, setSelectedEvent] = useState({
		intFID: "",
		intFName: "",
		intFDescription: "",
		intFStartDate: "",
		intFStartTime: "",
		intFEndTime: "",
		intFVenue: "",
		intFMaximumSeats: "",
		intFOrganizer: "",
		intFFaculty: "",
	});

	const [editEventInfo, setEditEventInfo] = useState({
		intFID: "",
		intFEventName: "",
		intFDescription: "",
		intFStartDate: "",
		intFStartTime: "",
		intFEndTime: "",
		intFVenue: "",
		intFMaximumSeats: "",
		intFOrganizer: "",
		intFFaculty: "",
	});

	const [showModalCreateEvent, setShowModalCreateEvent] = useState(false);
	const [showModalViewEvent, setShowModalViewEvent] = useState(false);
	const [showModalEditEvent, setShowModalEditEvent] = useState(false);
	const [selectedEventImage, setSelectedEventImage] = useState("");

	const [showModalSuccess, setShowModalSuccess] = useState(false);
	const [showModalConfirmation, setShowModalConfirmation] = useState(false);

	// This is for attendance modal,
	const [attendanceData, setAttendanceData] = useState<AttendanceDataType[]>([]);
	const [showAttendanceModal, setShowAttendanceModal] = useState(false);

	// Function to fetch the 6 latest events
	useEffect(() => {
		const fetchLatestEvent = async () => {
			const { data, error } = await supabase
				.from("internal_events")
				.select(
					"intFID, intFEventName, intFDescription, intFVenue, intFMaximumSeats, intFStartDate, intFStartTime, intFEndTime",
				)
				.gte(
					"intFStartDate",
					new Date().toLocaleString("en-US", { timeZone: malaysiaTimezone }),
				)
				.order("intFStartDate", { ascending: true })
				.order("intFStartTime", { ascending: true })
				.range(0, 5)
				.select();
			if (error) {
				console.error("Error fetching latest event:", error);
			} else {
				setLatestEvent(data);
			}
		};

		fetchLatestEvent();
	}, [supabase]);

	// This is for attendance modal,
	const openAttendanceModal = async (event_id: string) => {
		try {
			const { data: attendanceListData, error: attendanceListError } =
				await supabase
					.from("attendance_list")
					.select("attListID")
					.eq("attListEventID", event_id);

			if (attendanceListError) {
				console.error(
					"Error fetching attendance list data:",
					attendanceListError,
				);
				return;
			}

			const attListIDs = attendanceListData.map(item => item.attListID);

			const { data: attendanceFormData, error: attendanceFormError } =
				await supabase
					.from("attendance_forms")
					.select("*")
					.in("attFormsListID", attListIDs);

			if (attendanceFormError) {
				console.error(
					"Error fetching attendance forms data:",
					attendanceFormError,
				);
				return;
			}

			setAttendanceData(attendanceFormData);
			setSelectedEvent({
				intFID: event_id,
				intFName: "",
				intFDescription: "",
				intFStartDate: "",
				intFStartTime: "",
				intFEndTime: "",
				intFVenue: "",
				intFMaximumSeats: "",
				intFOrganizer: "",
				intFFaculty: "",
			});
			console.log("Attendance forms data:", attendanceFormData);
		} catch (error) {
			const typedError = error as Error;
			console.error("Error:", typedError.message);
		}

		setShowAttendanceModal(true);
	};

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
		event_faculty: string,
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
			.from("attendance_list")
			.select()
			.eq("attListEventID", event_id);

		if (error) {
			console.error("Error fetching attendance list:", error);
			return;
		}

		attendanceList.forEach(async entry => {
			const { data: attendanceForms, error: formsError } = await supabase
				.from("attendance_forms")
				.select("attFormsListID")
				.eq("attFormsListID", entry.attListID);

			if (formsError) {
				console.error("Error fetching attendance forms:", formsError);
				return;
			}

			setNumberOfAttendees(attendanceForms.length);
		});

		setShowModalViewEvent(true);
	};

	// Handle data submission
	const handleSubmitCreateEvent = async (e: SyntheticEvent) => {
		e.preventDefault();

		const { data, error } = await supabase
			.from("internal_events")
			.upsert({
				intFEventName: info.intFEventName,
				intFDescription: info.intFDescription,
				intFVenue: info.intFVenue,
				intFMaximumSeats: info.intFMaximumSeats,
				intFStartDate: info.intFStartDate,
				intFStartTime: info.intFStartTime,
				intFEndTime: info.intFEndTime,
				intFOrganizer: info.intFOrganizer,
				intFFaculty: info.intFFaculty,
			})
			.select();

		console.log(data);

		// This attendance list will be created x times based on how many days (sub-events spread out across multiple days), x the event has.
		if (error) {
			console.error("Error inserting event data:", error);
		} else {
			// Extract the generated UUID from the event data
			const generatedEventID = data[0].intFID;

			const { data: attendanceData, error: attendanceError } = await supabase
				.from("attendance_list")
				.upsert({
					attListEventID: generatedEventID,
					attListDayCount: 0,
					attListEventDate: info.intFStartDate,
				});

			if (attendanceError) {
				console.error("Error inserting attendance data:", attendanceError);
			} else {
				console.log("Attendance data inserted successfully:", attendanceData);
			}
		}

		if (error) {
			console.error(error);
			return;
		}

		setInfos([
			...infos,
			{
				intFID: info.intFID,
				intFEventName: info.intFEventName,
				intFDescription: info.intFDescription,
				intFVenue: info.intFVenue,
				intFMaximumSeats: info.intFMaximumSeats,
				intFStartDate: info.intFStartDate,
				intFStartTime: info.intFStartTime,
				intFEndTime: info.intFEndTime,
				intFOrganizer: info.intFOrganizer,
				intFFaculty: info.intFFaculty,
			},
		]);

		setInfo({} as Info);
	};

	const handleEditEventButton = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setShowModalEditEvent(true);
		setShowModalViewEvent(false);

		// Check if selectedEvent has a value
		if (selectedEvent) {
			setShowModalEditEvent(true);
			setShowModalViewEvent(false);

			setEditEventInfo({
				intFID: selectedEvent.intFID,
				intFEventName: selectedEvent.intFName,
				intFDescription: selectedEvent.intFDescription,
				intFStartDate: selectedEvent.intFStartDate,
				intFStartTime: selectedEvent.intFStartTime,
				intFEndTime: selectedEvent.intFEndTime,
				intFVenue: selectedEvent.intFVenue,
				intFMaximumSeats: selectedEvent.intFMaximumSeats,
				intFOrganizer: selectedEvent.intFOrganizer,
				intFFaculty: selectedEvent.intFFaculty,
			});
			console.log("testing edit");
			console.log(selectedEvent.intFName);
			console.log(selectedEvent.intFOrganizer);
		}
	};

	const handleEditEventSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const { data, error } = await supabase
			.from("internal_events")
			.update({
				intFEventName: editEventInfo.intFEventName,
				intFDescription: editEventInfo.intFDescription,
				intFStartDate: editEventInfo.intFStartDate,
				intFStartTime: editEventInfo.intFStartTime,
				intFEndTime: editEventInfo.intFEndTime,
				intFVenue: editEventInfo.intFVenue,
				intFMaximumSeats: editEventInfo.intFMaximumSeats,
				intFOrganizer: editEventInfo.intFOrganizer,
				intFFaculty: editEventInfo.intFFaculty,
			})
			.eq("intFID", editEventInfo.intFID);

		if (error) {
			console.error("Error updating event:", error);
			return;
		}

		setShowModalSuccess(true);
	};

	const handleOK = () => {
		setShowModalSuccess(false);
		window.location.reload();
	};

	const handleCancel = () => {
		setShowModalConfirmation(false);
	};

	// TODO: TEST WHETHER DELETE EVENT WORKS, INTFID CHANGED FROM NUMBER TO STRING.
	const handleDeleteEvent = async (intFID: string) => {
		const { data, error } = await supabase
			.from("internal_events")
			.delete()
			.eq("intFID", intFID);

		if (error) {
			console.error("Error deleting event:", error);
			return;
		}

		console.log("Event deleted successfully:", data);

		window.location.reload();
	};

	return (
		<div className="pr-5 bg-slate-100">
			<div className="mx-auto px-4 py-5 w-full">
				<div className="w-full flex ml-1">
					<div className="lg:flex justify-center bg-white border border-slate-200 w-3/4 rounded-lg mb-4 hidden">
						<div className="w-1/3 p-4 text-left">
							<div className="bg-[#E5F9FF] p-5 text-slate-700 rounded-lg flex">
								<div className="mr-4">
									<FontAwesomeIcon
										icon={faCalendar}
										className="w-8 mt-[6.5px] text-slate-700"
										size="2x"
									/>
								</div>
								<div className="ml-1">
									<p className="text-[15px]">Today&apos;s Date</p>
									<p className="font-medium">{formattedDate}</p>
								</div>
							</div>
						</div>

						<button className="w-1/3 p-4 text-left transition transform hover:scale-105">
							<a
								href="/upcomingEvents"
								className="bg-[#FFEDE5] p-5 text-slate-700 rounded-lg flex hover:bg-[#ffdcce]">
								<div className="mr-4">
									<FontAwesomeIcon
										icon={faUsers}
										className="w-8 mt-[6px] text-slate-700"
										size="2x"
									/>
								</div>
								<div className="ml-1">
									<p className="text-[15px]">Upcoming Events</p>
									<p className="font-medium">2</p>
								</div>
							</a>
						</button>

						<button className="w-1/3 p-4 text-left transition transform hover:scale-105">
							<a
								href="/pastEvents"
								className="bg-[#EAE5FF] p-5 text-slate-700 rounded-lg flex hover:bg-[#e0d8ff]">
								<div className="mr-4">
									<FontAwesomeIcon
										icon={faCheckCircle}
										className="w-[34px] mt-[6px] text-slate-700"
										size="2x"
									/>
								</div>
								<div className="ml-1">
									<p className="text-[15px]">Past Events</p>
									<p className="font-medium">2</p>
								</div>
							</a>
						</button>
					</div>

					<div className="w-1/4 mt-4 flex justify-end items-start mr-1 ">
						<button
							className="flex items-center bg-slate-800 rounded-lg py-3 px-[30px] font-medium hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm mt-4 
                        -mr-[15px] hover:text-slate-50 justify-end text-right hover:transition duration-300 transform hover:scale-105 cursor-pointer"
							onClick={() => setShowModalCreateEvent(true)}>
							<IoIosAddCircleOutline className="text-3xl text-slate-100 -ml-1 mr-1" />
							<span className="text-slate-100 ml-1">Add Events</span>
						</button>
					</div>

					<CreateEvent_Modal
						isVisible={showModalCreateEvent}
						onClose={() => setShowModalCreateEvent(false)}>
						<form onSubmit={handleSubmitCreateEvent}>
							<div className="py-[90px] relative">
								<div className="ml-[7px] lg:ml-4">
									<h3 className="text-[15px] lg:text-[16px] lg:text-lg font-semibold text-slate-700 mb-[6px] lg:mb-2 -mt-[80px]">
										Create Event
									</h3>
									<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[505px]" />

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 ml-[1px]">
										Name
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left"
										type="text"
										placeholder="Event name"
										id="event_name"
										name="event_name"
										required
										onChange={e =>
											setInfo({
												...info,
												intFEventName: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Description
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="text"
										placeholder="Description"
										name="event_description"
										required
										onChange={e =>
											setInfo({
												...info,
												intFDescription: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Venue
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="text"
										placeholder="Venue"
										name="event_venue"
										required
										onChange={e =>
											setInfo({
												...info,
												intFVenue: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Maximum Seats
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="number"
										placeholder="Maximum seats"
										name="event_maximum_seats"
										required
										onChange={e =>
											setInfo({
												...info,
												intFMaximumSeats: e.target.value,
											})
										}
									/>

									<div className="flex flex-col mt-[10px]">
										<div className="flex">
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[140.5px] ml-[2px] mb-[2px]">
												Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-2 lg:ml-[121px] mb-[2px]">
												Start Time
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-2 ml-[10.5px] lg:ml-[26px] mb-[2px]">
												End Time
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
										</div>
										<div className="flex">
											<input
												className="lg:pr-[8px] lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[139px] mb-[3px]"
												type="date"
												name="event_date"
												required
												onChange={e =>
													setInfo({
														...info,
														intFStartDate: e.target.value,
													})
												}
											/>
											<input
												className="lg:pr-[8px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white ml-2 mr-[14px] mb-[3px]"
												type="time"
												name="event_start_time"
												required
												onChange={e =>
													setInfo({
														...info,
														intFStartTime: e.target.value,
													})
												}
											/>
											<input
												className="lg:pr-[8px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] -ml-[6px] lg:ml-0"
												type="time"
												name="event_end_time"
												required
												onChange={e =>
													setInfo({
														...info,
														intFEndTime: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Organizer
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="text"
										placeholder="Organizer"
										name="event_organizer"
										required
										onChange={e =>
											setInfo({
												...info,
												intFOrganizer: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Faculty
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white -mb-[30px]"
										type="text"
										placeholder="Faculty"
										name="event_faculty"
										required
										onChange={e =>
											setInfo({
												...info,
												intFFaculty: e.target.value,
											})
										}
									/>

									<div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center">
										<button
											className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
											onClick={() => {
												if (
													info.intFEventName &&
													info.intFDescription &&
													info.intFVenue &&
													info.intFMaximumSeats &&
													info.intFStartDate &&
													info.intFStartTime &&
													info.intFEndTime &&
													info.intFOrganizer &&
													info.intFFaculty
												) {
													setShowModalSuccess(true);
												}
											}}
											disabled={
												!info.intFEventName ||
												!info.intFDescription ||
												!info.intFVenue ||
												!info.intFMaximumSeats ||
												!info.intFStartDate ||
												!info.intFStartTime ||
												!info.intFEndTime ||
												!info.intFOrganizer ||
												!info.intFFaculty
											}>
											Submit
										</button>
									</div>
								</div>
							</div>
						</form>
					</CreateEvent_Modal>

					<ViewEvent_Modal
						isVisible={showModalViewEvent}
						onClose={() => setShowModalViewEvent(false)}>
						<div className="py-[30px] lg:py-[100px] relative">
							<img
								src={selectedEventImage}
								alt="Random"
								className="absolute h-[200px] lg:h-[258px] object-cover -mt-[38px] lg:-mt-[100px] rounded-t-lg -ml-[0.25px] lg:ml-2 transform hover:scale-110 hover:rotate-1 scale-[1.063] lg:scale-[1.068] transition duration-300 shadow-sm"
							/>

							<div className="ml-[7px] lg:ml-[9px]">
								<h3 className="text-[16px] lg:text-[19px] font-semibold text-slate-800 mb-1 mt-[180px]">
									About this event
								</h3>
								<p className="text-[12px] lg:text-[14px] text-mb-7 -mb-1 lg:mb-5 font-normal text-slate-500 mt-[10px]">
									{selectedEvent.intFDescription}
								</p>

								<div className="flex items-center mt-4">
									<HiMiniCalendarDays className="text-[32px] lg:text-2xl mr-2 text-slate-800 -mt-[2px]" />
									<p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px] mt-[0.5px]">
										{formatDate(selectedEvent.intFStartDate)}
									</p>
									<span className="mx-2 text-slate-800 ml-[15px] lg:ml-[57px] mr-6">
										|
									</span>
									<FiClock className="text-[30px] lg:text-[21px] mr-2 text-slate-800 -mt-[1px]" />
									<p className="text-slate-600 text-[12px] lg:text-[13px]">
										{formatTime(selectedEvent.intFStartTime)}
									</p>
									<span className="mx-2 text-slate-800 -mt-[2px]">
										-
									</span>
									<p className="text-slate-600 text-[12px] lg:text-[13px]">
										{formatTime(selectedEvent.intFEndTime)}
									</p>
								</div>
								<div className="flex items-center mt-[10px] lg:mt-[14px]">
									<FaLocationDot className="text-xl lg:text-2xl -ml-[0.5px] lg:ml-0 mr-2 text-slate-800" />
									<p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px]">
										{selectedEvent.intFVenue}
									</p>
								</div>
								<div className="flex items-center mt-[11px] lg:mt-[14px]">
									<MdPeople className="text-2xl mr-2 text-slate-800 -ml-[1px] lg:ml-[1px]" />
									<p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] -ml-[2px] lg:ml-0">
										{numberOfAttendees} Attendees
									</p>
								</div>
								<div className="flex items-center mt-[15px] lg:mb-0 mb-[3px]">
									<MdAirlineSeatReclineNormal className="text-2xl mr-2 text-slate-800 lg:ml-[2px]" />
									<p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] lg:-ml-[1px]">
										{selectedEvent.intFMaximumSeats} Seats
									</p>
								</div>

								<div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
									<div className="flex justify-center">
										<button
											className="rounded-lg px-[7px] py-[5px] lg:px-[10px] lg:py-[5px] border border-slate-800 hover:bg-slate-100 mr-4 text-[12px] lg:text-[15px] focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-medium"
											onClick={() =>
												setShowModalConfirmation(true)
											}>
											Cancel Event
										</button>

										{/* <Link to={`/attendance/table/${selectedEvent.intFID}`}>
                                        <button
                                            className="rounded-lg py-[9px] px-[15px] bg-slate-800 text-slate-100 text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                                        >
                                            Attendance
                                        </button>
                                    </Link> */}

										<button
											className="rounded-lg px-[20px] py-[6px] lg:px-[25px] lg:py-[9px] bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
											onClick={handleEditEventButton}>
											Edit Event
										</button>
									</div>
								</div>
							</div>
						</div>
					</ViewEvent_Modal>

					<ViewAttendance_Modal
						isVisible={showAttendanceModal}
						onClose={() => setShowAttendanceModal(false)}>
						<div className="flex items-center justify-center">
							<div className="flex items-center justify-center text-text text-[20px] text-center -mt-8">
								<PencilNoteIcon />{" "}
								<span className="ml-2.5">Attendance List</span>
							</div>
							<div className="ml-auto">
								<Link
									href={`/attendance/${selectedEvent.intFID}`}
									passHref
									legacyBehavior={true}>
									<a className="flex items-center bg-slate-200 rounded-lg text-[15px] hover:bg-slate-300 focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm mb-3.5">
										<span className="text-slate-800 p-[5px]">
											View More
										</span>
									</a>
								</Link>
							</div>
						</div>
						<div className="text-left text-black text-[13px] pl-9 pb-5 -mt-[28px]">
							Total Attendees: {attendanceData.length}
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
										{attendanceData.map(attendanceItem => (
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
							<div className="text-center text-gray-600 mt-4">
								No attendance data available.
							</div>
						)}
					</ViewAttendance_Modal>

					<EditEvent_Modal
						isVisible={showModalEditEvent}
						onClose={() => setShowModalEditEvent(false)}>
						<form>
							<div className="py-[90px] relative">
								<div className="ml-[7px] lg:ml-4">
									<h3 className="text-[15px] lg:text-[16px] lg:text-lg font-semibold text-slate-700 mb-[6px] lg:mb-2 -mt-[80px]">
										Edit Event
									</h3>
									<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[505px]" />

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 ml-[1px]">
										Name
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>

									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left"
										type="text"
										placeholder="Event name"
										id="event_name"
										name="event_name"
										value={editEventInfo.intFEventName}
										required
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFEventName: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Description
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="text"
										placeholder="Description"
										name="event_description"
										required
										value={editEventInfo.intFDescription}
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFDescription: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Venue
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="text"
										placeholder="Venue"
										name="event_venue"
										required
										value={editEventInfo.intFVenue}
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFVenue: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Maximum Seats
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="number"
										placeholder="Maximum seats"
										name="event_maximum_seats"
										required
										value={editEventInfo.intFMaximumSeats}
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFMaximumSeats: e.target.value,
											})
										}
									/>

									<div className="flex flex-col mt-[10px]">
										<div className="flex">
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[140.5px] ml-[2px] mb-[2px]">
												Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-2 lg:ml-[121px] mb-[2px]">
												Start Time
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-2 ml-[10.5px] lg:ml-[26px] mb-[2px]">
												End Time
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
										</div>
										<div className="flex">
											<input
												className="lg:pr-[8px] lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[139px] mb-[3px]"
												type="date"
												name="event_date"
												required
												value={editEventInfo.intFStartDate}
												onChange={e =>
													setEditEventInfo({
														...editEventInfo,
														intFStartDate: e.target.value,
													})
												}
											/>
											<input
												className="lg:pr-[8px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white ml-2 mr-[14px] mb-[3px]"
												type="time"
												name="event_start_time"
												required
												value={editEventInfo.intFStartTime}
												onChange={e =>
													setEditEventInfo({
														...editEventInfo,
														intFStartTime: e.target.value,
													})
												}
											/>
											<input
												className="lg:pr-[8px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] -ml-[6px] lg:ml-0"
												type="time"
												name="event_end_time"
												required
												value={editEventInfo.intFEndTime}
												onChange={e =>
													setEditEventInfo({
														...editEventInfo,
														intFEndTime: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Organizer
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="text"
										placeholder="Organizer"
										name="event_organizer"
										required
										value={editEventInfo.intFOrganizer}
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFOrganizer: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
										Faculty
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white -mb-[30px]"
										type="text"
										placeholder="Faculty"
										name="event_faculty"
										required
										value={editEventInfo.intFFaculty}
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFFaculty: e.target.value,
											})
										}
									/>

									<div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center">
										<button
											className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
											onClick={handleEditEventSubmit}>
											Submit
										</button>
									</div>
								</div>
							</div>
						</form>
					</EditEvent_Modal>

					<Success_Modal
						isVisible={showModalSuccess}
						onClose={() => setShowModalSuccess(false)}>
						<div className="p-4">
							<Image
								src="/images/tick_mark.png"
								alt="tick_mark"
								width={200}
								height={250}
								className="mx-auto -mt-[39px] lg:-mt-[45px]"
							/>
							<h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
								Success!
							</h3>
							<p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
								Event has been successfully created!
							</p>
							<div className="text-center ml-4">
								<button
									className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5 focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
									onClick={handleOK}>
									OK
								</button>
							</div>
						</div>
					</Success_Modal>

					<Delete_Event_Confirmation_Modal
						isVisible={showModalConfirmation}
						onClose={() => setShowModalConfirmation(false)}>
						<div className="p-4">
							<Image
								src="/images/cross_mark.png"
								alt="cross_mark"
								width={210}
								height={250}
								className="ml-[17px] -mt-[45px] lg:-mt-[45px] lg:ml-[115px]"
							/>
							<h3 className="text-2xl lg:text-3xl font-medium text-slate-700 mb-3 text-center -mt-8">
								Are you sure?
							</h3>
							<p className="text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-slate-400 text-center">
								Do you really want to cancel this event? This process
								cannot be undone.
							</p>
							<div className="text-center mx-auto">
								<button
									className="text-slate-800 border border-slate-800 hover:bg-slate-100 font-medium text-sm rounded-lg px-[18px] lg:px-5 py-[9px] lg:py-2.5 text-center mr-5 ml-4 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
									onClick={handleCancel}>
									Cancel
								</button>
								<button
									className="text-slate-100 bg-slate-800 hover:bg-slate-900 font-medium text-sm rounded-lg px-[22px] lg:px-6 py-[10px] lg:py-[11px] text-center mr-5 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
									onClick={() =>
										handleDeleteEvent(selectedEvent.intFID)
									}>
									Delete
								</button>
							</div>
						</div>
					</Delete_Event_Confirmation_Modal>
				</div>
			</div>

			<div className="w-full bg-slate-100 flex pb-28">
				<div className="w-full pr-6 bg-slate-100">
					<div className="w-full bg-slate-100">
						<div className="ml-6 font-bold text-lg">
							Today&aposs Event(s)
						</div>
						<div className="border-t border-gray-300 my-4 ml-6"></div>
						{latestEvent[0] && (
							<div
								className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 ml-5 w-full relative transition transform hover:scale-105 z-[50]"
								onClick={() =>
									openModal(
										"https://source.unsplash.com/600x300?party",
										latestEvent[0].intFID,
										latestEvent[0]?.intFEventName,
										latestEvent[0]?.intFDescription,
										latestEvent[0]?.intFStartDate,
										latestEvent[0]?.intFStartTime,
										latestEvent[0]?.intFEndTime,
										latestEvent[0]?.intFVenue,
										latestEvent[0]?.intFMaximumSeats,
										latestEvent[0].intFOrganizer,
										latestEvent[0].intFFaculty,
									)
								}>
								{latestEvent[0] && (
									<div className="ml-2 mr-2">
										{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
										<h2 className="text-2xl font-semibold mb-2 text-slate-800">
											{latestEvent[0].intFEventName}
										</h2>
										<div className="border-t border-gray-300 my-4"></div>
										<p className="text-gray-500 mb-4">
											{latestEvent[0].intFDescription}
										</p>
										<div className="flex items-center mt-4">
											<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
											<p className="text-slate-600 text-sm">
												{formatDate(latestEvent[0].intFStartDate)}
											</p>
										</div>
										<div className="flex items-center mt-3">
											<FiClock className="text-2xl mr-2 text-slate-800" />
											<p className="text-slate-600 text-sm">
												{formatTime(latestEvent[0].intFStartTime)}
											</p>
										</div>
										<div className="flex items-center mt-3">
											<FaLocationDot className="text-2xl mr-2 text-slate-800" />
											<p className="text-slate-600 text-sm">
												{latestEvent[0].intFVenue}
											</p>
										</div>
										<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
											<div
												className="h-full bg-orange-300 rounded-full"
												style={{
													width: `${(20 / 60) * 100}%`,
												}}></div>
										</div>
										<div className="text-xs text-gray-600 mt-2 flex justify-between">
											<span className="ml-[2px]">
												Current Attendees:{" "}
											</span>
											<span className="mr-[2px]">
												Max Attendees:{" "}
												{latestEvent[0].intFMaximumSeats}
											</span>
										</div>

										<div className="flex justify-between items-end mt-5">
											<div
												className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]"
												onClick={e => {
													e.stopPropagation(); // This line prevents the event from propagating
													openAttendanceModal(
														latestEvent[0].intFID,
													);
												}}>
												Attendance List
											</div>

											<span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
												<span
													aria-hidden
													className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
												<AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
												<span className="relative mt-[1px] leading-3 tracking-wider">
													Upcoming
												</span>
											</span>
										</div>
									</div>
								)}
							</div>
						)}


						<div className="ml-6 mt-5 font-bold text-lg">
							Tomorrow&aposs Event(s)
						</div>
						<div className="border-t border-gray-300 my-4 ml-6"></div>
						{latestEvent[1] && <div className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 ml-5 w-full relative transition transform hover:scale-105 z-[50]" onClick={() => openModal("https://source.unsplash.com/600x300?birthday", latestEvent[1].intFID, latestEvent[1].intFEventName, latestEvent[1]?.intFDescription, latestEvent[1]?.intFStartDate, latestEvent[1]?.intFStartTime, latestEvent[1]?.intFEndTime, latestEvent[1]?.intFVenue, latestEvent[1]?.intFMaximumSeats, latestEvent[1].intFOrganizer, latestEvent[1].intFFaculty)}>
							{latestEvent[1] && (
								<div className="ml-2 mr-2">
									<h2 className="text-2xl font-semibold mb-2 text-slate-800">{latestEvent[1].intFEventName}</h2>
									<div className="border-t border-gray-300 my-4"></div>
									<p className="text-gray-500">{latestEvent[1].intFDescription}</p>
									<div className="flex items-center mt-4">
										<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
										<p className="text-slate-600 text-sm">{formatDate(latestEvent[1].intFStartDate)}</p>
									</div>
									<div className="flex items-center mt-3">
										<FiClock className="text-2xl mr-2 text-slate-800" />
										<p className="text-slate-600 text-sm">{formatTime(latestEvent[1].intFStartTime)}</p>
									</div>
									<div className="flex items-center mt-3">
										<FaLocationDot className="text-2xl mr-2 text-slate-800" />
										<p className="text-slate-600 text-sm">{latestEvent[1].intFVenue}</p>
									</div>
									<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
										<div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
									</div>
									<div className="text-xs text-gray-600 mt-2 flex justify-between">
										<span className="ml-[2px]">Current Attendees: 23</span>
										<span className="mr-[2px]">Max Attendees: {latestEvent[1].intFMaximumSeats}</span>
									</div>
									<div className="flex justify-between items-end mt-5">
										<div className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]" onClick={e => { e.stopPropagation(); openAttendanceModal(latestEvent[1].intFID); }}>Attendance List</div>
										<span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
											<span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
											<AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
											<span className="relative mt-[1px] leading-3 tracking-wider">Upcoming</span>
										</span>
									</div>
								</div>
							)}
						</div>}

						<div className="ml-6 mt-5 font-bold text-lg">
							Upcoming Event(s)
						</div>
						<div className="border-t border-gray-300 my-4 ml-6"></div>
						{latestEvent[2] && (
							<div
								className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 ml-5 w-full relative transition transform hover:scale-105 z-[50]"
								onClick={() =>
									openModal(
										"https://source.unsplash.com/600x300?new+year",
										latestEvent[2].intFID,
										latestEvent[2].intFEventName,
										latestEvent[2]?.intFDescription,
										latestEvent[2]?.intFStartDate,
										latestEvent[2]?.intFStartTime,
										latestEvent[2]?.intFEndTime,
										latestEvent[2]?.intFVenue,
										latestEvent[2]?.intFMaximumSeats,
										latestEvent[2].intFOrganizer,
										latestEvent[2].intFFaculty,
									)
								}>

								{latestEvent[2] && (
									<div className="ml-2 mr-2">
										<h2 className="text-2xl font-semibold mb-2 text-slate-800">
											{latestEvent[2].intFEventName}
										</h2>
										<div className="border-t border-gray-300 my-4"></div>
										<p className="text-gray-500">
											{latestEvent[2].intFDescription}
										</p>
										<div className="flex items-center mt-4">
											<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 -mt-[2px]" />
											<p className="text-slate-600 text-sm">
												{formatDate(latestEvent[2].intFStartDate)}
											</p>
										</div>
										<div className="flex items-center mt-3">
											<FiClock className="text-2xl mr-2 text-slate-800" />
											<p className="text-slate-600 text-sm">
												{formatTime(latestEvent[2].intFStartTime)}
											</p>
										</div>
										<div className="flex items-center mt-3">
											<FaLocationDot className="text-2xl mr-2 text-slate-800" />
											<p className="text-slate-600 text-sm">
												{latestEvent[2].intFVenue}
											</p>
										</div>
										<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
											<div
												className="h-full bg-orange-300 rounded-full"
												style={{
													width: `${(20 / 60) * 100}%`,
												}}></div>
										</div>
										<div className="text-xs text-gray-600 mt-2 flex justify-between">
											<span className="ml-[2px]">
												Current Attendees: 23
											</span>
											<span className="mr-[2px]">
												Max Attendees:{" "}
												{latestEvent[2].intFMaximumSeats}
											</span>
										</div>

										<div className="flex justify-between items-end mt-5">
											<div
												className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]"
												onClick={e => {
													e.stopPropagation(); // This line prevents the event from propagating
													openAttendanceModal(
														latestEvent[2].intFID,
													);
												}}>
												Attendance List
											</div>
											<span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
												<span
													aria-hidden
													className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
												<AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
												<span className="relative mt-[1px] leading-3 tracking-wider">
													Upcoming
												</span>
											</span>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* <div className="w-1/4 pl-5">
					<div className="bg-white border border-slate-200 rounded-lg p-6 h-[470px] transition transform hover:scale-105">
						<h2 className="text-2xl font-semibold mb-2">Calendar</h2>
						{/* <Calendar /> 
					</div>
				</div> */}
			</div>
		</div>
	);
}
