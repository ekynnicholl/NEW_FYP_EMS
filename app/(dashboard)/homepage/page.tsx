"use client";

import SideBarDesktop from "@/components/layouts/SideBarDesktop";
import SideBarMobile from "@/components/layouts/SideBarMobile";
import TopBar from "@/components/layouts/TopBar";
import CreateEvent_Modal from "@/components/CreateEvent_Modal";
import ViewEvent_Modal from "@/components/ViewEvent_Modal";
import EditEvent_Modal from "@/components/EditEvent_Modal";
import EditSubEvent_Modal from "@/components/EditSubEvent_Modal";
import AddSubEvent_Modal from "@/components/EditSubEvent_Modal";
import Success_CreateEventModal from "@/components/Modal";
import Modal from "@/components/QR_Codes_Modal";
import { QRCodeSVG } from "qrcode.react";
import Success_AddSubEventModal from "@/components/Modal";
import QRCodeIcon from '@/components/icons/QRCodeIcon';

import Success_EditEventModal from "@/components/Modal";
import Success_EditSubEventModal from "@/components/Modal";
import Success_DeleteSubEventModal from "@/components/Modal";
import Delete_Event_Confirmation_Modal from "@/components/Modal";
import { Chart } from 'chart.js/auto';

import Image from "next/image";
import { useState, useEffect, SyntheticEvent, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from '@supabase/supabase-js'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faUsers, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { IoIosAddCircleOutline } from "react-icons/io";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";
import { AiOutlineFieldTime } from "react-icons/ai";
import { MdPeople } from "react-icons/md";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { BsBoxArrowUpRight, BsFillTrash3Fill } from "react-icons/bs"
import { HiPencilAlt } from "react-icons/hi"
import { IoMdAddCircleOutline } from "react-icons/io"
import PencilNoteIcon from "@/components/icons/PencilNoteIcon";
import ViewAttendance_Modal from "@/components/ViewAttendance_Modal";
import useViewModeStore from '@/components/zustand/viewModeStorage';
import cookie from 'js-cookie';
import { useRouter } from "next/navigation";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AttendanceTable from "@/components/tables/attendanceTable";
import ThreeDotIcon from "@/components/icons/ThreeDotIcon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ViewEventFeedback from "@/components/ViewEventFeedback";
import FeedbackList from "@/components/tables/feedbackTable";
//npm install chartjs-plugin-datalabels

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

// type Info = {
// 	intFID: string;
// 	intFEventName: string;
// 	intFDescription: string;
// 	intFVenue: string;
// 	intFMaximumSeats: string;
// 	intFStartDate: string;
// 	intFStartTime: string;
// 	intFEndTime: string;
// 	intFOrganizer: string;
// 	intFFaculty: string;
// };

type mainEvent = {
	intFID: string;
	intFEventName: string;
	intFEventDescription: string;
	intFEventStartDate: string;
	intFEventEndDate: string;
};

type AttendanceDataType = {
	attFormsID: string;
	attFSubEventID: string;
	attFormsStaffID: string;
	attFormsStaffName: string;
	attFormsFacultyUnit: string;
};

type subEvents = {
	sub_eventsID: string;
	sub_eventsMainID: string;
	sub_eventsName: string;
	sub_eventsVenue: string;
	sub_eventsStartDate: string;
	sub_eventsEndDate: string;
	sub_eventsStartTime: string;
	sub_eventsEndTime: string;
	sub_eventsOrganizer: string;
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

export default function Homepage() {
	useEffect(() => {
		const checkIsUserLoggedIn = () => {
			const authToken = cookie.get('authToken');
			const accountRank = cookie.get('accountRank');
			if (!authToken && accountRank != "99") {
				router.push("/unauthorizedAccess");
			}
		};

		checkIsUserLoggedIn();
	})

	const supabase = createClientComponentClient();
	const malaysiaTimezone = "Asia/Kuala_Lumpur";

	// const [info, setInfo] = useState<Info>({} as Info);
	// const [infos, setInfos] = useState<Info[]>([] as Info[]);

	const [mainEvent, setMainEvent] = useState<mainEvent>({} as mainEvent);
	const [mainEvents, setMainEvents] = useState<mainEvent[]>([] as mainEvent[]);

	const [subEventz, setSubEventz] = useState<subEvents>({} as subEvents);
	const [subEventzs, setSubEventzs] = useState<subEvents[]>([] as subEvents[]);

	const [intFID, setIntFID] = useState(""); // pass the intFID to handleAddSubEvent

	// const [latestEvent, setLatestEvent] = useState<Info | null>(null);
	const [latestEvent, setLatestEvent] = useState<mainEvent[]>([]);

	const [numberOfAttendees, setNumberOfAttendees] = useState<number>(0);
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
		sub_eventsOrganizer: ""
	});

	const [editEventInfo, setEditEventInfo] = useState({
		intFID: "",
		intFEventName: "",
		intFEventDescription: "",
		intFEventStartDate: "",
		intFEventEndDate: "",
	});

	const [editSubEventInfo, setEditSubEventInfo] = useState({
		sub_eventsID: "",
		sub_eventsName: "",
		sub_eventsVenue: "",
		sub_eventsMaxSeats: "",
		sub_eventsStartDate: "",
		sub_eventsEndDate: "",
		sub_eventsStartTime: "",
		sub_eventsEndTime: "",
		sub_eventsOrganizer: "",
		// sub_eventsFaculty: "",
	});


	// Create, View, Edit Modal + Selected Event Image
	const [showModalCreateEvent, setShowModalCreateEvent] = useState(false);
	const [showModalViewEvent, setShowModalViewEvent] = useState(false);
	const [showModalAddEvent, setShowModalAddEvent] = useState(false);
	const [showModalEditEvent, setShowModalEditEvent] = useState(false);
	const [showModalEditSubEvent, setShowModalEditSubEvent] = useState(false);
	const [selectedEventImage, setSelectedEventImage] = useState("");
	const [subEvents, setSubEvents] = useState<subEvents[]>([]);

	// Success Modal and Confirmation Modal
	const [showModalCreateEventSuccess, setShowModalCreateEventSuccess] = useState(false);
	const [showModalAddEventSuccess, setShowModalAddEventSuccess] = useState(false);
	const [showModalEditEventSuccess, setShowModalEditEventSuccess] = useState(false);
	const [showModalEditSubEventSuccess, setShowModalEditSubEventSuccess] = useState(false);
	const [showModalDeleteSubEventSuccess, setShowModalDeleteSubEventSuccess] = useState(false);
	const [showModalConfirmation, setShowModalConfirmation] = useState(false);

	// This is for attendance modal,
	const [attendanceData, setAttendanceData] = useState<AttendanceDataType[]>([]);
	const [showAttendanceModal, setShowAttendanceModal] = useState(false);
	const [attendanceMainEventID, setAttendanceMainEventID] = useState("");
	const [subEventsForAttendance, setSubEventsForAttendance] = useState<subEvents[]>([]);

	// This is for the pie chart,
	const [selectedSubEvent, setSelectedSubEvent] = useState<string>("");
	const chartContainer = useRef<HTMLCanvasElement | null>(null);
	const chartInstanceRef = useRef<Chart<"pie", number[], string> | null>(null);
	const [isAllButtonActive, setIsAllButtonActive] = useState(true);
	const viewMode = useViewModeStore((state) => state.viewMode);

	// This is for checking login and redirecting with router,
	const router = useRouter();

	const currentAttendees = 20; // Example value, replace with your actual value
	const maxAttendees = 60; // Example value, replace with your actual value

	const percentage = (currentAttendees / maxAttendees) * 100;
	const isOverCapacity = percentage > 100;

	// Function to fetch the 6 latest events
	useEffect(() => {
		const fetchLatestEvent = async () => {
			// Fetch data from internal_events table
			const { data: mainEventData, error: internalError } = await supabase
				.from("internal_events")
				.select(
					"intFID, intFEventName, intFEventDescription, intFEventStartDate, intFEventEndDate",
				)
				.gte(
					"intFEventEndDate",
					new Date().toLocaleString("en-US", { timeZone: malaysiaTimezone }),
				)
				.order("intFEventStartDate", { ascending: true })
				.range(0, 5)
				.select();

			if (internalError) {
				console.error("Error fetching latest event:", internalError);
				return;
			}

			setLatestEvent(mainEventData);

			// Fetch data from sub_events table where sub_eventsMainID equals intFID
			const subEventQuery = await supabase
				.from("sub_events")
				.select(
					"sub_eventsID, sub_eventsMainID, sub_eventsName, sub_eventsVenue, sub_eventsMaxSeats, sub_eventsStartDate, sub_eventsEndDate, sub_eventsStartTime, sub_eventsEndTime, sub_eventsOrganizer",
				)
				.in("sub_eventsMainID", mainEventData.map(event => event.intFID));

			if (subEventQuery.error) {
				console.error("Error fetching sub_events:", subEventQuery.error);
				return;
			}

			setSubEvents(subEventQuery.data);
			// console.log("SubEvents:", subEventQuery.data)

			// console.log(
			// 	"Matching Sub Events:",
			// 	subEvents.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[0].intFID)
			// );

		};

		fetchLatestEvent();
	}, [supabase]);

	// 
	// This is for the GRID VIEW,
	//
	const [todayEvents, setTodayEvents] = useState<any[]>([]);
	const [tomorrowEvents, setTomorrowEvents] = useState<any[]>([]);
	const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

	// Function to compare dates (ignores time),
	function isSameDate(date1: string, date2: string) {
		const d1 = new Date(date1);
		const d2 = new Date(date2);
		return (
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate()
		);
	}

	// Function to check whether todays date is in range of the event,
	function isDateInRange(currentDate: string, startDate: string, endDate: string) {
		const currentDateObj = new Date(currentDate.substring(0, 10));
		const startDateObj = new Date(startDate.substring(0, 10));
		const endDateObj = new Date(endDate.substring(0, 10));

		return (
			currentDateObj.getTime() >= startDateObj.getTime() &&
			currentDateObj.getTime() <= endDateObj.getTime()
		);
	}

	// Function to get tomorrow's date,
	function getTomorrowDate(date: string) {
		const today = new Date(date);
		today.setDate(today.getDate() + 1);
		return today.toISOString();
	}

	useEffect(() => {
		const fetchGridView = async () => {
			const today = new Date().toISOString();
			// Fetch data from internal_events table
			const { data: mainEventData, error: internalError } = await supabase
				.from('internal_events')
				.select(
					'intFID, intFEventName, intFEventDescription, intFEventStartDate, intFEventEndDate'
				)
				.order('intFEventStartDate', { ascending: true })
				.select();

			if (internalError) {
				console.error('Error fetching latest event:', internalError);
				return;
			}

			// Filter events for today, tomorrow, and upcoming
			const todayEvents = mainEventData.filter(
				(event) =>
					isDateInRange(today, event.intFEventStartDate, event.intFEventEndDate)
			);

			// Filter tomorrow's events while excluding today's events
			const tomorrow = getTomorrowDate(today);
			const tomorrowEvents = mainEventData.filter(
				(event) =>
					isSameDate(event.intFEventStartDate, tomorrow) &&
					!isSameDate(event.intFEventStartDate, today) &&
					!todayEvents.some((todayEvent) => todayEvent.intFID === event.intFID)
			);

			// Filter upcoming events while excluding today's and past events
			const upcomingEvents = mainEventData.filter(
				(event) =>
					!isSameDate(event.intFEventStartDate, tomorrow) &&
					!isSameDate(event.intFEventStartDate, today) &&
					new Date(event.intFEventEndDate).getTime() >= new Date(today).getTime() &&
					!todayEvents.some((todayEvent) => todayEvent.intFID === event.intFID)
			);

			// Set the categorized events
			setTodayEvents(todayEvents);
			setTomorrowEvents(tomorrowEvents);
			setUpcomingEvents(upcomingEvents);
		};
		fetchGridView();
	});

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
			// setSelectedEvent({
			// 	intFID: event_id,
			// 	intFEventName: "",
			// 	intFEventDescription: "",
			// 	intFEventStartDate: "",
			// 	intFEventStartTime: "",
			// 	intFEventEndTime: "",
			// 	intFEventVenue: "",
			// 	intFEventMaximumSeats: "",
			// 	intFEventOrganizer: "",
			// 	intFEventFaculty: "",
			// });
			// Fetch the attendance list for that event,
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

			// // Calculate labels (faculty/unit) and label data (counts)
			// const facultyCounts: { [key: string]: number } = {};

			// attendanceForms.forEach(attendanceItem => {
			// 	const faculty = attendanceItem.attFormsFacultyUnit;
			// 	if (facultyCounts[faculty]) {
			// 		facultyCounts[faculty]++;
			// 	} else {
			// 		facultyCounts[faculty] = 1;
			// 	}
			// });

			// const facultyLabels = Object.keys(facultyCounts);
			// const facultyData = facultyLabels.map(label => facultyCounts[label]);

			// const canvas = chartContainer.current;
			// createPieChart(canvas, facultyLabels, facultyData);
			// if (attendanceData.length === 0) {
			// 	console.log("the data is empty");
			// }

			// console.log("Attendance forms data for selected sub-event:", attendanceForms);
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

	// useEffect(() => {
	// 	const channel = supabase
	// 		.channel('attendance-forms-changes')
	// 		.on('postgres_changes', {
	// 			event: 'INSERT',
	// 			schema: 'public',
	// 		}, (payload) => {
	// 			console.log(payload);
	// 		})
	// 		.subscribe();

	// 	return () => {
	// 		channel.unsubscribe();
	// 	};
	// }, []);

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

	const openModal = async (
		imageSrc: string,
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
		// sub_event_faculty: string,
	) => {
		setSelectedEventImage(imageSrc);
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
			// sub_eventsFaculty: sub_event_faculty,
		});

		setShowModalViewEvent(true);
	};


	// Create event + sub events dynamic textbox
	const [eventDetails, setEventDetails] = useState([
		{ event_names: [''], venues: [''], start_dates: [''], end_dates: [''], start_times: [''], end_times: [''], maximum_seats: [''], organizers: [''] },
	]);


	const lastDetailRef = useRef<HTMLDivElement>(null);
	const addEventDetails = () => {
		setEventDetails(eventDetails => [...eventDetails, { event_names: [''], venues: [''], start_dates: [''], end_dates: [''], start_times: [''], end_times: [''], maximum_seats: [''], organizers: [''] }]);
	};
	useEffect(() => {
		if (lastDetailRef.current) {
			lastDetailRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [eventDetails]);

	const handleEventNameInputChange = (eventIndex: number, eventNameIndex: number, value: string) => {
		const updatedDetails = [...eventDetails];
		updatedDetails[eventIndex].event_names[eventNameIndex] = value;
		setEventDetails(updatedDetails);
	};

	const handleEventVenueInputChange = (eventIndex: number, venueIndex: number, value: string) => {
		const updatedDetails = [...eventDetails];
		updatedDetails[eventIndex].venues[venueIndex] = value;
		setEventDetails(updatedDetails);
	};

	const handleEventStartDatesInputChange = (eventIndex: number, startDatesIndex: number, value: string) => {
		const updatedDetails = [...eventDetails];
		updatedDetails[eventIndex].start_dates[startDatesIndex] = value;
		setEventDetails(updatedDetails);
	};

	const handleEventEndDatesInputChange = (eventIndex: number, endDatesIndex: number, value: string) => {
		const updatedDetails = [...eventDetails];
		updatedDetails[eventIndex].end_dates[endDatesIndex] = value;
		setEventDetails(updatedDetails);
	};

	const handleEventStartTimesInputChange = (eventIndex: number, startTimesIndex: number, value: string) => {
		const updatedDetails = [...eventDetails];
		updatedDetails[eventIndex].start_times[startTimesIndex] = value;
		setEventDetails(updatedDetails);
	};

	const handleEventEndTimesInputChange = (eventIndex: number, endTimesIndex: number, value: string) => {
		const updatedDetails = [...eventDetails];
		updatedDetails[eventIndex].end_times[endTimesIndex] = value;
		setEventDetails(updatedDetails);
	};

	const handleEventMaximumSeatsInputChange = (eventIndex: number, maximumSeatsIndex: number, value: string) => {
		const updatedDetails = [...eventDetails];
		updatedDetails[eventIndex].maximum_seats[maximumSeatsIndex] = value;
		setEventDetails(updatedDetails);
	};

	const handleEventOrganizersInputChange = (eventIndex: number, organizersIndex: number, value: string) => {
		const updatedDetails = [...eventDetails];
		updatedDetails[eventIndex].organizers[organizersIndex] = value;
		setEventDetails(updatedDetails);
	};

	// Remove the session expanded (dynamic textboxes)
	const handleRemoveEventClick = (eventIndex: number) => {
		const updatedDetails = [...eventDetails];
		updatedDetails.splice(eventIndex);
		setEventDetails(updatedDetails);
	};


	// Handle data submission
	const handleSubmitCreateEvent = async (e: SyntheticEvent) => {
		e.preventDefault();
		// console.log(eventDetails);

		// MAIN EVENT
		const { data, error } = await supabase
			.from("internal_events")
			.upsert({
				intFEventName: mainEvent.intFEventName,
				intFEventDescription: mainEvent.intFEventDescription,
				intFEventStartDate: mainEvent.intFEventStartDate,
				intFEventEndDate: mainEvent.intFEventEndDate,
			})
			.select();

		console.log("DATAWEEEEEEE" + data![0].intFID);
		const generatedEventID = data![0].intFID;

		// // This attendance list will be created x times based on how many days (sub-events spread out across multiple days), x the event has.
		// if (error) {
		// 	console.error("Error inserting event data:", error);
		// } else {
		// 	// Extract the generated UUID from the event data
		// 	const generatedEventID = data[0].intFID;

		// 	const { data: attendanceData, error: attendanceError } = await supabase
		// 		.from("attendance_list")
		// 		.upsert({
		// 			attListEventID: generatedEventID,
		// 			attListDayCount: 0,
		// 			attListEventDate: info.intFStartDate,
		// 		});

		// 	if (attendanceError) {
		// 		console.error("Error inserting attendance data:", attendanceError);
		// 	} else {
		// 		console.log("Attendance data inserted successfully:", attendanceData);
		// 	}
		// }

		// if (error) {
		// 	console.error(error);
		// 	return;
		// }

		setMainEvents([
			...mainEvents,
			{
				intFID: mainEvent.intFID,
				intFEventName: mainEvent.intFEventName,
				intFEventDescription: mainEvent.intFEventDescription,
				intFEventStartDate: mainEvent.intFEventStartDate,
				intFEventEndDate: mainEvent.intFEventEndDate,
			},
		]);

		setMainEvent({} as mainEvent);


		// { event_names: [''], venues: [''], maximum_seats: [''], start_dates: [''], end_dates: [''], start_times: [''], end_times: [''], organizers: [''], faculties: [''] },
		// SUB EVENTS

		// THIS IS THE OLD ONE WITH RED RED
		// for (const [index, detail] of eventDetails.entries()) {
		// 	for (let i = 0; i < detail.venues.length; i++) {
		// 		console.log("Index: " + index)
		// 		console.log("Length" + detail.venues.length)

		// 		const sub_eventsName = detail.event_names[i];
		// 		const sub_eventsVenue = detail.venues[i];
		// 		const sub_eventsStartDate = detail.start_dates[i];
		// 		const sub_eventsEndDate = detail.end_dates[i];
		// 		const sub_eventsStartTime = detail.start_times[i];
		// 		const sub_eventsEndTime = detail.end_times[i];
		// 		const sub_eventsMaxSeats = detail.maximum_seats[i];
		// 		const sub_eventsOrganizer = detail.organizers[i];
		// 		const sub_eventsFaculty = detail.faculties[i];

		// 		const { data: subEventData, error: subEventError } = await supabase.from("sub_events").insert({
		// 			sub_eventsMainID: generatedEventID,
		// 			sub_eventsName,
		// 			sub_eventsVenue,
		// 			sub_eventsStartDate,
		// 			sub_eventsEndDate,
		// 			sub_eventsStartTime,
		// 			sub_eventsEndTime,
		// 			sub_eventsMaxSeats,
		// 			sub_eventsOrganizer,
		// 			sub_eventsFaculty,
		// 		});

		// 		if (subEventError) {
		// 			console.error(subEventError);
		// 			return;
		// 		}

		// 		if (subEventData && (subEventData as any[]).length > 0) {
		// 			setSubEvents(prevSubEvents => [...prevSubEvents, subEventData[0]]);
		// 		}
		// 	}
		// }

		for (let index = 0; index < eventDetails.length; index++) {
			const detail = eventDetails[index];
			for (let i = 0; i < detail.venues.length; i++) {
				const sub_eventsName = detail.event_names[i];
				const sub_eventsVenue = detail.venues[i];
				const sub_eventsStartDate = detail.start_dates[i];
				const sub_eventsEndDate = detail.end_dates[i];
				const sub_eventsStartTime = detail.start_times[i];
				const sub_eventsEndTime = detail.end_times[i];
				const sub_eventsMaxSeats = detail.maximum_seats[i];
				const sub_eventsOrganizer = detail.organizers[i];
				// const sub_eventsFaculty = detail.faculties[i];

				const { data: subEventData, error: subEventError } = await supabase.from("sub_events").insert({
					sub_eventsMainID: generatedEventID,
					sub_eventsName,
					sub_eventsVenue,
					sub_eventsStartDate,
					sub_eventsEndDate,
					sub_eventsStartTime,
					sub_eventsEndTime,
					sub_eventsMaxSeats,
					sub_eventsOrganizer,
					// sub_eventsFaculty,
				});

				if (subEventError) {
					console.error(subEventError);
					return;
				}

				if (subEventData && (subEventData as any[]).length > 0) {
					setSubEvents(prevSubEvents => [...prevSubEvents, subEventData[0]]);
				}
			}
		}

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
				intFEventName: selectedEvent.intFEventName,
				intFEventDescription: selectedEvent.intFEventDescription,
				intFEventStartDate: selectedEvent.intFEventStartDate,
				intFEventEndDate: selectedEvent.intFEventEndDate,
			});
		}
	};

	const handleEditEventSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const { data, error } = await supabase
			.from("internal_events")
			.update({
				intFEventName: editEventInfo.intFEventName,
				intFEventDescription: editEventInfo.intFEventDescription,
				intFEventStartDate: editEventInfo.intFEventStartDate,
				intFEventEndDate: editEventInfo.intFEventEndDate,
			})
			.eq("intFID", editEventInfo.intFID);

		if (error) {
			console.error("Error updating event:", error);
			return;
		}

		setShowModalEditEventSuccess(true);
	};

	// Edit Sub Event (using pencil)
	const handleEditSubEventButton = (e: React.MouseEvent<HTMLButtonElement>, subEventID: string) => {
		e.preventDefault();
		setShowModalEditSubEvent(true);
		setShowModalViewEvent(false);

		const selectedSubEvent = subEvents.find(subEvent => subEvent.sub_eventsID === subEventID);

		if (selectedSubEvent) {
			setEditSubEventInfo({
				sub_eventsID: selectedSubEvent.sub_eventsID,
				sub_eventsName: selectedSubEvent.sub_eventsName,
				sub_eventsVenue: selectedSubEvent.sub_eventsVenue,
				sub_eventsMaxSeats: selectedSubEvent.sub_eventsMaxSeats,
				sub_eventsStartDate: selectedSubEvent.sub_eventsStartDate,
				sub_eventsEndDate: selectedSubEvent.sub_eventsEndDate,
				sub_eventsStartTime: selectedSubEvent.sub_eventsStartTime,
				sub_eventsEndTime: selectedSubEvent.sub_eventsEndTime,
				sub_eventsOrganizer: selectedSubEvent.sub_eventsOrganizer
			});
		}
	};

	const handleEditSubEventSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const { data, error } = await supabase
			.from("sub_events")
			.update({
				sub_eventsID: editSubEventInfo.sub_eventsID,
				sub_eventsName: editSubEventInfo.sub_eventsName,
				sub_eventsVenue: editSubEventInfo.sub_eventsVenue,
				sub_eventsMaxSeats: editSubEventInfo.sub_eventsMaxSeats,
				sub_eventsStartDate: editSubEventInfo.sub_eventsStartDate,
				sub_eventsEndDate: editSubEventInfo.sub_eventsEndDate,
				sub_eventsStartTime: editSubEventInfo.sub_eventsStartTime,
				sub_eventsEndTime: editSubEventInfo.sub_eventsEndTime,
				sub_eventsOrganizer: editSubEventInfo.sub_eventsOrganizer,
			})
			.eq("sub_eventsID", editSubEventInfo.sub_eventsID);

		if (error) {
			console.error("Error updating sub event:", error);
			return;
		}

		setShowModalEditSubEventSuccess(true);
	};

	const openAddSubEventModal = (e: React.MouseEvent<HTMLButtonElement>, intFID: string) => {
		e.preventDefault();
		setShowModalAddEvent(true);
		setShowModalViewEvent(false);

		setIntFID(intFID);
	}

	const handleAddSubEvent = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		const { data, error } = await supabase.from("sub_events").insert({
			sub_eventsMainID: intFID,
			sub_eventsName: subEventz.sub_eventsName,
			sub_eventsVenue: subEventz.sub_eventsVenue,
			sub_eventsMaxSeats: subEventz.sub_eventsMaxSeats,
			sub_eventsStartDate: subEventz.sub_eventsStartDate,
			sub_eventsEndDate: subEventz.sub_eventsEndDate,
			sub_eventsStartTime: subEventz.sub_eventsStartTime,
			sub_eventsEndTime: subEventz.sub_eventsEndTime,
			sub_eventsOrganizer: subEventz.sub_eventsOrganizer
		});

		if (error) {
			console.error(error);
			return;
		}

		console.log(data);

		setSubEventzs([...subEventzs, {
			sub_eventsID: subEventz.sub_eventsID,
			sub_eventsMainID: intFID,
			sub_eventsName: subEventz.sub_eventsName,
			sub_eventsVenue: subEventz.sub_eventsVenue,
			sub_eventsMaxSeats: subEventz.sub_eventsMaxSeats,
			sub_eventsStartDate: subEventz.sub_eventsStartDate,
			sub_eventsEndDate: subEventz.sub_eventsEndDate,
			sub_eventsStartTime: subEventz.sub_eventsStartTime,
			sub_eventsEndTime: subEventz.sub_eventsEndTime,
			sub_eventsOrganizer: subEventz.sub_eventsOrganizer
		}]);

		setSubEventz({} as subEvents);

		setShowModalAddEventSuccess(true);
	};

	const handleOK = () => {
		setShowModalCreateEventSuccess(false);
		setShowModalAddEventSuccess(false);
		setShowModalEditEventSuccess(false);
		setShowModalEditSubEventSuccess(false);
		setShowModalDeleteSubEventSuccess(false);
		window.location.reload();
	};

	const handleCancel = () => {
		setShowModalConfirmation(false);
	};

	const handleDeleteEvent = async (intFID: string) => {
		// Step 1: Retrieve associated sub-events
		const { data: subEvents, error: subEventsError } = await supabase
			.from("sub_events")
			.select("*")
			.eq("sub_eventsMainID", intFID);

		if (subEventsError) {
			console.error("Error fetching sub-events:", subEventsError);
			return;
		}

		// Step 2: Delete attendance forms associated with the sub-event
		const subEventIDs = subEvents.map(subEvent => subEvent.sub_eventsID);
		const { error: deleteAttendanceFormsError } = await supabase
			.from("attendance_forms")
			.delete()
			.in("attFSubEventID", subEventIDs);

		if (deleteAttendanceFormsError) {
			console.error("Error deleting attendance forms:", deleteAttendanceFormsError);
			return;
		}

		// Step 3: Delete feedback forms associated with the sub-event
		const { error: deleteFeedbackFormsError } = await supabase
			.from("feedback_forms")
			.delete()
			.in("feedbackSubEventID", subEventIDs);

		if (deleteFeedbackFormsError) {
			console.error("Error deleting feedback forms:", deleteFeedbackFormsError);
			return;
		}

		// Step 4: Delete sub-events
		if (subEventIDs.length > 0) {
			const { error: deleteSubEventsError } = await supabase
				.from("sub_events")
				.delete()
				.in("sub_eventsID", subEventIDs);

			if (deleteSubEventsError) {
				console.error("Error deleting sub-events:", deleteSubEventsError);
				return;
			}
		}

		// Step 5: Delete main event
		const { error: deleteMainEventError } = await supabase
			.from("internal_events")
			.delete()
			.eq("intFID", intFID);

		if (deleteMainEventError) {
			console.error("Error deleting main event:", deleteMainEventError);
			return;
		}

		console.log("Event and associated sub-events deleted successfully.");

		window.location.reload(); // Refresh the page
	};

	const handleDeleteSubEvent = async (subEventID: string) => {
		const subEventIDs = subEvents.map(subEvent => subEvent.sub_eventsID);

		// Step 1: Delete attendance forms associated with the sub-event
		const { error: deleteAttendanceFormsError } = await supabase
			.from("attendance_forms")
			.delete()
			.in("attFSubEventID", subEventIDs);

		if (deleteAttendanceFormsError) {
			console.error("Error deleting attendance forms:", deleteAttendanceFormsError);
			return;
		}

		// Step 2: Delete feedback forms associated with the sub-event
		const { error: deleteFeedbackFormsError } = await supabase
			.from("feedback_forms")
			.delete()
			.in("feedbackSubEventID", subEventIDs);

		if (deleteFeedbackFormsError) {
			console.error("Error deleting feedback forms:", deleteFeedbackFormsError);
			return;
		}

		const { data, error } = await supabase
			.from("sub_events")
			.delete()
			.eq("sub_eventsID", subEventID);

		if (error) {
			console.error("Error deleting sub-event:", error);
			return;
		}

		console.log("Sub-event deleted successfully:", data);

		setShowModalDeleteSubEventSuccess(true);

		// Refresh the page or update the state as needed
	};

	// For QR codes,
	const [showQRCodesAttendance, setShowQRCodesAttendance] = useState(false);
	const [showQRCodesFeedback, setShowQRCodesFeedback] = useState(false);
	const [selectedSubEventID, setSelectedSubEventID] = useState<string>("");

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

	// 
	// This is for feedback modal,
	//
	// This is for feedback modal,
	const [feedbackData, setFeedbackData] = useState<FeedbackDataType[]>([]);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [feedbackMainEventID, setFeedbackMainEventID] = useState("");
	const [subEventsForFeedback, setSubEventsForFeedback] = useState<subEvents[]>([]);

	// This function fetches ALL the forms,
	const openFeedbackModal = async (event_id: string) => {
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
			setFeedbackMainEventID(event_id);
			fetchFeedbackList(event_id)
			setSubEventsForFeedback(subEvents);

			// Extract the subEventID values from the fetched sub_events
			const subEventIDs = subEvents.map((subEvent) => subEvent.sub_eventsID);

			// Fetch all attendance_forms related to those sub_events
			const { data: feedbackForms, error: formsError } = await supabase
				.from("feedback_forms")
				.select()
				.in("fbSubEventID", subEventIDs);

			if (formsError) {
				console.error("Error fetching attendance forms:", formsError);
				return;
			}

			// Set the attendance data for the main event
			setFeedbackData(feedbackForms);
			fetchFeedbackList(event_id)
		} catch (error) {
			const typedError = error as Error;
			console.error("Error:", typedError.message);
		}

		setShowFeedbackModal(true);
	};

	// This function fetches feedback lists for particular sub-events,
	const fetchFeedbackList = async (event_id: string) => {
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
		const { data: feedbackForms, error: formsError } = await supabase
			.from("feedback_forms")
			.select()
			.in("fbSubEventID", subEventIDs);

		if (formsError) {
			console.error("Error fetching attendance forms:", formsError);
			return;
		} else {
			setFeedbackData(feedbackForms);
			setSelectedSubEvent("");
		}
	}

	return (
		<div className="p-5 bg-slate-100 space-y-4">
			<div className="mx-auto w-full">
				<div className="w-full flex ml-1">
					<div className="lg:flex bg-white border border-slate-200 rounded-lg hidden p-5 gap-4 w-full">
						<div className="w-1/3 text-left h-full">
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

						<div className="w-1/3 h-full text-left transition transform hover:scale-105">
							<a
								href="/upcomingEvents"
								className="bg-[#FFEDE5] h-full p-5 text-slate-700 rounded-lg flex hover:bg-[#ffdcce]">
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
						</div>

						<div className="w-1/3 text-left h-full transition transform hover:scale-105">
							<a
								href="/pastEvents"
								className="bg-[#EAE5FF] p-5 h-full text-slate-700 rounded-lg flex hover:bg-[#e0d8ff]">
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
						</div>
					</div>

					<div className="w-1/4 mt-4 flex justify-end items-start lg:mr-1 lg:ml-5 hidden lg:inline">
						<button
							className="flex items-center bg-slate-800 rounded-lg py-3 px-[50px] lg:px-[30px] font-medium hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm mt-4 -mr-[15px] hover:text-slate-50 justify-end text-right hover:transition duration-300 transform hover:scale-105 cursor-pointer"
							onClick={() => setShowModalCreateEvent(true)}>
							<IoIosAddCircleOutline className="text-3xl text-slate-100 -ml-1 mr-1" />
							<span className="text-slate-100 ml-1">Add Events</span>
						</button>
					</div>

					<CreateEvent_Modal isVisible={showModalCreateEvent}
						onClose={() => setShowModalCreateEvent(false)}>
						<form onSubmit={handleSubmitCreateEvent}>
							<div className="ml-[7px] lg:ml-4 mb-[70px]">
								<h3 className="text-[15px] lg:text-[16px] lg:text-lg font-semibold text-slate-700 mb-[6px] lg:mb-2 mt-[9px] ml-[2px]">
									Create Event
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[505px]" />

								<div>
									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 ml-[2px]">
										Event Name
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left"
										type="text"
										placeholder="What is your event called?"
										id="event_name"
										name="event_name"
										required
										onChange={e =>
											setMainEvent({
												...mainEvent,
												intFEventName: e.target.value,
											})
										}
									/>

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
										Description
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="text"
										placeholder="This event is about..."
										name="event_description"
										required
										onChange={e =>
											setMainEvent({
												...mainEvent,
												intFEventDescription: e.target.value,
											})
										}
									/>

									<div className="flex flex-col mt-[10px]">
										<div className="flex">
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] ml-[2px] mb-[2px]">
												Start Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] -ml-[4px] lg:ml-[10px] mb-[2px]">
												End Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
										</div>
										<div className="flex">
											<input
												className="pr-2 lg:pr-[8px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px] py-[5px]"
												type="date"
												name="event_start_date"
												required
												onChange={e =>
													setMainEvent({
														...mainEvent,
														intFEventStartDate: e.target.value,
													})
												}
											/>
											<input
												className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-2 lg:pl-3 -ml-[71.5px] pr-2 py-[5px]"
												type="date"
												name="event_end_date"
												required
												onChange={e =>
													setMainEvent({
														...mainEvent,
														intFEventEndDate: e.target.value,
													})
												}
											/>

										</div>
									</div>

								</div>

								{eventDetails.map((detail, index) => (
									<div key={index} className="mb-7" ref={index === eventDetails.length - 1 ? lastDetailRef : null}>

										{index === 0 && (
											<div className="mt-1"></div>
										)}
										{index > 0 && (
											<div className="-mt-6"></div>
										)}

										<div className="flex items-center">
											<p className="text-[15px] lg:text-[17px] font-semibold text-slate-700 lg:mb-2 mt-5">‣ Session {index + 1}</p>

											{eventDetails.length > 1 && (
												<button
													type="button"
													onClick={() => handleRemoveEventClick(index)}
													className="text-sm lg:text-base ml-[10px] mt-[20px] lg:ml-[10px] lg:mt-[12.25px]"
												>
													<BsFillTrash3Fill className="text-slate-700 hover:scale-105 hover:text-red-500" />
												</button>
											)}
										</div>

										{detail.event_names.map((event_name, eventNameIndex) => (
											<div key={eventNameIndex}>
												<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 ml-[2px]">
													Event Name
													<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
												</p>
												<input
													type="text"
													placeholder="This sub-event is called?"
													value={event_name}
													onChange={(e) => handleEventNameInputChange(index, eventNameIndex, e.target.value)}
													className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
													required
												/>
											</div>
										))}

										{detail.venues.map((venue, venueIndex) => (
											<div key={venueIndex}>
												<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
													Venue
													<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
												</p>
												<input
													type="text"
													placeholder="Venue i.e., G401"
													value={venue}
													onChange={(e) => handleEventVenueInputChange(index, venueIndex, e.target.value)}
													className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
													required
												/>
											</div>
										))}

										{detail.maximum_seats.map((maximum_seats, maximumSeatsIndex) => (
											<div key={maximumSeatsIndex}>
												<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
													Maximum Seats
													<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
												</p>
												<input
													type="number"
													placeholder="Maximum Seats"
													value={maximum_seats}
													onChange={(e) => handleEventMaximumSeatsInputChange(index, maximumSeatsIndex, e.target.value)}
													className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
													required
												/>
											</div>
										))}

										<div className="flex flex-col mt-[10px]">
											<div className="flex">
												<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[94px] ml-[1.5px] lg:ml-[2px] mb-[2px]">
													Start Date
													<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
														*
													</span>
												</p>
												<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[90px] mb-[2px] -ml-[4px] lg:ml-[1px]">
													End Date
													<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
														*
													</span>
												</p>
											</div>
											<div className="flex">
												{detail.start_dates.map((start_dates, startDatesIndex) => (
													<div key={startDatesIndex}>
														<input
															className="pr-2 lg:pr-[8px] py-[5px] pl-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px]"
															type="date"
															name="event_start_date"

															onChange={(e) => handleEventStartDatesInputChange(index, startDatesIndex, e.target.value)}
															required
														/>
													</div>
												))}

												{detail.end_dates.map((end_dates, endDatesIndex) => (
													<div key={endDatesIndex}>
														<input
															className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] py-[5px] pl-2 -ml-[71.5px] pr-2 lg:pr-2 lg:py-2"
															type="date"
															name="event_end_date"

															onChange={(e) => handleEventEndDatesInputChange(index, endDatesIndex, e.target.value)}
															required
														/>
													</div>
												))}
											</div>
										</div>

										<div className="flex flex-col mt-[10px]">
											<div className="flex">
												<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mb-[2px] ml-[1.5px] lg:ml-[2px]">
													Start Time
													<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
														*
													</span>
												</p>
												<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 ml-[37px] lg:ml-[62.5px] mb-[2px]">
													End Time
													<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
														*
													</span>
												</p>
											</div>
											<div className="flex">
												{detail.start_times.map((start_times, startTimesIndex) => (
													<div key={startTimesIndex}>
														<input
															className="py-[5px] pl-3 pr-2 lg:pr-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[91.5px] mb-[3px]"
															type="time"
															name="event_start_time"

															onChange={(e) => handleEventStartTimesInputChange(index, startTimesIndex, e.target.value)}
															required
														/>
													</div>
												))}

												{detail.end_times.map((end_times, endTimesIndex) => (
													<div key={endTimesIndex}>
														<input
															className="py-[5px] lg:pr-2 lg:py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-3 ml-[18px] lg:-ml-[71.5px] pr-2 "
															type="time"
															name="event_end_time"

															onChange={(e) => handleEventEndTimesInputChange(index, endTimesIndex, e.target.value)}
															required
														/>
													</div>
												))}

											</div>
										</div>

										{detail.organizers.map((organizers, organizersIndex) => (
											<div key={organizersIndex}>
												<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
													Organizer
													<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
												</p>
												<input
													type="text"
													placeholder="Who is the organizer?"
													value={organizers}
													onChange={(e) => handleEventOrganizersInputChange(index, organizersIndex, e.target.value)}
													className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
													required
												/>
											</div>
										))}
									</div>
								))}

								<div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px]">
									<button type="button" onClick={addEventDetails} className="rounded-lg px-[7px] py-[5px] lg:px-[10px] lg:py-[5px] border border-slate-800 hover:bg-slate-100 mr-4 text-[12px] lg:text-[15px] focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-medium">
										Add Sub-Event
									</button>

									<button
										className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
										onClick={() => {
											if (
												mainEvent.intFEventName &&
												mainEvent.intFEventDescription &&
												mainEvent.intFEventStartDate &&
												mainEvent.intFEventEndDate
											) {
												setShowModalCreateEventSuccess(true);
											}
										}}
									>
										Submit
									</button>
								</div>
							</div>
						</form>
					</CreateEvent_Modal>

					<Modal isVisible={showQRCodesAttendance} onClose={() => setShowQRCodesAttendance(false)}>
						<div className="ml-2 p-5 z-[999]">
							<h3 className="lg:text-2xl font-medium text-gray-600 mb-2 text-center">
								Attendance
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
						<div className="ml-2 p-5 z-[999]">
							<h3 className="lg:text-2xl font-medium text-gray-600 mb-2 text-center">
								Feedback
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

					<ViewEvent_Modal
						isVisible={showModalViewEvent}
						onClose={() => setShowModalViewEvent(false)}>
						<div className="py-[30px] lg:py-[100px] relative z-[50]">
							<img
								src={selectedEventImage}
								alt="Random"
								className="absolute h-[200px] lg:h-[258px] object-cover -mt-[38px] lg:-mt-[100px] rounded-t-lg -ml-[0.25px] lg:ml-2 transform hover:scale-110 lg:hover:scale-110 hover:rotate-1 scale-[1.12] lg:scale-[1.070] transition duration-300 shadow-sm"
							/>

							<div className="ml-[7px] lg:ml-[9px]">
								<h3 className="text-[16px] lg:text-[19px] font-semibold text-slate-800 mb-1 mt-[180px]">
									About This Event
								</h3>
								<p className="text-[12px] lg:text-[14px] text-mb-7 -mb-1 lg:mb-5 font-normal text-slate-500 mt-[10px]">
									{selectedEvent.intFEventDescription}
								</p>

								{/* <div className="flex items-center mt-4">
									<HiMiniCalendarDays className="text-[32px] lg:text-2xl mr-2 text-slate-800 -mt-[2px]" />
									<p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px] mt-[0.5px]">
										{formatDate(selectedEvent.intFEventStartDate)}
									</p>
									<span className="mx-2 text-slate-800 ml-[15px] lg:ml-[57px] mr-6">
										|
									</span>
									<FiClock className="text-[30px] lg:text-[21px] mr-2 text-slate-800 -mt-[1px]" />
									<p className="text-slate-600 text-[12px] lg:text-[13px]">
										{formatTime(selectedEvent.sub_eventsStartTime)}
									</p>
									<span className="mx-2 text-slate-800 -mt-[2px]">
										-
									</span>
									<p className="text-slate-600 text-[12px] lg:text-[13px]">
										{formatTime(selectedEvent.sub_eventsEndTime)}
									</p>
								</div>
								<div className="flex items-center mt-[10px] lg:mt-[14px]">
									<FaLocationDot className="text-xl lg:text-2xl -ml-[0.5px] lg:ml-0 mr-2 text-slate-800" />
									<p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px]">
										{selectedEvent.sub_eventsVenue}
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
										{selectedEvent.sub_eventsMaxSeats} Seats
									</p>
								</div> */}

								{subEvents
									.filter(subEvent => subEvent.sub_eventsMainID === selectedEvent.intFID)
									.map((subEvent, index) => (
										<div key={index}>

											{index === 0 && (
												<div className="-mt-4"></div>
											)}

											<div className="flex items-center gap-[6px]">
												<p className="text-[15px] lg:text-[17px] font-semibold text-slate-700 lg:mb-2 mt-[22px]">‣ Session {index + 1}</p>
												<button
													type="button"
													onClick={(e) => openAddSubEventModal(e, selectedEvent.intFID)}
													className="text-base lg:text-[21px] ml-[10px] mt-[20px] lg:ml-[12px] lg:mt-[14.2px]"
												>
													<IoMdAddCircleOutline className="text-slate-700 hover:scale-105" />
												</button>
												<button
													type="button"
													onClick={() => handleDeleteSubEvent(subEvent.sub_eventsID)}
													className="text-sm lg:text-base ml-[10px] mt-[20px] lg:ml-[3px] lg:mt-[12.5px]"
												>
													<BsFillTrash3Fill className="text-slate-700 hover:scale-105 hover:text-red-500" />
												</button>
												<button
													type="button"
													onClick={(e) => handleEditSubEventButton(e, subEvent.sub_eventsID)}
													className="text-base lg:text-lg ml-[10px] mt-[20px] lg:ml-[3px] lg:mt-[12.6px]"
												>
													<HiPencilAlt className="text-slate-700 hover:scale-105" />
												</button>
												<button
													type="button"
													className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3"
													onClick={() => {
														setSelectedSubEventID(subEvent.sub_eventsID);
														setShowQRCodesAttendance(true);
													}}
												>
													<span className="ml-2 mt-[1.3px] text-slate-800 flex items-center mr-2">
														<QRCodeIcon />
														<span className="ml-1">
															Attendance
														</span>
													</span>
												</button>
												<button
													type="button"
													className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3"
													onClick={() => {
														setSelectedSubEventID(subEvent.sub_eventsID);
														setShowQRCodesFeedback(true);
													}}
												>
													<span className="ml-2 mt-[1.3px] text-slate-800 flex items-center mr-2">
														<QRCodeIcon />
														<span className="ml-1">
															Feedback
														</span>
													</span>
												</button>
											</div>

											<div className="flex items-center mt-1">
												<HiMiniCalendarDays className="text-[32px] lg:text-2xl mr-2 text-slate-800 -mt-[2px]" />
												<p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px] mt-[0.5px]">
													{formatDate(subEvent.sub_eventsStartDate)}
												</p>
												<span className="mx-2 text-slate-800 ml-[15px] lg:ml-[57px] mr-6">
													|
												</span>
												<FiClock className="text-[30px] lg:text-[21px] mr-2 text-slate-800 -mt-[1px]" />
												<p className="text-slate-600 text-[12px] lg:text-[13px]">
													{formatTime(subEvent.sub_eventsStartTime)}
												</p>
												<span className="mx-2 text-slate-800 -mt-[2px]">-</span>
												<p className="text-slate-600 text-[12px] lg:text-[13px]">
													{formatTime(subEvent.sub_eventsEndTime)}
												</p>
											</div>
											<div className="flex items-center mt-[10px] lg:mt-[14px]">
												<FaLocationDot className="text-xl lg:text-2xl -ml-[0.5px] lg:ml-0 mr-2 text-slate-800" />
												<p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px]">
													{subEvent.sub_eventsVenue}
												</p>
											</div>
											<div className="flex items-center mt-[11px] lg:mt-[14px]">
												<MdPeople className="text-2xl mr-2 text-slate-800 -ml-[1px] lg:ml-[1px]" />
												<p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] -ml-[2px] lg:ml-0">
													Attendees
												</p>
											</div>
											<div className="flex items-center mt-[15px] lg:mb-0 mb-[3px]">
												<MdAirlineSeatReclineNormal className="text-2xl mr-2 text-slate-800 lg:ml-[2px]" />
												<p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] lg:-ml-[1px]">
													{subEvent.sub_eventsMaxSeats} Seats
												</p>
											</div>
										</div>

									))}

								<div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
									<div className="flex justify-center">
										<button
											className="rounded-lg px-[7px] py-[5px] lg:px-[10px] lg:py-[5px] border border-slate-800 hover:bg-slate-100 mr-4 text-[12px] lg:text-[15px] focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-medium"
											onClick={() =>
												setShowModalConfirmation(true)
											}>
											Cancel Event
										</button>

										<button
											className="rounded-lg px-[20px] py-[6px] lg:px-[25px] lg:py-[9px] bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
											onClick={handleEditEventButton}
										>
											Edit Event
										</button>
									</div>
								</div>
							</div>
						</div>
					</ViewEvent_Modal>

					<ViewEventFeedback
						isVisible={showFeedbackModal}
						onClose={() => setShowFeedbackModal(false)}>
						<div className="flex">
							<div className="h-[700px] w-full mr-3">
								<div className="flex items-left justify-start">
									<div className="flex items-center justify-center text-text text-[20px] text-center">
										<PencilNoteIcon />{" "}
										<span className="ml-2.5">Feedback Summary</span>
									</div>
								</div>
								<div className="text-left text-black text-[13px] pl-[34px]">
									Total Feedback Received: {feedbackData.length}
								</div>
								{/* This is to loop through the attendance data. */}
								{feedbackData && feedbackData.length > 0 ? (
									<div className="ml-9">
										{/* <label htmlFor="itemsPerPageSelect">Show entries:</label>
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
										</select> */}
										<div className="h-[600px] overflow-y-auto">
											<FeedbackList feedbackData={feedbackData} />
										</div>
									</div>
								) : (
									<div className="text-center text-gray-600">
										No feedback received yet.
									</div>

								)}
							</div>
							{/* {attendanceData && attendanceData.length > 0 ? (
								<div className="w-1/2 flex flex-col items-center justify-center">
									<div className="text-center font-bold">Number of Attendees Each Faculty/ Unit</div>
									<div className="w-[500px] h-[500px] flex items-center justify-center mt-5">
										<canvas id="attendanceFacultyPieChart" ref={chartContainer} />
									</div>
								</div>
							) : null} */}
						</div>
					</ViewEventFeedback>

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
											className={`font-bold flex items-center bg-slate-200 rounded-lg text-[15px] hover:bg-red-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm mb-3.5 p-2 ml-3 ${selectedSubEvent === subEvent.sub_eventsID ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
												}`}
										>
											<button
												onClick={() => {
													setIsAllButtonActive(false);
													handleSubEventClick(subEvent);
												}}
											>
												{subEvent.sub_eventsName}
											</button>
										</div>
									))}
								</div>
								<button
									onClick={() => {
										// Handle the refresh button click here
										fetchAttendanceList(attendanceMainEventID);
										setIsAllButtonActive(true);
									}}
									className="font-bold flex items-center rounded-lg text-[15px] hover:bg-red-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 bg-slate-200 text-slate-800"
								>
									Refresh
								</button>
								{/* This is to loop through the attendance data. */}
								{attendanceData && attendanceData.length > 0 ? (
									<div className="">
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
										<div className="h-[300px] lg:h-[500px] overflow-y-auto">
											<AttendanceTable attendanceData={attendanceData} itemsPerPage={itemsPerPage} />
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

					<AddSubEvent_Modal
						isVisible={showModalAddEvent}
						onClose={() => setShowModalAddEvent(false)}>

						<form>
							<div className="ml-[7px] lg:ml-4 mb-[70px]">
								<h3 className="text-[15px] lg:text-[16px] lg:text-lg font-semibold text-slate-700 mb-[6px] lg:mb-2 mt-[9px] ml-[2px]">
									Add New SubEvent
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[477px]" />

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 ml-[2px]">
									Event Name
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Event name"
									required
									onChange={e =>
										setSubEventz({
											...subEventz,
											sub_eventsName: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
									Venue
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Venue"
									required
									onChange={e =>
										setSubEventz({
											...subEventz,
											sub_eventsVenue: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
									Maximum Seats
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="number"
									placeholder="Maximum seats"
									required
									onChange={e =>
										setSubEventz({
											...subEventz,
											sub_eventsMaxSeats: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>


								<div className="flex flex-col mt-[10px]">
									<div className="flex">
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[94px] ml-[1.5px] lg:ml-[2px] mb-[2px]">
											Start Date
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[90px] mb-[2px] -ml-[4px] lg:ml-[1px]">
											End Date
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
									</div>
									<div className="flex">

										<input
											className="pr-2 lg:pr-[8px] py-[5px] pl-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px]"
											type="date"
											name="event_start_date"
											required
											onChange={e =>
												setSubEventz({
													...subEventz,
													sub_eventsStartDate: e.target.value,
												})
											}
										/>

										<input
											className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] py-[5px] pl-2 -ml-[71.5px] pr-2 lg:pr-2 lg:py-2"
											type="date"
											name="event_end_date"
											required
											onChange={e =>
												setSubEventz({
													...subEventz,
													sub_eventsEndDate: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<div className="flex flex-col mt-[10px]">
									<div className="flex">
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mb-[2px] ml-[1.5px] lg:ml-[2px]">
											Start Time
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 ml-[37px] lg:ml-[38.5px] mb-[2px]">
											End Time
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
									</div>
									<div className="flex">
										<input
											className="py-[5px] pl-3 pr-2 lg:pr-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[91.5px] mb-[3px]"
											type="time"
											name="event_start_time"
											required
											onChange={e =>
												setSubEventz({
													...subEventz,
													sub_eventsStartTime: e.target.value,
												})
											}
										/>

										<input
											className="py-[5px] lg:pr-2 lg:py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-3 ml-[18px] lg:-ml-[71.5px] pr-2 "
											type="time"
											name="event_end_time"
											required
											onChange={e =>
												setSubEventz({
													...subEventz,
													sub_eventsEndTime: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
									Organizer
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Organizer"
									required
									onChange={e =>
										setSubEventz({
											...subEventz,
											sub_eventsOrganizer: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>
							</div>

							<div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px]">

								<button onClick={handleAddSubEvent}
									className="rounded-lg px-[32px] py-[8px] lg:px-[18px] lg:py-[10px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
								>
									Save Changes
								</button>
							</div>
						</form>
					</AddSubEvent_Modal>

					<EditSubEvent_Modal
						isVisible={showModalEditSubEvent}
						onClose={() => setShowModalEditSubEvent(false)}>

						<form>
							<div className="ml-[7px] lg:ml-4 mb-[70px]">
								<h3 className="text-[15px] lg:text-[16px] lg:text-lg font-semibold text-slate-700 mb-[6px] lg:mb-2 mt-[9px] ml-[2px]">
									Edit SubEvent
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[477px]" />

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 ml-[2px]">
									Event Name
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Event name"
									value={editSubEventInfo.sub_eventsName}
									required
									onChange={e =>
										setEditSubEventInfo({
											...editSubEventInfo,
											sub_eventsName: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
									Venue
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Venue"
									value={editSubEventInfo.sub_eventsVenue}
									required
									onChange={e =>
										setEditSubEventInfo({
											...editSubEventInfo,
											sub_eventsVenue: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
									Maximum Seats
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="number"
									placeholder="Maximum seats"
									value={editSubEventInfo.sub_eventsMaxSeats}
									required
									onChange={e =>
										setEditSubEventInfo({
											...editSubEventInfo,
											sub_eventsMaxSeats: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>


								<div className="flex flex-col mt-[10px]">
									<div className="flex">
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[94px] ml-[1.5px] lg:ml-[2px] mb-[2px]">
											Start Date
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[90px] mb-[2px] -ml-[4px] lg:ml-[1px]">
											End Date
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
									</div>
									<div className="flex">

										<input
											className="pr-2 lg:pr-[8px] py-[5px] pl-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px]"
											type="date"
											name="event_start_date"
											value={editSubEventInfo.sub_eventsStartDate}
											required
											onChange={e =>
												setEditSubEventInfo({
													...editSubEventInfo,
													sub_eventsStartDate: e.target.value,
												})
											}
										/>

										<input
											className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] py-[5px] pl-2 -ml-[71.5px] pr-2 lg:pr-2 lg:py-2"
											type="date"
											name="event_end_date"
											value={editSubEventInfo.sub_eventsEndDate}
											required
											onChange={e =>
												setEditSubEventInfo({
													...editSubEventInfo,
													sub_eventsEndDate: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<div className="flex flex-col mt-[10px]">
									<div className="flex">
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mb-[2px] ml-[1.5px] lg:ml-[2px]">
											Start Time
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 ml-[37px] lg:ml-[38.5px] mb-[2px]">
											End Time
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
									</div>
									<div className="flex">
										<input
											className="py-[5px] pl-3 pr-2 lg:pr-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[91.5px] mb-[3px]"
											type="time"
											name="event_start_time"
											value={editSubEventInfo.sub_eventsStartTime}
											required
											onChange={e =>
												setEditSubEventInfo({
													...editSubEventInfo,
													sub_eventsStartTime: e.target.value,
												})
											}
										/>

										<input
											className="py-[5px] lg:pr-2 lg:py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-3 ml-[18px] lg:-ml-[71.5px] pr-2 "
											type="time"
											name="event_end_time"
											value={editSubEventInfo.sub_eventsEndTime}
											required
											onChange={e =>
												setEditSubEventInfo({
													...editSubEventInfo,
													sub_eventsEndTime: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
									Organizer
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Organizer"
									value={editSubEventInfo.sub_eventsOrganizer}
									required
									onChange={e =>
										setEditSubEventInfo({
											...editSubEventInfo,
											sub_eventsOrganizer: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>
							</div>

							<div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px]">

								<button
									className="rounded-lg px-[32px] py-[8px] lg:px-[18px] lg:py-[10px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
								>
									Save Changes
								</button>
							</div>
						</form>
					</EditSubEvent_Modal>

					<EditEvent_Modal
						isVisible={showModalEditEvent}
						onClose={() => setShowModalEditEvent(false)}>
						<form onSubmit={handleEditEventSubmit}>
							<div className="ml-[7px] lg:ml-4 mb-[70px]">
								<h3 className="text-[15px] lg:text-[16px] lg:text-lg font-semibold text-slate-700 mb-[6px] lg:mb-2 mt-[9px] ml-[2px]">
									Edit Event
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[505px]" />

								<div>
									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 ml-[2px]">
										Event Name
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left"
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

									<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
										Description
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
										type="text"
										placeholder="Description"
										name="event_description"
										value={editEventInfo.intFEventDescription}
										required
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFEventDescription: e.target.value,
											})
										}
									/>

									<div className="flex flex-col mt-[10px]">
										<div className="flex">
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] ml-[2px] mb-[2px]">
												Start Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] -ml-[4px] lg:ml-[10px] mb-[2px]">
												End Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
										</div>
										<div className="flex">
											<input
												className="pr-2 lg:pr-[8px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px] py-[5px]"
												type="date"
												name="event_start_date"
												value={editEventInfo.intFEventStartDate}
												required
												onChange={e =>
													setEditEventInfo({
														...editEventInfo,
														intFEventStartDate: e.target.value,
													})
												}

											/>
											<input
												className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-2 lg:pl-3 -ml-[71.5px] pr-2 py-[5px]"
												type="date"
												name="event_end_date"
												value={editEventInfo.intFEventEndDate}
												required
												onChange={e =>
													setEditEventInfo({
														...editEventInfo,
														intFEventEndDate: e.target.value,
													})
												}
											/>

										</div>
									</div>

								</div>

								<div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px]">

									<button
										className="rounded-lg px-[32px] py-[8px] lg:px-[18px] lg:py-[10px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
									>
										Save Changes
									</button>
								</div>
							</div>
						</form>
					</EditEvent_Modal>

					<EditSubEvent_Modal
						isVisible={showModalEditSubEvent}
						onClose={() => setShowModalEditSubEvent(false)}>

						<form onSubmit={handleEditSubEventSubmit}>
							<div className="ml-[7px] lg:ml-4 mb-[70px]">
								<h3 className="text-[15px] lg:text-[16px] lg:text-lg font-semibold text-slate-700 mb-[6px] lg:mb-2 mt-[9px] ml-[2px]">
									Edit Sub-Event
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[477px]" />

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 ml-[2px]">
									Event Name
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Event name"
									value={editSubEventInfo.sub_eventsName}
									required
									onChange={e =>
										setEditSubEventInfo({
											...editSubEventInfo,
											sub_eventsName: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
									Venue
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Venue"
									value={editSubEventInfo.sub_eventsVenue}
									required
									onChange={e =>
										setEditSubEventInfo({
											...editSubEventInfo,
											sub_eventsVenue: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
									Maximum Seats
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="number"
									placeholder="Maximum seats"
									value={editSubEventInfo.sub_eventsMaxSeats}
									required
									onChange={e =>
										setEditSubEventInfo({
											...editSubEventInfo,
											sub_eventsMaxSeats: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>


								<div className="flex flex-col mt-[10px]">
									<div className="flex">
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[94px] ml-[1.5px] lg:ml-[2px] mb-[2px]">
											Start Date
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[90px] mb-[2px] -ml-[4px] lg:ml-[1px]">
											End Date
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
									</div>
									<div className="flex">

										<input
											className="pr-2 lg:pr-[8px] py-[5px] pl-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px]"
											type="date"
											name="event_start_date"
											value={editSubEventInfo.sub_eventsStartDate}
											required
											onChange={e =>
												setEditSubEventInfo({
													...editSubEventInfo,
													sub_eventsStartDate: e.target.value,
												})
											}
										/>

										<input
											className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] py-[5px] pl-2 -ml-[71.5px] pr-2 lg:pr-2 lg:py-2"
											type="date"
											name="event_end_date"
											value={editSubEventInfo.sub_eventsEndDate}
											required
											onChange={e =>
												setEditSubEventInfo({
													...editSubEventInfo,
													sub_eventsEndDate: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<div className="flex flex-col mt-[10px]">
									<div className="flex">
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mb-[2px] ml-[1.5px] lg:ml-[2px]">
											Start Time
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
										<p className="text-[12px] lg:text-[14px] text-mb-7 font-normal text-slate-500 ml-[37px] lg:ml-[38.5px] mb-[2px]">
											End Time
											<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
												*
											</span>
										</p>
									</div>
									<div className="flex">
										<input
											className="py-[5px] pl-3 pr-2 lg:pr-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[91.5px] mb-[3px]"
											type="time"
											name="event_start_time"
											value={editSubEventInfo.sub_eventsStartTime}
											required
											onChange={e =>
												setEditSubEventInfo({
													...editSubEventInfo,
													sub_eventsStartTime: e.target.value,
												})
											}
										/>

										<input
											className="py-[5px] lg:pr-2 lg:py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-3 ml-[18px] lg:-ml-[71.5px] pr-2 "
											type="time"
											name="event_end_time"
											value={editSubEventInfo.sub_eventsEndTime}
											required
											onChange={e =>
												setEditSubEventInfo({
													...editSubEventInfo,
													sub_eventsEndTime: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<p className="text-[12px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px]">
									Organizer
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">*</span>
								</p>
								<input
									type="text"
									placeholder="Organizer"
									value={editSubEventInfo.sub_eventsOrganizer}
									required
									onChange={e =>
										setEditSubEventInfo({
											...editSubEventInfo,
											sub_eventsOrganizer: e.target.value,
										})
									}
									className="pr-[106px] lg:pr-[290px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
								/>
							</div>

							<div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px]">

								<button
									className="rounded-lg px-[32px] py-[8px] lg:px-[18px] lg:py-[10px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
								>
									Save Changes
								</button>
							</div>
						</form>
					</EditSubEvent_Modal>

					<Success_CreateEventModal
						isVisible={showModalCreateEventSuccess}
						onClose={() => setShowModalCreateEventSuccess(false)}>
						<div className="p-4">
							<Image
								src="/images/tick_mark.png"
								alt="tick_mark"
								width={200}
								height={250}
								className="-mt-[39px] lg:-mt-[45px] ml-[121.5px]"
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
					</Success_CreateEventModal>

					<Success_AddSubEventModal
						isVisible={showModalAddEventSuccess}
						onClose={() => setShowModalAddEventSuccess(false)}>
						<div className="p-4">
							<Image
								src="/images/tick_mark.png"
								alt="tick_mark"
								width={200}
								height={250}
								className="-mt-[39px] lg:-mt-[45px] ml-[121.5px]"
							/>
							<h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
								Success!
							</h3>
							<p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
								SubEvent has been successfully created!
							</p>
							<div className="text-center ml-4">
								<button
									className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5 focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
									onClick={handleOK}>
									OK
								</button>
							</div>
						</div>
					</Success_AddSubEventModal>

					<Success_EditEventModal
						isVisible={showModalEditEventSuccess}
						onClose={() => setShowModalEditEventSuccess(false)}>
						<div className="p-4">
							<Image
								src="/images/tick_mark.png"
								alt="tick_mark"
								width={200}
								height={250}
								className="-mt-[39px] lg:-mt-[45px] ml-[121.5px]"
							/>
							<h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
								Success!
							</h3>
							<p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
								Event has been successfully edited!
							</p>
							<div className="text-center ml-4">
								<button
									className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5 focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
									onClick={handleOK}>
									OK
								</button>
							</div>
						</div>
					</Success_EditEventModal>

					<Success_EditSubEventModal
						isVisible={showModalEditSubEventSuccess}
						onClose={() => setShowModalEditSubEventSuccess(false)}>
						<div className="p-4">
							<Image
								src="/images/tick_mark.png"
								alt="tick_mark"
								width={200}
								height={250}
								className="-mt-[39px] lg:-mt-[45px] ml-[121.5px]"
							/>
							<h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
								Success!
							</h3>
							<p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
								SubEvent has been successfully edited!
							</p>
							<div className="text-center ml-4">
								<button
									className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5 focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
									onClick={handleOK}>
									OK
								</button>
							</div>
						</div>
					</Success_EditSubEventModal>

					<Success_DeleteSubEventModal
						isVisible={showModalDeleteSubEventSuccess}
						onClose={() => setShowModalDeleteSubEventSuccess(false)}>
						<div className="p-4">
							<Image
								src="/images/tick_mark.png"
								alt="tick_mark"
								width={200}
								height={250}
								className="-mt-[39px] lg:-mt-[45px] ml-[121.5px]"
							/>
							<h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
								Success!
							</h3>
							<p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
								Sub Event has been successfully deleted!
							</p>
							<div className="text-center ml-4">
								<button
									className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5 focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
									onClick={handleOK}>
									OK
								</button>
							</div>
						</div>
					</Success_DeleteSubEventModal>

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

			{
				viewMode === 1 ? (
					<div className="w-full bg-slate-100 grid lg:grid-cols-[1fr_32%] pb-28 gap-4">
						<div className="hidden lg:grid grid-auto-fit-lg gap-4 ml-1">

							{latestEvent[0] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[495px] w-full relative flex flex-col transition transform hover:scale-105"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[0].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?party",
												latestEvent[0]?.intFID,
												latestEvent[0]?.intFEventName,
												latestEvent[0]?.intFEventDescription,
												latestEvent[0]?.intFEventStartDate,
												latestEvent[0]?.intFEventEndDate,
												filteredSubEvent.sub_eventsID,
												filteredSubEvent.sub_eventsMainID,
												filteredSubEvent.sub_eventsName,
												filteredSubEvent.sub_eventsVenue,
												filteredSubEvent.sub_eventsStartDate,
												filteredSubEvent.sub_eventsEndDate,
												filteredSubEvent.sub_eventsStartTime,
												filteredSubEvent.sub_eventsEndTime,
												filteredSubEvent.sub_eventsMaxSeats,
												filteredSubEvent.sub_eventsOrganizer
											);
										} else {
											openModal(
												"https://source.unsplash.com/600x300?party",
												latestEvent[0]?.intFID,
												latestEvent[0]?.intFEventName,
												latestEvent[0]?.intFEventDescription,
												latestEvent[0]?.intFEventStartDate,
												latestEvent[0]?.intFEventEndDate,
												"default_sub_eventsID",
												"default_sub_eventsMainID",
												"default_sub_eventsName",
												"default_sub_eventsVenue",
												"default_sub_eventsStartDate",
												"default_sub_eventsEndDate",
												"default_sub_eventsStartTime",
												"default_sub_eventsEndTime",
												"default_sub_eventsMaxSeats",
												"default_sub_eventsOrganizer"
											);
										}
									}}>
									<div className="w-full h-[300px] mb-4 relative">
										<div className="absolute -inset-6">
											<img
												src="https://source.unsplash.com/600x300?party"
												alt="Random"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									{latestEvent[0] && (
										<div className="mt-6">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-2xl font-semibold mb-2 text-slate-800">
													{latestEvent[0].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
															<ThreeDotIcon />
														</div>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem onClick={e => {
															e.stopPropagation();
															openAttendanceModal(
																latestEvent[0].intFID,
															);
															fetchAttendanceList(latestEvent[0].intFID);
														}}>Attendance List</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={e => {
															e.stopPropagation(); // 
															openFeedbackModal(
																latestEvent[0].intFID,
															);
															fetchFeedbackList(latestEvent[0].intFID);
														}}>Feedback Forms</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<p className="text-gray-500 mb-4">
												{latestEvent[0].intFEventDescription}
											</p>
											<div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
												<p className="text-slate-600 text-sm">
													{formatDate(latestEvent[0].intFEventStartDate)}
												</p>
											</div>

											{subEvents.length > 0 && (
												subEvents.length > 0 &&
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[0].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FiClock className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{formatTime(subEvent.sub_eventsStartTime)}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[0].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[0].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index}>
															<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
																<div
																	className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300"
																		}`}
																	style={{
																		width: `${Math.min(percentage, 100)}%`,
																	}}
																></div>
															</div>
															<div className="text-xs text-gray-600 mt-2 flex justify-between">
																<span className="ml-[2px]">Current Attendees: {currentAttendees}</span>
																<span className="mr-[2px]">Max Attendees: {maxAttendees}</span>
															</div>
														</div>
													))
											)}

											<div className="flex justify-between items-end mt-5">
												<div
													className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]"
													onClick={e => {
														e.stopPropagation(); // This line prevents the event from propagating
														openAttendanceModal(
															latestEvent[0].intFID,
														);
														fetchAttendanceList(latestEvent[0].intFID);
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

							{latestEvent[1] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[495px] w-full relative flex flex-col transition transform hover:scale-105"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[1].intFID);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?birthday",
												latestEvent[1]?.intFID,
												latestEvent[1]?.intFEventName,
												latestEvent[1]?.intFEventDescription,
												latestEvent[1]?.intFEventStartDate,
												latestEvent[1]?.intFEventEndDate,
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
											);
										} else {
											openModal(
												"https://source.unsplash.com/600x300?birthday",
												latestEvent[0]?.intFID,
												latestEvent[0]?.intFEventName,
												latestEvent[0]?.intFEventDescription,
												latestEvent[0]?.intFEventStartDate,
												latestEvent[0]?.intFEventEndDate,
												"default_sub_eventsID",
												"default_sub_eventsMainID",
												"default_sub_eventsName",
												"default_sub_eventsVenue",
												"default_sub_eventsStartDate",
												"default_sub_eventsEndDate",
												"default_sub_eventsStartTime",
												"default_sub_eventsEndTime",
												"default_sub_eventsMaxSeats",
												"default_sub_eventsOrganizer"
											);
										}
									}}>
									<div className="w-full h-[300px] mb-4 relative">
										<div className="absolute -inset-6">
											<img
												src="https://source.unsplash.com/600x300?birthday"
												alt="Random"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									{latestEvent[1] && (
										<div className="mt-6">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-2xl font-semibold mb-2 text-slate-800">
													{latestEvent[1].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
															<ThreeDotIcon />
														</div>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem onClick={e => {
															e.stopPropagation();
															openAttendanceModal(
																latestEvent[1].intFID,
															);
															fetchAttendanceList(latestEvent[1].intFID);
														}}>Attendance List</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={e => {
															e.stopPropagation(); // 
															openFeedbackModal(
																latestEvent[1].intFID,
															);
															fetchFeedbackList(latestEvent[1].intFID);
														}}>Feedback Forms</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<p className="text-gray-500 mb-4">
												{latestEvent[1].intFEventDescription}
											</p>
											<div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
												<p className="text-slate-600 text-sm">
													{formatDate(latestEvent[1].intFEventStartDate)}
												</p>
											</div>

											{subEvents.length > 0 && (
												subEvents.length > 0 &&
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[1].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FiClock className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{formatTime(subEvent.sub_eventsStartTime)}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[1].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[1].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index}>
															<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
																<div
																	className="h-full bg-orange-300 rounded-full"
																	style={{
																		width: `${(20 / 60) * 100}%`,
																	}}
																></div>
															</div>
															<div className="text-xs text-gray-600 mt-2 flex justify-between">
																<span className="ml-[2px]">Current Attendees: </span>
																<span className="mr-[2px]">
																	Max Attendees: {subEvent.sub_eventsMaxSeats}
																</span>
															</div>
														</div>
													))
											)}

											<div className="flex justify-between items-end mt-5">
												<div
													className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]"
													onClick={e => {
														e.stopPropagation(); // This line prevents the event from propagating
														openAttendanceModal(
															latestEvent[1].intFID,
														);
														fetchAttendanceList(latestEvent[1].intFID);
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

							{latestEvent[2] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[495px] w-full relative flex flex-col transition transform hover:scale-105"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[2].intFID);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?new+year",
												latestEvent[2]?.intFID,
												latestEvent[2]?.intFEventName,
												latestEvent[2]?.intFEventDescription,
												latestEvent[2]?.intFEventStartDate,
												latestEvent[2]?.intFEventEndDate,
												filteredSubEvent.sub_eventsID,
												filteredSubEvent.sub_eventsMainID,
												filteredSubEvent.sub_eventsName,
												filteredSubEvent.sub_eventsVenue,
												filteredSubEvent.sub_eventsStartDate,
												filteredSubEvent.sub_eventsEndDate,
												filteredSubEvent.sub_eventsStartTime,
												filteredSubEvent.sub_eventsEndTime,
												filteredSubEvent.sub_eventsMaxSeats,
												filteredSubEvent.sub_eventsOrganizer
											);
										} else {
											openModal(
												"https://source.unsplash.com/600x300?new+year",
												latestEvent[2]?.intFID,
												latestEvent[2]?.intFEventName,
												latestEvent[2]?.intFEventDescription,
												latestEvent[2]?.intFEventStartDate,
												latestEvent[2]?.intFEventEndDate,
												"default_sub_eventsID",
												"default_sub_eventsMainID",
												"default_sub_eventsName",
												"default_sub_eventsVenue",
												"default_sub_eventsStartDate",
												"default_sub_eventsEndDate",
												"default_sub_eventsStartTime",
												"default_sub_eventsEndTime",
												"default_sub_eventsMaxSeats",
												"default_sub_eventsOrganizer"
											);
										}
									}}>
									<div className="w-full h-[300px] mb-4 relative">
										<div className="absolute -inset-6">
											<img
												src="https://source.unsplash.com/600x300?new+year"
												alt="Random"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									{latestEvent[2] && (
										<div className="mt-6">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-2xl font-semibold mb-2 text-slate-800">
													{latestEvent[2].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
															<ThreeDotIcon />
														</div>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem onClick={e => {
															e.stopPropagation();
															openAttendanceModal(
																latestEvent[2].intFID,
															);
															fetchAttendanceList(latestEvent[2].intFID);
														}}>Attendance List</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={e => {
															e.stopPropagation(); // 
															openFeedbackModal(
																latestEvent[2].intFID,
															);
															fetchFeedbackList(latestEvent[2].intFID);
														}}>Feedback Forms</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<p className="text-gray-500 mb-4">
												{latestEvent[2].intFEventDescription}
											</p>
											<div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
												<p className="text-slate-600 text-sm">
													{formatDate(latestEvent[2].intFEventStartDate)}
												</p>
											</div>

											{subEvents.length > 0 && (
												subEvents.length > 0 &&
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[2].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FiClock className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{formatTime(subEvent.sub_eventsStartTime)}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[2].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[2].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index}>
															<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
																<div
																	className="h-full bg-orange-300 rounded-full"
																	style={{
																		width: `${(20 / 60) * 100}%`,
																	}}
																></div>
															</div>
															<div className="text-xs text-gray-600 mt-2 flex justify-between">
																<span className="ml-[2px]">Current Attendees: </span>
																<span className="mr-[2px]">
																	Max Attendees: {subEvent.sub_eventsMaxSeats}
																</span>
															</div>
														</div>
													))
											)}

											<div className="flex justify-between items-end mt-5">
												<div
													className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]"
													onClick={e => {
														e.stopPropagation(); // This line prevents the event from propagating
														openAttendanceModal(
															latestEvent[2].intFID,
														);
														fetchAttendanceList(latestEvent[2].intFID);
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

							{latestEvent[3] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[495px] w-full relative flex flex-col transition transform hover:scale-105"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[3].intFID);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?events",
												latestEvent[3]?.intFID,
												latestEvent[3]?.intFEventName,
												latestEvent[3]?.intFEventDescription,
												latestEvent[3]?.intFEventStartDate,
												latestEvent[3]?.intFEventEndDate,
												filteredSubEvent.sub_eventsID,
												filteredSubEvent.sub_eventsMainID,
												filteredSubEvent.sub_eventsName,
												filteredSubEvent.sub_eventsVenue,
												filteredSubEvent.sub_eventsStartDate,
												filteredSubEvent.sub_eventsEndDate,
												filteredSubEvent.sub_eventsStartTime,
												filteredSubEvent.sub_eventsEndTime,
												filteredSubEvent.sub_eventsMaxSeats,
												filteredSubEvent.sub_eventsOrganizer
											);
										} else {
											openModal(
												"https://source.unsplash.com/600x300?events",
												latestEvent[3]?.intFID,
												latestEvent[3]?.intFEventName,
												latestEvent[3]?.intFEventDescription,
												latestEvent[3]?.intFEventStartDate,
												latestEvent[3]?.intFEventEndDate,
												"default_sub_eventsID",
												"default_sub_eventsMainID",
												"default_sub_eventsName",
												"default_sub_eventsVenue",
												"default_sub_eventsStartDate",
												"default_sub_eventsEndDate",
												"default_sub_eventsStartTime",
												"default_sub_eventsEndTime",
												"default_sub_eventsMaxSeats",
												"default_sub_eventsOrganizer"
											);
										}
									}}>
									<div className="w-full h-[300px] mb-4 relative">
										<div className="absolute -inset-6">
											<img
												src="https://source.unsplash.com/600x300?events"
												alt="Random"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									{latestEvent[3] && (
										<div className="mt-6">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-2xl font-semibold mb-2 text-slate-800">
													{latestEvent[3].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
															<ThreeDotIcon />
														</div>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem onClick={e => {
															e.stopPropagation();
															openAttendanceModal(
																latestEvent[3].intFID,
															);
															fetchAttendanceList(latestEvent[3].intFID);
														}}>Attendance List</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={e => {
															e.stopPropagation(); // 
															openFeedbackModal(
																latestEvent[3].intFID,
															);
															fetchFeedbackList(latestEvent[3].intFID);
														}}>Feedback Forms</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<p className="text-gray-500 mb-4">
												{latestEvent[3].intFEventDescription}
											</p>
											<div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
												<p className="text-slate-600 text-sm">
													{formatDate(latestEvent[3].intFEventStartDate)}
												</p>
											</div>

											{subEvents.length > 0 && (
												subEvents.length > 0 &&
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[3].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FiClock className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{formatTime(subEvent.sub_eventsStartTime)}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[3].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[3].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index}>
															<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
																<div
																	className="h-full bg-orange-300 rounded-full"
																	style={{
																		width: `${(20 / 60) * 100}%`,
																	}}
																></div>
															</div>
															<div className="text-xs text-gray-600 mt-2 flex justify-between">
																<span className="ml-[2px]">Current Attendees: </span>
																<span className="mr-[2px]">
																	Max Attendees: {subEvent.sub_eventsMaxSeats}
																</span>
															</div>
														</div>
													))
											)}

											<div className="flex justify-between items-end mt-5">
												<div
													className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]"
													onClick={e => {
														e.stopPropagation(); // This line prevents the event from propagating
														openAttendanceModal(
															latestEvent[3].intFID,
														);
														fetchAttendanceList(latestEvent[3].intFID);
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

							{latestEvent[4] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[495px] w-full relative flex flex-col transition transform hover:scale-105"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[4].intFID);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?balloon",
												latestEvent[4]?.intFID,
												latestEvent[4]?.intFEventName,
												latestEvent[4]?.intFEventDescription,
												latestEvent[4]?.intFEventStartDate,
												latestEvent[4]?.intFEventEndDate,
												filteredSubEvent.sub_eventsID,
												filteredSubEvent.sub_eventsMainID,
												filteredSubEvent.sub_eventsName,
												filteredSubEvent.sub_eventsVenue,
												filteredSubEvent.sub_eventsStartDate,
												filteredSubEvent.sub_eventsEndDate,
												filteredSubEvent.sub_eventsStartTime,
												filteredSubEvent.sub_eventsEndTime,
												filteredSubEvent.sub_eventsMaxSeats,
												filteredSubEvent.sub_eventsOrganizer
											);
										} else {
											openModal(
												"https://source.unsplash.com/600x300?balloon",
												latestEvent[4]?.intFID,
												latestEvent[4]?.intFEventName,
												latestEvent[4]?.intFEventDescription,
												latestEvent[4]?.intFEventStartDate,
												latestEvent[4]?.intFEventEndDate,
												"default_sub_eventsID",
												"default_sub_eventsMainID",
												"default_sub_eventsName",
												"default_sub_eventsVenue",
												"default_sub_eventsStartDate",
												"default_sub_eventsEndDate",
												"default_sub_eventsStartTime",
												"default_sub_eventsEndTime",
												"default_sub_eventsMaxSeats",
												"default_sub_eventsOrganizer"
											);
										}
									}}>
									<div className="w-full h-[300px] mb-4 relative">
										<div className="absolute -inset-6">
											<img
												src="https://source.unsplash.com/600x300?balloon"
												alt="Random"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									{latestEvent[4] && (
										<div className="mt-6">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-2xl font-semibold mb-2 text-slate-800">
													{latestEvent[4].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
															<ThreeDotIcon />
														</div>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem onClick={e => {
															e.stopPropagation();
															openAttendanceModal(
																latestEvent[4].intFID,
															);
															fetchAttendanceList(latestEvent[4].intFID);
														}}>Attendance List</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={e => {
															e.stopPropagation(); // 
															openFeedbackModal(
																latestEvent[4].intFID,
															);
															fetchFeedbackList(latestEvent[4].intFID);
														}}>Feedback Forms</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<p className="text-gray-500 mb-4">
												{latestEvent[4].intFEventDescription}
											</p>
											<div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
												<p className="text-slate-600 text-sm">
													{formatDate(latestEvent[4].intFEventStartDate)}
												</p>
											</div>

											{subEvents.length > 0 && (
												subEvents.length > 0 &&
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[4].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FiClock className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{formatTime(subEvent.sub_eventsStartTime)}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[4].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[4].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index}>
															<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
																<div
																	className="h-full bg-orange-300 rounded-full"
																	style={{
																		width: `${(20 / 60) * 100}%`,
																	}}
																></div>
															</div>
															<div className="text-xs text-gray-600 mt-2 flex justify-between">
																<span className="ml-[2px]">Current Attendees: </span>
																<span className="mr-[2px]">
																	Max Attendees: {subEvent.sub_eventsMaxSeats}
																</span>
															</div>
														</div>
													))
											)}

											<div className="flex justify-between items-end mt-5">
												<div
													className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]"
													onClick={e => {
														e.stopPropagation(); // This line prevents the event from propagating
														openAttendanceModal(
															latestEvent[4].intFID,
														);
														fetchAttendanceList(latestEvent[4].intFID);
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

							{latestEvent[5] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[495px] w-full relative flex flex-col transition transform hover:scale-105"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[5].intFID);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?beers",
												latestEvent[5]?.intFID,
												latestEvent[5]?.intFEventName,
												latestEvent[5]?.intFEventDescription,
												latestEvent[5]?.intFEventStartDate,
												latestEvent[5]?.intFEventEndDate,
												filteredSubEvent.sub_eventsID,
												filteredSubEvent.sub_eventsMainID,
												filteredSubEvent.sub_eventsName,
												filteredSubEvent.sub_eventsVenue,
												filteredSubEvent.sub_eventsStartDate,
												filteredSubEvent.sub_eventsEndDate,
												filteredSubEvent.sub_eventsStartTime,
												filteredSubEvent.sub_eventsEndTime,
												filteredSubEvent.sub_eventsMaxSeats,
												filteredSubEvent.sub_eventsOrganizer
											);
										} else {
											openModal(
												"https://source.unsplash.com/600x300?beers",
												latestEvent[5]?.intFID,
												latestEvent[5]?.intFEventName,
												latestEvent[5]?.intFEventDescription,
												latestEvent[5]?.intFEventStartDate,
												latestEvent[5]?.intFEventEndDate,
												"default_sub_eventsID",
												"default_sub_eventsMainID",
												"default_sub_eventsName",
												"default_sub_eventsVenue",
												"default_sub_eventsStartDate",
												"default_sub_eventsEndDate",
												"default_sub_eventsStartTime",
												"default_sub_eventsEndTime",
												"default_sub_eventsMaxSeats",
												"default_sub_eventsOrganizer"
											);
										}
									}}>
									<div className="w-full h-[300px] mb-4 relative">
										<div className="absolute -inset-6">
											<img
												src="https://source.unsplash.com/600x300?beers"
												alt="Random"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									{latestEvent[5] && (
										<div className="mt-6">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-2xl font-semibold mb-2 text-slate-800">
													{latestEvent[5].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
															<ThreeDotIcon />
														</div>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem onClick={e => {
															e.stopPropagation();
															openAttendanceModal(
																latestEvent[5].intFID,
															);
															fetchAttendanceList(latestEvent[5].intFID);
														}}>Attendance List</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={e => {
															e.stopPropagation(); // 
															openFeedbackModal(
																latestEvent[5].intFID,
															);
															fetchFeedbackList(latestEvent[5].intFID);
														}}>Feedback Forms</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<p className="text-gray-500 mb-4">
												{latestEvent[5].intFEventDescription}
											</p>
											<div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
												<p className="text-slate-600 text-sm">
													{formatDate(latestEvent[5].intFEventStartDate)}
												</p>
											</div>

											{subEvents.length > 0 && (
												subEvents.length > 0 &&
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[5].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FiClock className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{formatTime(subEvent.sub_eventsStartTime)}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[5].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-2xl mr-2 text-slate-800" />
															<p className="text-slate-600 text-sm">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))
											)}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[5].intFID)
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index}>
															<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
																<div
																	className="h-full bg-orange-300 rounded-full"
																	style={{
																		width: `${(20 / 60) * 100}%`,
																	}}
																></div>
															</div>
															<div className="text-xs text-gray-600 mt-2 flex justify-between">
																<span className="ml-[2px]">Current Attendees: </span>
																<span className="mr-[2px]">
																	Max Attendees: {subEvent.sub_eventsMaxSeats}
																</span>
															</div>
														</div>
													))
											)}

											<div className="flex justify-between items-end mt-5">
												<div
													className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]"
													onClick={e => {
														e.stopPropagation(); // This line prevents the event from propagating
														openAttendanceModal(
															latestEvent[5].intFID,
														);
														fetchAttendanceList(latestEvent[5].intFID);
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

						<div className="w-full bg-white border border-slate-200 rounded-lg p-6 h-[500px] transition transform hover:scale-105 hidden lg:inline">
							<h2 className="text-2xl font-semibold mb-2">Calendar</h2>
							{/* <Calendar /> */}
						</div>
					</div>
				) : (
					<div className="w-full bg-slate-100 flex pb-28">
						<div className="w-full pr-6 bg-slate-100">
							<div className="w-full bg-slate-100">
								<div className="ml-1 font-bold text-lg">
									Today&rsquo;s Event(s)
								</div>
								<div className="border-t border-gray-300 my-4 ml-1"></div>
								{todayEvents.length === 0 ? (
									<p className="font-bold ml-5 mb-5">No events today...</p>
								) : (
									todayEvents.map((event) => (
										<div
											key={event.intFID}
											className="bg-white border border-slate-200 ml-5 rounded-lg overflow-hidden p-6 h-[240px] mb-5 w-7/8 relative flex flex-col shadow-sm hover:shadow-md"
											onClick={() => {
												const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === event.intFID);

												if (filteredSubEvent) {
													openModal(
														"https://source.unsplash.com/600x300?party",
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
														filteredSubEvent.sub_eventsOrganizer
													);
												}
											}}>
											<div className="ml-2 mr-2">
												<div className="flex justify-between items-center">
													<h2 className="text-2xl font-semibold mb-2 text-slate-800">
														{event.intFEventName}
													</h2>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
																<ThreeDotIcon />
															</div>
														</DropdownMenuTrigger>
														<DropdownMenuContent>
															<DropdownMenuItem onClick={e => {
																e.stopPropagation();
																openAttendanceModal(
																	event.intFID,
																);
																fetchAttendanceList(event.intFID);
															}}>Attendance List</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem onClick={e => {
																e.stopPropagation(); // 
																openFeedbackModal(
																	event.intFID,
																);
																fetchFeedbackList(event.intFID);
															}}>Feedback Forms</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
												<div className="border-t border-gray-300 my-4"></div>
												<p className="text-gray-500">{event.intFEventDescription}</p>
												<div className="flex items-center mt-4">
													<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
													<p className="text-slate-600 text-sm">{formatDate(event.intFEventStartDate)} - {formatDate(event.intFEventEndDate)}</p>
												</div>
												{/* <div className="flex items-center mt-3">
											<FiClock className="text-2xl mr-2 text-slate-800" />
											<p className="text-slate-600 text-sm">{formatTime(latestEvent[1].intFStartTime)}</p>
										</div> */}
												{/* <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
											<div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
										</div> */}
												<div className="flex justify-between items-end mt-5">
													{/* <div className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]" onClick={e => { e.stopPropagation(); openAttendanceModal(event.intFID); }}>Attendance List</div> */}
													<span className="relative px-3 py-[5px] font-semibold text-green-900 text-xs flex items-center">
														<span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
														<span className="relative mt-[1px] leading-3 tracking-wider">Today</span>
													</span>
												</div>
											</div>
										</div>
									))
								)}

								<div className="ml-1 font-bold text-lg">
									Tomorrow&rsquo;s Event(s)
								</div>
								<div className="border-t border-gray-300 my-4 ml-1"></div>
								{tomorrowEvents.length === 0 ? (
									<p className="font-bold ml-5 mb-5">No events tomorrow...</p>
								) : (
									tomorrowEvents.map((event) => (
										<div
											key={event.intFID}
											className="bg-white border border-slate-200 ml-5 rounded-lg overflow-hidden p-6 h-[240px] mb-5 w-7/8 relative flex flex-col shadow-sm hover:shadow-md"
											onClick={() => {
												const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === event.intFID);
												console.log(filteredSubEvent);

												if (filteredSubEvent) {
													openModal(
														"https://source.unsplash.com/600x300?party",
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
														filteredSubEvent.sub_eventsOrganizer
													);
												}
											}}>
											<div className="ml-2 mr-2">
												<div className="flex justify-between items-center">
													<h2 className="text-2xl font-semibold mb-2 text-slate-800">
														{event.intFEventName}
													</h2>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
																<ThreeDotIcon />
															</div>
														</DropdownMenuTrigger>
														<DropdownMenuContent>
															<DropdownMenuItem onClick={e => {
																e.stopPropagation();
																openAttendanceModal(
																	event.intFID,
																);
																fetchAttendanceList(event.intFID);
															}}>Attendance List</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem onClick={e => {
																e.stopPropagation(); // 
																openFeedbackModal(
																	event.intFID,
																);
																fetchFeedbackList(event.intFID);
															}}>Feedback Forms</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
												<div className="border-t border-gray-300 my-4"></div>
												<p className="text-gray-500">{event.intFEventDescription}</p>
												<div className="flex items-center mt-4">
													<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
													<p className="text-slate-600 text-sm">{formatDate(event.intFEventStartDate)} - {formatDate(event.intFEventEndDate)}</p>
												</div>
												{/* <div className="flex items-center mt-3">
											<FiClock className="text-2xl mr-2 text-slate-800" />
											<p className="text-slate-600 text-sm">{formatTime(latestEvent[1].intFStartTime)}</p>
										</div> */}
												{/* <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
											<div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
										</div> */}
												<div className="flex justify-between items-end mt-5">
													{/* <div className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]" onClick={e => { e.stopPropagation(); openAttendanceModal(event.intFID); }}>Attendance List</div> */}
													<span className="relative px-3 py-[5px] font-semibold text-yellow-900 text-xs flex items-center">
														<span aria-hidden className="absolute inset-0 bg-yellow-200 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
														<span className="relative mt-[1px] leading-3 tracking-wider">Tomorrow</span>
													</span>
												</div>
											</div>
										</div>
									))
								)}

								<div className="ml-1 font-bold text-lg">
									Upcoming Event(s)
								</div>
								<div className="border-t border-gray-300 my-4 ml-1"></div>
								{upcomingEvents.length === 0 ? (
									<p className="font-bold ml-5 mb-5">No upcoming events...</p>
								) : (
									upcomingEvents.map((event) => (
										<div
											key={event.intFID}
											className="bg-white border border-slate-200 ml-5 rounded-lg overflow-hidden p-6 h-[240px] mb-5 w-7/8 relative flex flex-col shadow-sm hover:shadow-md"
											onClick={() => {
												const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === event.intFID);

												if (filteredSubEvent) {
													openModal(
														"https://source.unsplash.com/600x300?party",
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
														filteredSubEvent.sub_eventsOrganizer
													);
												}
											}}>
											<div className="ml-2 mr-2">
												<div className="flex justify-between items-center">
													<h2 className="text-2xl font-semibold mb-2 text-slate-800">
														{event.intFEventName}
													</h2>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] cursor-pointer">
																<ThreeDotIcon />
															</div>
														</DropdownMenuTrigger>
														<DropdownMenuContent>
															<DropdownMenuItem onClick={e => {
																e.stopPropagation();
																openAttendanceModal(
																	event.intFID,
																);
																fetchAttendanceList(event.intFID);
															}}>Attendance List</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem onClick={e => {
																e.stopPropagation(); // 
																openFeedbackModal(
																	event.intFID,
																);
																fetchFeedbackList(event.intFID);
															}}>Feedback Forms</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
												<div className="border-t border-gray-300 my-4"></div>
												<p className="text-gray-500">{event.intFEventDescription}</p>
												<div className="flex items-center mt-4">
													<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
													<p className="text-slate-600 text-sm">{formatDate(event.intFEventStartDate)} - {formatDate(event.intFEventEndDate)}</p>
												</div>
												{/* <div className="flex items-center mt-3">
											<FiClock className="text-2xl mr-2 text-slate-800" />
											<p className="text-slate-600 text-sm">{formatTime(latestEvent[1].intFStartTime)}</p>
										</div> */}
												{/* <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
											<div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
										</div> */}
												<div className="flex justify-between items-end mt-5">
													{/* <div className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]" onClick={e => { e.stopPropagation(); openAttendanceModal(event.intFID); }}>Attendance List</div> */}
													<span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
														<span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
														<span className="relative mt-[1px] leading-3 tracking-wider">Upcoming</span>
													</span>
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				)
			}
		</div >
	);
}
