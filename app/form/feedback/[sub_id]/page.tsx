"use client";

import Image from "next/image";
import { Fragment, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Modal from "@/components/Modal";
import { useParams, useRouter } from "next/navigation";

//Define the structure of Feedback Form Data
type FeedbackFormData = {
	fbSubEventID: string; // Add the missing property
	feedbackStaffID: string;
	fbCourseName: string;
	fbCommencementDate: Date;
	fbCompletionDate: Date;
	fbDuration: string;
	fbTrainersName: string;
	fbTrainingProvider: string;
	fbSectionA1: number;
	fbSectionA2: number;
	fbSectionA3: number;
	fbSectionA4: number;
	fbSectionA5: number;
	fbSectionB1: number;
	fbSectionB2: number;
	fbSectionB3: number;
	fbSectionB4: number;
	fbSectionC1: number;
	fbSectionD1: number;
	fbSectionESuggestions: string;
	fbSectionEChanges: string;
	fbSectionEAdditional: string;
	fbFullName: string;
	fbEmailAddress: string;
};
// Initial form data with default values
const initialFormData: FeedbackFormData = {
	fbSubEventID: "", // Add the missing property
	feedbackStaffID: "",
	fbCourseName: "",
	fbCommencementDate: new Date(), // Initialize with the current date or any default date you prefer
	fbCompletionDate: new Date(),
	fbDuration: "",
	fbTrainersName: "",
	fbTrainingProvider: "",
	fbSectionA1: 0,
	fbSectionA2: 0,
	fbSectionA3: 0,
	fbSectionA4: 0,
	fbSectionA5: 0,
	fbSectionB1: 0,
	fbSectionB2: 0,
	fbSectionB3: 0,
	fbSectionB4: 0,
	fbSectionC1: 0,
	fbSectionD1: 0,
	fbSectionESuggestions: "",
	fbSectionEChanges: "",
	fbSectionEAdditional: "",
	fbFullName: "",
	fbEmailAddress: ""
};

export default function FeedbackForm() {
	// Initialize Supabase client
	const supabase = createClientComponentClient();
	const [eventData, setEventData] = useState<any>(null);
	const [formData, setFormData] = useState<FeedbackFormData>(initialFormData);
	const [showModalSuccess, setShowModalSuccess] = useState(false);
	const [formErrors, setFormErrors] = useState({
		fbSectionA1: false,
		fbSectionA2: false,
		fbSectionA3: false,
		fbSectionA4: false,
		fbSectionA5: false,
		fbSectionB1: false,
		fbSectionB2: false,
		fbSectionB3: false,
		fbSectionB4: false,
		fbSectionC1: false,
		fbSectionD1: false,
		fbSectionESuggestions: false,
		fbSectionEChanges: false,
		fbSectionEAdditional: false,
		fbFullName: false,
		fbEmailAddress: false,
		// Add default values for other form fields if needed
		
	  });

	// Get the Event ID from the link,
	const { sub_id } = useParams();
	const router = useRouter();
	const handleClearForm = () => {
		setFormData(initialFormData);
		setFormErrors({
			fbSectionA1: false,
			fbSectionA2: false,
			fbSectionA3: false,
			fbSectionA4: false,
			fbSectionA5: false,
			fbSectionB1: false,
			fbSectionB2: false,
			fbSectionB3: false,
			fbSectionB4: false,
			fbSectionC1: false,
			fbSectionD1: false,
			fbSectionESuggestions: false,
			fbSectionEChanges: false,
			fbSectionEAdditional: false,
			fbFullName: false,
			fbEmailAddress: false,
		});

	};
	useEffect(() => {
		const fetchEventData = async () => {
			// Fetch the event_id associated with the given attendance_list ID
			const { data: attendanceListData, error: attendanceListError } = await supabase
				.from('sub_events')
				.select('sub_eventsID, sub_eventsMainID, sub_eventsName, sub_eventsVenue, sub_eventsStartDate, sub_eventsEndDate, sub_eventsStartTime, sub_eventsEndTime')
				.eq('sub_eventsID', sub_id);

			if (attendanceListError) {
				console.error('Error fetching attendance list data:', attendanceListError);
				router.push('/error-404');
				return;
			}

			setEventData(attendanceListData);

			const event_id = attendanceListData[0]?.sub_eventsMainID;

			if (event_id) {
				// Fetch the event details based on the event_id,
				const { data: eventDetails, error: eventError } = await supabase
					.from('internal_events')
					.select('intFEventName,intFTrainerName,intFTrainingProvider,intFDurationCourse')
					.eq('intFID', event_id);

				if (eventError) {
					console.error('Error fetching event details:', eventError);
				} else {
					const combinedData = {
						...attendanceListData[0],
						intFEventName: eventDetails[0]?.intFEventName,
						intFTrainerName: eventDetails[0]?.intFTrainerName,
						intFTrainingProvider: eventDetails[0]?.intFTrainingProvider,
						intFDurationCourse: eventDetails[0]?.intFDurationCourse
					};

					setEventData(combinedData);
				}
			}
		};

		fetchEventData();
	}, [sub_id, supabase, router]);

	//// Add validation function for email
	const validateEmail = (email: string): boolean => {
		// Regular expression pattern for email validation
		const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailPattern.test(email);
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const {
			fbSectionA1,
			fbSectionA2,
			fbSectionA3,
			fbSectionA4,
			fbSectionA5,
			fbSectionB1,
			fbSectionB2,
			fbSectionB3,
			fbSectionB4,
			fbSectionC1,
			fbSectionD1,
			fbSectionESuggestions,
			fbSectionEChanges,
			fbSectionEAdditional,
			fbFullName,
			fbEmailAddress
			// ...other new form fields
		} = formData;

		// Validate form fields
		const errors = {
		fbSectionA1: !formData.fbSectionA1,
		fbSectionA2: !formData.fbSectionA2,
		fbSectionA3: !formData.fbSectionA3,
		fbSectionA4: !formData.fbSectionA4,
		fbSectionA5: !formData.fbSectionA5,
		fbSectionB1: !formData.fbSectionB1,
		fbSectionB2: !formData.fbSectionB2,
		fbSectionB3: !formData.fbSectionB3,
		fbSectionB4: !formData.fbSectionB4,
		fbSectionC1: !formData.fbSectionC1,
		fbSectionD1: !formData.fbSectionD1,
		fbSectionESuggestions: !formData.fbSectionESuggestions,
		fbSectionEChanges: !formData.fbSectionEChanges,
		fbSectionEAdditional: !formData.fbSectionEAdditional,
		fbFullName: !formData.fbFullName,
		fbEmailAddress: !validateEmail(formData.fbEmailAddress),
		};
	
		// Check if there are any validation errors
		if (Object.values(errors).some((error) => error)) {
		// Update form state with validation errors
		setFormErrors(errors);
		return;
		}

		// Insert/upsert data into the database using Supabase API
		const { data, error } = await supabase.from("feedback_forms").upsert([
			{
				fbSubEventID: sub_id,
				fbCourseName:eventData.intFEventName,
				fbCommencementDate:eventData.sub_eventsStartDate,
				fbCompletionDate:eventData.sub_eventsEndDate,
				fbDuration:eventData.intFDurationCourse,
				fbTrainersName:eventData.intFTrainerName,
				fbTrainingProvider:eventData.intFTrainingProvider,
				fbSectionA1,
				fbSectionA2,
				fbSectionA3,
				fbSectionA4,
				fbSectionA5,
				fbSectionB1,
				fbSectionB2,
				fbSectionB3,
				fbSectionB4,
				fbSectionC1,
				fbSectionD1,
				fbSectionESuggestions,
				fbSectionEChanges,
				fbSectionEAdditional,
				fbFullName,
				fbEmailAddress,
			},
		]);

		if (error) {
			console.error("Error inserting data:", error);
		} else {
			console.log("Data inserted successfully:", data);
			setFormData({ ...initialFormData }); // Reset the form fields after submission
			setShowModalSuccess(true);
		}
	};
	const handleOK = () => {
		setShowModalSuccess(false);
		window.location.reload();
	};
	return (
		<div className="flex flex-col items-center min-h-screen bg-slate-100">
			<form onSubmit={handleSubmit} className="px-4 w-full max-w-screen-xl lg:max-w-3xl mt-[50px]">
				<div className="mb-4 bg-white rounded-md relative"
					style={{ height: "200px" }}>
					<Image 
						width={200} 
						height={200} 
						src="https://source.unsplash.com/600x300?social"
						alt="Random"
						className="w-full h-full object-cover rounded-lg"
						style={{ objectPosition: "center top" }}
					/>
				</div>

				<div className="mb-4 p-2 py-10 pl-5 bg-white rounded-lg border-slate-600 border-t-[9px]">
					<div className="ml-1">
						<p className="block text-black font-medium text-xl lg:text-2xl mb-3 -mt-3">
							Training Feedback Form
						</p>
						<div className="border-t border-gray-300 pt-3 text-xs lg:text-sm">
							{eventData && (
								<div>
									<p>Course Name: <span className="font-bold">{eventData.intFEventName}</span></p>
									<p>Commencement Date: <span className="font-bold">{eventData.sub_eventsStartDate}</span></p>
									<p>Completed Date: <span className="font-bold">{eventData.sub_eventsEndDate}</span></p>
									<p>Course Duration (No. of Days): <span className="font-bold">{eventData.intFDurationCourse}</span></p>
									<p>Trainer&apos;s Name: <span className="font-bold">{eventData.intFTrainerName}</span></p>
									<p>Training Provider: <span className="font-bold">{eventData.intFTrainingProvider}</span></p>
									<p>Venue: <span className="font-bold">{eventData.sub_eventsVenue}</span></p>
								</div>
								
							)}
							
							<p>Contact us at <span className="font-bold">(123) 456-7890</span> or <span className="font-bold">no_reply@example.com</span></p>
							<p className="mt-3">
								Help us improve!<br /><br />
								Your valuable feedback will help us to improve our training.<br /><br />
								Rest assured, all responses will be kept <strong>STRICTLY CONFIDENTIAL</strong> and will not be divulged to any person or party outside Swinburne University of Technology Sarawak and the Human Resource Development Corporation (HRDCorp – previously known as HRDF).
							</p>

							<p className="pt-3 text-red-500 font-medium">* Required</p>
						</div>
					</div>
				</div>
				
				<div className="mb-4 p-2 pr-2 py-8 pl-2 lg:pl-5 bg-white rounded-lg overflow-x-auto">
					<p className="block text-black font-medium text-[18px] lg:text-2xl ml-3 -mt-3">Assessment Criteria <span className="text-red-500"> *</span></p>
					<div className="ml-1">
						<table className="w-full text-center border-collapse">
							<thead>
								<tr>
									<th className="w-40 block text-black-800 text-left lg:text-base font-medium ml-2 mt-7">A. Course Quality</th>
									<th className="w-1/5 p-2 ">Strongly Disagree</th>
									<th className="w-1/5 p-2 r">Disagree</th>
									<th className="w-1/5 p-2 ">Neutral</th>
									<th className="w-1/5 p-2 ">Agree</th>
									<th className="w-1/5 p-2 ">Strongly Agree</th>
								</tr>
							</thead>
							<tbody>
								{/* Question 1 */}
								<tr className="mb-1">
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium">The contents were clear and easy to understand.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question1"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionA1: parseInt(e.target.value) })
											}
											checked={formData.fbSectionA1 === value}
											/>
										</td>
									))}
								</tr>
								{/* Question 2 */}
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa]">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >The course objectives were successfully achieved.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question2"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionA2: parseInt(e.target.value) })
											}
											checked={formData.fbSectionA2 === value}
											/>
										</td>
									))}
								</tr>
								{/* Question 3 */}
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >The course materials were enough and helpful.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question3"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionA3: parseInt(e.target.value) })
											}
											checked={formData.fbSectionA3 === value}
											/>
										</td>
									))}
								</tr>
								{/* Question 4 */}
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >The class environment enabled me to learn.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question4"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionA4: parseInt(e.target.value) })
											}
											checked={formData.fbSectionA4 === value}
											/>
										</td>
									))}
								</tr>
								{/* Question 5 */}
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >The program was well coordinated (e.g., registration, pre-program information, etc.).</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa]">
											<input
												type="radio"
												name="question5"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionA5: parseInt(e.target.value) })
											}
											checked={formData.fbSectionA5 === value}
											/>
										</td>
									))}
								</tr>
								<tr>
									<td className="text-left p-2" colSpan={6}>B. Training Experience</td>
								</tr>
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >My learning was enhanced by the knowledge and experience shared by the trainer.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question6"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionB1: parseInt(e.target.value) })
											}
											checked={formData.fbSectionB1 === value}
											/>
										</td>
									))}
								</tr>
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa]">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >I was well engaged during the session by the trainer.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question7"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionB2: parseInt(e.target.value) })
											}
											checked={formData.fbSectionB2 === value}
											/>
										</td>
									))}
								</tr>
								{/* Question 3 */}
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >The course exposed me to new knowledge and practices.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question8"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionB3: parseInt(e.target.value) })
											}
											checked={formData.fbSectionB3 === value}
											/>
										</td>
									))}
								</tr>
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >I understand how to apply what I learned.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question9"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionB4: parseInt(e.target.value) })
											}
											checked={formData.fbSectionB4 === value}
											/>
										</td>
									))}
								</tr>
								<tr>
									<td className="text-left p-2" colSpan={6}>C. Duration</td>
								</tr>
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >The duration of the course was just right.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question10"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionC1: parseInt(e.target.value) })
											}
											checked={formData.fbSectionC1 === value}
											/>
										</td>
									))}
								</tr>
								<tr>
									<td className="text-left p-2" colSpan={6}>D. Recommendation</td>
								</tr>
								<tr>
									<td className="text-left p-2 bg-[#f8f9fa] ">
										<p className="block text-gray-700 text-sm lg:text-base font-medium" >I would recommend this course to my colleagues.</p>
									</td>
									{[1, 2, 3, 4, 5].map((value) => (
										<td key={value} className="p-2 bg-[#f8f9fa] ">
											<input
												type="radio"
												name="question11"
												value={value}
												className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out sm:text-sm sm:leading-5 hover:cursor-pointer hover:shadow-lg"
												onChange={(e) => setFormData({ ...formData, fbSectionD1: parseInt(e.target.value) })
											}
											checked={formData.fbSectionD1 === value}
											/>
										</td>
									))}
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Suggestions/Comments Card */}
				<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg w-full">
					<div className="ml-1">
						<p className="block text-black font-medium text-xl lg:text-2xl -mt-3 ml-1">
							Suggestions/Comments
						</p>

						{/* Question 1 Card */}
						<div className="mb-4 p-2 py-8  bg-white rounded-lg">
							<div className="ml-1">
								<label
									htmlFor="suggestion1"
									className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 -ml-[6px]">
									What did you like most about the course?
									<span className="text-red-500"> *</span>
								</label>
								<input
									id="suggestion1"
									className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
									required
									placeholder="Your answer"
									style={{ paddingLeft: "0px" }}
									value={formData.fbSectionESuggestions}
									onChange={(event) =>
										setFormData({ ...formData, fbSectionESuggestions: event.target.value })
									}
								/>
							</div>
						</div>

						{/* Question 2 Card */}
						<div className="mb-4 p-2 py-8  bg-white rounded-lg">
							<div className="ml-1">
								<label
									htmlFor="suggestion2"
									className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 -ml-[6px]">
									If you could change one thing about this course, what would it be?
									<span className="text-red-500"> *</span>
								</label>
								<input
									id="suggestion2"
									className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
									required
									placeholder="Your answer"
									style={{ paddingLeft: "0px" }}
									value={formData.fbSectionEChanges}
									onChange={(event) =>
										setFormData({ ...formData, fbSectionEChanges: event.target.value })
									}
								/>
							</div>
						</div>

						{/* Question 3 Card */}
						<div className="mb-4 p-2 py-8  bg-white rounded-lg">
							<div className="ml-1">
								<label
									htmlFor="suggestion3"
									className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 -ml-[6px]">
									Please share any additional comments or suggestions.
									<span className="text-red-500"> *</span>
								</label>
								<input
									id="suggestion3"
									className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
									required
									placeholder="Your answer"
									style={{ paddingLeft: "0px" }}
									value={formData.fbSectionEAdditional}
									onChange={(event) =>
										setFormData({ ...formData, fbSectionEAdditional: event.target.value })
									}
								/>
							</div>
						</div>

					</div>
				</div>

				<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
					<div className="ml-1">
						{/* Verification Card */}
						<div className="mb-4">
							<p className="block text-black font-medium text-[18px] lg:text-2xl mb-2 -mt-3 ml-[5px]">Verification</p>
							<p className="font-semibold mb-2 mt-3 ml-[5px]">
								I hereby declare that the information I have provided in the Training Feedback Form provided is true, correct & complete.
							</p>
						</div>
					</div>
				</div>

				<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
					<div className="ml-1">
						{/* Full Name Card */}
						<label htmlFor="fullName" className="block text-gray-700 text-xs lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
							Full Name
							<span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="fullName"
							name="fullName"
							placeholder="Your answer"
							style={{ paddingLeft: "5px" }}
							className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
							required
							value={formData.fbFullName}
							onChange={(event) => setFormData({ ...formData, fbFullName: event.target.value })}
						/>
					</div>
				</div>

				<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
					<div className="ml-1">
						<label
						htmlFor="emailAddress"
						className="block text-gray-700 text-xs lg:text-base font-medium mb-2 -mt-3 ml-[5px]"
						>
						Email Address
						<span className="text-red-500"> *</span>
						</label>
						<input
						type="email"
						name="emailAddress"
						id="emailAddress"
						className={`w-full px-4 py-2 border-b ${
							formErrors.fbEmailAddress ? 'border-red-500' : 'border-gray-300'
						} focus:outline-none mt-3 text-sm lg:text-base`}
						required
						placeholder="Your answer"
						style={{ paddingLeft: '5px' }}
						value={formData.fbEmailAddress}
						onChange={(event) => {
							setFormData({ ...formData, fbEmailAddress: event.target.value });
							setFormErrors({ ...formErrors, fbEmailAddress: !validateEmail(event.target.value) });
						}}
						/>
						{formErrors.fbEmailAddress && (
						<p className="text-red-500 text-sm mt-1">Please enter a valid email address.</p>
						)}
					</div>
				</div>


				<Fragment>
				<button
					type="submit"
					className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-[11px] lg:py-3 px-8 rounded mb-10 mt-3 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base"
					disabled={Object.values(formErrors).some((error) => error)}
					>
					Submit
				</button>
				</Fragment>

				<button
					type="button"
					className="bottom-4 ml-[500px] -mt-[20px]  bg-transparent border border-gray-500 text-gray-500 px-4 py-2 rounded-full transition duration-300 hover:bg-gray-500 hover:text-white focus:outline-none cursor-pointer font-sans font-medium text-sm"
					onClick={handleClearForm}
				>
					Clear Form
				</button>




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
							Your Feedback has been successfully recorded!
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
