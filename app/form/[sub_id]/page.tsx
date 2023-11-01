"use client";

import Image from "next/image";
import { Fragment, useState, useEffect } from "react";
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

	useEffect(() => {
		setAuthToken(cookie.get('authToken'))

		const fetchEventData = async () => {
			// Fetch the event_id associated with the given attendance_list ID
			const { data: attendanceListData, error: attendanceListError } = await supabase
				.from('sub_events')
				.select('sub_eventsID, sub_eventsMainID, sub_eventsName, sub_eventsVenue, sub_eventsStartDate, sub_eventsEndDate, sub_eventsStartTime, sub_eventsEndTime')
				.eq('sub_eventsID', sub_id);

			if (attendanceListError) {
				console.error('Error fetching attendance list data:', attendanceListError);
				router.push('/notFound');
				return;
			}

			const eventEndDate = new Date(attendanceListData[0].sub_eventsEndDate);
			const currentDate = new Date(eventEndDate.toDateString());

			// Get the start time and end time of the event,
			const eventEndTimeStr = attendanceListData[0].sub_eventsEndTime;
			const eventStartTimeStr = attendanceListData[0].sub_eventsStartTime;

			// Split the time to hours, minutes and seconds.
			const [hoursEnd, minutesEnd, secondsEnd] = eventEndTimeStr.split(':');
			const [hoursStart, minutesStart, secondsStart] = eventStartTimeStr.split(':');

			// Set the end time,
			const eventEndTime = new Date(currentDate);
			eventEndTime.setHours(Number(hoursEnd));
			eventEndTime.setMinutes(Number(minutesEnd));
			eventEndTime.setSeconds(Number(secondsEnd));

			// Set the start time,
			const eventStartTime = new Date(currentDate);
			eventStartTime.setHours(Number(hoursStart));
			eventStartTime.setMinutes(Number(minutesStart));
			eventStartTime.setSeconds(Number(secondsStart));

			const currentTime = new Date();

			// Check if the current time is AFTER the event start date and time,
			if (currentTime > eventEndTime) {
				router.push('/notFound?from=end_att');
				return;
			}

			// Check if the current time is BEFORE the event start date and time,
			if (currentTime < eventStartTime) {
				const eventStartTimeString = eventStartTime.toISOString();
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

		if (!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit) {
			return;
		}

		let attFormsStaffID = info.attFormsStaffID.trim().toUpperCase();
		attFormsStaffID = attFormsStaffID.replace(/\s/g, '');

		if (!attFormsStaffID.startsWith("SS")) {
			attFormsStaffID = "SS" + attFormsStaffID;
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
							Faculty/Unit
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
							<option value="" disabled>Select Faculty/Unit</option>
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
						<button
							type="submit"
							className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-[11px] lg:py-3 px-8 rounded mb-10 mt-3 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base"
							onClick={() => {
								if (info.attFormsStaffName && info.attFormsStaffID && info.attFormsFacultyUnit) {
									handleSubmit
								}
							}}
							disabled={!info.attFormsStaffName || !info.attFormsStaffID || !info.attFormsFacultyUnit}>
							Submit
						</button>
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
							An attendance form already exists associated with your staff ID. Please contact the organizer if you think this was a mistake.
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
