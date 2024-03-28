"use client";

import Image from "next/image";
import { Fragment, useState, useEffect, SetStateAction } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Modal from "@/components/Modal";

// Import icons from react-icons
import { BiCalendar } from "react-icons/bi";
import { useParams, useRouter } from "next/navigation";
import cookie from 'js-cookie';
import toast from "react-hot-toast";
import { sendParticipationCert } from "@/lib/api";

type Info = {
	attFormsAttendanceID: string;
	attFormsStaffName: string;
	attFormsStaffID: string;
	attFormsStaffEmail: string;
	attFormsFacultyUnit: string;
};

type FacultyUnit = {
	attsID: string;
	attsName: string;
	attsCategory: number;
	attsSubcategory: number;
	attsType: number;
	attsPosition: number;
	attsFacultyUnit: number;
};

export default function AttendanceForm() {
	const supabase = createClientComponentClient();
	const [info, setInfo] = useState<Info>({} as Info);
	const [eventData, setEventData] = useState<any>(null);
	const [authToken, setAuthToken] = useState<any>("")

	const [showModalSuccess, setShowModalSuccess] = useState(false);
	const [showModalFailure, setShowModalFailure] = useState(false);

	const [attendance_id, setAttendanceID] = useState("");

	// Get the Event ID from the link,
	const { sub_id } = useParams();
	const router = useRouter();

	const [userType, setUserType] = useState('');

	const handleUserTypeChange = (event: { target: { value: SetStateAction<string>; }; }) => {
		setUserType(event.target.value);
		setInfo({ ...info, attFormsFacultyUnit: "" });
	};

	useEffect(() => {
		setAuthToken(cookie.get('authToken'))

		const fetchEventData = async () => {
			// Fetch the event_id associated with the given attendance_list ID
			const { data: attendanceListData, error: attendanceListError } = await supabase
				.from('sub_events')
				.select('sub_eventsID, sub_eventsMainID, sub_eventsName, sub_eventsVenue, sub_eventsStartDate, sub_eventsEndDate, sub_eventsStartTime, sub_eventsEndTime')
				.eq('sub_eventsID', sub_id);

			if (attendanceListError || attendanceListData.length == 0) {
				// console.error('Error fetching attendance list data:', attendanceListError);
				toast.error("The event associated with this link doesn't exist. Please contact the developers if you think this was a mistake.")
				router.push('/notFound');
				return;
			}

			const eventStartDate = new Date(attendanceListData[0].sub_eventsStartDate);
			const currentStartDate = new Date(eventStartDate.toDateString());
			const eventEndDate = new Date(attendanceListData[0].sub_eventsEndDate);
			const currentEndDate = new Date(eventEndDate.toDateString());

			// Get the start time and end time of the event,
			const eventEndTimeStr = attendanceListData[0].sub_eventsEndTime;
			const eventStartTimeStr = attendanceListData[0].sub_eventsStartTime;

			// Split the time to hours, minutes and seconds.
			const [hoursEnd, minutesEnd, secondsEnd] = eventEndTimeStr.split(':');
			const [hoursStart, minutesStart, secondsStart] = eventStartTimeStr.split(':');

			// Set the start time,
			const eventStartTime = new Date(currentStartDate);
			eventStartTime.setHours(Number(hoursStart));
			eventStartTime.setMinutes(Number(minutesStart));
			eventStartTime.setSeconds(Number(secondsStart));

			// Set the end time,
			const eventEndTime = new Date(currentEndDate);
			eventEndTime.setHours(Number(hoursEnd));
			eventEndTime.setMinutes(Number(minutesEnd));
			eventEndTime.setSeconds(Number(secondsEnd));

			const currentTime = new Date();

			const startTimeWindow = new Date(eventStartTime);
			startTimeWindow.setMinutes(startTimeWindow.getMinutes() - 15);
			const endTimeWindow = new Date(eventEndTime);
			endTimeWindow.setMinutes(endTimeWindow.getMinutes() + 15);

			const event_id = attendanceListData[0]?.sub_eventsMainID;

			// Check if the current time is AFTER the event start date and time,
			if (currentTime > endTimeWindow) {
				const { data: eventDetails, error: eventError } = await supabase
					.from('internal_events')
					.select('intFEventName')
					.eq('intFID', event_id);
				router.push(`/notFound?from=end_att&event_name=${eventDetails![0].intFEventName}`);
				return;
			}

			// Check if the current time is BEFORE the event start date and time,
			if (currentTime < startTimeWindow) {
				const { data: eventDetails, error: eventError } = await supabase
					.from('internal_events')
					.select('intFEventName')
					.eq('intFID', event_id);
				const eventStartTimeString = startTimeWindow.toISOString();
				router.push(`/notFound?from=start_att&time=${eventStartTimeString}&event_id=${sub_id}&event_name=${eventDetails![0].intFEventName}`);
				return;
			}

			setEventData(attendanceListData);

			if (event_id) {
				// Fetch the event details based on the event_id
				const { data: eventDetails, error: eventError } = await supabase
					.from('internal_events')
					.select('intFEventName')
					.eq('intFID', event_id);

				if (eventError) {
					// console.error('Error fetching event details:', eventError);
				} else {
					const combinedData = {
						...attendanceListData[0],
						intFEventName: eventDetails[0]?.intFEventName
					};

					setEventData(combinedData);
				}
			}
		};

		fetchEventData();
	}, [sub_id, supabase, router]);


	const [formSubmitted, setFormSubmitted] = useState(false);


	// Handle data submission
	const handleSubmit = async () => {
		// e.preventDefault();

		setFormSubmitted(true);

		const isValidEmail = validateEmail(info.attFormsStaffEmail);

		if (!isValidEmail) {
			toast.error("Please input the email in a valid format.")
			return;
		}

		if (userType == 'visitor') {
			info.attFormsStaffID = '0';
			info.attFormsFacultyUnit = 'Visitor';
		} else {
			if (!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit || !info.attFormsStaffEmail) {
				return;
			}
		}

		let attFormsStaffID = info.attFormsStaffID.trim().toUpperCase();

		if (userType == 'staff') {
			attFormsStaffID = attFormsStaffID.replace(/\s/g, '');

			if (!attFormsStaffID.startsWith("SS")) {
				attFormsStaffID = "SS" + attFormsStaffID;
			}
		}

		const { data: existingForms, error: existingFormsError } = await supabase
			.from("attendance_forms")
			.select()
			.eq("attFSubEventID", sub_id)
			.eq("attFormsStaffID", attFormsStaffID);

		if (existingForms && existingForms.length > 0 && userType != 'visitor') {
			setShowModalFailure(true);
			return;
		} else {
			const { data: oldForms, error } = await supabase
				.from("attendance_forms")
				.upsert([
					{
						attFSubEventID: sub_id,
						attFormsStaffName: info.attFormsStaffName,
						attFormsStaffEmail: info.attFormsStaffEmail,
						attFormsStaffID: attFormsStaffID,
						attFormsFacultyUnit: info.attFormsFacultyUnit,
					},
				])
				.select();

			if (error) {
				// console.error("Error inserting data:", error);
			} else {
				// console.log("Data inserted successfully:", data);
				// setInfo({} as Info);
				// setShowModalSuccess(true);

				// Redirect to the desired page after form submission

				const { data: newForms, error } = await supabase
					.from("attendance_forms")
					.select("attFormsID, attDateSubmitted")
					.eq("attFormsID", oldForms[0].attFormsID);

				// if (error) {

				// } else {
				// 	// const participationData = {
				// 	// 	sub_eventsName: eventData.sub_eventsName,
				// 	// 	eventName: eventData.intFEventName,
				// 	// 	// eventVenue: eventData.sub_eventsVenue,
				// 	// 	eventStartDate: formatDate(eventData.sub_eventsStartDate),
				// 	// 	// eventEndDate: formatDate(eventData.sub_eventsEndDate),
				// 	// 	attFormsStaffName: info.attFormsStaffName,
				// 	// 	attFormsStaffID: info.attFormsStaffID,
				// 	// 	attFormsStaffEmail: info.attFormsStaffEmail,
				// 	// 	attDateSubmitted: newForms[0].attDateSubmitted,
				// 	// 	attFormsID: newForms[0].attFormsID,
				// 	// 	eventVenue: eventData.sub_eventsVenue
				// 	// };

				// 	// sendParticipationCert(participationData);

				// }
			}
		}



		// setInfo({} as Info);
	};

	// const handleOK = () => {
	// 	setShowModalSuccess(false);
	// 	setShowModalFailure(false);
	// 	window.location.reload();
	// };

	// Fetch the attendance forms settings,
	const [facultyOptions, setFacultyOptions] = useState<string[]>([]);
	// const [facultyStudents, setFacultyStudents] = useState<string[]>([]);
	const [facultyStudents, setFacultyStudents] = useState<{ facultyName: string; facultyCategory: number; }[]>([]);
	const [facultyUnits, setFacultyUnits] = useState<FacultyUnit[]>([]);

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
				// .select('attsName')
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


	const [categories, setCategories] = useState<{ id: number; category: number; name: string; subcategories: { name: string; facultyUnit: number }[]; }[]>([]);

	// retrieve units according categories
	useEffect(() => {
		const fetchFacultyUnits = async () => {
			const { data, error } = await supabase
				.from('attendance_settings')
				.select('attsID, attsName, attsCategory, attsSubcategory, attsType, attsPosition, attsFacultyUnit')
				.eq('attsType', 2)
				.order('attsCategory, attsName');
			// .order('attsCategory, attsPosition');

			if (error) {
				// console.error('Error fetching faculty units:', error);
				return;
			}

			if (data) {
				setFacultyUnits(data);
				// console.log(data);

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
				console.log(categoriesArray);
			}
		};

		fetchFacultyUnits();
	}, []);


	const [selectedOption, setSelectedOption] = useState('');

	const handleSelectChange = (event: { target: { value: SetStateAction<string>; }; }) => {
		setSelectedOption(event.target.value);
	};

	const handleAnotherSelectChange = (event: { target: { value: any; }; }) => {
		const selectedCourse = event.target.value;
		// Concatenate the faculty/unit and the selected course
		const updatedSelectedOption = `${selectedOption} - ${selectedCourse}`;
		setInfo({ ...info, attFormsFacultyUnit: updatedSelectedOption })
	};

	const getSecondSelectOptions = () => {
		const selectedfacultyunit = facultyStudents.filter(faculty => faculty.facultyName === selectedOption)
		const facultyUnitCat = selectedfacultyunit.map(unit => unit.facultyCategory);
		return (
			<>
				<option value="" disabled>Select Option</option>
				{categories
					.filter(cat => selectedfacultyunit.some(unit => unit.facultyCategory === cat.category || (cat.category === 0 && (facultyUnitCat.includes(1) || facultyUnitCat.includes(2)))))
					.map((cat) => (
						<optgroup key={cat.id} label={cat.name}>
							{cat.subcategories
								.filter(subcategory => facultyUnitCat.includes(subcategory.facultyUnit) || subcategory.facultyUnit === 3)
								.map((subcategory, index) => (
									<option key={index} value={subcategory.name}>
										{subcategory.name}
									</option>
								))}
						</optgroup>
					))
				}
				<optgroup label="Not Mentioned Above">
					<option value="Other">Other</option>
				</optgroup>
			</>
		);
		// switch (selectedOption) {
		// 	case 'Faculty of Business, Design and Arts':
		// 		return (
		// 			<>
		// 				<option value="" disabled>Select Option</option>
		// 				{categories
		// 					.filter(category => category.category === 1 || category.category === 3)
		// 					.map((category) => (
		// 						<optgroup key={category.id} label={category.name}>
		// 							{category.subcategories
		// 								.filter(subcategory => subcategory.facultyUnit === 1)
		// 								.map((subcategory, index) => (
		// 									<option key={index} value={subcategory.name}>
		// 										{subcategory.name}
		// 									</option>
		// 								))}
		// 						</optgroup>
		// 					))}

		// 				<optgroup label="Not Mentioned Above">
		// 					<option value="Other">Other</option>
		// 				</optgroup>
		// 			</>
		// 		);
		// 	case 'Faculty of Engineering, Computing and Science':
		// 		return (
		// 			<>
		// 				<option value="" disabled>Select Option</option>
		// 				{categories
		// 					.filter(category => category.category === 2 || category.category === 3)
		// 					.map((category) => (
		// 						<optgroup key={category.id} label={category.name}>
		// 							{category.subcategories
		// 								.filter(subcategory => subcategory.facultyUnit === 2)
		// 								.map((subcategory, index) => (
		// 									<option key={index} value={subcategory.name}>
		// 										{subcategory.name}
		// 									</option>
		// 								))}
		// 						</optgroup>
		// 					))}

		// 				<optgroup label="Not Mentioned Above">
		// 					<option value="Other">Other</option>
		// 				</optgroup>
		// 			</>
		// 		);
		// 	case 'School of Foundation':
		// 		return (
		// 			<>
		// 				<option value="" disabled>Select Option</option>
		// 				{categories
		// 					.filter(category => category.category === 4)
		// 					.map((category) => (
		// 						<optgroup key={category.id} label={category.name}>
		// 							{category.subcategories
		// 								.filter(subcategory => subcategory.facultyUnit === 3)
		// 								.map((subcategory, index) => (
		// 									<option key={index} value={subcategory.name}>
		// 										{subcategory.name}
		// 									</option>
		// 								))}
		// 						</optgroup>
		// 					))}

		// 				<optgroup label="Not Mentioned Above">
		// 					<option value="Other">Other</option>
		// 				</optgroup>
		// 			</>
		// 		);
		// 	case 'School of Research':
		// 		return (
		// 			<>
		// 				<option value="" disabled>Select Option</option>
		// 				{categories
		// 					.filter(category => category.category === 5)
		// 					.map((category) => (
		// 						<optgroup key={category.id} label={category.name}>
		// 							{category.subcategories
		// 								.filter(subcategory => subcategory.facultyUnit === 4)
		// 								.map((subcategory, index) => (
		// 									<option key={index} value={subcategory.name}>
		// 										{subcategory.name}
		// 									</option>
		// 								))}
		// 						</optgroup>
		// 					))}

		// 				<optgroup label="Not Mentioned Above">
		// 					<option value="Other">Other</option>
		// 				</optgroup>
		// 			</>
		// 		);
		// 	default:
		// 		return (
		// 			<option value="" disabled>
		// 				Select Option
		// 			</option>
		// 		);
		// }
	};

	const formatTimeToAMPM = (time: string | undefined) => {
		if (!time) {
			return '';
		}

		const [hours, minutes, seconds] = time.split(':');
		let period = 'AM';

		let formattedHours = parseInt(hours, 10);
		if (formattedHours >= 12) {
			period = 'PM';
			formattedHours = formattedHours % 12 || 12;
		}

		return `${formattedHours}:${minutes}:${seconds} ${period}`;
	};

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', options);
	};

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};


	const submitAnotherResponse = () => {
		setFormSubmitted(false);
	}


	return (
		<div>
			{!formSubmitted ? (
				<div className="flex flex-col items-center min-h-screen bg-slate-100">
					<form
						onSubmit={handleSubmit}
						className="px-4 w-full max-w-screen-xl lg:max-w-3xl mt-[20px] lg:mt-[50px]">
						<div
							className="mb-4 rounded-md relative block lg:hidden">
							<img
								src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png"
								alt="Random"
								className="object-cover rounded-lg h-full w-full"
								style={{ objectPosition: "center top" }}
							/>
						</div>

						<div
							className="mb-4 rounded-md relative hidden lg:block">
							<img
								src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png"
								alt="Random"
								className="object-cover rounded-lg h-1/2 w-1/2"
								style={{ objectPosition: "center top" }}
							/>
						</div>

						<div className="mb-4 p-2 py-10 pl-5 bg-white rounded-lg border-slate-600 border-t-[9px]">
							<div className="ml-1 mr-1">
								<p className="block text-black font-medium text-xl lg:text-2xl mb-3 -mt-3">
									Event Attendance
								</p>
								<div className="border-t border-gray-300 pt-3 text-xs lg:text-sm">
									<p>Please ensure you are attending the correct event,</p>
									<br />
									{eventData && (
										<div>
											<p>Event Name: <span className="font-bold">{eventData.intFEventName} - {eventData.sub_eventsName}</span></p>
											<p>
												Date:{" "}
												<span className="font-bold">
													{formatDate(eventData.sub_eventsStartDate)} -{" "}
													{formatDate(eventData.sub_eventsEndDate)}
												</span>
											</p>
											<p>Time:{" "}
												<span className="font-bold">
													{formatTimeToAMPM(eventData.sub_eventsStartTime)} -{" "}
													{formatTimeToAMPM(eventData.sub_eventsEndTime)}
												</span>
											</p>
											<p>Venue: <span className="font-bold">{eventData.sub_eventsVenue}</span></p>
										</div>
									)}
									<br />
									<p>
										Encountered a technical error? Contact us @{" "}
										<span className="underline text-blue-700">
											<a href="mailto:fypemsmaster369@gmail.com">fypemsmaster369@gmail.com</a>
										</span>
										.
									</p>
									<p className="pt-3 text-red-500 font-medium">* Required</p>
								</div>
							</div>
						</div>

						<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
							<div className="ml-1">
								<label
									htmlFor="name"
									className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
									Are you a staff, student, or a visitor?
									<span className="text-red-500"> *</span>
								</label>
								<div>
									<label className="ml-1">
										<input
											type="radio"
											name="userType"
											value="staff"
											checked={userType === 'staff'}
											onChange={handleUserTypeChange}
										/>
										<span className="ml-2 font-medium text-sm lg:text-base">Staff</span>
									</label>
								</div>
								<div className="mt-2">
									<label className="ml-1">
										<input
											type="radio"
											name="userType"
											value="student"
											checked={userType === 'student'}
											onChange={handleUserTypeChange}
										/>
										<span className="ml-2 font-medium text-sm lg:text-base">Student</span>
									</label>
								</div>
								<div className="mt-2">
									<label className="ml-1">
										<input
											type="radio"
											name="userType"
											value="visitor"
											checked={userType === 'visitor'}
											onChange={handleUserTypeChange}
										/>
										<span className="ml-2 font-medium text-sm lg:text-base">External Visitor</span>
									</label>
								</div>
							</div>
						</div>

						<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
							<div className="ml-1">
								<label
									htmlFor="name"
									className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
									Name
									<span className="text-red-500"> *</span>
								</label>
								<input
									type="text"
									name="name"
									id="name"
									className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
									required
									placeholder="e.g., John Lennon"
									style={{ paddingLeft: "5px" }}
									onChange={event =>
										setInfo({ ...info, attFormsStaffName: event.target.value })
									}
								/>
							</div>
						</div>

						{/* <div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
							<div className="ml-1">
								<label
									htmlFor="name"
									className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
									Email
									<span className="text-red-500"> *</span>
								</label>
								<input
									type="email"
									name="name"
									id="name"
									className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
									required
									placeholder="e.g., abc@swinburne.edu.my OR 12345678@students.swinburne.edu.my"
									style={{ paddingLeft: "5px" }}
									onChange={event => {
										if (!formSubmitted) {
											setInfo({ ...info, attFormsStaffEmail: event.target.value });
										}
									}}
								/>
							</div>
						</div> */}

						<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
							<div className="ml-1">
								<label
									htmlFor="email"
									className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]"
								>
									Email
									<span className="text-red-500"> *</span>
								</label>
								<input
									type="email"
									name="email"
									id="email"
									className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
									required
									placeholder="e.g., abc@swinburne.edu.my OR 12345678@students.swinburne.edu.my"
									style={{ paddingLeft: "5px" }}
									onChange={event => {
										if (!formSubmitted) {
											setInfo({ ...info, attFormsStaffEmail: event.target.value });
										}
									}}
								/>
						
							</div>
						</div>


						{userType === 'staff' && (
							<div>
								<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
									<div className="ml-1">
										<label
											htmlFor="name"
											className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
											Staff ID
											<span className="text-red-500"> *</span>
										</label>
										<input
											type="text"
											name="name"
											id="name"
											className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
											required
											placeholder="e.g., SS207 OR 207"
											style={{ paddingLeft: "5px" }}
											onChange={event =>
												setInfo({ ...info, attFormsStaffID: event.target.value })
											}
										/>
									</div>
								</div>
								<div className="mb-3 lg:mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
									<div className="ml-1">
										<label
											htmlFor="facultyUnit"
											className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
											Faculty/ Unit (STAFF)
											<span className="text-red-500"> *</span>
										</label>
										<select
											name="facultyUnit"
											id="facultyUnit"
											defaultValue=""
											className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-xs lg:text-base"
											required
											onChange={event =>
												setInfo({ ...info, attFormsFacultyUnit: event.target.value })
											}

										>
											<option value="" disabled>
												Select Faculty/ Unit
											</option>
											{facultyOptions.map((faculty, index) => (
												<option key={index} value={faculty}>
													{faculty}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						)}

						{userType === 'student' && (
							<div>
								<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
									<div className="ml-1">
										<label
											htmlFor="name"
											className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
											Student ID
											<span className="text-red-500"> *</span>
										</label>
										<input
											type="text"
											name="name"
											id="name"
											className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
											required
											placeholder="e.g., 12345678"
											style={{ paddingLeft: "5px" }}
											onChange={event =>
												setInfo({ ...info, attFormsStaffID: event.target.value })
											}
										/>
									</div>
								</div>
								<div className="mb-3 lg:mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
									<div className="ml-1">
										<label
											htmlFor="studentFacultyUnit"
											className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]"
										>
											Faculty/ Unit (STUDENT)
											<span className="text-red-500"> *</span>
										</label>
										<select
											name="studentFacultyUnit"
											id="studentFacultyUnit"
											defaultValue=""
											className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-xs lg:text-base"
											required
											onChange={event => {
												setInfo({ ...info, attFormsFacultyUnit: event.target.value });
												handleSelectChange(event);
											}}
										>
											<option value="" disabled>Select Faculty/ Unit</option>
											{facultyStudents.map((faculty, index) => (
												<option key={index} value={faculty.facultyName}>
													{faculty.facultyName}
												</option>
											))}
										</select>
									</div>
								</div>
								{selectedOption &&
									<div className="mb-3 lg:mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
										<div className="ml-1">
											<label
												htmlFor="anotherSelect"
												className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]"
											>
												Course (STUDENT)
												<span className="text-red-500"> *</span>
											</label>
											<select
												name="anotherSelect"
												id="anotherSelect"
												defaultValue=""
												className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-xs lg:text-base"
												required
												onChange={handleAnotherSelectChange}
											>
												{getSecondSelectOptions()}
											</select>
										</div>
									</div>
								}
							</div>
						)}

						<Fragment>
							<div className="flex justify-end">
								{authToken && (
									<button
										type="button"
										className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base mr-3"
										onClick={() => {
											router.push("/homepage")
										}}
									>
										Cancel
									</button>
								)}
								{/* {userType === 'visitor' ? (
								<button
									type="submit"
									className={`${info.attFormsStaffName ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
									onClick={() => {
										if (info.attFormsStaffName) {
											handleSubmit
										}
									}}
									disabled={!info.attFormsStaffName}>
									Submit
								</button>
							) : (
								<button
									type="submit"
									className={`${info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
									onClick={() => {
										if (info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit) {
											handleSubmit
										}
									}}
									disabled={!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit}>
									Submit
								</button>
							)} */}


								<div>
									{userType === 'visitor' ? (
										<button
											type="submit"
											className={`${info.attFormsStaffName ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
											onClick={() => {
												if (info.attFormsStaffName && !formSubmitted) {
													handleSubmit();
												}
											}}
											disabled={!info.attFormsStaffName || formSubmitted}>
											Submit
										</button>
									) : (
										<button
											type="submit"
											className={`${info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
											onClick={() => {
												if (info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit && !formSubmitted) {
													handleSubmit();
												}
											}}
											disabled={!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit || formSubmitted}>
											Submit
										</button>
									)}
								</div>
							</div>
						</Fragment>

						{/* <Modal
							isVisible={showModalSuccess}
							onClose={() => setShowModalSuccess(false)}>
							<div className="p-4">
								<Image
									src="/images/tick_mark.png"
									alt="cross_mark"
									width={200}
									height={250}
									className="mx-auto -mt-[39px] lg:-mt-[45px]"
								/>
								<h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
									Success!
								</h3>
								<p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
									Your attendance has been successfully recorded!
								</p>
								<div className="text-center ml-4">
									<button
										className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5"
										onClick={handleOK}>
										OK
									</button>
								</div>
							</div>
						</Modal>

						<Modal
							isVisible={showModalFailure}
							onClose={() => setShowModalFailure(false)}>
							<div className="p-4">
								<Image
									src="/images/cross_mark.png"
									alt="cross_mark"
									width={200}
									height={250}
									className="mx-auto -mt-[39px] lg:-mt-[45px]"
								/>
								<h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
									Failed.
								</h3>
								<p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
									An attendance form already exists associated with your staff/ student ID. Please contact the organizer if you think this was a mistake.
								</p>
								<div className="text-center ml-4">
									<button
										className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5"
										onClick={handleOK}>
										OK
									</button>
								</div>
							</div>
						</Modal> */}
					</form>
				</div>
			) : (
				<>
					<div className="flex flex-col items-center min-h-screen bg-slate-100">
						<form
							onSubmit={() => setFormSubmitted(true)}
							className="px-4 w-full max-w-screen-xl lg:max-w-3xl mt-[20px] lg:mt-[50px]">

							<div className="mb-4 p-2 py-10 pl-5 bg-white rounded-lg border-slate-600 border-t-[9px]">
								<div className="ml-1 mr-1">
									<p className="block text-black font-medium text-xl lg:text-2xl mb-3 -mt-3">
										Event Attendance
									</p>
									<div className="pt-4 mt-1 text-xs lg:text-sm">
										<p>Your response has been recorded.</p>
										<br />
										<button onClick={() => window.location.reload()} className="pt-4 -mt-[2px] text-xs lg:text-sm text-[#0000EE]"><u>Submit another response</u></button>
									</div>
								</div>
							</div>
						</form>
					</div>
				</>
			)}
		</div>
	);
}
