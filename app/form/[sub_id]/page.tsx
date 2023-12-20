"use client";

import Image from "next/image";
import { Fragment, useState, useEffect, SetStateAction } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Modal from "@/components/Modal";

// Import icons from react-icons
import { BiCalendar } from "react-icons/bi";
import { useParams, useRouter } from "next/navigation";
import cookie from 'js-cookie';

type Info = {
	attFormsAttendanceID: string;
	attFormsStaffName: string;
	attFormsStaffID: string;
	attFormsFacultyUnit: string;
};

export default function AttendanceForm() {
	const supabase = createClientComponentClient();
	const [info, setInfo] = useState<Info>({} as Info);
	const [eventData, setEventData] = useState<any>(null);
	const [authToken, setAuthToken] = useState<any>("")

	const [showModalSuccess, setShowModalSuccess] = useState(false);
	const [showModalFailure, setShowModalFailure] = useState(false);

	// const [attendance_id, setAttendanceID] = useState("");

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
				console.error('Error fetching attendance list data:', attendanceListError);
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

			// Check if the current time is AFTER the event start date and time,
			if (currentTime > endTimeWindow) {
				router.push('/notFound?from=end_att');
				return;
			}

			// Check if the current time is BEFORE the event start date and time,
			if (currentTime < startTimeWindow) {
				const eventStartTimeString = startTimeWindow.toISOString();
				router.push(`/notFound?from=start_att&time=${eventStartTimeString}&event_id=${sub_id}`);
				// router.push('/notFound?from=start_att');
				return;
			}

			setEventData(attendanceListData);

			const event_id = attendanceListData[0]?.sub_eventsMainID;

			if (event_id) {
				// Fetch the event details based on the event_id
				const { data: eventDetails, error: eventError } = await supabase
					.from('internal_events')
					.select('intFEventName')
					.eq('intFID', event_id);

				if (eventError) {
					console.error('Error fetching event details:', eventError);
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

	// Handle data submission
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (userType == 'visitor') {
			info.attFormsStaffID = '0';
			info.attFormsFacultyUnit = 'Visitor';
		} else {
			if (!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit) {
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

		if (existingForms && existingForms.length > 0) {
			setShowModalFailure(true);
			return;
		} else {
			const { data, error } = await supabase
				.from("attendance_forms")
				.upsert([
					{
						attFSubEventID: sub_id,
						attFormsStaffName: info.attFormsStaffName,
						attFormsStaffID: attFormsStaffID,
						attFormsFacultyUnit: info.attFormsFacultyUnit,
					},
				]);

			if (error) {
				console.error("Error inserting data:", error);
			} else {
				console.log("Data inserted successfully:", data);
				setInfo({} as Info);
				setShowModalSuccess(true);
			}
		}

		setInfo({} as Info);
	};

	const handleOK = () => {
		setShowModalSuccess(false);
		setShowModalFailure(false);
		window.location.reload();
	};

	// const [selectedOption, setSelectedOption] = useState('');

	// const handleSelectChange = (event: { target: { value: SetStateAction<string>; }; }) => {
	// 	setSelectedOption(event.target.value);
	// };

	// const handleAnotherSelectChange = (event: { target: { value: any; }; }) => {
	// 	const selectedCourse = event.target.value;
	// 	// Concatenate the faculty/unit and the selected course
	// 	const updatedSelectedOption = `${selectedOption} - ${selectedCourse}`;
	// 	setInfo({ ...info, attFormsFacultyUnit: updatedSelectedOption })
	// };

	// const getSecondSelectOptions = () => {
	// 	switch (selectedOption) {
	// 		case 'Faculty of Business, Design and Arts':
	// 			return (
	// 				<>
	// 					<option value="" disabled>Select Option</option>
	// 					<optgroup label="Foundation Study">
	// 						<option value="Swinburne Foundation Studies (Business)">Swinburne Foundation Studies (Business)</option>
	// 						<option value="Swinburne Foundation Studies (Design)">Swinburne Foundation Studies (Design)</option>
	// 					</optgroup>

	// 					<optgroup label="Bachelor Degrees">
	// 						<option value="Bachelor of Business">Bachelor of Business</option>
	// 						<option value="Bachelor of Business (Accounting)">Bachelor of Business (Accounting)</option>
	// 						<option value="Bachelor of Business (Accounting and Finance)">Bachelor of Business (Accounting and Finance)</option>
	// 						<option value="Bachelor of Business (Finance)">Bachelor of Business (Finance)</option>
	// 						<option value="Bachelor of Business (Human Resource Management)">Bachelor of Business (Human Resource Management)</option>
	// 						<option value="Bachelor of Business (International Business)">Bachelor of Business (International Business)</option>
	// 						<option value="Bachelor of Business (Management)">Bachelor of Business (Management)</option>
	// 						<option value="Bachelor of Business (Marketing)">Bachelor of Business (Marketing)</option>
	// 						<option value="Bachelor of Business (Management and Digital Media)">Bachelor of Business (Management and Digital Media)</option>
	// 						<option value="Bachelor of Design (Multimedia Design)">Bachelor of Design (Multimedia Design)</option>
	// 					</optgroup>

	// 					<optgroup label="Professional Short Courses">
	// 						<option value="Professional Short Courses">Professional Short Courses</option>
	// 					</optgroup>

	// 					<optgroup label="Master by Research">
	// 						<option value="Master of Business (Research)">Master of Business (Research)</option>
	// 					</optgroup>

	// 					<optgroup label="Master by Coursework">
	// 						<option value="Master of Arts (Teaching English to Speakers of Other Languages)">Master of Arts (Teaching English to Speakers of Other Languages)</option>
	// 						<option value="Master of Business Administration (International)">Master of Business Administration (International)</option>
	// 						<option value="Master of Human Resource Management">Master of Human Resource Management</option>
	// 					</optgroup>

	// 					<optgroup label="Doctor of Philosophy by Research">
	// 						<option value="Doctor of Philosophy">Doctor of Philosophy</option>
	// 					</optgroup>

	// 					<optgroup label="Not Mentioned Above">
	// 						<option value="Other">Other</option>
	// 					</optgroup>
	// 				</>
	// 			);
	// 		case 'Faculty of Engineering, Computing and Science':
	// 			return (
	// 				<>
	// 					<option value="" disabled>Select Option</option>
	// 					<optgroup label="Foundation Study">
	// 						<option value="Swinburne Foundation Studies (Engineering/Science)">Swinburne Foundation Studies (Engineering/Science)</option>
	// 						<option value="Swinburne Foundation Studies (Information Technology/ Multimedia)">Swinburne Foundation Studies (Information Technology/ Multimedia)</option>
	// 					</optgroup>

	// 					<optgroup label="Engineering Degrees and Double Degrees">
	// 						<option value="Bachelor of Engineering (Honours) (Civil)">Bachelor of Engineering (Honours) (Civil)</option>
	// 						<option value="Bachelor of Engineering (Honours) (Chemical)">Bachelor of Engineering (Honours) (Chemical)</option>
	// 						<option value="Bachelor of Engineering (Honours) (Electrical and Electronic)">Bachelor of Engineering (Honours) (Electrical and Electronic)</option>
	// 						<option value="Bachelor of Engineering (Honours) (Mechanical)">Bachelor of Engineering (Honours) (Mechanical)</option>
	// 						<option value="Bachelor of Quantity Surveying (Honours)">Bachelor of Quantity Surveying (Honours)</option>
	// 						<option value="Bachelor of Engineering (Honours) (Civil)/ Bachelor of Business">Bachelor of Engineering (Honours) (Civil)/ Bachelor of Business</option>
	// 						<option value="Bachelor of Engineering (Mechanical) (Honours)/ Bachelor of Business">Bachelor of Engineering (Mechanical) (Honours)/ Bachelor of Business</option>
	// 						<option value="Bachelor of Engineering (Honours) (Robotics and Mechatronics)/ Bachelor of Computer Science">Bachelor of Engineering (Honours) (Robotics and Mechatronics)/ Bachelor of Computer Science</option>
	// 					</optgroup>

	// 					<optgroup label="Bachelor Degrees">
	// 						<option value="Bachelor of Information and Communication Technology">Bachelor of Information and Communication Technology</option>
	// 						<option value="Bachelor of Computer Science">Bachelor of Computer Science</option>
	// 						<option value="Bachelor of Engineering (Honours) (Software)">Bachelor of Engineering (Honours) (Software)</option>
	// 					</optgroup>

	// 					<optgroup label="Science Degrees">
	// 						<option value="Bachelor of Science (Biotechnology)">Bachelor of Science (Biotechnology)</option>
	// 						<option value="Bachelor of Science (Environmental Science)">Bachelor of Science (Environmental Science)</option>
	// 					</optgroup>

	// 					<optgroup label="Built Environment">
	// 						<option value="Master of Construction Management">Master of Construction Management</option>
	// 						<option value="Graduate Certificate of Construction Management">Graduate Certificate of Construction Management</option>
	// 					</optgroup>

	// 					<optgroup label="Master by Coursework">
	// 						<option value="Master of Information Technology">Master of Information Technology</option>
	// 					</optgroup>

	// 					<optgroup label="Master by Research">
	// 						<option value="Master of Science (Research)">Master of Science (Research)</option>
	// 						<option value="Master of Engineering (Research)">Master of Engineering (Research)</option>
	// 					</optgroup>

	// 					<optgroup label="Doctor of Philosophy by Research">
	// 						<option value="Doctor of Philosophy">Doctor of Philosophy</option>
	// 					</optgroup>

	// 					<optgroup label="Not Mentioned Above">
	// 						<option value="Other">Other</option>
	// 					</optgroup>
	// 				</>
	// 			);
	// 		default:
	// 			return (
	// 				<option value="" disabled>
	// 					Select Option
	// 				</option>
	// 			);
	// 	}
	// };

	return (
		<div className="flex flex-col items-center min-h-screen bg-slate-100">
			<form
				onSubmit={handleSubmit}
				className="px-4 w-full max-w-screen-xl lg:max-w-3xl mt-[50px]">
				<div
					className="mb-4 bg-white rounded-md relative"
					style={{ height: "200px" }}>
					<img
						src="https://source.unsplash.com/600x300?social"
						alt="Random"
						className="w-full h-full object-cover rounded-lg"
						style={{ objectPosition: "center top" }}
					/>
				</div>

				<div className="mb-4 p-2 py-10 pl-5 bg-white rounded-lg border-slate-600 border-t-[9px]">
					<div className="ml-1">
						<p className="block text-black font-medium text-xl lg:text-2xl mb-3 -mt-3">
							Event Attendance
						</p>
						<div className="border-t border-gray-300 pt-3 text-xs lg:text-sm">
							{eventData && (
								<div>
									<p>Event Name: <span className="font-bold">{eventData.intFEventName} - {eventData.sub_eventsName}</span></p>
									<p>Date: <span className="font-bold">{eventData.sub_eventsStartDate} - {eventData.sub_eventsEndDate}</span></p>
									<p>Time: <span className="font-bold">{eventData.sub_eventsStartTime} - {eventData.sub_eventsEndTime}</span></p>
									<p>Venue: <span className="font-bold">{eventData.sub_eventsVenue}</span></p>
								</div>
							)}
							<p>Contact us at <span className="font-bold">(123) 456-7890</span> or <span className="font-bold">no_reply@example.com</span></p>
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
							placeholder="Your answer"
							style={{ paddingLeft: "5px" }}
							onChange={event =>
								setInfo({ ...info, attFormsStaffName: event.target.value })
							}
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
									placeholder="Your answer"
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
									<option value="" disabled>Select Faculty/ Unit</option>
									<option value="Academic Office">Academic Office</option>
									<option value="Audit and Risk">Audit and Risk</option>
									<option value="Building Facilities">Building Facilities</option>
									<option value="Business Development and Liaison">Business Development and Liaison</option>
									<option value="Campus Services">Campus Services</option>
									<option value="Director Administration Office">Director Administration Office</option>
									<option value="Finance and Business Analysis">Finance and Business Analysis</option>
									<option value="Faculty of Business, Design and Arts">Faculty of Business, Design and Arts</option>
									<option value="Faculty of Engineering, Computing and Science">Faculty of Engineering, Computing and Science</option>
									<option value="Human Resources">Human Resources</option>
									<option value="Information Resources">Information Resources</option>
									<option value="Information Technology">Information Technology</option>
									<option value="Learning and Teaching Unit">Learning and Teaching Unit</option>
									<option value="Market and Student Recruitment">Market and Student Recruitment</option>
									<option value="PVC & CEO Office">PVC & CEO Office</option>
									<option value="Policy, Planning and Quality">Policy, Planning and Quality</option>
									<option value="School of Foundation Studies">School of Foundation Studies</option>
									<option value="School of Research">School of Research</option>
									<option value="Swinburne Innovation Malaysia Sdn Bhd">Swinburne Innovation Malaysia Sdn Bhd</option>
									<option value="Student Engagement">Student Engagement</option>
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
									placeholder="Your answer"
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
									// onChange={handleSelectChange}
									onChange={event =>
										setInfo({ ...info, attFormsFacultyUnit: event.target.value })
									}
								>
									<option value="" disabled>Select Faculty/ Unit</option>
									<option value="Faculty of Business, Design and Arts">Faculty of Business, Design and Arts</option>
									<option value="Faculty of Engineering, Computing and Science">Faculty of Engineering, Computing and Science</option>
								</select>
							</div>
						</div>
						{/* {selectedOption &&
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
						} */}
					</div>
				)}

				<Fragment>
					<div>
						{authToken && (
							<button
								type="button"
								className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-[11px] lg:py-3 px-8 rounded mb-10 mt-3 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base mr-3"
								onClick={() => {
									router.push("/homepage")
								}}
							>
								Cancel
							</button>
						)}
						{userType === 'visitor' ? (
							<button
								type="submit"
								className={`${info.attFormsStaffName ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 rounded mb-10 mt-3 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
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
								className={`${info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 rounded mb-10 mt-3 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`}
								onClick={() => {
									if (info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit) {
										handleSubmit
									}
								}}
								disabled={!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit}>
								Submit
							</button>
						)}
					</div>
				</Fragment>

				<Modal
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
				</Modal>
			</form>
		</div>
	);
}
