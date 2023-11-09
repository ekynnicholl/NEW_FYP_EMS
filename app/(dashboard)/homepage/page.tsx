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
import { Chart, registerables } from 'chart.js/auto';

import Image from "next/image";
import { useState, useEffect, SyntheticEvent, useRef, ChangeEvent } from "react";
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
import { BsBoxArrowUpRight, BsFillTrash3Fill } from "react-icons/bs"
import { HiPencilAlt } from "react-icons/hi"
import { IoMdAddCircleOutline } from "react-icons/io"
import { FaChalkboardTeacher } from "react-icons/fa"
import { LiaQrcodeSolid } from "react-icons/lia"
import PencilNoteIcon from "@/components/icons/PencilNoteIcon";
import ViewAttendance_Modal from "@/components/ViewAttendance_Modal";
import useViewModeStore from '@/components/zustand/viewModeStorage';
import darkLightStorage from '@/components/zustand/darkLightStorage';
import cookie from 'js-cookie';
import { useRouter } from "next/navigation";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AttendanceTable from "@/components/tables/attendanceTable";
import ThreeDotIcon from "@/components/icons/ThreeDotIcon";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ViewEventFeedback from "@/components/ViewEventFeedback";
import FeedbackList from "@/components/tables/feedbackTable";
//npm install chartjs-plugin-datalabels

import Calendar from "@/components/layouts/Calendar";

const currentDate = new Date();

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const month = date.toLocaleDateString("en-GB", { month: "long" });
	const day = date.toLocaleDateString("en-GB", { day: "numeric" });
	const dayOfWeek = date.toLocaleDateString("en-GB", { weekday: "long" });
	return `${dayOfWeek}, ${day} ${month} ${date.getFullYear()}`;
};

//for calendar date selection
const handleDateChange = (date: Date) => {
	// Handle the selected date here
	console.log("Selected Date:", date);

};


const formattedDate = formatDate(currentDate.toISOString());

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
	intFDurationCourse: string;
	intFTrainerName: string;
	intFTrainingProvider: string;
};

