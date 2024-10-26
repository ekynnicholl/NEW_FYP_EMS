"use client";

import { Fragment, useState, useEffect, SetStateAction, JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import loadingGIF from "@/public/loading_bird.gif";
import { getAuth } from "firebase/auth";
import Image from "next/image";
import Linkify from 'react-linkify';

import Failure_Modal from "@/components/Failure_Modal";

type Info = {
	attFormsAttendanceID: string;
	attFormsStaffName: string;
	attFormsStaffID: string;
	attFormsStaffEmail: string;
	attFormsFacultyUnit: string;
	attFormsYearofStudy: string;
	attFormsPhoneNumber: string;
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
	const [isLoaded, setIsLoaded] = useState<Boolean>(false);
	const auth = getAuth()

	const { sub_id } = useParams();
	const router = useRouter();

	const [userType, setUserType] = useState('');

	const handleUserTypeChange = (event: { target: { value: SetStateAction<string>; }; }) => {
		setUserType(event.target.value);
		setInfo({ ...info, attFormsFacultyUnit: "" });
	};

	useEffect(() => {

		const fetchEventData = async () => {
			// Fetch the event_id associated with the given attendance_list ID
			const { data: attendanceListData, error: attendanceListError } = await supabase
				.from('sub_events')
				.select('sub_eventsID, sub_eventsMainID, sub_eventsName, sub_eventsVenue, sub_eventsStartDate, sub_eventsEndDate, sub_eventsStartTime, sub_eventsEndTime, sub_eventsOrganizer')
				.eq('sub_eventsID', sub_id);

			if (attendanceListError || attendanceListData.length == 0) {
				// console.error('Error fetching attendance list data:', attendanceListError);
				toast.error("The event associated with this link doesn't exist. Please contact the developers if you think this was a mistake.")
				router.push('/notFound');
				return;
			}

			// Fetch the start and end minutes,
			const { data: timingData, error: timingError } = await supabase
				.from("attendance_timing")
				.select("timStartTime, timEndTime")

			if (timingError) {
				toast.error("There was an error fetching the availability of the forms, reverting to 15 minutes.")
			}

			const beforeMinutes = timingData?.[0]?.timStartTime ?? 15;
			const afterMinutes = timingData?.[0]?.timEndTime ?? 15;

			// console.log(beforeMinutes, afterMinutes);

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
			startTimeWindow.setMinutes(startTimeWindow.getMinutes() - beforeMinutes);
			const endTimeWindow = new Date(eventEndTime);
			endTimeWindow.setMinutes(endTimeWindow.getMinutes() + afterMinutes);

			const event_id = attendanceListData[0]?.sub_eventsMainID;

			// Check if the current time is AFTER the event start date and time,
			if (afterMinutes != 0) {
				if (currentTime > endTimeWindow) {
					const { data: eventDetails, error: eventError } = await supabase
						.from('internal_events')
						.select('intFEventName')
						.eq('intFID', event_id);
					const encodedEventName = encodeURIComponent(eventDetails![0].intFEventName);
					router.push(`/notFound?from=end_att&event_name=${encodedEventName}`);
					return;
				}
			}

			// Check if the current time is BEFORE the event start date and time,
			if (beforeMinutes != 0) {
				if (currentTime < startTimeWindow) {
					const { data: eventDetails, error: eventError } = await supabase
						.from('internal_events')
						.select('intFEventName')
						.eq('intFID', event_id);
					const eventStartTimeString = startTimeWindow.toISOString();
					const encodedEventName = encodeURIComponent(eventDetails![0].intFEventName);
					router.push(`/notFound?from=start_att&time=${eventStartTimeString}&event_id=${sub_id}&event_name=${encodedEventName}`);
					return;
				}
			}

			setEventData(attendanceListData);
			setIsLoaded(true);

			if (event_id) {
				// Fetch the event details based on the event_id
				const { data: eventDetails, error: eventError } = await supabase
					.from('internal_events')
					.select('intFEventName, intFTrainerName, intFEventDescription')
					.eq('intFID', event_id);

				if (eventError) {
					// console.error('Error fetching event details:', eventError);
				} else {
					const combinedData = {
						...attendanceListData[0],
						intFEventName: eventDetails[0]?.intFEventName,
						intFTrainerName: eventDetails[0]?.intFTrainerName,
						intFEventDescription: eventDetails[0]?.intFEventDescription
					};

					setEventData(combinedData);
				}
			}
		};

		fetchEventData();
	}, [sub_id, supabase, router]);

	useEffect(() => {

	})

	const [formSubmitted, setFormSubmitted] = useState(false);

	// Define a state variable to track form submission status
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validateName = (input: string) => {
		// Regular expression to match only alphabets and white spaces
		const regex = /^[A-Za-zÀ-ÿ\s-]+$/;

		return regex.test(input);
	}

	// Handle data submission
	const handleSubmit = async () => {
		// e.preventDefault();

		// Prevent multiple submissions if form is already being submitted
		if (isSubmitting) return;

		setIsSubmitting(true); // Set form submission status to true

		const isValidEmail = validateEmail(info.attFormsStaffEmail);
		const isValidName = validateName(info.attFormsStaffName);

		if (!isValidEmail) {
			toast.error("Please input the email in a valid format.")
			setIsSubmitting(false);
			return;
		}

		if (!isValidName) {
			toast.error("Your name MUST be in alphabets A-Z.")
			setIsSubmitting(false);
			return;
		}

		if (userType !== 'staff') {
			const phoneNumberPattern = /^[0-9()+\-\s]{7,}$/; // Pattern for allowed characters and minimum length of 7

			// Trim the phone number if it is not empty
			if (info.attFormsPhoneNumber) {
				info.attFormsPhoneNumber = info.attFormsPhoneNumber.trim();
			}

			// Validate the phone number format
			if (!phoneNumberPattern.test(info.attFormsPhoneNumber)) {
				toast.error("Please input a valid phone number.");
				setIsSubmitting(false);
				return;
			}
		} else {
			info.attFormsPhoneNumber = '';
		}

		// 0 = External Visitor, 1 = Secondary Students, 2 = Teacher
		if (userType == 'visitor') {
			info.attFormsStaffID = '0';
			if (!info.attFormsFacultyUnit || info.attFormsFacultyUnit.length === 0) {
				info.attFormsFacultyUnit = 'N/A'
			}
		} else if (userType == 'secondary') {
			info.attFormsStaffID = '1';
		} else if (userType == 'teacher') {
			info.attFormsStaffID = '2';
			if (!info.attFormsFacultyUnit || info.attFormsFacultyUnit.length === 0) {
				info.attFormsFacultyUnit = 'N/A'
			}
		} else {
			if (!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit || !info.attFormsStaffEmail) {
				if (info.attFormsStaffID == '0') {
					toast.error("Your Staff/ Student ID cannot be 0.");
					setIsSubmitting(false);
					return;
				}
				return;
			}
		}

		let attFormsStaffID = info.attFormsStaffID.trim().toUpperCase();

		if (userType == 'staff') {
			attFormsStaffID = attFormsStaffID.replace(/\s/g, '');
			// console.log(attFormsStaffID);

			if (attFormsStaffID.startsWith("S") && !attFormsStaffID.startsWith("SS")) {
				attFormsStaffID = "S" + attFormsStaffID;
			} else if (!attFormsStaffID.startsWith("SS")) {
				attFormsStaffID = "SS" + attFormsStaffID;
			}
		}

		const { data: existingForms, error: existingFormsError } = await supabase
			.from("attendance_forms")
			.select()
			.eq("attFSubEventID", sub_id)
			.eq("attFormsStaffID", attFormsStaffID);

		if (existingForms && existingForms.length > 0 && userType != 'visitor' && userType != 'secondary' && userType != 'teacher') {
			setShowModalFailure(true);
			// toast.error("Your Staff/ Student ID cannot be 0.");
			setIsSubmitting(false);
			return;
		} else if (userType == 'secondary') {
			const { data: oldForms, error } = await supabase
				.from("attendance_forms")
				.upsert([
					{
						attFSubEventID: sub_id,
						attFormsStaffName: info.attFormsStaffName.trim().toUpperCase(),
						attFormsStaffEmail: info.attFormsStaffEmail.trim(),
						attFormsStaffID: attFormsStaffID,
						attFormsFacultyUnit: info.attFormsFacultyUnit.trim().toUpperCase(),
						attFormsYearofStudy: info.attFormsYearofStudy.trim().toUpperCase(),
						attFormsPhoneNumber: info.attFormsPhoneNumber
					},
				])
				.select();

			if (error) {
				// console.error("Error inserting data:", error);
			} else {
				// console.log("Data inserted successfully:", data);
			}
		} else {
			const { data: oldForms, error } = await supabase
				.from("attendance_forms")
				.upsert([
					{
						attFSubEventID: sub_id,
						attFormsStaffName: info.attFormsStaffName.trim(),
						attFormsStaffEmail: info.attFormsStaffEmail.trim(),
						attFormsStaffID: attFormsStaffID.trim(),
						attFormsFacultyUnit: info.attFormsFacultyUnit.trim(),
						attFormsPhoneNumber: info.attFormsPhoneNumber
					},
				])
				.select();

			if (error) {
				// console.error("Error inserting data:", error);
			} else {
				// console.log("Data inserted successfully:", data);
			}
		}

		setFormSubmitted(true);

		// After successful form submission or error handling, reset form submission status
		setIsSubmitting(false);

		// setInfo({} as Info);
	};

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
				// console.log(categoriesArray);
			}
		};

		fetchFacultyUnits();
	}, []);


	const [selectedOption, setSelectedOption] = useState('');
	const [hasSelectedCourse, setHasSelectedCourse] = useState<boolean>(false);

	const handleSelectChange = (event: { target: { value: SetStateAction<string>; }; }) => {
		setSelectedOption(event.target.value);
	};

	const handleAnotherSelectChange = (event: { target: { value: any; }; }) => {
		const selectedCourse = event.target.value;
		setHasSelectedCourse(true);
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


	const [showModalFailure, setShowModalFailure] = useState(false);

	const linkDecorator = (decoratedHref: string | undefined, decoratedText: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined, key: Key | null | undefined) => (
		<a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
			{decoratedText}
		</a>
	);

	return (
		<>
			{isLoaded ? (
				<div>
					{!formSubmitted ? (
						<div className="flex flex-col items-center min-h-screen bg-slate-100">
							<form
								onSubmit={handleSubmit}
								className="px-4 w-full max-w-screen-xl lg:max-w-3xl mt-[20px] lg:mt-[50px]">
								<div
									className="mb-4 rounded-md relative block lg:hidden">
									<Image
										width={200}
										height={200}
										src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png"
										alt="Random"
										className="object-cover rounded-lg h-full w-full"
										style={{ objectPosition: "center top" }}
									/>
								</div>

								<div
									className="mb-4 rounded-md relative hidden lg:block">
									<Image
										width={200}
										height={200}
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
											<p>Thank you for attending the following session. Please ensure you are attending the correct event before registering your attendance below.</p>
											<br />
											{eventData && (
												<div>
													<p>Event Name: <span className="font-bold">{eventData.intFEventName} - {eventData.sub_eventsName}</span></p>
													<p>
														Description:{" "}
														<span className="font-bold">
															<Linkify componentDecorator={linkDecorator}>
																{eventData.intFEventDescription}
															</Linkify>
														</span>
													</p>
													<p>Organizer: <span className="font-bold">{eventData.sub_eventsOrganizer}</span></p>
													<p>Trainer&apos;s Name: <span className="font-bold">{eventData.intFTrainerName}</span></p>
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
											Are you a Staff, Swinburne Student, Secondary School Student, Secondary School Teacher or an External Visitor?
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
												<span className="ml-2 font-medium text-sm lg:text-base">Swinburne Student</span>
											</label>
										</div>
										<div className="mt-2">
											<label className="ml-1">
												<input
													type="radio"
													name="userType"
													value="secondary"
													checked={userType === 'secondary'}
													onChange={handleUserTypeChange}
												/>
												<span className="ml-2 font-medium text-sm lg:text-base">Secondary School Student</span>
											</label>
										</div>
										<div className="mt-2">
											<label className="ml-1">
												<input
													type="radio"
													name="userType"
													value="teacher"
													checked={userType === 'teacher'}
													onChange={handleUserTypeChange}
												/>
												<span className="ml-2 font-medium text-sm lg:text-base">Teacher</span>
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
											{/* Name {userType === 'secondary' ? "(In FULL as per IC)" : ""} */}
											Full Name (as per NRIC)
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

								{(userType && userType !== 'staff') && (
									<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
										<div className="ml-1">
											<label
												htmlFor="phoneNo"
												className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]"
											>
												Phone Number
												<span className="text-red-500"> *</span>
											</label>
											<input
												type="phoneNo"
												name="phoneNo"
												id="phoneNo"
												className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
												required
												placeholder="e.g., 012-345 6789 OR +6012-345 6789"
												style={{ paddingLeft: "5px" }}
												onChange={event => {
													if (!formSubmitted) {
														setInfo({ ...info, attFormsPhoneNumber: event.target.value });
													}
												}}
											/>

										</div>
									</div>
								)}

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

								{userType === 'secondary' && (
									<div>
										<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
											<div className="ml-1">
												<label
													htmlFor="name_of_school"
													className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
													Name of School
													<span className="text-red-500"> *</span>
												</label>
												<input
													type="text"
													name="name_of_school"
													id="name_of_school"
													className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
													required
													placeholder="e.g., Lodge International School"
													style={{ paddingLeft: "5px" }}
													onChange={event =>
														setInfo({ ...info, attFormsFacultyUnit: event.target.value })
													}
												/>
											</div>
										</div>

										<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
											<div className="ml-1">
												<label
													htmlFor="year_of_study"
													className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
													Year of Study (F4/F5)
													<span className="text-red-500"> *</span>
												</label>
												<input
													type="text"
													name="year_of_study"
													id="year_of_study"
													className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
													required
													placeholder="e.g., F4/ F5"
													style={{ paddingLeft: "5px" }}
													onChange={event =>
														setInfo({ ...info, attFormsYearofStudy: event.target.value })
													}
												/>
											</div>
										</div>
									</div>
								)}

								{userType === 'visitor' && (
									<div>
										<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
											<div className="ml-1">
												<label
													htmlFor="organization"
													className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
													Organization
													<span className="text-red-500"> *</span>
												</label>
												<input
													type="text"
													name="organization"
													id="organization"
													className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
													required
													placeholder="e.g., SCCS"
													style={{ paddingLeft: "5px" }}
													onChange={event =>
														setInfo({ ...info, attFormsFacultyUnit: event.target.value })
													}
												/>
											</div>
										</div>

									</div>
								)}

								{userType === 'teacher' && (
									<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
										<div className="ml-1">
											<label
												htmlFor="name_of_school"
												className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
												Name of School
												<span className="text-red-500"> *</span>
											</label>
											<input
												type="text"
												name="name_of_school"
												id="name_of_school"
												className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
												required
												placeholder="e.g., Lodge International School"
												style={{ paddingLeft: "5px" }}
												onChange={event =>
													setInfo({ ...info, attFormsFacultyUnit: event.target.value })
												}
											/>
										</div>
									</div>
								)}

								<Fragment>
									<div className="flex justify-end">
										{auth.currentUser?.uid && (
											<button
												type="button"
												className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base mr-3"
												onClick={() => {
													router.push("/dashboard")
												}}
											>
												Cancel
											</button>
										)}

										<div>
											{userType === 'visitor' || userType === 'teacher' ? (
												<button
													type="button"
													className={`${info.attFormsStaffName && info.attFormsStaffEmail && info.attFormsFacultyUnit && info.attFormsPhoneNumber && !isSubmitting ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
													onClick={() => {
														if (info.attFormsStaffName && info.attFormsStaffName && info.attFormsStaffEmail && info.attFormsFacultyUnit && !formSubmitted && !isSubmitting && info.attFormsPhoneNumber) {
															handleSubmit();
														}
													}}
													disabled={!info.attFormsStaffName || formSubmitted || isSubmitting || !info.attFormsPhoneNumber}>
													Submit
												</button>
											) : userType === 'secondary' ? (
												<button
													type="button"
													className={`${info.attFormsStaffName && info.attFormsFacultyUnit && info.attFormsYearofStudy && info.attFormsPhoneNumber && !isSubmitting ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
													onClick={() => {
														if (info.attFormsStaffName && info.attFormsFacultyUnit && info.attFormsYearofStudy && !formSubmitted && !isSubmitting) {
															handleSubmit();
														}
													}}
													disabled={!info.attFormsStaffName || !info.attFormsFacultyUnit || !info.attFormsFacultyUnit || formSubmitted || isSubmitting || !info.attFormsPhoneNumber}>
													Submit
												</button>
											) : userType === 'student' ? (
												<button
													type="button"
													className={`${info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit && info.attFormsPhoneNumber && hasSelectedCourse && !isSubmitting ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
													onClick={() => {
														if (info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit && hasSelectedCourse && !formSubmitted && !isSubmitting && info.attFormsPhoneNumber) {
															handleSubmit();
														}
													}}
													disabled={!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit || !hasSelectedCourse || formSubmitted || isSubmitting || !info.attFormsPhoneNumber}>
													Submit
												</button>
											) : (
												<button
													type="button"
													className={`${info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit && !isSubmitting ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 mb-10 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
													onClick={() => {
														if (info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit && !formSubmitted && !isSubmitting) {
															handleSubmit();
														}
													}}
													disabled={!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit || formSubmitted || isSubmitting}>
													Submit
												</button>
											)}
										</div>
									</div>
								</Fragment>

								<Failure_Modal
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
												onClick={() => {
													setShowModalFailure(false);
												}}
											>
												OK
											</button>
										</div>
									</div>
								</Failure_Modal>

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
			) : (
				<div className="flex flex-col justify-center items-center h-screen bg-[#ffffff] z-[999]">
					<Image src={loadingGIF.src} alt="loading..." width={100} height={100} className="w-[100px] lg:w-[100px]" />
				</div>
			)}
		</>
	);
}
