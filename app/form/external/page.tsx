"use client"

import React, { useState } from 'react'
import Image from "next/image"
import SignatureCanvas from 'react-signature-canvas';

export default function ExternalFormPage() {

	// // Create a reference to the signature canvas
	// const sigCanvas = React.useRef({});

	// // Function to clear the signature
	// const clearSignature = () => {
	// 	sigCanvas.current.clear();
	// };

	// Initialize state variables for each input field
	const [courseFee, setCourseFee] = useState(0);
	const [airfareFee, setAirfareFee] = useState(0);
	const [accomodation, setAccomodation] = useState(0);
	const [perDiem, setPerDiem] = useState(0);
	const [transportation, setTransportation] = useState(0);
	const [travelInsurance, setTravelInsurance] = useState(0);
	const [others, setOthers] = useState(0);

	// Calculate the grand total
	const grandTotal = courseFee + airfareFee + accomodation + perDiem + transportation + travelInsurance + others;

	return (
		<div className="mx-auto max-w-6xl px-8 my-8 mt-6 mb-[200px]">
			<div className="ml-10">
				<div className="flex ml-[13px]">
					<div>
						<Image
							src="/swinburne_logo.png"
							alt=""
							width={200}
							height={300}
						/>
					</div>
					<div className="ml-8 mt-2">
						<p className="font-medium">Human Resources</p>
						<h1 className="text-3xl font-bold text-slate-800 mb-4 mt-4 -ml-[1px]">
							Nomination / Travelling Application Form
						</h1>
					</div>
				</div>

				<div className="mb-4 text-slate-800 mt-2">
					<p className="mb-2">
						<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
							*
						</span>
						<span>Before completing this form, please refer to the separate document on “General Instructions for completing Nomination / Travelling Application Form”, which is available on SharePoint.</span>
					</p>
					<p className="mb-2">
						<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
							*
						</span><span>All fields are mandatory to complete as required for each applicable section.</span>
					</p>
					<p>
						<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
							*
						</span>
						<span>This form is also to be used for any contracted individual as consultant, and is to be completed where applicable.
						</span>
					</p>
				</div>
			</div>

			<hr className="my-8" />

			<div className="flex justify-between -mt-6">
				<div className="space-y-8 h-[150vh] top-0 px-8 py-8 whitespace-nowrap text-slate-800">
					<a href="#personal_details" className="cursor-pointer hover:text-lg hover:font-semibold block">Personal Details</a>
					<a href="#" className="cursor-pointer hover:text-lg hover:font-semibold block">Travel Details</a>
					<a href="#" className="cursor-pointer hover:text-lg hover:font-semibold block">Logistic Arrangement</a>
					<a href="#" className="cursor-pointer hover:text-lg hover:font-semibold block">Funding</a>
					<a href="" className="cursor-pointer hover:text-lg hover:font-semibold block">Applicant Declaration</a>
				</div>



				<form className="mt-6 w-full ml-[45px]">
					<div>
						<div>
							<a href="#personal_details" className="text-2xl font-bold mb-5 block">
								1. Personal Details
							</a>
							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Email
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="email"
										id="email_address"
										placeholder="Email"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-500 font-medium mt-5 ml-[1px]">Full name (as per I.C. / Passport)
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="text"
										id="full_name"
										placeholder="Full name"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium mt-5 ml-[1px]">Staff ID / Student No.
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="text"
										id="staff_id"
										placeholder="Staff ID"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-500 font-medium mt-5 ml-[1px]">Designation / Course
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="text"
										id="full_name"
										placeholder="Designation / Course"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium mt-5 ml-[1px]">Faculty / School / Unit
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="text"
										id="staff_id"
										placeholder="Faculty / School / Unit"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-500 font-medium mt-5 ml-[1px]">Type of Transportation
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<select
										id="transportation"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[6px]  hover:bg-slate-100 text-slate-500"
									>
										<option value="" className="text-slate-500">Please select an option</option>
										<option value="aeroplane" className="text-slate-800">Aeroplane</option>
										<option value="company_vehicle" className="text-slate-800">Company Vehicle</option>
										<option value="own_transport" className="text-slate-800">Own Transport</option>
									</select>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium mt-5 ml-[1px]">Travelling in
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<select
										id="transportation"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[10px]  hover:bg-slate-100 text-slate-500"
									>
										<option value="" className="text-slate-500">Choose an item</option>
										<option value="alone" className="text-slate-800">Alone</option>
										<option value="group" className="text-slate-800">Group</option>
									</select>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-500 font-medium mt-5 ml-[1px]">Name of other staff / student travelling together in group
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="text"
										id="full_name"
										placeholder="Name of other staff"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium mt-5 ml-[1px]">Number of total staffs
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="text"
										id="staff_id"
										placeholder="Number of total staffs"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-[45px]">
						<div>
							<a href="#personal_details" className="text-2xl font-bold mb-5 block">
								2. Travel Details
							</a>
							<div>
								<p className="text-sm text-slate-500 font-medium">Program title / Event
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="text"
										id="program_title"
										placeholder="Program title"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-sm text-slate-500 font-medium">Description
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="text"
										id="description"
										placeholder="Description"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-500 font-medium mt-5">Commencement date of event
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="date"
											id="commencement_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											required
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-500 font-medium mt-5">Completion date of event
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="date"
											id="completion_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											required
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-500 font-medium mt-5">Organiser
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="text"
											id="organizer"
											placeholder="Organizer"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											required
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-500 font-medium mt-5">Venue
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="text"
											id="venue"
											placeholder="Venue"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											required
										/>
									</div>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-sm text-slate-500 font-medium">HDRF Claimable
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div className="mt-2">
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="hdrf_claimable"
											value="yes"
											className="form-checkbox h-4 w-4 text-slate-800"
										/>
										<span className="text-slate-800 text-[15px]">Yes</span>
									</label>
								</div>
								<div className="mt-2">
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="hdrf_claimable"
											value="no"
											className="form-checkbox h-4 w-4 text-slate-800"
										/>
										<span className="text-slate-800 text-[15px]">No</span>
									</label>
								</div>
								<div className="mt-2">
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="hdrf_claimable"
											value="not_indicated"
											className="form-checkbox h-4 w-4 text-slate-800"
										/>
										<span className="text-slate-800 text-[15px]">Not indicated in event brochure / registration form</span>
									</label>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-[45px]">
						<div>
							<a href="#personal_details" className="text-2xl font-bold mb-5 block">
								3. Logistic Arrangement
							</a>

							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Flight Number
								</p>
								<div>
									<input
										type="text"
										id="flight_number"
										placeholder="Flight number"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5 mt-5">
								<div>
									<p className="text-sm text-slate-500 font-medium ml-[1px]">
										Flight date
									</p>

									<div>
										<input
											type="date"
											id="flight_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											required
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-500 font-medium">Flight time
									</p>
									<div>
										<input
											type="time"
											id="flight_time"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											required
										/>
									</div>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-base text-slate-800 font-medium ml-[1px]">Destination
								</p>

								<div className="grid grid-cols-2 gap-5 mt-3">
									<div>
										<p className="text-sm text-slate-500 font-medium ml-[1px]">From
										</p>
										<div>
											<input
												type="text"
												id="from"
												placeholder="From"
												className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
												required
											/>
										</div>
									</div>

									<div>
										<p className="text-sm text-slate-500 font-medium ml-[1px]">To
										</p>
										<div>
											<input
												type="text"
												id="to"
												placeholder="To"
												className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
												required
											/>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Hotel
								</p>
								<div>
									<input
										type="text"
										id="hotel"
										placeholder="Hotel"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-500 font-medium mt-5">Check-in
									</p>
									<div>
										<input
											type="date"
											id="check_in_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											required
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-500 font-medium mt-5">Check-out
									</p>
									<div>
										<input
											type="date"
											id="check_out_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											required
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-[45px]">

						<a href="#personal_details" className="text-2xl font-bold mb-5 block">
							4. Funding
						</a>

						<p className="text-[15px] text-slate-800 font-medium ml-[1px]">Please indicate estimated cost.
						</p>

						<div className="grid grid-cols-2 gap-5 mt-4">
							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Course Fee
								</p>

								<div>
									<input
										type="number"
										id="course_fee"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										onChange={(e) => setCourseFee(parseFloat(e.target.value) || 0)}
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Airfare Fee
								</p>

								<div>
									<input
										type="number"
										id="airfare_fee"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										onChange={(e) => setAirfareFee(parseFloat(e.target.value) || 0)}
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5 mt-5">
							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Accomodation
								</p>

								<div>
									<input
										type="number"
										id="accomodation"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										onChange={(e) => setAccomodation(parseFloat(e.target.value) || 0)}
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Per Diem
								</p>

								<div>
									<input
										type="number"
										id="per_diem"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										onChange={(e) => setPerDiem(parseFloat(e.target.value) || 0)}
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5 mt-5">
							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Transportation
								</p>

								<div>
									<input
										type="number"
										id="transportation"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										onChange={(e) => setTransportation(parseFloat(e.target.value) || 0)}
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Travel Insurance
								</p>

								<div>
									<input
										type="number"
										id="travel_insurance"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										onChange={(e) => setTravelInsurance(parseFloat(e.target.value) || 0)}
									/>
								</div>
							</div>
						</div>

						<div className="mt-5">
							<p className="text-sm text-slate-500 font-medium ml-[1px]">Others
							</p>

							<div>
								<input
									type="number"
									id="others"
									placeholder="Amount (RM)"
									className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
									onChange={(e) => setOthers(parseFloat(e.target.value) || 0)}
								/>
							</div>
						</div>

						<p className="text-base text-slate-800 font-medium ml-[1px] mt-3">
							Grand Total: <span className="text-red-500">RM{grandTotal.toFixed(2)}</span>
						</p>

						<p className="text-[15px] text-slate-800 font-medium ml-[1px] mt-8">Source of Fund <br></br><span className="text-slate-500 text-sm font-normal">Details of account(s) to be debited. (It is encouraged to have a single source of funding)</span>.
						</p>

						<div className="grid grid-cols-2 gap-5 mt-4">
							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">
								</p>

								<div>
									<input
										type="number"
										id="course_fee"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										onChange={(e) => setCourseFee(parseFloat(e.target.value) || 0)}
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Airfare Fee
								</p>

								<div>
									<input
										type="number"
										id="airfare_fee"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										onChange={(e) => setAirfareFee(parseFloat(e.target.value) || 0)}
									/>
								</div>
							</div>
						</div>
					</div>











					{/*	<div className="grid grid-cols-2 gap-5 mt-4">
							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Course Fee
								</p>

								<div>
									<input
										type="number"
										id="course_fee"
										placeholder="Amount (RM)"
										value="0"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-500 font-medium ml-[1px]">Airfare Fee
								</p>

								<div>
									<input
										type="number"
										id="airfare_fee"
										placeholder="Amount (RM)"
										value="0"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										required
									/>
								</div>
							</div>
						</div>
					    <div style={{ border: '1px solid #000', padding: '10px' }}>
						<SignatureCanvas
							ref={sigCanvas}
							canvasProps={{ width: 400, height: 200, className: 'signature-canvas' }}
						/>
						<button onClick={clearSignature}>Clear Signature</button>
						</div> */}














				</form>
			</div >
		</div >


	)
}
