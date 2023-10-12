"use client"

import React from 'react'
import Image from "next/image"

export default function ExternalFormPage() {
	return (
		<div className="mx-auto max-w-6xl px-8 my-8 mt-6">
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
					<h1 className="text-3xl font-bold text-slate-800 mb-4 mt-4">
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
							<p className="text-sm text-slate-500 font-medium">Email
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

						<div className="grid grid-cols-2 gap-5">
							<div>
								<p className="text-sm text-slate-500 font-medium mt-5">Full name (as per I.C. / Passport)
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
								<p className="text-sm text-slate-500 font-medium mt-5">Staff ID / Student No.
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
								<p className="text-sm text-slate-500 font-medium mt-5">Designation / Course
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
								<p className="text-sm text-slate-500 font-medium mt-5">Faculty / School / Unit
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
								<p className="text-sm text-slate-500 font-medium mt-5">Type of Transportation
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
								<p className="text-sm text-slate-500 font-medium mt-5">Travelling in
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
								<p className="text-sm text-slate-500 font-medium mt-5">Name of other staff / student travelling together in group
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
								<p className="text-sm text-slate-500 font-medium mt-5">Number of total staffs
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
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] text-slate-500"
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
											className="border border-gray-300 px-2 py-[7px] w-full rounded mt-2 bg-gray-100 placeholder-gray-500 lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px] text-[12px] text-left pl-[11px] text-slate-500"
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
				</form>
			</div>
		</div>


	)
}
