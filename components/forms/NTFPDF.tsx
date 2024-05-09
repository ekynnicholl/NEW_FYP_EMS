"use client";

import { Document, Page } from "react-pdf";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

export default function NTFPDF({ id }: { id: string }) {
	const supabase = createClientComponentClient();
	const [formDetails, setFormDetails] = useState<ExternalForm[]>([]);
	const [auditLog, setAuditLog] = useState<AuditLog[]>([]);

	const [numPagesArray, setNumPagesArray] = useState<(number | null)[]>([]);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }, index: number) {
		setNumPagesArray(prevNumPagesArray => {
			const newNumPagesArray = [...prevNumPagesArray];
			newNumPagesArray[index] = numPages;
			return newNumPagesArray;
		});
	}

	useEffect(() => {
		const fetchFormInfos = async () => {
			const { data: external, error: externalError } = await supabase
				.from("external_forms")
				.select("*")
				.eq("id", id);

			console.log("external", external);

			if (externalError) {
				console.error("Error fetching staff external form data:", externalError);
				return;
			}
			setFormDetails(external || []);

			const { data: audit, error: auditError } = await supabase
				.from("audit_log")
				.select("*")
				.eq("ntf_id", id);

			if (auditError) {
				console.error("Error fetching audit log data:", auditError);
				return;
			}
			setAuditLog(audit || []);
		};
		fetchFormInfos();
	}, [id, supabase]);

	const handlePrint = () => {
		window.print();
	};

	const capitalizeFirstLetter = (str: string | null): string => {
		if (!str) return "";
		return str
			.trim()
			.split(" ")
			.map((word: string): string => {
				if (word.length > 0) {
					return word[0].toUpperCase() + word.substring(1);
				}
				return "";
			})
			.join(" ");
	};

	const formatDate = (dateString: string | null): string => {
		if (!dateString) return "";

		const date = new Date(dateString);
		const month = date.toLocaleDateString("en-GB", { month: "long" });
		const day = date.toLocaleDateString("en-GB", { day: "numeric" });
		return `${day} ${month} ${date.getFullYear()}`;
	};

	const formatDateAndTime = (dateString: string): string => {
		const date = new Date(dateString);
		const month = date.toLocaleDateString("en-GB", { month: "long" });
		const day = date.toLocaleDateString("en-GB", { day: "numeric" });
		const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
		return `${day} ${month} ${date.getFullYear()}, ${time}`;
	};

	return (
		<div className="bg-white w-full">
			<div className="m-auto bg-white w-a4">
				<div>
					<span className="float-left mr-4">
						<Image src="/images/swinburne_logo_black_and_white.png" alt="" width={140} height={40} />
					</span>
					<div className="text-left">
						<p className="text-[17px] mt-2 py-1 font-arial-narrow">Human Resources</p>
						<p className="text-[26px] font-bold font-arial-narrow">Nomination / Travelling Application Form</p>
					</div>
				</div>
				<div className="text-[11px] mt-1 leading-3">
					<p>
						&#8226;Before completing this form, please refer to the separate document on &quot;General Instructions for completing
						Nomination / Travelling Application Form&quot;, which is available on SharePoint.
					</p>
					<p>&#8226;All fields are mandatory to complete as required for each applicable section.</p>
					<p>&#8226;This form is also to be used for any contracted individual as consultant, and is to be completed where applicable.</p>
				</div>

				<div>
					{formDetails.map(details => (
						<form key={details.id}>
							{/* Section 1: Personal details */}
							<fieldset className="p-[0.5px] bg-slate-950 text-[13px]">
								<span className="text-slate-50 font-semibold uppercase ml-2">Section 1: Personal Details</span>
							</fieldset>
							<div className="grid grid-cols-8 text-[12px] font-semibold bg-gray-200 leading-3">
								<label className="col-start-1 col-span-2 p-1 border border-slate-950 border-t-0 flex items-center">
									Full Name in CAPITAL LETTERS &#40;as per I.C. / Passport&#41;
								</label>
								<p
									className={`col-span-2 row-span-1 border-b border-slate-950 bg-white flex items-center ${
										(details.full_name?.length ?? 0) >= 26 ? "px-2 py-1" : "p-2"
									}`}
								>
									{details.full_name}
								</p>

								<label className="col-span-2 p-1 border border-slate-950 border-t-0 flex items-center">Staff ID / Student No.</label>
								<p className="col-span-2 border-r border-b border-slate-950 bg-white p-2">{details.staff_id}</p>

								<label className="col-start-1 col-span-2 p-1 border border-slate-950 border-t-0 flex items-center">
									Designation / Course
								</label>
								<p
									className={`col-span-2 row-span-1 border-b border-slate-950 bg-white flex items-center ${
										(details.course?.length ?? 0) >= 26 ? "px-2 py-1" : "p-2"
									}`}
								>
									{details.course}
								</p>

								<label className="col-span-2 p-1 border border-slate-950 border-t-0 flex items-center">Faculty / School / Unit</label>
								<p
									className={`col-span-2 row-span-1 border-b border-r border-slate-950 bg-white flex items-center ${
										details.faculty && details.faculty.length >= 26 ? "px-2 py-1" : "p-2"
									}`}
								>
									{details.faculty}
								</p>

								<label className="col-start-1 col-span-2 p-1 border border-slate-950 border-t-0 flex items-center">
									Type of Transportation
								</label>
								<p className="col-span-2 border-b border-slate-950 bg-white p-2">
									{details && details.transport === "None" ? "" : capitalizeFirstLetter(details.transport!)}
								</p>

								<label className="col-span-2 p-1 border border-slate-950 border-t-0 flex items-center">Traveling in</label>
								<p className="col-span-2 border-b border-r border-slate-950 bg-white p-2">
									{capitalizeFirstLetter(details.travelling!)}
								</p>

								<label className="col-start-1 col-span-2 p-1 border-r border-l border-slate-950">
									Name of other staff / student travelling together in group<sup>1</sup>
								</label>
								<p
									className={`col-span-6 row-span-1 border-r border-slate-950 bg-white flex items-center ${
										details.other_members?.length ?? 0 >= 96 ? "px-2 py-1" : "p-2"
									}`}
								>
									{(details && details.other_members?.length) ?? 0 > 0 ? details.other_members : ""}
								</p>
							</div>

							{/* Section 2: Travel details */}
							<fieldset className="p-[0.5px] text-[13px] bg-slate-950">
								<span className="text-slate-50 font-semibold uppercase ml-2">Section 2: Travel Details</span>
							</fieldset>
							<div className="grid grid-cols-8 normal-case text-[12px] font-semibold leading-3 bg-gray-200">
								<label className="col-start-1 col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0 flex items-center">
									Program title / Event
								</label>
								<p className="col-span-6 border-r border-b border-slate-950 bg-white p-2 flex items-center">
									{details.program_title}
								</p>

								<label className="col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0 flex items-center">Description</label>
								{/* <input
									typeof="text"
									className="col-span-6 border-b border-r border-slate-950 p-2"
									value={details?.program_description ?? ""}
								/> */}
								<p className="col-span-6 border-b border-r border-slate-950 bg-white p-2 flex items-center">
									{details?.program_description ?? ""}
								</p>

								<label className="col-start-1 col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0 flex items-center">
									Commencement date of event
								</label>
								<p className="col-span-2 border-b border-slate-950 bg-white p-2 flex items-center">
									{details.commencement_date ? formatDate(details.commencement_date) : ""}
								</p>

								<label className="col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0 flex items-center">
									Completion date of event
								</label>
								<p className="col-span-2 border-b border-r border-slate-950 bg-white p-2 flex items-center">
									{details.completion_date ? formatDate(details.completion_date) : ""}
								</p>

								<label className="col-start-1 col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0 flex items-center">
									Organiser
								</label>
								<p
									className={`col-span-2 row-span-1 border-b border-slate-950 bg-white flex items-center ${
										details?.organiser?.length ?? 0 >= 26 ? "px-2 py-1" : "p-2"
									}`}
								>
									{details && details.organiser?.length ? details.organiser : ""}
								</p>

								<label className="col-span-2 p-1 bg-gray-200 border border-slate-950 border-t-0 flex items-center">Venue</label>
								<p
									className={`col-span-2 row-span-1 border-b border-r border-slate-950 bg-white flex items-center ${
										details.venue && details.venue.length >= 26 ? "px-2 py-1" : "p-2"
									}`}
								>
									{details.venue}
								</p>

								<label className="col-start-1 col-span-2 p-1 bg-gray-200 border-l border-r border-slate-950 flex items-center">
									HRDF Claimable
								</label>

								<label className="flex col-span-6 items-center justify-center bg-slate-50 border-r border-slate-950">
									<input
										type="checkbox"
										className="-ml-28"
										checked={details.hrdf_claimable && details.hrdf_claimable === "yes" ? true : false}
									/>
									<label className="px-2">Yes</label>
									<input
										type="checkbox"
										className="ml-6"
										checked={details.hrdf_claimable && details.hrdf_claimable === "no" ? true : false}
									/>
									<label className="px-2">No</label>
									<input
										type="checkbox"
										className="ml-6"
										checked={
											details.hrdf_claimable && details.hrdf_claimable === "not indicated in event brochure / registration form"
												? true
												: false
										}
									/>
									<label className="whitespace-nowrap px-2">Not indicated in event brochure / registration form</label>
								</label>
							</div>

							{/* Section 3: Logistic Arrangement */}
							<fieldset className=" text-[13px] bg-slate-950">
								<span className="text-slate-50 font-semibold uppercase ml-2">Section 3: Logistic Arrangement</span>
								<div className="grid grid-cols-2 normal-case bg-gray-200 text-[12px] font-semibold leading-3">
									<label className=" row-span-1 p-1 flex items-center justify-center border border-slate-950 border-t-0">
										Tentative / Planned Flight Arrangement
									</label>
									<label className="p-1 row-span-1 text-center border-r border-b border-slate-950">
										Tentative / Planned Accommodation Arrangement <br />
										<span className="italic font-normal">&#40;with or without receipt&#41;</span>
									</label>
								</div>
								<div className="grid grid-cols-10 bg-gray-200 text-center text-xs font-semibold leading-3">
									<div className="border border-slate-950 border-t-0 border-r-0 py-2 flex items-center justify-center">Date</div>
									<div className="border border-slate-950 border-t-0 border-r-0 py-2 flex items-center justify-center">Time</div>
									<div className="border border-slate-950 border-t-0 border-r-0 py-2 flex items-center justify-center">Flight<br />Number</div>
									<div className="col-span-2 border border-slate-950 border-t-0">
										<div className="flex justify-center items-center py-1">Destination</div>
										<div className="grid grid-cols-2 pt-1 h-full">
											<div className="border border-slate-950 border-l-0 border-b-0">From</div>
											<div className="border border-slate-950 border-l-0 border-b-0 border-r-0">To</div>
										</div>
									</div>
									<div className="col-span-2 border-b border-slate-950">
										<div className="flex justify-center items-center py-1">Date</div>
										<div className="grid grid-cols-2 pt-1 h-full">
											<div className="border border-slate-950 border-l-0 border-b-0">Check In</div>
											<div className="border border-slate-950 border-l-0 border-b-0 border-r-0">Check out</div>
										</div>
									</div>
									<div className="col-span-3 border border-slate-950 border-t-0 flex items-center justify-center">Hotel / Lodging Place</div>
								</div>

								{details.logistic_arrangement && details.logistic_arrangement.length > 0 ? details.logistic_arrangement?.map((logistic, index) => (
									<div key={index} className="grid grid-cols-10 bg-white text-center text-xs">
										<div className="border border-slate-950 border-t-0 border-r-0 py-2">
											{/* @ts-ignore */}
											{formatDate(logistic?.flight_date)}
										</div>
										{/* @ts-ignore */}
										<div className="border border-slate-950 border-t-0 border-r-0 py-2">{logistic?.flight_time!}</div>
										<div className="border border-slate-950 border-t-0 border-r-0 py-2">
											{/* @ts-ignore */}
											{logistic?.flight_number ? logistic.flight_number.toUpperCase() : ""}
										</div>
										<div className="border border-slate-950 border-t-0 py-2">
											{/* @ts-ignore */}
											{capitalizeFirstLetter(logistic?.destination_from!)}
										</div>
										<div className="border border-slate-950 border-t-0 border-l-0 py-2">
											{/* @ts-ignore */}
											{capitalizeFirstLetter(logistic?.destination_to!)}
										</div>
										<div className="border border-slate-950 border-t-0 border-l-0 py-2">
											{/* @ts-ignore */}
											{formatDate(logistic?.check_in_date)}
										</div>
										<div className="border border-slate-950 border-t-0 border-l-0 border-r-0 py-2">
											{/* @ts-ignore */}
											{formatDate(logistic?.check_out_date)}
										</div>
										<div className="col-span-3 border border-slate-950 border-t-0 py-2">
											{/* @ts-ignore */}
											{logistic?.hotel_name}
										</div>
									</div>
								)) : (
									<>
										<div className="grid grid-cols-10 bg-white text-center text-xs">
											<div className="border border-slate-950 border-t-0 border-r-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-r-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-r-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-l-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-l-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-l-0 border-r-0 py-2"></div>
											<div className="col-span-3 border border-slate-950 border-t-0 py-2"></div>
										</div>

										<div className="grid grid-cols-10 bg-white text-center text-xs">
											<div className="border border-slate-950 border-t-0 border-r-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-r-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-r-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-l-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-l-0 py-2"></div>
											<div className="border border-slate-950 border-t-0 border-l-0 border-r-0 py-2"></div>
											<div className="col-span-3 border border-slate-950 border-t-0 py-2"></div>
										</div>
									</>
									
								)}

								{/* <div className="grid grid-cols-2 normal-case bg-gray-200 text-[12px] font-semibold leading-3">
									<div className="row-span-4 grid grid-cols-5 grid-rows-5">
										<label className="col-span-1 row-span-2 flex items-center justify-center border border-slate-950 border-t-0">
											Date
										</label>
										<label className="col-span-1 row-span-2 flex items-center justify-center border-b border-r border-slate-950">
											Time
										</label>
										<label className="col-span-1 row-span-2 flex justify-center items-center text-center border-b border-r border-slate-950">
											Flight <br />
											Number
										</label>
										<label className="col-span-2 row-span-1 flex items-center justify-center border-b border-r border-slate-950">
											Destination
										</label>
										<label className="col-span-1 row-span-1 flex items-center justify-center border-b border-r border-slate-950">
											From
										</label>
										<label className="col-span-1 row-span-1 flex items-center justify-center border-b border-r border-slate-950">
											To
										</label>
										{details.logistic_arrangement?.map((logistic, index) => (
											<>
												<p className="col-span-1 border border-t-0 border-slate-950 p-1 bg-white flex items-center justify-center">
													{formatDate(logistic?.flight_date!)}
												</p>
												<p className="col-span-1 border-b border-r border-slate-950 p-1 bg-white flex items-center justify-center">
													{logistic?.flight_time!}
												</p>
												<p className="col-span-1 border-b border-r border-slate-950 p-1 bg-white flex items-center justify-center">
													{logistic.flight_number ? logistic.flight_number.toUpperCase() : ""}
												</p>
												<p className="col-span-1 border-b border-r border-slate-950 p-1 bg-white flex items-center justify-center whitespace-nowrap">
													{capitalizeFirstLetter(logistic.destination_from!)}
												</p>
												<p className="col-span-1 border-b border-r border-slate-950 p-1 bg-white flex items-center justify-center whitespace-nowrap">
													{capitalizeFirstLetter(logistic.destination_to!)}
												</p>
											</>
										))}
									</div>
									<div className="row-span-4 grid grid-cols-4 grid-rows-5">
										<label className="col-span-2 row-span-1  flex items-center justify-center border-b border-r border-slate-950">
											Date
										</label>
										<label className="col-span-1 row-start-2 row-span-1  flex items-center justify-center border-b border-r border-slate-950">
											Check-in
										</label>
										<label className="col-span-1 row-start-2 row-span-1  flex items-center justify-center border-b border-r border-slate-950">
											Check-out
										</label>
										<label className="col-span-2 row-span-2  flex items-center justify-center border-b border-r border-slate-950">
											Hotel / Lodging Place
										</label>
										{details.logistic_arrangement?.map((logistic, index) => (
											<>
												<p className="col-span-1 border-b border-r border-slate-950 p-1 bg-white flex items-center justify-center">
													{formatDate(logistic.check_in_date)}
												</p>
												<p className="col-span-1 border-b border-r border-slate-950 p-1 bg-white flex items-center justify-center">
													{formatDate(logistic.check_out_date)}
												</p>
												<p className="col-span-2 border-b border-r border-slate-950 p-1 bg-white flex items-center justify-center whitespace-nowrap">
													{logistic.hotel_name}
												</p>
											</>
										))}
									</div>
								</div> */}
							</fieldset>

							{/* Section 4: Funding */}
							<fieldset className="p-[0.5px] text-[13px] bg-slate-950">
								<span className="text-slate-50 font-semibold uppercase ml-2">Section 4: Funding</span>
							</fieldset>
							<div className="grid grid-cols-5 normal-case font-semibold leading-3 text-[12px]">
								<div className="col-span-2 grid grid-cols-2 grid-rows-10">
									<label className="col-span-2 row-span-1 font-normal p-1 bg-gray-200 border border-slate-950 border-t-0">
										Please indicate estimated cost
									</label>
									<label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">
										Funding Particulars
									</label>
									<label className="col-span-1 row-span-1 p-1 text-center bg-gray-200 border-b border-r border-slate-950">
										Amount &#40;RM&#41;
									</label>
									<label className="col-start-1 col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">
										1&#41; Course Fees
									</label>
									<p className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 flex items-center justify-center">
										{details && details.course_fee && Number(details.course_fee) > 0 ? details.course_fee : ""}
									</p>
									<label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">2&#41; Airfare</label>
									<p className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 flex items-center justify-center">
										{details && details.airfare_fee && Number(details.airfare_fee) > 0 ? details.airfare_fee : ""}
									</p>
									<label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">
										3&#41; <span className="underline">Accommodation</span>
									</label>
									<p className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 flex items-center justify-center">
										{details && details.accommodation_fee && Number(details.accommodation_fee) > 0
											? details.accommodation_fee
											: ""}
									</p>
									<label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">
										4&#41; <span className="underline">Per Diem</span>
									</label>
									<p className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 flex items-center justify-center">
										{details && details.per_diem_fee && Number(details.per_diem_fee) > 0 ? details.per_diem_fee : ""}
									</p>
									<label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">
										5&#41; <span className="underline">Transportation</span>
									</label>
									<p className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 flex items-center justify-center">
										{details && details.transportation_fee && Number(details.transportation_fee) > 0
											? details.transportation_fee
											: ""}
									</p>
									<label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">
										6&#41; Travel Insurance
									</label>
									<p className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 flex items-center justify-center">
										{details && details.travel_insurance_fee && Number(details.travel_insurance_fee) > 0
											? details.travel_insurance_fee
											: ""}
									</p>
									<label className="col-span-1 row-span-1 p-1 bg-gray-200 border border-slate-950 border-t-0">
										7&#41; Others<sup>4</sup>
									</label>
									<p className="col-span-1 row-span-1 p-1 border-b border-r border-slate-950 flex items-center justify-center">
										{details && details.other_fees! > 0 ? details.other_fees : ""}
									</p>
									<label className="col-span-1 row-span-1 p-1 bg-gray-200 uppercase border-r border-l border-slate-950">
										Grand Total
									</label>
									<p className="col-span-1 row-span-1 p-1 border-r border-slate-950 flex items-center justify-center">
										{details && details.grand_total_fees! > 0 ? details.grand_total_fees : ""}
									</p>
								</div>
								<div className="col-span-3 grid grid-cols-3 grid-rows-10 bg-slate-50">
									<label className="col-span-3 row-start-1 row-span-2 p-3 bg-gray-200 border-r border-b border-slate-950">
										Source of Fund - <span className="font-normal">Details of account&#40;s&#41; to be debited. </span>
										<span className="italic font-normal">&#40;It is encouraged to have a single source of funding&#41;</span>
									</label>
									<label className="relative inline-flex col-span-2 border-b border-r border-slate-950">
										<span className="border-r border-slate-950 pb-[4.5px] pt-[1px] px-1 text-xs">
											<input type="checkbox" checked={details && details.staff_development_fund?.length! > 0} />
										</span>
										<span className="ml-2 flex items-center">Staff Development Fund</span>
									</label>

									<p className="col-span-1 p-1 border-b border-r border-slate-950 text-center">
										{details.staff_development_fund! ? details.staff_development_fund : ""}
									</p>

									<label className="relative inline-flex col-span-2 border-b border-r border-slate-950">
										<span className="border-r border-slate-950 pb-[4.5px] pt-1 px-1">
											<input type="checkbox" checked={details && details.consolidated_pool_fund?.length! > 0} />
										</span>
										<span className="ml-2 flex items-center">Consolidated Pool Fund</span>
									</label>

									<p className="col-span-1 p-1 border-b border-r border-slate-950 text-center">
										{details && details.consolidated_pool_fund?.length! > 0 ? details.consolidated_pool_fund : ""}
									</p>

									<label className="relative inline-flex col-span-2 border-b border-r border-slate-950">
										<span className="border-r border-slate-950 pb-[4.5px] pt-1 px-1">
											<input type="checkbox" checked={details && details.research_fund?.length! > 0} />
										</span>
										<span className="ml-2 flex items-center">Research Fund</span>
									</label>

									<p className="col-span-1 p-1 border-b border-r border-slate-950 text-center">
										{details && details.research_fund?.length! > 0 ? details.research_fund : ""}
									</p>

									<label className="relative inline-flex col-span-2 border-b border-r border-slate-950">
										<span className="border-r border-slate-950 pb-[4.5px] pt-1 px-1">
											<input type="checkbox" checked={details && details.travel_fund?.length! > 0} />
										</span>
										<span className="ml-2">Travel / Accommodation Fund</span>
									</label>

									<p className="col-span-1 p-1 border-b border-r border-slate-950 text-center">
										{details && details.travel_fund?.length! > 0 ? details.travel_fund : ""}
									</p>

									<label className="relative inline-flex col-span-2 whitespace-nowrap border-b border-r border-slate-950">
										<span className="border-r border-slate-950 pb-[4.5px] px-1 pt-1">
											<input type="checkbox" checked={details && details.student_council_fund?.length! > 0} />
										</span>
										<span className="ml-2 flex items-center">Student Council / Student Welfare Fund</span>
									</label>

									<p className="col-span-1 p-1 border-b border-r border-slate-950 text-center">
										{details && details.student_council_fund?.length! > 0 ? details.student_council_fund : ""}
									</p>

									<label className="relative inline-flex col-span-2 border-b border-r border-slate-950">
										<span className="border-r border-slate-950 pb-[8.5px] pt-1 px-1">
											<input type="checkbox" checked={details && details.other_funds?.length! > 0} />
										</span>
										<span className="ml-2 flex items-center">
											Others<sup>3</sup>
										</span>
									</label>

									<p className="col-span-1 p-1 border-b border-r border-slate-950 text-center">
										{details && details.other_funds?.length! > 0 ? details.other_funds : ""}
									</p>

									<label className="col-span-3 p-1 flex items-center border-b border-r border-slate-950 font-normal">
										Any expenditure cap?
										<input type="checkbox" className="ml-2" checked={details && details.expenditure_cap === "No"} />
										<label className="ml-2">No</label>
										<input type="checkbox" className="ml-4" checked={details && details.expenditure_cap === "Yes"} />
										<label className="ml-2">Yes</label>
										<p className="italic text-xs font-normal ml-20">if yes, please specify below</p>
									</label>
									<label className="col-span-1 row-span-1 p-1 border-r border-slate-950">Capped Amount &#40;RM&#41;</label>
									<p className="col-span-2 row-span-1 p-1 border-r border-slate-950">{details.expenditure_cap_amount}</p>
								</div>
							</div>

							{/* Section 5: Applicant Declaration */}
							<div className="grid grid-cols-2">
								<fieldset className="p-[0.5px] border-r border-slate-50 text-[13px] bg-slate-950">
									<span className="text-slate-50 font-semibold uppercase ml-2">Section 5: Applicant Declaration</span>
								</fieldset>
								<fieldset className="p-[0.5px] text-[13px] bg-slate-950">
									<span className="text-slate-50 font-semibold uppercase ml-2">Section 6: Verification</span>
								</fieldset>
								<div className="col-span-1 normal-case text-[11.5px] bg-gray-200 leading-3 border-r border-l border-slate-950">
									<p className="mx-2 p-1 text-justify">
										I &#40;or acting as representative of group travelling&#41; hereby confirm the accuracy of the information
										&#40;including any attachments&#41; provided for this application.
									</p>
									<div className="ml-6 mt-1">
										<label>
											Signature<span className="ml-8">:</span>
										</label>
										{details && details.applicant_declaration_signature === null ? (
											<></>
										) : (
											<img src={details.applicant_declaration_signature ?? ""} className="absolute w-6 h-6 ml-40 -mt-6" />
										)}

										<input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" />
										<br />
										<label>
											Name<span className="ml-[50px]">:</span>
										</label>
										<input
											type="text"
											className="border-b border-slate-950 ml-2 w-60 bg-gray-200"
											value={details.applicant_declaration_name ?? ""}
										/>
										<br />
										<label>
											Position Title<span className="ml-[15px]">:</span>
										</label>
										<input
											type="text"
											className="border-b border-slate-950 ml-2 w-60 bg-gray-200"
											value={details.applicant_declaration_position_title ?? ""}
										/>
										<br />
										<label>
											Date<span className="ml-[56px]">:</span>
										</label>
										<input
											type="text"
											className="bg-gray-200 ml-2 w-60"
											value={formatDate(details.applicant_declaration_date ?? "")}
										/>
										<br />
									</div>
								</div>

								<div className="col-span-1 normal-case text-[11.5px] bg-gray-200 leading-3 border-r border-slate-950">
									<p className="ml-2 p-1">I have verified and support of this application.</p>
									<div className="mx-4 mt-6">
										<label>
											Signature<span className="ml-8">:</span>
										</label>
										{details && details.verification_signature === null ? (
											<></>
										) : (
											<img src={details.verification_signature ?? ""} className="absolute w-6 h-6 ml-40 -mt-6" />
										)}
										<input type="text" className="border-b border-slate-950 ml-2 w-60 bg-gray-200" />
										<br />
										<label>
											Name<span className="ml-[50px]">:</span>
										</label>
										<input
											type="text"
											className="border-b border-slate-950 ml-2 w-60 bg-gray-200"
											value={details.verification_name ?? ""}
										/>
										<br />
										<label>
											Position Title<span className="ml-[15px]">:</span>
										</label>
										<input
											type="text"
											className="border-b border-slate-950 ml-2 w-60 bg-gray-200"
											value={details.verification_position_title ?? ""}
										/>
										<br />
										<label>
											Date<span className="ml-[56px]">:</span>
										</label>
										<input type="text" className="bg-gray-200 ml-2 w-60" value={formatDate(details.verification_date ?? "")} />
										<br />
									</div>
								</div>
							</div>
							{/* section 7: approval */}
							<fieldset className=" p-[0.5px] text-[13px] bg-slate-950">
								<span className="text-slate-50 font-semibold uppercase ml-2">Section 7: Approval</span>{" "}
								<span className="italic normal-case text-slate-50">&#40;HMU / Dean / Director / DVC & CEO&#41;</span>
							</fieldset>
							<div className="pb-[0.5px] normal-case text-[11.5px] bg-gray-200 border border-slate-950 border-t-0">
								<p className="mx-2">I have reviewed, and approve this application.</p>
								<div className="mx-4 my-2">
									<label>
										Name<span className="ml-[48px]">:</span>
									</label>
									<input
										type="text"
										className="border-b border-slate-950 ml-2 w-60 bg-gray-200"
										value={details.approval_name ?? ""}
									/>
									<br />
									<label>
										Position Title<span className="ml-[14px]">:</span>
									</label>
									<input
										type="text"
										className="border-b border-slate-950 ml-2 w-60 bg-gray-200"
										value={details.approval_position_title ?? ""}
									/>
									{details && details.approval_signature === null ? (
										<></>
									) : (
										<img src={details.approval_signature ?? ""} className="absolute w-9 h-9 ml-[575px] -mt-8" />
									)}

									<input type="text" className="border-b border-slate-950 ml-2 w-72 float-right mr-5 bg-gray-200" />
									<br />
									<label>
										Date<span className="ml-[56px]">:</span>
									</label>
									<input type="text" className="bg-gray-200 ml-2 w-60" value={formatDate(details.approval_date ?? "")} />
									<label className="float-right mr-[135px]">Signature</label>
								</div>
							</div>

							<div className="mt-3 text-[11px]">
								<div className="border-b-[1.5px] border-slate-950 w-48"></div>
								<p className="mt-1">
									<sup>1,2,3,4</sup> Please attach additional information / page(s), where necessary.
								</p>
								<p>
									<sup>5</sup> Verification done by Associate Dean, Research / School of Research Office, where relevant, for
									academic / research related trips.
								</p>
								<div className="border-b border-slate-950 w-44 mt-2"></div>
								<p className="ml-2 font-arial-narrow">Human Resources - Nomination / Travelling Application Form</p>
								<p className="ml-2 font-arial-narrow">Version 8.1: February 2020</p>
								<p className="float-right font-arial-narrow">
									Page <span className="font-bold">1</span> of <span className="font-bold">1</span>
								</p>
							</div>

							<Button
								variant="destructive"
								onClick={handlePrint}
								className="hover:bg-blue-700 duration-300 text-white font-semibold py-2 px-4 text-sm mt-2 rounded print-button"
							>
								Print
							</Button>
						</form>
					))}
				</div>

				<div className="py-4">
					{auditLog.map((log, index) => (
						<div key={index} className="my-3">
							{log.type?.toLocaleLowerCase() === "create" && (
								<div>
									<p className="font-semibold">Created By:</p>
									<span>
										{log.username} ({log.email})
									</span>
									<p>Time: {formatDateAndTime(log.created_at)}</p>
								</div>
							)}

							{log.type?.toLocaleLowerCase() === "revert" && (
								<div>
									<p className="font-semibold">Reverted By:</p>
									<span>
										{log.username} ({log.email})
									</span>
									<p>Time: {formatDateAndTime(log.created_at)}</p>
								</div>
							)}

							{log.type?.toLocaleLowerCase() === "undo" && (
								<div>
									<p className="font-semibold">Undo By:</p>
									<span>
										{log.username} ({log.email})
									</span>
									<p>Time: {formatDateAndTime(log.created_at)}</p>
								</div>
							)}

							{log.type?.toLocaleLowerCase() === "verified" && (
								<div>
									<p className="font-semibold">Verified By:</p>
									<span>{formDetails[0].approval_email}</span>
									<p>Time: {formatDateAndTime(log.created_at)}</p>
								</div>
							)}

							{log.type?.toLocaleLowerCase() === "approved" && (
								<div>
									<p className="font-semibold">Approved By:</p>
									<span>{formDetails[0].verification_email}</span>
									<p>Time: {formatDateAndTime(log.created_at)}</p>
								</div>
							)}

							{log.type?.toLocaleLowerCase() === "reject" && (
								<div>
									<p className="font-semibold">Rejected:</p>
									<p>Time: {formatDateAndTime(log.created_at)}</p>
								</div>
							)}
						</div>
					))}
				</div>

				<div className="w-full">
					{formDetails?.[0]?.supporting_documents?.map((doc, index) => (
						<Document
							key={index}
							file={doc}
							onLoadSuccess={({ numPages }) => onDocumentLoadSuccess({ numPages }, index)}
							className="grid justify-center"
						>
							{Array.from(new Array(numPagesArray[index] || 0), (el, pageIndex) => (
								<Page
									key={`page_${pageIndex + 1}`}
									pageNumber={pageIndex + 1}
									width={1000}
									renderTextLayer={false}
									renderAnnotationLayer={false}
									onError={error => {
										console.error("Failed to load page:", error);
									}}
								/>
							))}
						</Document>
					))}
				</div>
			</div>
		</div>
	);
}
