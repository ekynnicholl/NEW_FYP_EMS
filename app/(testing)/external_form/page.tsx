import Image from "next/image";

export default function ExternalFormPage() {

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
						<span>
							Before completing this form, please refer to the separate
							document on “General Instructions for completing Nomination /
							Travelling Application Form”, which is available on
							SharePoint.
						</span>
					</p>
					<p className="mb-2">
						<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
							*
						</span>
						<span>
							All fields are mandatory to complete as required for each
							applicable section.
						</span>
					</p>
					<p>
						<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
							*
						</span>
						<span>
							This form is also to be used for any contracted individual as
							consultant, and is to be completed where applicable.
						</span>
					</p>
				</div>
			</div>

			<hr className="mt-8" />

			<div className="flex justify-between">
				<div className="space-y-8 h-[150vh] top-0 px-8 py-8 whitespace-nowrap text-slate-800 hidden lg:inline">
					<a href="#personal_details" className="cursor-pointer hover:text-lg hover:font-semibold block">Personal Details</a>
					<a href="#travel_details" className="cursor-pointer hover:text-lg hover:font-semibold block">Travel Details</a>
					<a href="#logistic_arrangement" className="cursor-pointer hover:text-lg hover:font-semibold block">Logistic Arrangement</a>
					<a href="#funding" className="cursor-pointer hover:text-lg hover:font-semibold block">Funding</a>
					<a href="#additional_files" className="cursor-pointer hover:text-lg hover:font-semibold block">Additional Files</a>
					<a href="#applicant_declaration" className="cursor-pointer hover:text-lg hover:font-semibold block">Applicant Declaration</a>
					<a href="#hos_verification" className="cursor-pointer hover:text-lg hover:font-semibold block">Verification</a>
					<a href="#hmu_dean_approval" className="cursor-pointer hover:text-lg hover:font-semibold block">Approval</a>
				</div>


				<form className="mt-6 w-full ml-[45px]">

					<div>
						<div>
							<a href="#personal_details" className="text-2xl font-bold mb-5 block text-slate-900">
								1. Personal Details
							</a>
							<div>
								<p className="text-sm text-slate-800 font-medium ml-[1px]">Email
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<input
										type="email"
										id="email"
										placeholder="Email"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Full name (as per I.C. / Passport)
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
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Staff ID / Student No.
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
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Designation / Course
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
									// onChange={(event) => setFormData({ ...formData, course: event.target.value })}
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Faculty / School / Unit
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
									/>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Type of Transportation
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<select
										id="transportation"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[6px]  hover:bg-slate-100 text-slate-800"
									>
										<option value="" className="text-slate-800">Please select an option</option>
										<option value="aeroplane" className="text-slate-800">Aeroplane</option>
										<option value="company_vehicle" className="text-slate-800">Company Vehicle</option>
										<option value="own_transport" className="text-slate-800">Own Transport</option>
									</select>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Travelling in
									<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
										*
									</span>
								</p>
								<div>
									<select
										id="transportation"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[10px]  hover:bg-slate-100 text-slate-800"
									>
										<option value="" className="text-slate-800">Choose an item</option>
										<option value="alone" className="text-slate-800">Alone</option>
										<option value="group" className="text-slate-800">Group</option>
									</select>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Name of other staff / student travelling together in group
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
									/>
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Number of total staffs
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
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-[45px]">
						<div>
							<p id="travel_details" className="text-2xl font-bold mb-5 block">
								2. Travel Details
							</p>
							<div>
								<p className="text-sm text-slate-800 font-medium">Program title / Event
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
									/>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-sm text-slate-800 font-medium">Description
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
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-800 font-medium mt-5">Commencement date of event
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="date"
											id="commencement_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium mt-5">Completion date of event
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="date"
											id="completion_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-800 font-medium mt-5">Organiser
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
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium mt-5">Venue
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
										/>
									</div>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-sm text-slate-800 font-medium">HDRF Claimable
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
							<p id="logistic_arrangement" className="text-2xl font-bold mb-5 block text-slate-900">
								3. Logistic Arrangement
							</p>

							<div>
								<p className="text-sm text-slate-800 font-medium ml-[1px]">Flight Number
								</p>
								<div>
									<input
										type="text"
										id="flight_number"
										placeholder="Flight number"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5 mt-5">
								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">
										Flight date
									</p>

									<div>
										<input
											type="date"
											id="flight_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium">Flight time
									</p>
									<div>
										<input
											type="time"
											id="flight_time"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-base text-slate-800 font-medium ml-[1px]">Destination
								</p>

								<div className="grid grid-cols-2 gap-5 mt-3">
									<div>
										<p className="text-sm text-slate-800 font-medium ml-[1px]">From
										</p>
										<div>
											<input
												type="text"
												id="from"
												placeholder="From"
												className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											/>
										</div>
									</div>

									<div>
										<p className="text-sm text-slate-800 font-medium ml-[1px]">To
										</p>
										<div>
											<input
												type="text"
												id="to"
												placeholder="To"
												className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
											/>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-sm text-slate-800 font-medium ml-[1px]">Hotel
								</p>
								<div>
									<input
										type="text"
										id="hotel"
										placeholder="Hotel"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-800 font-medium mt-5">Check-in
									</p>
									<div>
										<input
											type="date"
											id="check_in_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium mt-5">Check-out
									</p>
									<div>
										<input
											type="date"
											id="check_out_date"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-[45px]">
						<div>
							<p id="funding" className="text-2xl font-bold mb-5 block text-slate-900">
								4. Funding
							</p>

							<p className="text-[15px] text-slate-800 font-medium ml-[1px]">Please indicate estimated cost.
							</p>

							<div className="grid grid-cols-2 gap-5 mt-4">
								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Course Fee
									</p>

									<div>
										<input
											type="number"
											id="course_fee"
											placeholder="Amount (RM)"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Airfare Fee
									</p>

									<div>
										<input
											type="number"
											id="airfare_fee"
											placeholder="Amount (RM)"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5 mt-5">
								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Accomodation
									</p>

									<div>
										<input
											type="number"
											id="accomodation"
											placeholder="Amount (RM)"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Per Diem
									</p>

									<div>
										<input
											type="number"
											id="per_diem"
											placeholder="Amount (RM)"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5 mt-5">
								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Transportation
									</p>

									<div>
										<input
											type="number"
											id="transportation"
											placeholder="Amount (RM)"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Travel Insurance
									</p>

									<div>
										<input
											type="number"
											id="travel_insurance"
											placeholder="Amount (RM)"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-sm text-slate-800 font-medium ml-[1px]">Others
								</p>

								<div>
									<input
										type="number"
										id="others"
										placeholder="Amount (RM)"
										className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
									/>
								</div>
							</div>

							<p className="text-base text-slate-800 font-medium ml-[1px] mt-3">
								Grand Total: <span className="text-red-500">RM</span>
							</p>


							<p className="text-[15px] text-slate-800 font-medium ml-[1px] mt-8">Source of Fund <br></br><span className="text-slate-800 text-sm font-normal">Details of account(s) to be debited. (It is encouraged to have a single source of funding)</span>.
							</p>

							<div className="grid grid-cols-2 gap-5 mt-4">
								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Staff Development Fund
									</p>

									<div>
										<input
											type="text"
											id="staff_development_fund"
											placeholder="Staff development fund"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Consolidated Pool Fund
									</p>

									<div>
										<input
											type="text"
											id="consolidated_pool_fund"
											placeholder="Consolidated pool fund"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5 mt-5">
								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Research Fund
									</p>

									<div>
										<input
											type="text"
											id="research_fund"
											placeholder="Research fund"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Travel Fund
									</p>

									<div>
										<input
											type="text"
											id="travel_fund"
											placeholder="Travel fund"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-5 mt-5">
								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Student Welfare Fund
									</p>

									<div>
										<input
											type="text"
											id="student_welfare_fund"
											placeholder="Student welfare fund"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium ml-[1px]">Other Funds
									</p>

									<div>
										<input
											type="text"
											id="other_fund"
											placeholder="Other funds"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<fieldset disabled>
								<div className="mt-5 cursor-not-allowed">
									<p className="text-sm text-slate-800 font-medium">Any Expenditure Cap?
									</p>
									<div className="mt-2">
										<label className="flex items-center space-x-2">
											<input
												type="checkbox"
												name="expenditure_cap"
												value="yes"
												className="form-checkbox h-4 w-4 text-slate-800 cursor-not-allowed"
											/>
											<span className="text-slate-800 text-[15px]">Yes</span>
										</label>
									</div>
									<div className="mt-2">
										<label className="flex items-center space-x-2">
											<input
												type="checkbox"
												name="expenditure_cap"
												value="no"
												className="form-checkbox h-4 w-4 text-slate-800 cursor-not-allowed"
											/>
											<span className="text-slate-800 text-[15px]">No</span>
										</label>
									</div>

									<div className="mt-5 cursor-not-allowed">
										<p className="text-sm text-slate-800 font-medium ml-[1px]">Capped Amount
										</p>

										<div>
											<input
												type="number"
												id="capped_amount"
												placeholder="Amount (RM)"
												className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] cursor-not-allowed"
											/>
										</div>
									</div>
								</div>
							</fieldset>

						</div>
					</div>

					<div className="mt-[45px]">
						<p id="additional_files" className="text-2xl font-bold block text-slate-900">
							5. Additional Files
						</p>

						<p className="text-[15px] text-slate-800 font-normal text-base ml-[1px] mt-4">Additional files to be upload (if have).
						</p>

						{/* <div className="flex items-center justify-center w-full mt-3">
							<label
								htmlFor="dropzone-file"
								className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
							>
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<svg
										className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 20 16"
									>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
										/>
									</svg>
									<p className="mb-2 text-base text-gray-500 dark:text-gray-400">
										<span className="font-semibold">Click to upload</span> or drag and drop
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">PDF or Word (maximum 2MB)</p>
									{uploadedFileName && <p className="mt-2 text-xl text-slate-700">{uploadedFileName}</p>}
								</div>
								<input
									id="dropzone-file"
									type="file"
									className="hidden"
									onChange={handleFileUpload}
									accept=".pdf,.doc,.docx"
								/>
							</label>
						</div> */}
					</div>

					<div className="mt-[45px]">
						<div>
							<p id="applicant_declaration" className="text-2xl font-bold mb-4 block text-slate-900">
								6. Applicant Declaration
							</p>

							<p className="text-slate-800 text-base font-normal ml-[1px]">I (or acting as representative of group travelling) hereby confirm the accuracy of the information (including any attachments) provided for this application.
							</p>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Name
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="text"
											id="applicant_declaration_name"
											placeholder="Name"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Position Title
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="text"
											id="applicant_declaration_position_title"
											placeholder="Position title"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<p className="text-sm text-slate-800 font-medium mt-5">Declaration Date
								<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
									*
								</span>
							</p>
							<div>
								<input
									type="date"
									id="applicant_declaration_date"
									className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
								/>
							</div>

							{/* <div style={{ border: '1px solid #000', padding: '10px' }}>
								<SignatureCanvas
									ref={sigCanvas}
									canvasProps={{ width: 400, height: 200, className: 'signature-canvas' }}
								/>
								<button onClick={clearSignature}>Clear Signature</button>
							</div> */}

						</div>
					</div>

					<div className="mt-[45px]">
						<div>
							<p id="hos_verification" className="text-2xl font-bold mb-4 block text-slate-900">
								7. Verification (HOS)
							</p>

							<p className="text-slate-800 text-base font-normal ml-[1px]">I have verified and support of this application.
							</p>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Name
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="text"
											id="hos_verification_name"
											placeholder="Name"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Position Title
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="text"
											id="hos_verification_position_title"
											placeholder="Position title"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<p className="text-sm text-slate-800 font-medium mt-5">Verification Date
								<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
									*
								</span>
							</p>
							<div>
								<input
									type="date"
									id="hos_verification_date"
									className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
								/>
							</div>
						</div>
					</div>

					<div className="mt-[45px]">
						<div>
							<p id="hmu_dean_approval" className="text-2xl font-bold mb-4 block text-slate-900">
								8. Approval (HMU / Dean / Director / DVC & CEO)
							</p>

							<p className="text-slate-800 text-base font-normal ml-[1px]">I have reviewed, and approve this application.
							</p>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Name
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="text"
											id="hmu_dean_approval_name"
											placeholder="Name"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>

								<div>
									<p className="text-sm text-slate-800 font-medium mt-5 ml-[1px]">Position Title
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
											*
										</span>
									</p>
									<div>
										<input
											type="text"
											id="hmu_dean_approval_position_title"
											placeholder="Position title"
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
										/>
									</div>
								</div>
							</div>

							<p className="text-sm text-slate-800 font-medium mt-5">Approval Date
								<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px]">
									*
								</span>
							</p>
							<div>
								<input
									type="date"
									id="hmu_dean_approval_date"
									className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px]"
								/>
							</div>
						</div>
					</div>

					<button className="rounded-lg px-[32px] py-[8px] lg:px-[37px] lg:py-[9px]  bg-slate-800 text-slate-100 text-[13px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 p-4 w-[125px] mt-6 text-center">
						Submit
					</button>
				</form>
			</div>
		</div>
	);
}