type AttendanceDataType = {
	attFormsID: string;
	attFSubEventID: string;
	attFormsStaffID: string;
	attFormsStaffName: string;
	attFormsFacultyUnit: string;
	attDateSubmitted: string;
	sub_eventName: string;
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
	sub_eventsCurrentAttendees?: string;
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
			if (!authToken) {
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

	// Count how many days left on each event
	const [eventsWithDaysLeft, setEventsWithDaysLeft] = useState<any[]>([]);

	const [numberOfAttendees, setNumberOfAttendees] = useState<number>(0);
	const [selectedEvent, setSelectedEvent] = useState({
		intFID: "",
		intFEventName: "",
		intFEventDescription: "",
		intFEventStartDate: "",
		intFEventEndDate: "",
		intFDurationCourse: "",
		intFTrainerName: "",
		intFTrainingProvider: "",
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
		intFDurationCourse: "",
		intFTrainerName: "",
		intFTrainingProvider: ""
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
	const [searchAttendanceQuery, setSearchAttendanceQuery] = useState("");
	const [filteredAttendanceData, setFilteredAttendanceData] = useState<AttendanceDataType[]>([]);
	const [activeTab, setActiveTab] = useState<'all' | 'staff' | 'student'>('all');

	// This is for the pie chart,
	const [selectedSubEvent, setSelectedSubEvent] = useState<string>("");
	const chartContainer = useRef<HTMLCanvasElement | null>(null);
	const chartInstanceRef = useRef<Chart<"bar", number[], string> | null>(null);
	const [isAllButtonActive, setIsAllButtonActive] = useState(true);
	const viewMode = useViewModeStore((state) => state.viewMode);
	// const isDarkMode = darkLightStorage((state) => state.isDarkMode);

	// This is for checking login and redirecting with router,
	const router = useRouter();

	// Function to fetch the 6 latest events
	useEffect(() => {
		const fetchLatestEvent = async () => {
			// Fetch data from internal_events table
			const { data: mainEventData, error: internalError } = await supabase
				.from("internal_events")
				.select(
					"intFID, intFEventName, intFEventDescription, intFEventStartDate, intFEventEndDate, intFDurationCourse, intFTrainerName, intFTrainingProvider",
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
					"*",
				)
				.in("sub_eventsMainID", mainEventData.map(event => event.intFID));
			// .gte(
			// 	"sub_eventsEndDate",
			// 	new Date().toLocaleString("en-US", { timeZone: malaysiaTimezone }),
			// )
			// .order("sub_eventsEndDate", { ascending: false }) // Sort by sub_eventsEndDate in descending order
			// .limit(1); // Limit to 1 result (the latest sub-event)

			// console.log("Sub-event Query:", subEventQuery.data);

			if (subEventQuery.error) {
				console.error("Error fetching sub_events:", subEventQuery.error);
				return;
			}

			const updatedSubEvents = await Promise.all(
				subEventQuery.data.map(async (subEvent) => {
					const { data: attendanceForms, error: formsError } = await supabase
						.from("attendance_forms")
						.select()
						.eq("attFSubEventID", subEvent.sub_eventsID);

					if (formsError) {
						console.error("Error fetching attendance forms:", formsError);
						return subEvent; // Return the original sub-event if there's an error
					}

					// Update the sub-event with current attendees
					subEvent.sub_eventsCurrentAttendees = attendanceForms.length;
					return subEvent;
				})
			);

			setSubEvents(updatedSubEvents);
			// console.log("SubEvents:", subEventQuery.data)

			// console.log(
			// 	"Matching Sub Events:",
			// 	subEvents.filter(subEvent => subEvent.sub_eventsMainID === latestEvent[0].intFID)
			// );

			const updatedMainEventData = await Promise.all(
				mainEventData.map(async (event) => {
					const startDate = new Date(event.intFEventStartDate);
					const currentDate = new Date();
					const timeDiff = startDate.getTime() - currentDate.getTime();
					const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

					return { ...event, daysLeft };
				})
			);

			setEventsWithDaysLeft(updatedMainEventData);
		};

		fetchLatestEvent();
	}, [supabase]);


	// Fetch the total of upcoming events
	const [upcomingEventCounts, setUpcomingEventCounts] = useState(0);

	useEffect(() => {
		const fetchTotalUpcomingEvents = async () => {
			const currentDate = new Date();

			const { count, error } = await supabase
				.from("internal_events")
				.select('intFID', { count: 'exact' })
				.gte(
					'intFEventEndDate',
					currentDate.toISOString(),
				);

			if (error) {
				throw new Error(`Error fetching total upcoming events: ${error.message}`);
			}

			if (count) {
				setUpcomingEventCounts(count);
			} else {
				// console.warn('No upcoming events found.');
				setUpcomingEventCounts(0);
			}
		};

		fetchTotalUpcomingEvents();
	}, [supabase]);

	// console.log(upcomingEventCounts);


	// Count the total past events
	const [pastEventCounts, setPastEventCounts] = useState(0);

	useEffect(() => {
		const fetchTotalPastEvents = async () => {

			const currentDate = new Date();

			const { count, error } = await supabase
				.from("internal_events")
				.select('intFID', { count: 'exact' })
				.lt(
					'intFEventEndDate',
					currentDate.toISOString(),
				);

			if (error) {
				throw new Error(`Error fetching total past events: ${error.message}`);
			}

			if (count) {
				setPastEventCounts(count);
			} else {
				// console.warn('No past events found.');
				setPastEventCounts(0);
			}
		};

		fetchTotalPastEvents();
	}, [supabase]);


	const [shouldShake, setShouldShake] = useState(true);

	useEffect(() => {
		const shakeInterval = setInterval(() => {
			setShouldShake(prevState => !prevState);
		}, 1000);

		return () => clearInterval(shakeInterval);
	}, []);

	//
	// This is for the GRID VIEW,
	//
	const [todayEvents, setTodayEvents] = useState<any[]>([]);
	const [tomorrowEvents, setTomorrowEvents] = useState<any[]>([]);
	const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

	// Function to compare dates (ignores time)
	function isSameDate(date1: string, date2: string) {
		const d1 = new Date(date1.substring(0, 10)); // Extract only the date part
		const d2 = new Date(date2.substring(0, 10));
		return (
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate()
		);
	}

	// Function to check whether a date is in the range of an event (ignores time)
	function isDateInRange(currentDate: string, startDate: string, endDate: string) {
		const currentDateObj = new Date(currentDate.substring(0, 10));
		const startDateObj = new Date(startDate.substring(0, 10));
		const endDateObj = new Date(endDate.substring(0, 10));
		return (
			currentDateObj.getTime() >= startDateObj.getTime() &&
			currentDateObj.getTime() <= endDateObj.getTime()
		);
	}

	// Function to get tomorrow's date (ignores time)
	function getTomorrowDate(date: string) {
		const today = new Date(date);
		today.setDate(today.getDate() + 1);
		return today.toISOString().substring(0, 10);
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
	}, []);

	// This is for attendance modal,
	const openAttendanceModal = async (event_id: string) => {
		try {
			// Fetch sub-events for the given event,
			const { data: subEvents, error: subEventsError } = await supabase
				.from("sub_events")
				.select()
				.eq("sub_eventsMainID", event_id);

			if (subEventsError) {
				console.error("Error fetching sub_events:", subEventsError);
				return;
			}

			const subEventNameMap: { [key: string]: string } = {};
			subEvents.forEach(subEvent => {
				subEventNameMap[subEvent.sub_eventsID] = subEvent.sub_eventsName;
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
				.in("attFSubEventID", subEventIDs);

			if (formsError) {
				console.error("Error fetching attendance forms:", formsError);
				return;
			}

			const attendanceDataWithSubEventNames = attendanceForms.map(attendanceItem => ({
				...attendanceItem,
				sub_eventName: subEventNameMap[attendanceItem.attFSubEventID],
			}));

			// Set the attendance data for the main event,
			setAttendanceData(attendanceDataWithSubEventNames);

			// Fetch the attendance list for that event,
			fetchAttendanceList(event_id);

			console.log("Attendance forms data:", attendanceDataWithSubEventNames);
			setShowAttendanceModal(true);
		} catch (error) {
			const typedError = error as Error;
			console.error("Error:", typedError.message);
		}
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

				createHorizontalBarChart(canvas, facultyLabels, facultyData);
			}
		}
	}, [filteredAttendanceData]);

	// 1 is for attendance forms, 2 is for feedback forms,
	const handleSubEventClick = async (subEvent: subEvents, type: number) => {
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
		} else if (type == 2) {
			try {
				// Fetch attendance data for the selected sub-event
				setSelectedSubEvent(subEvent.sub_eventsID);
				const { data: feedbackForms, error: formsError } = await supabase
					.from("feedback_forms")
					.select()
					.eq("fbSubEventID", subEvent.sub_eventsID);

				if (formsError) {
					console.error("Error fetching feedback forms:", formsError);
					return;
				}

				// Set the attendance data for the selected sub-event
				setFeedbackData(feedbackForms);

			} catch (error) {
				const typedError = error as Error;
				console.error("Error:", typedError.message);
			}
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

		const subEventNameMap: { [key: string]: string } = {};
		subEvents.forEach(subEvent => {
			subEventNameMap[subEvent.sub_eventsID] = subEvent.sub_eventsName;
		});

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
			const attendanceDataWithSubEventNames = attendanceForms.map(attendanceItem => ({
				...attendanceItem,
				sub_eventName: subEventNameMap[attendanceItem.attFSubEventID],
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

	const createHorizontalBarChart = (
		chartContainer: HTMLCanvasElement | null,
		labels: string[],
		data: number[]
	) => {
		if (chartContainer) {
			const ctx = chartContainer.getContext('2d');

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

				chartInstanceRef.current = new Chart(ctx, {
					type: 'bar',
					data: {
						labels: labels,
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
								font: {
									weight: 'bold',
								},
								align: 'end',
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

	const openModal = async (
		imageSrc: string,
		event_id: string,
		event_name: string,
		event_description: string,
		event_start_date: string,
		event_end_date: string,
		event_duration_course: string,
		event_trainer_name: string,
		event_training_provider: string,
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
			intFDurationCourse: event_duration_course,
			intFTrainerName: event_trainer_name,
			intFTrainingProvider: event_training_provider,
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


	// Create sub events dynamic textbox
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
				intFDurationCourse: calculateDays(),
				intFTrainerName: mainEvent.intFTrainerName,
				intFTrainingProvider: mainEvent.intFTrainingProvider
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
				intFDurationCourse: mainEvent.intFDurationCourse,
				intFTrainerName: mainEvent.intFTrainerName,
				intFTrainingProvider: mainEvent.intFTrainingProvider
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

	// Calculate how many days for main event
	const calculateDays = () => {
		const startDate = new Date(mainEvent.intFEventStartDate).getTime();
		const endDate = new Date(mainEvent.intFEventEndDate).getTime();

		if (!isNaN(startDate) && !isNaN(endDate)) {
			const timeDiff = Math.abs(endDate - startDate);
			const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
			return diffDays;
		}

		return null; // Return null if either date is invalid
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
				intFDurationCourse: selectedEvent.intFDurationCourse,
				intFTrainerName: selectedEvent.intFTrainerName,
				intFTrainingProvider: selectedEvent.intFTrainingProvider,
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
				intFDurationCourse: editEventInfo.intFDurationCourse,
				intFTrainerName: editEventInfo.intFTrainerName,
				intFTrainingProvider: editEventInfo.intFTrainingProvider
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
			.in("fbSubEventID", subEventIDs);

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
			.in("fbSubEventID", subEventIDs);

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

	// This function fetches ALL the feedback forms,
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

	//Refresh attendance data from database
	const refreshAttendanceData = async () => {
		setSearchAttendanceQuery("");
		setAttendanceData(attendanceData);
	}

	//Handle search input
	const handleAttendanceSearch = (query: string) => {
		setSearchAttendanceQuery(query);
		// const filteredStaffData = attendanceData.filter(
		//     staff =>
		//         staff.attFormsStaffName.toLowerCase().includes(query.toLowerCase()) ||
		//         staff.attFormsFacultyUnit.toLowerCase().includes(query.toLowerCase())
		// );
		// setFilteredAttendanceData(filteredStaffData);
		filterAttendanceData(activeTab, query);
		// console.log("filter data: ", filteredAttendanceData);
	}

	const filterAttendanceData = (tab: 'all' | 'staff' | 'student', query: string) => {
		let filteredData = attendanceData;
		if (tab === 'staff') {
			filteredData = attendanceData.filter((item) => item.attFormsStaffID.startsWith('SS'));
		} else if (tab === 'student') {
			filteredData = attendanceData.filter((item) => !item.attFormsStaffID.startsWith('SS'));
		}

		// Apply search filter
		if (query) {
			filteredData = filteredData.filter((item) => {
				// Replace the conditions with your specific search criteria
				return item.attFormsStaffName.toLowerCase().includes(query.toLowerCase());
			});
		}

		setFilteredAttendanceData(filteredData);
	};

	useEffect(() => {
		filterAttendanceData(activeTab, searchAttendanceQuery);
	}, [activeTab, searchAttendanceQuery, attendanceData]);

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

	useEffect(() => {
		setActiveTab('all');
	}, [selectedSubEvent, isAllButtonActive])

	return (
		// <div className={`pl-1 pr-3 py-3 lg:p-5 ${isDarkMode ? 'bg-black-100' : 'bg-slate-100'} space-y-4`}>
		<div className="pl-1 pr-3 py-3 lg:p-5 space-y-4 dark:bg-dark_mode_bg bg-slate-100">
			<div className="mx-auto w-full">
				<div className="w-full flex ml-1">

					{/* PC View */}
					<div className="md:flex bg-white border border-slate-200 rounded-lg hidden p-3 lg:p-5 gap-4 w-full dark:bg-dark_mode_card dark:border-[#27374C]">
						<div className="w-1/3 text-left h-full">
							<div className="bg-[#E5F9FF] p-5 text-slate-700 rounded-lg flex dark:bg-[#003343] dark:text-slate-300 dark:border dark:border-[#363B3D]">
								<div className="mr-4">
									<FontAwesomeIcon
										icon={faCalendar}
										className="w-8 mt-[7px] text-slate-700 dark:text-slate-300"
										size="2x"
									/>
								</div>
								<div className="ml-1">
									<p className="text-[16px]">Today&apos;s Date</p>
									<p className="text-[16px] font-medium">{formattedDate}</p>
								</div>
							</div>
						</div>

						<div className="w-1/3 h-full text-left transition transform hover:scale-105">
							<a
								href="/upcomingEvents"
								className="bg-[#FFEDE5] h-full p-5 text-slate-700 rounded-lg flex hover:bg-[#ffdcce] dark:bg-[#431400] dark:text-slate-300 dark:border dark:border-[#363B3D]">
								<div className="mr-[14px]">
									<FontAwesomeIcon
										icon={faUsers}
										className="w-8 mt-[7px] text-slate-700 dark:text-slate-300"
										size="2x"
									/>
								</div>
								<div className="ml-1">
									<p className="text-[16px]">Upcoming Events</p>
									<p className="text-[16px] font-medium">{upcomingEventCounts}</p>
								</div>
							</a>
						</div>

						<div className="w-1/3 text-left h-full transition transform hover:scale-105">
							<a
								href="/pastEvents"
								className="bg-[#EAE5FF] p-5 h-full text-slate-700 rounded-lg flex hover:bg-[#e0d8ff] dark:bg-[#1F2223] dark:text-slate-300 dark:border dark:border-[#363B3D]">
								<div className="mr-[14px]">
									<FontAwesomeIcon
										icon={faCheckCircle}
										className="w-[34px] mt-[7px] text-slate-700 dark:text-slate-300"
										size="2x"
									/>
								</div>
								<div className="ml-1">
									<p className="text-[16px]">Past Events</p>
									<p className="text-[16px] font-medium">{pastEventCounts}</p>
								</div>
							</a>
						</div>
					</div>

					{/* Mobile View */}
					<div className="bg-white border border-slate-200 rounded px-2 pt-2 pb-3 gap-2 w-full md:hidden dark:bg-dark_mode_card dark:border-[#27374C]">
						<div className="grid grid-cols-2 gap-2 h-[49px]">
							<div className="text-left transition transform hover:scale-105 h-[53px]">
								<a
									href="/upcomingEvents"
									className="bg-[#FFEDE5] h-full p-3 text-slate-700 rounded flex hover:bg-[#ffdcce] dark:bg-[#431400] dark:text-slate-300 dark:border dark:border-[#363B3D]">
									<div className="mr-2">
										<FontAwesomeIcon
											icon={faUsers}
											className="w-[19px] -mt-[3px] text-slate-700 dark:text-slate-300"
											size="2x"
										/>
									</div>
									<div className="ml-[2px] -mt-1">
										<p className="text-[12px]">Upcoming Events</p>
										<p className="font-medium text-[12px]">{upcomingEventCounts}</p>
									</div>
								</a>
							</div>

							<div className="text-left transition transform hover:scale-105 h-[53px]">
								<a
									href="/pastEvents"
									className="bg-[#EAE5FF] p-3 h-full text-slate-700 rounded flex hover:bg-[#e0d8ff] dark:bg-[#1F2223] dark:text-slate-300 dark:border dark:border-[#363B3D]">
									<div className="mr-2">
										<FontAwesomeIcon
											icon={faCheckCircle}
											className="w-[19px] -mt-[3px] text-slate-700 dark:text-slate-300"
											size="2x"
										/>
									</div>
									<div className="ml-[2px] -mt-1">
										<p className="text-[12px]">Past Events</p>
										<p className="font-medium text-[12px]">{pastEventCounts}</p>
									</div>
								</a>
							</div>
						</div>
					</div>

					{/* PC View */}
					<div className="w-1/4 mt-4 flex justify-end items-start lg:mr-1 lg:ml-5 hidden md:inline">
						<button
							className="flex items-center bg-slate-800 rounded-lg py-3 px-[50px] lg:px-[30px] font-medium hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm mt-4 -mr-[15px] hover:text-slate-50 justify-end text-right hover:transition duration-300 transform hover:scale-105 cursor-pointer dark:bg-slate-800"
							onClick={() => setShowModalCreateEvent(true)}>
							<IoIosAddCircleOutline className="text-[31px] text-slate-100 -ml-1 mr-1" />
							<span className="text-[18px] text-slate-100 ml-[2px] -mt-[2.5px]">Add Events</span>
						</button>
					</div>

					<CreateEvent_Modal isVisible={showModalCreateEvent}
						onClose={() => setShowModalCreateEvent(false)}>
						<form onSubmit={handleSubmitCreateEvent}>
							<div className="ml-1 lg:ml-4 mb-[0px] lg:mb-[70px] dark:bg-dark_mode_card">
								<h3 className="text-[14px] lg:text-[20px] font-semibold text-slate-700 -mb-[7px] lg:-mb-1 mt-[9px] ml-[2px] dark:text-dark_text2">
									Create Event
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[270px] lg:w-[505px] dark:border-[#253345]" />

								<div className="w-full pr-[11px]">
									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 ml-[2px] -mt-1 lg:mt-0 dark:text-dark_textbox_title">
										Event / Course Name
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px] dark:text-dark_textbox_title">
										Description
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
											*
										</span>
									</p>
									<textarea
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

									<div className="flex flex-col mt-[2px]">
										<div className="flex">
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] ml-[2px] mb-[2px] dark:text-dark_textbox_title">
												Start Date
												<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[89px] -ml-[4px] lg:ml-[10px] mb-[2px] dark:text-dark_textbox_title">
												End Date
												<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 -ml-[4px] lg:ml-[10px] mb-[2px] dark:text-dark_textbox_title">
												Total days:
											</p>
										</div>

										<div className="flex">
											<input
												className="pr-2 lg:pr-[8px] lg:py-2 pl-2 lg:pl-[10px] rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px] py-[5px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:text-slate-300"
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
												className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-2 lg:pl-[10px] -ml-[71.5px] pr-2 py-[5px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
												type="date"
												name="event_end_date"
												min={mainEvent.intFEventStartDate} // Set the minimum date to the main event start date
												required
												onChange={e =>
													setMainEvent({
														...mainEvent,
														intFEventEndDate: e.target.value,
													})
												}
											/>
											<div>
												{mainEvent.intFEventStartDate && mainEvent.intFEventEndDate &&
													<div className="font-medium text-slate-800 text-[20px] dark:text-slate-300 ml-[24px] mt-[2px]">
														{calculateDays()} days
													</div>
												}
											</div>

											{/* <input
												className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-2 lg:pl-3 py-[5px] w-[80px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300 ml-[19px]"
												type="number"
												value={calculateDays() || ''}
												required
												onChange={e =>
													setMainEvent({
														...mainEvent,
														intFDurationCourse: e.target.value,
													})
												}
											/> */}
										</div>
									</div>

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px] dark:text-dark_textbox_title">
										Trainer&apos;s Name
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
										type="text"
										placeholder="What is your trainer's name?"
										id="trainer_name"
										name="trainer_name"
										required
										onChange={e =>
											setMainEvent({
												...mainEvent,
												intFTrainerName: e.target.value,
											})
										}
									/>

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px] dark:text-dark_textbox_title">
										Training Provider
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
										type="text"
										placeholder="Who's is your training provider?"
										id="training_provider"
										name="training_provider"
										required
										onChange={e =>
											setMainEvent({
												...mainEvent,
												intFTrainingProvider: e.target.value,
											})
										}
									/>

								</div>

								{eventDetails.map((detail, index) => (
									<div key={index} className="mb-7 pr-[11px]" ref={index === eventDetails.length - 1 ? lastDetailRef : null}>

										{index === 0 && (
											<div className="mt-1"></div>
										)}
										{index > 0 && (
											<div className="-mt-6"></div>
										)}

										<div className="flex items-center">
											<p className="text-[14px] lg:text-[17px] font-semibold text-slate-700 lg:mb-2 mt-5 dark:text-dark_text2">‣ Session {index + 1}</p>

											{eventDetails.length > 1 && (
												<button
													type="button"
													onClick={() => handleRemoveEventClick(index)}
													className="text-sm lg:text-base ml-[10px] mt-[20px] lg:ml-[10px] lg:mt-[12.25px]"
												>
													<BsFillTrash3Fill className="text-slate-700 hover:scale-105 hover:text-red-500 dark:text-dark_text2" />
												</button>
											)}
										</div>

										{detail.event_names.map((event_name, eventNameIndex) => (
											<div key={eventNameIndex}>
												<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 ml-[2px] dark:text-dark_textbox_title">
													Sub-event Name
													<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">*</span>
												</p>
												<input
													type="text"
													placeholder="This sub-event is called?"
													value={event_name}
													onChange={(e) => handleEventNameInputChange(index, eventNameIndex, e.target.value)}
													className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
													required
												/>
											</div>
										))}

										{detail.venues.map((venue, venueIndex) => (
											<div key={venueIndex}>
												<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px] dark:text-dark_textbox_title">
													Venue
													<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">*</span>
												</p>
												<input
													type="text"
													placeholder="Venue i.e., G401"
													value={venue}
													onChange={(e) => handleEventVenueInputChange(index, venueIndex, e.target.value)}
													className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
													required
												/>
											</div>
										))}

										{detail.maximum_seats.map((maximum_seats, maximumSeatsIndex) => (
											<div key={maximumSeatsIndex}>
												<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px] dark:text-dark_textbox_title">
													Maximum Seats
													<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">*</span>
												</p>
												<input
													type="number"
													placeholder="Maximum Seats"
													value={maximum_seats}
													onChange={(e) => handleEventMaximumSeatsInputChange(index, maximumSeatsIndex, e.target.value)}
													className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
													required
												/>
											</div>
										))}

										<div className="flex flex-col mt-[10px]">
											<div className="flex">
												<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[82px] lg:mr-[95px] ml-[1.5px] lg:ml-[2px] mb-[2px] dark:text-dark_textbox_title">
													Start Date
													<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
														*
													</span>
												</p>
												<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mb-[2px] -ml-[4px] lg:ml-[1px] dark:text-dark_textbox_title">
													End Date
													<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
														*
													</span>
												</p>
											</div>
											<div className="flex">
												{detail.start_dates.map((start_dates, startDatesIndex) => (
													<div key={startDatesIndex}>
														<input
															className="pr-2 lg:pr-[8px] py-[5px] pl-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[87.5px] lg:mr-[90.5px] mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
															type="date"
															name="event_start_date"
															min={mainEvent.intFEventStartDate} // Set the minimum date to the main event start date
															max={mainEvent.intFEventEndDate}   // Set the maximum date to the main event end date
															onChange={(e) => handleEventStartDatesInputChange(index, startDatesIndex, e.target.value)}
															required
														/>
													</div>
												))}

												{detail.end_dates.map((end_dates, endDatesIndex) => (
													<div key={endDatesIndex}>
														<input
															className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] py-[5px] pl-2 -ml-[71.5px] pr-2 lg:pr-2 lg:py-2 dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
															type="date"
															name="event_end_date"
															min={mainEvent.intFEventStartDate} // Set the minimum date to the main event start date
															max={mainEvent.intFEventEndDate}   // Set the maximum date to the main event end date
															onChange={(e) => handleEventEndDatesInputChange(index, endDatesIndex, e.target.value)}
															required
														/>
													</div>
												))}
											</div>
										</div>

										<div className="flex flex-col mt-[10px]">
											<div className="flex">
												<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mb-[2px] ml-[2px] lg:ml-[2px] dark:text-dark_textbox_title">
													Start Time
													<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
														*
													</span>
												</p>
												<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 ml-[77px] lg:ml-[40px] mb-[2px] dark:text-dark_textbox_title">
													End Time
													<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
														*
													</span>
												</p>
											</div>
											<div className="flex">
												{detail.start_times.map((start_times, startTimesIndex) => (
													<div key={startTimesIndex}>
														<input
															className="py-[5px] pl-3 pr-2 lg:pr-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[91.5px] mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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
															className="py-[5px] lg:pr-2 lg:py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-3 ml-[15px] lg:-ml-[71.5px] pr-2 dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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
												<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px] dark:text-dark_textbox_title">
													Organizer
													<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">*</span>
												</p>
												<input
													type="text"
													placeholder="Who is the organizer?"
													value={organizers}
													onChange={(e) => handleEventOrganizersInputChange(index, organizersIndex, e.target.value)}
													className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
													required
												/>
											</div>
										))}
									</div>
								))}

								<div className="-mt-8 lg:mt-0 lg:absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px] dark:bg-dark_mode_card">
									<button type="button" onClick={addEventDetails} className="rounded-lg px-[7px] py-[4px] lg:px-[10px] lg:py-[5px] border border-slate-800 hover:bg-slate-100 mr-4 text-[11px] lg:text-[15px] focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-medium dark:bg-dark_mode_card dark:text-slate-200 dark:border-[#7D7467] transform lg:hover:scale-105">
										Add Sub-Event
									</button>

									<button
										className="rounded-lg px-[30px] py-[7px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:font-medium transform lg:hover:scale-105 dark:hover:bg-slate-800"
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
							<h3 className="lg:text-2xl font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
								Attendance
							</h3>
							<QRCodeSVG
								value={`https://fyp-hosting.vercel.app/form/${selectedSubEventID}`}
							/>
							<button
								onClick={() =>
									copyToClipboard(
										`https://fyp-hosting.vercel.app/form/${selectedSubEventID}`
									)
								}
								className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] lg:ml-2 transform hover:scale-105"
							>
								Copy Link
							</button>
						</div>
					</Modal>

					<Modal isVisible={showQRCodesFeedback} onClose={() => setShowQRCodesFeedback(false)}>
						<div className="ml-2 p-5 z-[999]">
							<h3 className="lg:text-2xl font-medium text-gray-600 -ml-[9px] mb-3 mt-1 text-center dark:text-slate-200">
								Feedback
							</h3>
							<QRCodeSVG
								value={`https://fyp-hosting.vercel.app/form/feedback/${selectedSubEventID}`}
							/>
							<button
								onClick={() =>
									copyToClipboard(
										`https://fyp-hosting.vercel.app/form/feedback/${selectedSubEventID}`
									)
								}
								className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px] dark:bg-[#242729] dark:text-[#C1C7C1] lg:ml-2 transform hover:scale-105"
							>
								Copy Link
							</button>
						</div>
					</Modal>

					<ViewEvent_Modal
						isVisible={showModalViewEvent}
						onClose={() => setShowModalViewEvent(false)}>
						<div className="py-[30px] lg:py-[100px] relative z-[50] dark:bg-dark_mode_card">
							<img
								src={selectedEventImage}
								alt="Random"
								className="absolute h-[200px] lg:h-[258px] object-cover -mt-[38px] lg:-mt-[100px] rounded-t-lg -ml-[0.25px] lg:ml-2 transform hover:scale-110 lg:hover:scale-110 hover:rotate-1 scale-[1.12] lg:scale-[1.070] transition duration-300 shadow-sm"
							/>

							<div className="ml-[6px] lg:ml-[9px]">
								<h3 className="text-[15px] lg:text-[20px] font-semibold text-slate-800 mb-1 mt-[185px] lg:mt-[180px] dark:text-dark_text">
									About This Event
								</h3>
								<p className="text-[11px] lg:text-[15px] text-mb-7 mb-1 lg:mb-5 font-normal text-slate-500 mt-[5px] lg:mt-[10px] dark:text-[#7B756B]">
									{selectedEvent.intFEventDescription} ({selectedEvent.intFDurationCourse} days)
								</p>

								<div className="flex ml-[1px] mt-2 lg:mt-0">
									<FaChalkboardTeacher className="text-[19px] lg:text-[21px] text-slate-800 dark:text-[#7B756B]" />
									<p className="text-[11px] lg:text-[15px] text-mb-7 mb-1 lg:mb-5 ml-2 mt-[0px] lg:-mt-[1px] text-slate-800 dark:text-[#7B756B]">
										{selectedEvent.intFTrainerName} ({selectedEvent.intFTrainingProvider})
									</p>
								</div>

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

											<div className="flex items-center gap-[0px] lg:gap-[6px] mt-1 lg:mt-0">
												<p className="text-[13px] lg:text-[18px] font-semibold text-slate-700 lg:mb-2 mt-[22px] dark:text-dark_text2">‣ Session {index + 1}</p>

												<button
													type="button"
													onClick={(e) => openAddSubEventModal(e, selectedEvent.intFID)}
													className="text-base lg:text-[21px] ml-[10px] mt-[20px] lg:ml-[12px] lg:mt-[15.2px]"
												>
													<IoMdAddCircleOutline className="text-slate-700 hover:scale-105 mt-[2.5px] lg:mt-[0.5px] text-[15px] lg:text-[18px] dark:text-dark_text2" />
												</button>
												<button
													type="button"
													onClick={() => handleDeleteSubEvent(subEvent.sub_eventsID)}
													className="text-sm lg:text-base ml-[10px] mt-[19px] lg:ml-[3px] lg:mt-[13.5px]"
												>
													<BsFillTrash3Fill className="text-slate-700 hover:scale-105 hover:text-red-500 mt-[3px] lg:mt-[1px] text-[13px] lg:text-base dark:text-dark_text2" />
												</button>
												<button
													type="button"
													onClick={(e) => handleEditSubEventButton(e, subEvent.sub_eventsID)}
													className="text-base lg:text-lg ml-[10px] mt-[19px] lg:ml-[3px] lg:mt-[13.6px]"
												>
													<HiPencilAlt className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text2" />
												</button>
											</div>

											<div className="flex -mt-[6px] lg:-mt-3 mb-2 lg:mb-4">
												<button
													type="button"
													className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 dark:bg-[#242729]"
													onClick={() => {
														setSelectedSubEventID(subEvent.sub_eventsID);
														setShowQRCodesAttendance(true);
													}}
												>
													<span className="ml-2 lg:mt-[1px] text-slate-800 flex items-center mr-2">
														<LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
														<span className="ml-[3px] lg:ml-[5px] -mt-[1px] text-[11px] lg:text-[14px] dark:text-[#C1C7C1]">
															Attendance
														</span>
													</span>
												</button>
												<button
													type="button"
													className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ml-2 lg:ml-3 px-[5px] dark:bg-[#242729]"
													onClick={() => {
														setSelectedSubEventID(subEvent.sub_eventsID);
														setShowQRCodesFeedback(true);
													}}
												>
													<span className="ml-2 text-slate-800 flex items-center mr-2">
														<LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
														<span className="ml-[3px] lg:ml-[5px] -mt-[1px] text-[11px] lg:text-[14px] dark:text-[#C1C7C1]">
															Feedback
														</span>
													</span>
												</button>
											</div>

											<div className="hidden lg:flex items-center mt-1">
												<HiMiniCalendarDays className="text-[32px] lg:text-[25px] mr-2 text-slate-800 -mt-[2px] dark:text-dark_text" />
												<p className="text-slate-600 text-[13px] lg:text-[14px] ml-[1px] mt-[1px] lg:-mt-[1px] dark:text-dark_text">
													{formatDate(subEvent.sub_eventsStartDate)}
												</p>
												<span className="mx-2 text-slate-800 ml-[15px] lg:ml-[57px] mr-6 dark:text-dark_text">
													|
												</span>
												<FiClock className="text-[30px] lg:text-[22px] mr-2 text-slate-800 mt-[0px] dark:text-dark_text" />
												<p className="text-slate-600 text-[12px] lg:text-[14px] lg:-mt-[1px] dark:text-dark_text">
													{formatTime(subEvent.sub_eventsStartTime)}
												</p>
												<span className="mx-2 text-slate-800 -mt-[2px] dark:text-dark_text">-</span>
												<p className="text-slate-600 text-[12px] lg:text-[14px] lg:-mt-[1px] dark:text-dark_text">
													{formatTime(subEvent.sub_eventsEndTime)}
												</p>
											</div>

											<div className="inline lg:hidden mt-1">
												<div className="flex items-center mt-[11px] lg:mt-[14px]">
													<HiMiniCalendarDays className="text-[20px] lg:text-2xl mr-[6px] text-slate-800 -mt-[2px]" />
													<p className="text-slate-600 text-[11px] lg:text-[13px] ml-[1px] mt-[0.5px] lg:mt-[0.5px]">
														{formatDate(subEvent.sub_eventsStartDate)}
													</p>
												</div>
												<div className="flex items-center mt-[10px] lg:mt-[14px]">
													<FiClock className="text-[20px] lg:text-[21px] mr-[6px] text-slate-800 -mt-[1px]" />
													<p className="text-slate-600 text-[11px] lg:text-[13px] ml-[0.5px]">
														{formatTime(subEvent.sub_eventsStartTime)}
													</p>

													<span className="mx-2 text-slate-800 -mt-[2px]">-</span>
													<p className="text-slate-600 text-[11px] lg:text-[13px]">
														{formatTime(subEvent.sub_eventsEndTime)}
													</p>
												</div>
											</div>

											<div className="flex items-center mt-[10px] lg:mt-[14px]">
												<FaLocationDot className="text-xl lg:text-[25px] -ml-[0.5px] lg:ml-0 mr-[6px] text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-[11px] lg:text-[14px] ml-[1px] -mt-[1px] dark:text-dark_text">
													{subEvent.sub_eventsVenue}
												</p>
											</div>
											<div className="flex items-center mt-[8px] lg:mt-[15px] lg:mb-0 mb-[3px]">
												<MdAirlineSeatReclineNormal className="text-2xl lg:text-[25px] mr-[6px] text-slate-800 lg:ml-[2px] dark:text-dark_text" />
												<p className="text-slate-600 text-[11px] lg:text-[14px] mt-[1px] lg:mt-[0px] -ml-[3.5px] lg:-ml-[1px] dark:text-dark_text">
													{subEvent.sub_eventsMaxSeats} Maximum Seats
												</p>
											</div>
											<div className="flex items-center mt-[8px] lg:mt-[14px]">
												<MdPeople className="text-2xl lg:text-[25px] mr-[6px] text-slate-800 -ml-[1px] lg:ml-[1px] dark:text-dark_text" />
												<p className="text-slate-600 text-[11px] lg:text-[14px] mt-[1px] -ml-[2px] lg:ml-0 dark:text-dark_text">
													{subEvent.sub_eventsCurrentAttendees} Attendees
												</p>
											</div>
										</div>

									))}

								<div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-dark_mode_card">
									<div className="flex justify-center">
										<button
											className="rounded-lg px-[7px] py-[5px] lg:px-[10px] lg:py-[5px] border border-slate-800 hover:bg-slate-100 mr-4 text-[12px] lg:text-[15px] focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-medium dark:text-slate-200 dark:border-[#7D7467] dark:hover:bg-dark_mode_card transform lg:hover:scale-105"
											onClick={() =>
												setShowModalConfirmation(true)
											}>
											Cancel Event
										</button>

										<button
											className="rounded-lg px-[20px] py-[6px] lg:px-[25px] lg:py-[9px] bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:font-medium transform lg:hover:scale-105 dark:hover:bg-slate-800"
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
							<div className="h-[600px] lg:h-[700px] w-full mr-3">
								<div className="flex items-left justify-start">
									<div className="flex items-center justify-center text-text text-[16px] lg:text-[20px] text-center text-slate-800 dark:text-dark_text">
										<PencilNoteIcon />{" "}
										<span className="ml-2.5">Feedback Summary</span>
									</div>
								</div>
								<div className="text-left text-[12px] lg:text-[13px] pl-[34px] pb-5 text-slate-800 dark:text-dark_text">
									Total Feedback Received: {feedbackData.length}
								</div>
								<div className="flex flex-wrap ml-9">
									<button
										className={`font-bold flex items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-3 dark:bg-[#242729] dark:text-dark_text ${isAllButtonActive ? 'bg-red-600 dark:bg-red-600 text-slate-100' : 'bg-slate-200 text-slate-800'
											}`}
										onClick={() => {
											setIsAllButtonActive(true);
											fetchFeedbackList(feedbackMainEventID);
										}}
									>
										All
									</button>
									{subEventsForFeedback.map((subEvent) => (
										<div
											key={subEvent.sub_eventsID}
											className={`font-bold flex items-center bg-slate-200 rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 shadow-sm mb-3.5 p-2 mr-3 dark:bg-[#242729] dark:text-dark_text ${selectedSubEvent === subEvent.sub_eventsID ? 'bg-red-600 dark:bg-red-600 text-slate-100' : 'bg-slate-200 text-slate-800'
												}`}
										>
											<button
												onClick={() => {
													setIsAllButtonActive(false);
													handleSubEventClick(subEvent, 2);
												}}
											>
												{subEvent.sub_eventsName}
											</button>
										</div>
									))}
								</div>
								{/* This is to loop through the attendance data. */}
								{feedbackData && feedbackData.length > 0 ? (
									<div className="ml-9">
										<div className={`lg:h-[675px] h-[400px] overflow-y-auto dark:bg-[#242729] dark:text-dark_text`}>
											<FeedbackList feedbackData={feedbackData} />
										</div>
									</div>
								) : (
									<div className="text-left text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[34px]">
										No feedback received yet.
									</div>

								)}
							</div>
						</div>
					</ViewEventFeedback>

					<ViewAttendance_Modal
						isVisible={showAttendanceModal}
						onClose={() => setShowAttendanceModal(false)}>
						<div className="flex flex-col lg:flex-row h-[450px] lg:h-[825px] overflow-y-auto">
							<div className={`w-${attendanceData && attendanceData.length > 0 ? '1/2' : 'full'} lg:h-[700px] h-[600px] w-full`}>
								<div className="flex items-start justify-start text-text text-[20px] text-center">
									<PencilNoteIcon />{" "}
									<span className="ml-5 lg:-mt-1 lg:text-[20px] text-[16px]">Attendance List</span>
								</div>
								<div className="text-left text-black lg:text-[13px] text-[12px] pb-5 ml-11">
									Total Attendees: {attendanceData.length}
								</div>
								<div className="flex flex-wrap">
									<button
										className={`font-bold flex items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 ${isAllButtonActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
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
											className={`font-bold flex items-center bg-slate-200 rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm mb-3.5 p-2 ml-3 ${selectedSubEvent === subEvent.sub_eventsID ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
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
								<button
									onClick={() => {
										// Handle the refresh button click here
										fetchAttendanceList(attendanceMainEventID);
										setIsAllButtonActive(true);
									}}
									className="font-bold flex items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 bg-slate-200 text-slate-800"
								>
									Refresh
								</button>
								{/* This is to loop through the attendance data. */}
								{attendanceData && attendanceData.length > 0 ? (
									<div className="lg:text-[16px] text-[12px]">
										<button
											className={`flex rounded-md items-center py-2 px-4 mr-3 font-medium hover:bg-slate-300 shadow-sm md:inline-flex ${activeTab === 'all' ? 'bg-slate-300' : 'bg-slate-200'
												}`}
											onClick={() => setActiveTab('all')}
										>
											All
										</button>
										<button
											className={`flex rounded-md items-center py-2 px-4 mr-3 font-medium hover:bg-slate-300 shadow-sm md:inline-flex ${activeTab === 'staff' ? 'bg-slate-300' : 'bg-slate-200'
												}`}
											onClick={() => setActiveTab('staff')}
										>
											Staff
										</button>
										<button
											className={`flex rounded-md items-center py-2 px-4 mr-3 font-medium hover:bg-slate-300 shadow-sm md:inline-flex ${activeTab === 'student' ? 'bg-slate-300' : 'bg-slate-200'
												}`}
											onClick={() => setActiveTab('student')}
										>
											Student
										</button>
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
											<span className="h-full absolute inset-y-0 left-0 flex items-center pl-2 ">
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
											{filteredAttendanceData && searchAttendanceQuery.length > 0 ? (
												<AttendanceTable attendanceData={filteredAttendanceData} itemsPerPage={itemsPerPage} isAllTabActive={isAllButtonActive} />
											) : (
												<AttendanceTable attendanceData={filteredAttendanceData} itemsPerPage={itemsPerPage} isAllTabActive={isAllButtonActive} />
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
							{filteredAttendanceData && filteredAttendanceData.length > 0 ? (
								<div className="w-full lg:flex flex-col items-center justify-center mt-24">
									<div className="text-center font-bold lg:text-[16px] text-[14px]">Number of Attendees Each Faculty/ Unit</div>
									<div className="w-[400px] h-[400px] lg:w-[650px] lg:h-[750px] flex items-center justify-center mt-5">
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
								<h3 className="text-[14px] lg:text-[20px] font-semibold text-slate-700 mb-[6px] lg:mb-2 mt-[9px] ml-[2px] dark:text-dark_text2">
									Add New Sub-event
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[477px] dark:border-[#253345]" />

								<div className="w-full pr-[13px]">
									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-0 lg:mt-1 ml-[2px] dark:text-dark_textbox_title">
										Event Name
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">*</span>
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
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
									/>

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 lg:mt-2 ml-[2px] dark:text-dark_textbox_title">
										Venue
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">*</span>
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
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
									/>

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 lg:mt-2 ml-[1px] dark:text-dark_textbox_title">
										Maximum Seats
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">*</span>
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
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
									/>


									<div className="flex flex-col mt-[5px] lg:mt-[10px]">
										<div className="flex">
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[85px] lg:mr-[94px] ml-[1.5px] lg:ml-[2px] mb-[2px] dark:text-dark_textbox_title">
												Start Date
												<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[86px] lg:mr-[90px] mb-[2px] -ml-[4px] lg:ml-[1px] dark:text-dark_textbox_title">
												End Date
												<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
													*
												</span>
											</p>
										</div>
										<div className="flex">

											<input
												className="pr-2 lg:pr-[8px] py-[5px] pl-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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
												className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] py-[5px] pl-2 -ml-[71.5px] pr-2 lg:pr-2 lg:py-2 dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

									<div className="flex flex-col mt-[5px] lg:mt-[10px]">
										<div className="flex">
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mb-[2px] ml-[1.5px] lg:ml-[2px] dark:text-dark_textbox_title">
												Start Time
												<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 ml-[80px] lg:ml-[38.5px] mb-[2px] dark:text-dark_textbox_title">
												End Time
												<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
													*
												</span>
											</p>
										</div>
										<div className="flex">
											<input
												className="py-[5px] pl-3 pr-2 lg:pr-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[91.5px] mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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
												className="py-[5px] lg:pr-2 lg:py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-3 ml-[18px] lg:-ml-[71.5px] pr-2 dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 lg:mt-2 ml-[2px] dark:text-dark_textbox_title">
										Organizer
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">*</span>
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
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] lg:mb-[8px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
									/>
								</div>
							</div>

							<div className="lg:absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px] -mt-[70px] lg:mt-0 dark:bg-dark_mode_card dark:border-l-[#253345] dark:border-r-[#253345] dark:border-b-[#253345]">
								<button onClick={handleAddSubEvent}
									className="rounded-lg px-[12px] py-[7px] lg:px-[18px] lg:py-[10px]  bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 -mb-[6px] lg:mb-2 dark:hover:bg-slate-800 transform dark:hover:scale-105"
								>
									Save Changes
								</button>
							</div>
						</form>
					</AddSubEvent_Modal>

					<EditEvent_Modal
						isVisible={showModalEditEvent}
						onClose={() => setShowModalEditEvent(false)}>
						<form onSubmit={handleEditEventSubmit}>
							<div className="ml-[7px] lg:ml-4 mb-[70px]">
								<h3 className="text-[14px] lg:text-[20px] font-semibold text-slate-700 -mb-[7px] lg:-mb-1 mt-[9px] ml-[2px] dark:text-dark_text2">
									Edit Event
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[505px] dark:border-[#253345]" />

								<div className="w-full pr-[13px]">
									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 ml-[2px] mt-0 lg:mt-1 dark:text-dark_textbox_title">
										Event Name
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] dark:text-red-600">
											*
										</span>
									</p>
									<input
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px] dark:text-dark_textbox_title">
										Description
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] dark:text-red-600">
											*
										</span>
									</p>
									<textarea
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

									<div className="flex flex-col mt-[2px]">
										<div className="flex">
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[84px] ml-[2px] mb-[2px] dark:text-dark_textbox_title">
												Start Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] dark:text-red-600">
													*
												</span>
											</p>
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[89px] -ml-[4px] lg:ml-[10px] mb-[2px] dark:text-dark_textbox_title">
												End Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] dark:text-red-600">
													*
												</span>
											</p>
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 -ml-[4px] lg:ml-[10px] mb-[2px] dark:text-dark_textbox_title">
												Total days:
											</p>
										</div>
										<div className="flex">
											<input
												className="pr-2 lg:pr-[8px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px] py-[5px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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
												className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-2 lg:pl-3 -ml-[71.5px] pr-2 py-[5px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

											<input
												className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-2 lg:pl-3 py-[5px] w-[80px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300 ml-[19px]"
												type="number"
												value={editEventInfo.intFDurationCourse}
												onChange={e =>
													setEditEventInfo({
														...editEventInfo,
														intFDurationCourse: e.target.value,
													})
												}
											/>

										</div>
									</div>

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px] dark:text-dark_textbox_title">
										Trainer&apos;s Name
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
										type="text"
										placeholder="What is your trainer's name?"
										id="trainer_name"
										name="trainer_name"
										value={editEventInfo.intFTrainerName}
										required
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFTrainerName: e.target.value,
											})
										}
									/>

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[2px] dark:text-dark_textbox_title">
										Training Provider
										<span className="text-[12px] lg:text-[14px] text-red-500 dark:text-red-600 ml-[2px]">
											*
										</span>
									</p>
									<input
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white text-[12px] text-left dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300 mb-0 lg:-mb-[18px]"
										type="text"
										placeholder="Whos is your training provider?"
										id="training_provider"
										name="training_provider"
										value={editEventInfo.intFTrainingProvider}
										required
										onChange={e =>
											setEditEventInfo({
												...editEventInfo,
												intFTrainingProvider: e.target.value,
											})
										}
									/>
								</div>

								<div className="lg:absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px] -mb-[80px] lg:mb-0 dark:bg-dark_mode_card">

									<button
										className="rounded-lg px-[12px] py-[7px] lg:px-[18px] lg:py-[10px]  bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 mb-2 dark:font-medium transform lg:hover:scale-105 dark:hover:bg-slate-800"
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
								<h3 className="text-[14px] lg:text-[20px] font-semibold text-slate-700 -mb-[7px] lg:-mb-1 mt-[9px] ml-[2px] dark:text-dark_text2">
									Edit Sub-event
								</h3>

								<hr className="border-t-2 border-slate-200 my-4 w-[285px] lg:w-[477px] dark:border-[#253345]" />

								<div className="w-full pr-[15px]">
									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-0 ml-[2px] lg:mt-1 dark:text-dark_textbox_title">
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
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
									/>

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 lg:mt-2 ml-[2px] dark:text-dark_textbox_title">
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
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
									/>

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 lg:mt-2 ml-[1px] dark:text-dark_textbox_title">
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
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
									/>


									<div className="flex flex-col mt-[5px] lg:mt-[10px]">
										<div className="flex">
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[87px] lg:mr-[94px] ml-[1.5px] lg:ml-[2px] mb-[2px] dark:text-dark_textbox_title">
												Start Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mr-[87px] lg:mr-[90px] mb-[2px] -ml-[4px] lg:ml-[1px] dark:text-dark_textbox_title">
												End Date
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
										</div>
										<div className="flex">

											<input
												className="pr-2 lg:pr-[8px] py-[5px] pl-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mr-[90.5px] mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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
												className="rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] py-[5px] pl-2 -ml-[71.5px] pr-2 lg:pr-2 lg:py-2 dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

									<div className="flex flex-col mt-[5px] lg:mt-[10px]">
										<div className="flex">
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 mb-[2px] ml-[1.5px] lg:ml-[2px] dark:text-dark_textbox_title">
												Start Time
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
											<p className="text-[11px] lg:text-[14px] text-mb-7 font-normal text-slate-500 ml-[80px] lg:ml-[38.5px] mb-[2px] dark:text-dark_textbox_title">
												End Time
												<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
													*
												</span>
											</p>
										</div>
										<div className="flex">
											<input
												className="py-[5px] pl-3 pr-2 lg:pr-2 lg:py-2 lg:pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white lg:mr-[91.5px] mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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
												className="py-[5px] lg:pr-2 lg:py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm text-slate-500 focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] pl-3 ml-[18px] lg:-ml-[71.5px] pr-2 dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
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

									<p className="text-[11px] lg:text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-1 lg:mt-2 ml-[2px] dark:text-dark_textbox_title">
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
										className="w-full pr-[10px] lg:pr-[11px] py-[6px] lg:py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-[12px] lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] dark:bg-dark_textbox dark:border-dark_textbox_line dark:placeholder-dark_placeholder_text dark:text-slate-300"
									/>
								</div>
							</div>

							<div className="lg:absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center gap-[2px] -mt-[68px] lg:mt-0 dark:bg-dark_mode_card">
								<button
									className="rounded-lg px-[12px] py-[7px] lg:px-[18px] lg:py-[10px]  bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 lg:mb-1 dark:font-medium transform lg:hover:scale-105 dark:hover:bg-slate-800"
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

				{/* Mobile View */}
				<div className="md:hidden mt-2">
					<button
						className="bg-slate-800 rounded h-[40px] w-full font-medium hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm hover:text-slate-50 hover:transition duration-300 transform hover:scale-105 cursor-pointer flex items-center justify-center ml-1 dark:hover:bg-slate-800"
						onClick={() => setShowModalCreateEvent(true)}
					>
						<IoIosAddCircleOutline className="text-[23px] text-slate-100" />
						<span className="text-slate-100 ml-1 text-[13px] -mt-[0px]">Add Events</span>
					</button>
				</div>

			</div>

			{
				viewMode === 1 ? (
					<div className="w-full bg-slate-100 grid lg:grid-cols-[1fr_32%] pb-[400px] lg:pb-28 gap-4 dark:bg-dark_mode_bg">

						{/* PC View */}
						<div className="hidden md:grid grid-auto-fit-lg lg:grid-cols-2 gap-4 ml-1 ">

							{latestEvent[0] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[535px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[0].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?social",
												latestEvent[0]?.intFID,
												latestEvent[0]?.intFEventName,
												latestEvent[0]?.intFEventDescription,
												latestEvent[0]?.intFEventStartDate,
												latestEvent[0]?.intFEventEndDate,
												latestEvent[0]?.intFDurationCourse,
												latestEvent[0]?.intFTrainerName,
												latestEvent[0]?.intFTrainingProvider,
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
												"https://source.unsplash.com/600x300?social",
												latestEvent[0]?.intFID,
												latestEvent[0]?.intFEventName,
												latestEvent[0]?.intFEventDescription,
												latestEvent[0]?.intFEventStartDate,
												latestEvent[0]?.intFEventEndDate,
												latestEvent[0]?.intFDurationCourse,
												latestEvent[0]?.intFTrainerName,
												latestEvent[0]?.intFTrainingProvider,
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
												src="https://source.unsplash.com/600x300?social"
												alt="Random"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									{latestEvent[0] && (
										<div className="mt-6">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-[26px] font-semibold mb-2 text-slate-800 dark:text-dark_text">
													{latestEvent[0].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 -mt-[3px] -mr-[10px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[25px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-4 dark:text-[#7B756B] text-[18px]">
												{latestEvent[0].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[0].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[0].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[0].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<FiClock className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[15px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[0].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[0].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[0].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[13px] text-gray-600 mt-2 flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="mr-[2px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}

											<div className="flex justify-between items-end mt-5">
												{eventsWithDaysLeft.slice(0, 1).map((event, index) => (
													<div key={index}>
														<span className={`relative -mt-[35px] px-[10px] py-[5px] font-semibold text-red-900 text-[13px] flex items-center dark:text-red-200 ${event.daysLeft <= 1 ? 'shake' : ''}`}>
															<span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full dark:bg-red-900"></span>
															<FiClock className="mr-1 text-2xl font-bold relative" />
															<span className="relative mt-[0px] leading-3 ml-1">{event.daysLeft} Days Left</span>
														</span>
													</div>
												))}

												{eventsWithDaysLeft.every(event => event.daysLeft === 0) ? (
													<span className="relative px-3 py-[5px] font-semibold text-green-900 dark:text-green-200 text-[13px] flex items-center">
														<span aria-hidden className="absolute inset-0 bg-green-200 dark:bg-green-900 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
														<span className="relative mt-[0px] leading-3 tracking-wider">
															Today
														</span>
													</span>
												) : (
													eventsWithDaysLeft.some(event => event.daysLeft === 1) ? (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Tomorrow
															</span>
														</span>
													) : (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Upcoming
															</span>
														</span>
													)
												)}
											</div>
										</div>
									)}
								</div>
							)}

							{latestEvent[1] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[535px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[1].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?birthday",
												latestEvent[1]?.intFID,
												latestEvent[1]?.intFEventName,
												latestEvent[1]?.intFEventDescription,
												latestEvent[1]?.intFEventStartDate,
												latestEvent[1]?.intFEventEndDate,
												latestEvent[1]?.intFDurationCourse,
												latestEvent[1]?.intFTrainerName,
												latestEvent[1]?.intFTrainingProvider,
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
												"https://source.unsplash.com/600x300?birthday",
												latestEvent[1]?.intFID,
												latestEvent[1]?.intFEventName,
												latestEvent[1]?.intFEventDescription,
												latestEvent[1]?.intFEventStartDate,
												latestEvent[1]?.intFEventEndDate,
												latestEvent[1]?.intFDurationCourse,
												latestEvent[1]?.intFTrainerName,
												latestEvent[1]?.intFTrainingProvider,
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
												<h2 className="text-[26px] font-semibold mb-2 text-slate-800 dark:text-dark_text">
													{latestEvent[1].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 -mt-[3px] -mr-[10px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[25px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-4 dark:text-[#7B756B] text-[18px]">
												{latestEvent[1].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[1].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[1].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[1].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<FiClock className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[15px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[1].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[1].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[1].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[13px] text-gray-600 mt-2 flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="mr-[2px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}

											<div className="flex justify-between items-end mt-5">
												{eventsWithDaysLeft.slice(1, 2).map((event, index) => (
													<div key={index}>
														<span className={`relative -mt-[35px] px-[10px] py-[5px] font-semibold text-red-900 text-[13px] flex items-center dark:text-red-200 ${event.daysLeft <= 1 ? 'shake' : ''}`}>
															<span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full dark:bg-red-900"></span>
															<FiClock className="mr-1 text-2xl font-bold relative" />
															<span className="relative mt-[0px] leading-3 ml-1">{event.daysLeft} Days Left</span>
														</span>
													</div>
												))}

												{eventsWithDaysLeft.every(event => event.daysLeft === 0) ? (
													<span className="relative px-3 py-[5px] font-semibold text-green-900 dark:text-green-200 text-[13px] flex items-center">
														<span aria-hidden className="absolute inset-0 bg-green-200 dark:bg-green-900 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
														<span className="relative mt-[0px] leading-3 tracking-wider">
															Today
														</span>
													</span>
												) : (
													eventsWithDaysLeft.some(event => event.daysLeft === 1) ? (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Tomorrow
															</span>
														</span>
													) : (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Upcoming
															</span>
														</span>
													)
												)}
											</div>
										</div>
									)}
								</div>
							)}

							{latestEvent[2] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[535px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[2].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?new+year",
												latestEvent[2]?.intFID,
												latestEvent[2]?.intFEventName,
												latestEvent[2]?.intFEventDescription,
												latestEvent[2]?.intFEventStartDate,
												latestEvent[2]?.intFEventEndDate,
												latestEvent[2]?.intFDurationCourse,
												latestEvent[2]?.intFTrainerName,
												latestEvent[2]?.intFTrainingProvider,
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
												latestEvent[2]?.intFDurationCourse,
												latestEvent[2]?.intFTrainerName,
												latestEvent[2]?.intFTrainingProvider,
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
												<h2 className="text-[26px] font-semibold mb-2 text-slate-800 dark:text-dark_text">
													{latestEvent[2].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 -mt-[3px] -mr-[10px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[25px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-4 dark:text-[#7B756B] text-[18px]">
												{latestEvent[2].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[2].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[2].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[2].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<FiClock className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[15px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[2].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[2].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[2].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[13px] text-gray-600 mt-2 flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="mr-[2px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}

											<div className="flex justify-between items-end mt-5">
												{eventsWithDaysLeft.slice(2, 3).map((event, index) => (
													<div key={index}>
														<span className={`relative -mt-[35px] px-[10px] py-[5px] font-semibold text-red-900 text-[13px] flex items-center dark:text-red-200 ${event.daysLeft <= 1 ? 'shake' : ''}`}>
															<span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full dark:bg-red-900"></span>
															<FiClock className="mr-1 text-2xl font-bold relative" />
															<span className="relative mt-[0px] leading-3 ml-1">{event.daysLeft} Days Left</span>
														</span>
													</div>
												))}

												{eventsWithDaysLeft.every(event => event.daysLeft === 0) ? (
													<span className="relative px-3 py-[5px] font-semibold text-green-900 dark:text-green-200 text-[13px] flex items-center">
														<span aria-hidden className="absolute inset-0 bg-green-200 dark:bg-green-900 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
														<span className="relative mt-[0px] leading-3 tracking-wider">
															Today
														</span>
													</span>
												) : (
													eventsWithDaysLeft.some(event => event.daysLeft === 1) ? (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Tomorrow
															</span>
														</span>
													) : (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Upcoming
															</span>
														</span>
													)
												)}
											</div>
										</div>
									)}
								</div>
							)}

							{latestEvent[3] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[535px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[3].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?events",
												latestEvent[3]?.intFID,
												latestEvent[3]?.intFEventName,
												latestEvent[3]?.intFEventDescription,
												latestEvent[3]?.intFEventStartDate,
												latestEvent[3]?.intFEventEndDate,
												latestEvent[3]?.intFDurationCourse,
												latestEvent[3]?.intFTrainerName,
												latestEvent[3]?.intFTrainingProvider,
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
												latestEvent[3]?.intFDurationCourse,
												latestEvent[3]?.intFTrainerName,
												latestEvent[3]?.intFTrainingProvider,
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
												<h2 className="text-[26px] font-semibold mb-2 text-slate-800 dark:text-dark_text">
													{latestEvent[3].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 -mt-[3px] -mr-[10px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[25px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-4 dark:text-[#7B756B] text-[18px]">
												{latestEvent[3].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[3].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[3].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[3].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<FiClock className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[15px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[3].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[3].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[3].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[13px] text-gray-600 mt-2 flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="mr-[2px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}

											<div className="flex justify-between items-end mt-5">
												{eventsWithDaysLeft.slice(3, 4).map((event, index) => (
													<div key={index}>
														<span className={`relative -mt-[35px] px-[10px] py-[5px] font-semibold text-red-900 text-[13px] flex items-center dark:text-red-200 ${event.daysLeft <= 1 ? 'shake' : ''}`}>
															<span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full dark:bg-red-900"></span>
															<FiClock className="mr-1 text-2xl font-bold relative" />
															<span className="relative mt-[0px] leading-3 ml-1">{event.daysLeft} Days Left</span>
														</span>
													</div>
												))}

												{eventsWithDaysLeft.every(event => event.daysLeft === 0) ? (
													<span className="relative px-3 py-[5px] font-semibold text-green-900 dark:text-green-200 text-[13px] flex items-center">
														<span aria-hidden className="absolute inset-0 bg-green-200 dark:bg-green-900 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
														<span className="relative mt-[0px] leading-3 tracking-wider">
															Today
														</span>
													</span>
												) : (
													eventsWithDaysLeft.some(event => event.daysLeft === 1) ? (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Tomorrow
															</span>
														</span>
													) : (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Upcoming
															</span>
														</span>
													)
												)}
											</div>
										</div>
									)}
								</div>
							)}

							{latestEvent[4] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[535px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[4].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?balloon",
												latestEvent[4]?.intFID,
												latestEvent[4]?.intFEventName,
												latestEvent[4]?.intFEventDescription,
												latestEvent[4]?.intFEventStartDate,
												latestEvent[4]?.intFEventEndDate,
												latestEvent[4]?.intFDurationCourse,
												latestEvent[4]?.intFTrainerName,
												latestEvent[4]?.intFTrainingProvider,
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
												latestEvent[4]?.intFDurationCourse,
												latestEvent[4]?.intFTrainerName,
												latestEvent[4]?.intFTrainingProvider,
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
												<h2 className="text-[26px] font-semibold mb-2 text-slate-800 dark:text-dark_text">
													{latestEvent[4].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 -mt-[3px] -mr-[10px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[25px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-4 dark:text-[#7B756B] text-[18px]">
												{latestEvent[4].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[4].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[4].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[4].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<FiClock className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[15px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[4].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[4].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[4].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[13px] text-gray-600 mt-2 flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="mr-[2px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}

											<div className="flex justify-between items-end mt-5">
												{eventsWithDaysLeft.slice(4, 5).map((event, index) => (
													<div key={index}>
														<span className={`relative -mt-[35px] px-[10px] py-[5px] font-semibold text-red-900 text-[13px] flex items-center dark:text-red-200 ${event.daysLeft <= 1 ? 'shake' : ''}`}>
															<span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full dark:bg-red-900"></span>
															<FiClock className="mr-1 text-2xl font-bold relative" />
															<span className="relative mt-[0px] leading-3 ml-1">{event.daysLeft} Days Left</span>
														</span>
													</div>
												))}

												{eventsWithDaysLeft.every(event => event.daysLeft === 0) ? (
													<span className="relative px-3 py-[5px] font-semibold text-green-900 dark:text-green-200 text-[13px] flex items-center">
														<span aria-hidden className="absolute inset-0 bg-green-200 dark:bg-green-900 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
														<span className="relative mt-[0px] leading-3 tracking-wider">
															Today
														</span>
													</span>
												) : (
													eventsWithDaysLeft.some(event => event.daysLeft === 1) ? (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Tomorrow
															</span>
														</span>
													) : (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Upcoming
															</span>
														</span>
													)
												)}
											</div>
										</div>
									)}
								</div>
							)}

							{latestEvent[5] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[535px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[5].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?beers",
												latestEvent[5]?.intFID,
												latestEvent[5]?.intFEventName,
												latestEvent[5]?.intFEventDescription,
												latestEvent[5]?.intFEventStartDate,
												latestEvent[5]?.intFEventEndDate,
												latestEvent[5]?.intFDurationCourse,
												latestEvent[5]?.intFTrainerName,
												latestEvent[5]?.intFTrainingProvider,
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
												latestEvent[5]?.intFDurationCourse,
												latestEvent[5]?.intFTrainerName,
												latestEvent[5]?.intFTrainingProvider,
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
												<h2 className="text-[26px] font-semibold mb-2 text-slate-800 dark:text-dark_text">
													{latestEvent[5].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 -mt-[3px] -mr-[10px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[25px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-4 dark:text-[#7B756B] text-[18px]">
												{latestEvent[5].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[5].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[5].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[5].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<FiClock className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[15px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[5].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-3">
																<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[5].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-3">
															<FaLocationDot className="text-[28px] mr-2 text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[15px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[5].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[13px] text-gray-600 mt-2 flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="mr-[2px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}

											<div className="flex justify-between items-end mt-5">
												{eventsWithDaysLeft.slice(5, 6).map((event, index) => (
													<div key={index}>
														<span className={`relative -mt-[35px] px-[10px] py-[5px] font-semibold text-red-900 text-[13px] flex items-center dark:text-red-200 ${event.daysLeft <= 1 ? 'shake' : ''}`}>
															<span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full dark:bg-red-900"></span>
															<FiClock className="mr-1 text-2xl font-bold relative" />
															<span className="relative mt-[0px] leading-3 ml-1">{event.daysLeft} Days Left</span>
														</span>
													</div>
												))}

												{eventsWithDaysLeft.every(event => event.daysLeft === 0) ? (
													<span className="relative px-3 py-[5px] font-semibold text-green-900 dark:text-green-200 text-[13px] flex items-center">
														<span aria-hidden className="absolute inset-0 bg-green-200 dark:bg-green-900 opacity-50 rounded-full"></span>
														<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
														<span className="relative mt-[0px] leading-3 tracking-wider">
															Today
														</span>
													</span>
												) : (
													eventsWithDaysLeft.some(event => event.daysLeft === 1) ? (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Tomorrow
															</span>
														</span>
													) : (
														<span className="relative px-3 py-[5px] font-semibold text-orange-900 dark:text-[#BF7B5F] text-[13px] flex items-center">
															<span aria-hidden className="absolute inset-0 bg-orange-200 dark:bg-[#3F290E] opacity-50 rounded-full"></span>
															<AiOutlineFieldTime className="mr-1 text-[28px] font-bold relative" />
															<span className="relative mt-[0px] leading-3 tracking-wider">
																Upcoming
															</span>
														</span>
													)
												)}
											</div>
										</div>
									)}
								</div>
							)}

						</div>

						{/* Mobile View */}
						<div className="grid md:hidden grid-cols-1 gap-[8px] ml-1 -mr-[4.5px] -mt-2">

							{latestEvent[0] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[0].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?social",
												latestEvent[0]?.intFID,
												latestEvent[0]?.intFEventName,
												latestEvent[0]?.intFEventDescription,
												latestEvent[0]?.intFEventStartDate,
												latestEvent[0]?.intFEventEndDate,
												latestEvent[0]?.intFDurationCourse,
												latestEvent[0]?.intFTrainerName,
												latestEvent[0]?.intFTrainingProvider,
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
												"https://source.unsplash.com/600x300?social",
												latestEvent[0]?.intFID,
												latestEvent[0]?.intFEventName,
												latestEvent[0]?.intFEventDescription,
												latestEvent[0]?.intFEventStartDate,
												latestEvent[0]?.intFEventEndDate,
												latestEvent[0]?.intFDurationCourse,
												latestEvent[0]?.intFTrainerName,
												latestEvent[0]?.intFTrainingProvider,
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
												src="https://source.unsplash.com/600x300?social"
												alt="Random"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>

									{latestEvent[0] && (
										<div className="mt-4 -ml-2">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-[18px] font-semibold mb-1 text-slate-800 dark:text-dark_text">
													{latestEvent[0].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 mt-[0px] -mr-[14px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[18px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-[10px] dark:text-[#7B756B] text-[13px]">
												{latestEvent[0].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[0].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[0].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[6px]">
															<HiMiniCalendarDays className="text-[25px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[0].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<FiClock className="text-[24px] mr-[6px] -mt-[1px] text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[0].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<p className="text-slate-600 text-[12px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[0].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[10px]">
															<FaLocationDot className="text-[24px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[0].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-[343px] h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[11px] text-gray-600 mt-[5px] flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="-mr-[6px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}
										</div>
									)}
								</div>
							)}

							{latestEvent[1] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[1].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?birthday",
												latestEvent[1]?.intFID,
												latestEvent[1]?.intFEventName,
												latestEvent[1]?.intFEventDescription,
												latestEvent[1]?.intFEventStartDate,
												latestEvent[1]?.intFEventEndDate,
												latestEvent[1]?.intFDurationCourse,
												latestEvent[1]?.intFTrainerName,
												latestEvent[1]?.intFTrainingProvider,
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
												"https://source.unsplash.com/600x300?birthday",
												latestEvent[1]?.intFID,
												latestEvent[1]?.intFEventName,
												latestEvent[1]?.intFEventDescription,
												latestEvent[1]?.intFEventStartDate,
												latestEvent[1]?.intFEventEndDate,
												latestEvent[1]?.intFDurationCourse,
												latestEvent[1]?.intFTrainerName,
												latestEvent[1]?.intFTrainingProvider,
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
										<div className="mt-4 -ml-2">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-[18px] font-semibold mb-1 text-slate-800 dark:text-dark_text">
													{latestEvent[1].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 mt-[0px] -mr-[14px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[18px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-[10px] dark:text-[#7B756B] text-[13px]">
												{latestEvent[1].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[1].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[1].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[6px]">
															<HiMiniCalendarDays className="text-[25px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[1].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<FiClock className="text-[24px] mr-[6px] -mt-[1px] text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[1].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<p className="text-slate-600 text-[12px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[1].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[10px]">
															<FaLocationDot className="text-[24px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[1].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-[343px] h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[11px] text-gray-600 mt-[5px] flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="-mr-[6px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}
										</div>
									)}
								</div>
							)}

							{latestEvent[2] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[2].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?new+year",
												latestEvent[2]?.intFID,
												latestEvent[2]?.intFEventName,
												latestEvent[2]?.intFEventDescription,
												latestEvent[2]?.intFEventStartDate,
												latestEvent[2]?.intFEventEndDate,
												latestEvent[2]?.intFDurationCourse,
												latestEvent[2]?.intFTrainerName,
												latestEvent[2]?.intFTrainingProvider,
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
												latestEvent[2]?.intFDurationCourse,
												latestEvent[2]?.intFTrainerName,
												latestEvent[2]?.intFTrainingProvider,
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
										<div className="mt-4 -ml-2">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-[18px] font-semibold mb-1 text-slate-800 dark:text-dark_text">
													{latestEvent[2].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 mt-[0px] -mr-[14px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[18px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-[10px] dark:text-[#7B756B] text-[13px]">
												{latestEvent[2].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[2].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[2].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[6px]">
															<HiMiniCalendarDays className="text-[25px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[2].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<FiClock className="text-[24px] mr-[6px] -mt-[1px] text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[2].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<p className="text-slate-600 text-[12px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[2].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[10px]">
															<FaLocationDot className="text-[24px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[2].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-[343px] h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[11px] text-gray-600 mt-[5px] flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="-mr-[6px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}
										</div>
									)}
								</div>
							)}

							{latestEvent[3] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[3].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?events",
												latestEvent[3]?.intFID,
												latestEvent[3]?.intFEventName,
												latestEvent[3]?.intFEventDescription,
												latestEvent[3]?.intFEventStartDate,
												latestEvent[3]?.intFEventEndDate,
												latestEvent[3]?.intFDurationCourse,
												latestEvent[3]?.intFTrainerName,
												latestEvent[3]?.intFTrainingProvider,
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
												latestEvent[3]?.intFDurationCourse,
												latestEvent[3]?.intFTrainerName,
												latestEvent[3]?.intFTrainingProvider,
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
										<div className="mt-4 -ml-2">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-[18px] font-semibold mb-1 text-slate-800 dark:text-dark_text">
													{latestEvent[3].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 mt-[0px] -mr-[14px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[18px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-[10px] dark:text-[#7B756B] text-[13px]">
												{latestEvent[3].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[3].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[3].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[6px]">
															<HiMiniCalendarDays className="text-[25px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[3].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<FiClock className="text-[24px] mr-[6px] -mt-[1px] text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[3].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<p className="text-slate-600 text-[12px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[3].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[10px]">
															<FaLocationDot className="text-[24px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[3].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-[343px] h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[11px] text-gray-600 mt-[5px] flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="-mr-[6px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}
										</div>
									)}
								</div>
							)}

							{latestEvent[4] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[4].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?balloon",
												latestEvent[4]?.intFID,
												latestEvent[4]?.intFEventName,
												latestEvent[4]?.intFEventDescription,
												latestEvent[4]?.intFEventStartDate,
												latestEvent[4]?.intFEventEndDate,
												latestEvent[4]?.intFDurationCourse,
												latestEvent[4]?.intFTrainerName,
												latestEvent[4]?.intFTrainingProvider,
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
												latestEvent[4]?.intFDurationCourse,
												latestEvent[4]?.intFTrainerName,
												latestEvent[4]?.intFTrainingProvider,
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
										<div className="mt-4 -ml-2">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-[18px] font-semibold mb-1 text-slate-800 dark:text-dark_text">
													{latestEvent[4].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 mt-[0px] -mr-[14px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[18px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-[10px] dark:text-[#7B756B] text-[13px]">
												{latestEvent[4].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[4].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[4].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[6px]">
															<HiMiniCalendarDays className="text-[25px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[4].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<FiClock className="text-[24px] mr-[6px] -mt-[1px] text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[4].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<p className="text-slate-600 text-[12px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[4].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[10px]">
															<FaLocationDot className="text-[24px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[4].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-[343px] h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[11px] text-gray-600 mt-[5px] flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="-mr-[6px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}
										</div>
									)}
								</div>
							)}

							{latestEvent[5] && (
								<div
									className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] w-full relative flex flex-col transition transform hover:scale-105 dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]"
									onClick={() => {
										const filteredSubEvent = subEvents.find(subEvent => subEvent.sub_eventsMainID === latestEvent[5].intFID);

										console.log(filteredSubEvent);

										if (filteredSubEvent) {
											openModal(
												"https://source.unsplash.com/600x300?beers",
												latestEvent[5]?.intFID,
												latestEvent[5]?.intFEventName,
												latestEvent[5]?.intFEventDescription,
												latestEvent[5]?.intFEventStartDate,
												latestEvent[5]?.intFEventEndDate,
												latestEvent[5]?.intFDurationCourse,
												latestEvent[5]?.intFTrainerName,
												latestEvent[5]?.intFTrainingProvider,
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
												latestEvent[5]?.intFDurationCourse,
												latestEvent[5]?.intFTrainerName,
												latestEvent[5]?.intFTrainingProvider,
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
										<div className="mt-4 -ml-2">
											{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
											<div className="flex justify-between items-center">
												<h2 className="text-[18px] font-semibold mb-1 text-slate-800 dark:text-dark_text">
													{latestEvent[5].intFEventName}
												</h2>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<div className="rounded-full bg-slate-100 p-[6px] opacity-80 hover:opacity-90 mt-[0px] -mr-[14px] cursor-pointer dark:bg-[#1C1E1E]">
															{/* <ThreeDotIcon /> */}
															<BiDotsVerticalRounded className="text-[18px] text-slate-800 dark:text-dark_text" />
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
											<p className="text-gray-500 mb-[10px] dark:text-[#7B756B] text-[13px]">
												{latestEvent[5].intFEventDescription}
											</p>
											{/* <div className="flex items-center mt-4">
												<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 dark:text-dark_text" />
												<p className="text-slate-600 text-sm dark:text-dark_text">
													{formatDate(latestEvent[5].intFEventStartDate)}
												</p>
											</div> */}

											{subEvents.length > 0 && (
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[5].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1) // Take only the first sub event
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[6px]">
															<HiMiniCalendarDays className="text-[25px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] dark:text-dark_text mt-[1px]">
																{formatDate(subEvent.sub_eventsStartDate)}
															</p>
														</div>
													))
											)}

											<div className="flex">
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[5].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<FiClock className="text-[24px] mr-[6px] -mt-[1px] text-slate-800 dark:text-dark_text" />
																<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																	{formatTime(subEvent.sub_eventsStartTime)}
																</p>
															</div>
														))}
												{subEvents.length > 0 &&
													subEvents
														.filter(subEvent => {
															const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
															const currentDate = new Date();
															return (
																subEvent.sub_eventsMainID === latestEvent[5].intFID &&
																(subEventStartDate.toDateString() === currentDate.toDateString() ||
																	subEventStartDate > currentDate)
															);
														})
														.slice(0, 1)
														.map((subEvent, index) => (
															<div key={index} className="flex items-center mt-[10px]">
																<p className="text-slate-600 text-[12px] -mt-[2px] dark:text-dark_text ml-1">
																	- {formatTime(subEvent.sub_eventsEndTime)}
																</p>
															</div>
														))}
											</div>

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const subEventStartDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[5].intFID &&
															(subEventStartDate.toDateString() === currentDate.toDateString() ||
																subEventStartDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => (
														<div key={index} className="flex items-center mt-[10px]">
															<FaLocationDot className="text-[24px] mr-[6px] text-slate-800 dark:text-dark_text" />
															<p className="text-slate-600 text-[12px] ml-[1px] -mt-[2px] dark:text-dark_text">
																{subEvent.sub_eventsVenue}
															</p>
														</div>
													))}

											{subEvents.length > 0 &&
												subEvents
													.filter(subEvent => {
														const startDate = new Date(subEvent.sub_eventsStartDate);
														const currentDate = new Date();
														return (
															subEvent.sub_eventsMainID === latestEvent[5].intFID &&
															(startDate.toDateString() === currentDate.toDateString() || startDate > currentDate)
														);
													})
													.slice(0, 1)
													.map((subEvent, index) => {
														const currentAttendees = Number(subEvent.sub_eventsCurrentAttendees) || 0;
														const maxAttendees = Number(subEvent.sub_eventsMaxSeats) || 0;

														const isOverCapacity = currentAttendees > maxAttendees;

														return (
															<div key={index}>
																<div className="mt-4 w-[343px] h-[10px] bg-gray-200 rounded-full relative dark:bg-[#25282A]">
																	<div
																		className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : "bg-orange-300 dark:bg-[#864502]"
																			} animate-blink `}
																		style={{
																			width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%`,
																		}}
																	></div>
																</div>
																<div className="text-[11px] text-gray-600 mt-[5px] flex justify-between">
																	<span className="ml-[2px] dark:text-dark_text">
																		Current Attendees: {currentAttendees}
																	</span>
																	<span className="-mr-[6px] dark:text-dark_text">
																		Max Attendees: {maxAttendees}
																	</span>
																</div>
															</div>
														);
													})}
										</div>
									)}
								</div>
							)}

						</div>

						<Calendar onDateChange={handleDateChange} />

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
														event.intFDurationCourse,
														event.intFTrainerName,
														event.intFTrainingProvider,
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
														"https://source.unsplash.com/600x300?social",
														event.intFID,
														event.intFEventName,
														event.intFEventDescription,
														event.intFEventStartDate,
														event.intFEventEndDate,
														event.intFDurationCourse,
														event.intFTrainerName,
														event.intFTrainingProvider,
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
														event.intFDurationCourse,
														event.intFTrainerName,
														event.intFTrainingProvider,
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
