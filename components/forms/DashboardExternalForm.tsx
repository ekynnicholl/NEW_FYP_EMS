"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import adminExternalFormSchema from "@/schema/adminExternalFormSchema";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BsFiletypePdf } from "react-icons/bs";

import { ArrowLeftIcon, Calendar as CalenderIcon, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-year";
import { Input } from "@/components/ui/external-dashboard-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/external-dashboard-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Document = ({ documents }: { documents?: string[] }) => {
	function convertToReadableName(url: string) {
		const split = url.split("supporting_documents/");
		const fileName = split[split.length - 1];
		const firstUnderscorePosition = fileName.indexOf("_");
		let readableName = fileName.substring(firstUnderscorePosition + 1);
		readableName = readableName.replaceAll("%20", " ");
		return readableName;
	}

	if (documents?.length === 0 || !documents) {
		return null;
	}

	return (
		<>
			{documents.map((data: string) => (
				<Link href={data} target="_blank" className="flex gap-2 p-2 items-start" key={data}>
					<BsFiletypePdf className="w-6 h-6 text-red-500" />
					{convertToReadableName(data)}
				</Link>
			))}
		</>
	);
};

export default function DashboardExternalForm({ data }: { data: ExternalForm }) {
	const [externalForm, setExternalForm] = useState<ExternalForm>(data);
	const [useOwnTransport, setUseOwnTransport] = useState(false);
	const [group, setGroup] = useState(false);
	const [faculties, setFaculties] = useState<string[]>([]);
	const selectContentCustomStyle = "";

	const [numPagesArray, setNumPagesArray] = useState<(number | null)[]>([]);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }, index: number) {
		setNumPagesArray(prevNumPagesArray => {
			const newNumPagesArray = [...prevNumPagesArray];
			newNumPagesArray[index] = numPages;
			return newNumPagesArray;
		});
	}

	const form = useForm<z.infer<typeof adminExternalFormSchema>>({
		resolver: zodResolver(adminExternalFormSchema),
		defaultValues: {
			revertComment: externalForm.revertComment ?? "",
			formStage: externalForm.formStage!,
			verification_email: externalForm.verification_email!,
			approval_email: externalForm.approval_email!,

			full_name: externalForm.full_name!,
			email: externalForm.email!,
			staff_id: externalForm.staff_id!,
			course: externalForm.course!,
			faculty: externalForm.faculty!,
			transport: externalForm.transport!,
			travelling: externalForm.travelling!,
			other_members: externalForm.other_members!,

			program_title: externalForm.program_title!,
			program_description: externalForm.program_description!,
			commencement_date: new Date(externalForm.commencement_date!),
			completion_date: new Date(externalForm.completion_date!),
			organiser: externalForm.organiser!,
			venue: externalForm.venue!,
			hrdf_claimable: externalForm.hrdf_claimable!,

			flight_date: externalForm.flight_date ? new Date(externalForm.flight_date) : null,
			flight_time: externalForm.flight_time ?? null,
			flight_number: externalForm.flight_number!,
			destination_from: externalForm.destination_from!,
			destination_to: externalForm.destination_to!,
			check_in_date: externalForm.check_in_date ? new Date(externalForm.check_in_date) : null,
			check_out_date: externalForm.check_out_date ? new Date(externalForm.check_out_date) : null,
			hotel_name: externalForm.hotel_name!,

			course_fee: externalForm.course_fee!,
			airfare_fee: externalForm.airfare_fee!,
			accommodation_fee: externalForm.accommodation_fee!,
			per_diem_fee: externalForm.per_diem_fee!,
			transportation_fee: externalForm.transportation_fee!,
			travel_insurance_fee: externalForm.travel_insurance_fee!,
			other_fees: externalForm.other_fees!,
			grand_total_fees: externalForm.grand_total_fees!,
			staff_development_fund: externalForm.staff_development_fund!,
			consolidated_pool_fund: externalForm.consolidated_pool_fund!,
			research_fund: externalForm.research_fund!,
			travel_fund: externalForm.travel_fund!,
			student_council_fund: externalForm.student_council_fund!,
			other_funds: externalForm.other_funds!,
			expenditure_cap: externalForm.expenditure_cap!,
			expenditure_cap_amount: externalForm.expenditure_cap_amount!,

			supporting_documents: externalForm.supporting_documents ?? null,

			applicant_declaration_signature: externalForm.applicant_declaration_signature!,
			applicant_declaration_name: externalForm.applicant_declaration_name!,
			applicant_declaration_position_title: externalForm.applicant_declaration_position_title!,
			applicant_declaration_date: new Date(externalForm.applicant_declaration_date!),

			verification_signature: externalForm.verification_signature ?? "",
			verification_name: externalForm.verification_name ?? "",
			verification_position_title: externalForm.verification_position_title ?? "",
			// verification_date: verificationDate,

			approval_signature: externalForm.approval_signature ?? "",
			approval_name: externalForm.approval_name ?? "",
			approval_position_title: externalForm.approval_position_title ?? "",
			// approval_date: approvalDate,
		},
	});

	return (
		<Form {...form}>
			<form className="space-y-4">
				<section className="section-1 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
					<div className="flex justify-between mb-8">
						<div className="flex gap-3">
							<div className="rounded-sm bg-green-200 w-4 h-8"></div>
							<h1 className="text-xl font-semibold">Persona Details</h1>
						</div>

						<Link
							href="/external"
							className="px-4 border flex shadow-[0_0_0_2px_#EFEFEF_inset] h-10 rounded-lg items-center hover:shadow-black-500 hover:text-black-500 transition gap-2"
						>
							<ArrowLeftIcon className="cursor-pointer text-gray-500" />
							<span>Back</span>
						</Link>
					</div>
					<div>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="mb-8">
									<FormLabel className="font-semibold text-sm text-gray-500 text-gray-500">
										Email <span className="text-red-500"> *</span>
									</FormLabel>
									<FormControl>
										<Input type="email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-auto-fit-lg gap-8">
							<FormField
								control={form.control}
								name="full_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Full Name (Same as I.C / Passport) <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="staff_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Staff ID / Student No. <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="course"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Designation / Course <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="faculty"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Faculty / School / Unit <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Select onValueChange={field.onChange} value={field.value}>
												<SelectTrigger>
													<SelectValue placeholder="Please select an option" />
												</SelectTrigger>
												<SelectContent className="h-[300px] overflow-y-auto">
													{faculties.map((faculty, index) => (
														<SelectItem key={index} value={faculty}>
															{faculty}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="transport"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Type of Transportation <span className="text-red-500"> *</span>
										</FormLabel>
										<Select
											onValueChange={e => {
												field.onChange(e);
												if (e === "own transport" || e === "company vehicle") {
													setUseOwnTransport(true);
												} else {
													setUseOwnTransport(false);
												}
											}}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Please select an option" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="aeroplane">Aerophone</SelectItem>
												<SelectItem value="company vehicle">Company vehicle</SelectItem>
												<SelectItem value="own transport">Own transport</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="travelling"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Traveling in <span className="text-red-500"> *</span>
										</FormLabel>
										<Select
											onValueChange={e => {
												field.onChange(e);
												if (e === "group") {
													setGroup(true);
												} else {
													setGroup(false);
												}
											}}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Please select an option" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="alone">Alone</SelectItem>
												<SelectItem value="group">Group</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{group && (
							<FormField
								control={form.control}
								name="other_members"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Name of other staff / student traveling together in group <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</div>
				</section>

				<section className="section-2 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
					<div className="flex gap-3 mb-8">
						<div className="rounded-sm bg-blue-200 w-4 h-8"></div>
						<h1 className="text-xl font-semibold">Travel Details</h1>
					</div>
					<div className="grid grid-auto-fit-lg gap-8">
						<FormField
							control={form.control}
							name="program_title"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">
										Program title / Event <span className="text-red-500"> *</span>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="program_description"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">
										Description <span className="text-red-500"> *</span>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="commencement_date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel className="mb-2 font-semibold text-sm text-gray-500">
										Commencement Date <span className="text-red-500"> *</span>
									</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={cn(
														"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden",
														!field.value && "text-muted-foreground",
													)}
												>
													<div className="bg-gray-100 h-full px-3 text-gray-900 grid place-items-center">
														<CalenderIcon size={20} />
													</div>
													{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={date => {
													if (date !== undefined) {
														date.setHours(date.getHours() + 8);
														field.onChange(date);
														field.value = date;
													}
												}}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="completion_date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel className="mb-2 font-semibold text-sm text-gray-500">
										Completion Date <span className="text-red-500"> *</span>
									</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl",
														!field.value && "text-muted-foreground",
													)}
												>
													<div className="bg-gray-100 h-full px-3 text-gray-900 grid place-items-center">
														<CalenderIcon size={20} />
													</div>
													{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={date => {
													field.onChange(date);
													if (date !== undefined) {
														date.setHours(date.getHours() + 8);
														field.value = new Date(date);
													}
												}}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="organiser"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">
										Organiser <span className="text-red-500"> *</span>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{externalForm.formStage === 2 && (
							<FormField
								control={form.control}
								name="total_hours"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Total Hours</FormLabel>
										<FormControl>
											<Input
												{...field}
												onChange={e => {
													field.onChange(e);
													if (e.target.value === "") {
														field.onChange(0);
													} else {
														field.onChange(parseInt(e.target.value));
													}
												}}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<FormField
							control={form.control}
							name="venue"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">
										Venue <span className="text-red-500"> *</span>
									</FormLabel>
									<FormControl>
										<Input {...field} value={field.value || ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="hrdf_claimable"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">
										HDRF Claimable <span className="text-red-500"> *</span>
									</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Please select an option" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="yes">Yes</SelectItem>
											<SelectItem value="no">No</SelectItem>
											<SelectItem value="not indicated in event brochure / registration form">
												Not indicated in event brochure / registration form
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</section>

				<section className="section-3 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
					<div className="flex gap-3 mb-8">
						<div className="rounded-sm bg-purple-300 w-4 h-8"></div>
						<h1 className="text-xl font-semibold">Logistic Arrangement</h1>
					</div>
					<div className="grid gap-8">
						{form.getValues("transport") === "aeroplane" && (
							<>
								<div className="grid grid-auto-fit-lg gap-8">
									<FormField
										control={form.control}
										name="flight_date"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-semibold text-sm text-gray-500">
													Flight Date <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant={"outline"}
																	className={cn(
																		"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden",
																		!field.value && "text-muted-foreground",
																	)}
																>
																	<div className="bg-gray-100 h-full px-3 text-gray-900 grid place-items-center">
																		<CalenderIcon size={20} />
																	</div>
																	{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent className="w-auto p-0" align="start">
															<Calendar
																mode="single"
																selected={field.value!}
																onSelect={date => {
																	field.onChange(date);
																	if (date !== undefined) {
																		date.setHours(date.getHours() + 8);
																		field.value = new Date(date);
																	}
																}}
																initialFocus
															/>
														</PopoverContent>
													</Popover>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="flight_time"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-semibold text-sm text-gray-500">
													Flight Time <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="flight_number"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-semibold text-sm text-gray-500">
												Flight Number <span className="text-red-500"> *</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div>
									<h2 className="font-medium mb-3">Destination</h2>
									<div className="grid grid-auto-fit-lg gap-8 ">
										<FormField
											control={form.control}
											name="destination_from"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="font-semibold text-sm text-gray-500">
														From <span className="text-red-500"> *</span>
													</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="destination_to"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="font-semibold text-sm text-gray-500">
														To <span className="text-red-500"> *</span>
													</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							</>
						)}

						<FormField
							control={form.control}
							name="hotel_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Hotel Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-auto-fit-lg gap-8 ">
							<FormField
								control={form.control}
								name="check_in_date"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Check In</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal disabled:opacity-100",
															!field.value && "text-muted-foreground",
														)}
													>
														{field.value ? format(field.value, "PPP") : <span>Not Filled</span>}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value!}
													onSelect={date => {
														field.onChange(date);
														if (date !== undefined) {
															date.setHours(date.getHours() + 8);
															field.value = new Date(date);
														}
													}}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="check_out_date"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Check Out</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal disabled:opacity-100",
															!field.value && "text-muted-foreground",
														)}
													>
														{field.value ? format(field.value, "PPP") : <span>Not Filled</span>}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value!}
													onSelect={date => {
														field.onChange(date);
														if (date !== undefined) {
															date.setHours(date.getHours() + 8);
															field.value = new Date(date);
														}
													}}
													disabled={date => {
														const checkInDate = form.getValues("check_in_date");
														return date < checkInDate!;
													}}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</section>

				<section className="section-4 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
					<div className="flex gap-3 mb-8">
						<div className="rounded-sm bg-cyan-400 w-4 h-8"></div>
						<h1 className="text-xl font-semibold">Funding</h1>
					</div>
					<div className="grid grid-auto-fit-lg gap-8">
						<FormField
							control={form.control}
							name="course_fee"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Course Fee</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												{...field}
												onChange={e => {
													field.onChange(Number(e.target.value));
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="airfare_fee"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Airfare Fee</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												{...field}
												onChange={e => {
													field.onChange(Number(e.target.value));
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="accommodation_fee"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Accommodation Fee</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												{...field}
												onChange={e => {
													field.onChange(Number(e.target.value));
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="per_diem_fee"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Per Diem Fee</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												{...field}
												onChange={e => {
													field.onChange(Number(e.target.value));
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="transportation_fee"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Transportation Fee</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												{...field}
												onChange={e => {
													field.onChange(Number(e.target.value));
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="travel_insurance_fee"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Travel Insurance Fee</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												{...field}
												onChange={e => {
													field.onChange(Number(e.target.value));
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="other_fees"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Other Fee</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												{...field}
												onChange={e => {
													field.onChange(Number(e.target.value));
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="grand_total_fees"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Total Fee</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												value={
													form.getValues("course_fee") +
													form.getValues("airfare_fee") +
													form.getValues("accommodation_fee") +
													form.getValues("per_diem_fee") +
													form.getValues("transportation_fee") +
													form.getValues("travel_insurance_fee") +
													form.getValues("other_fees")
												}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="mt-8">
						<h2 className="font-medium mb-3">
							Source of Fund -
							<span className="text-gray-500 text-sm">
								Details of account(s) to be debited. (It is encouraged to have a single source of funding)
							</span>
						</h2>
						<div className="grid grid-auto-fit-lg gap-8">
							<FormField
								name="staff_development_fund"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Staff Development Fund</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="consolidated_pool_fund"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Consolidated Pool Fund</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="research_fund"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Research Fund</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="travel_fund"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Travel Fund</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="student_council_fund"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Student Council Fund</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="other_funds"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">Other Fund</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="mt-8 space-y-4">
						<FormField
							control={form.control}
							name="expenditure_cap"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel className="font-semibold text-sm text-gray-500">
										Any expenditure cap? If yes, please specify below,{" "}
									</FormLabel>
									<FormControl>
										<RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-1">
											<FormItem className="flex items-center space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value="Yes" />
												</FormControl>
												<FormLabel className={"font-normal " + (externalForm.formStage !== 2 ? "text-gray-500" : "")}>
													Yes
												</FormLabel>
											</FormItem>
											<FormItem className="flex items-center space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value="No" />
												</FormControl>
												<FormLabel className={"font-normal " + (externalForm.formStage !== 2 ? "text-gray-500" : "")}>
													No
												</FormLabel>
											</FormItem>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="expenditure_cap_amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">Expenditure Cap Amount</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute bg-gray-100/90 h-[44px] w-[44px] rounded-l-xl text-center top-[2px] left-[2px]">
												<div className="grid place-items-center w-full h-full">
													<DollarSign className="h-5 w-5 text-gray-500" />
												</div>
											</div>
											<Input
												className="bg-white border border-gray-200 pl-14"
												disabled={form.getValues("expenditure_cap") !== "Yes"}
												{...field}
												onChange={e => {
													field.onChange(Number(e.target.value));
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</section>

				<section className="section-5 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
					<div className="flex gap-3 mb-8">
						<div className="rounded-sm bg-orange-400 w-4 h-8"></div>
						<h1 className="text-xl font-semibold">Supporting Documents</h1>
					</div>
					<div className="w-full">
						<Document documents={externalForm.supporting_documents ?? []} />
						{externalForm.supporting_documents?.length === 0 && (
							<div className="flex items-center justify-center h-96">
								<p className="text-gray-500">No supporting documents uploaded</p>
							</div>
						)}
					</div>
				</section>

				<section className="section-6 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
					<div className="flex gap-3 mb-8">
						<div className="rounded-sm bg-lime-400 w-4 h-8"></div>
						<h1 className="text-xl font-semibold">Applicant Declaration</h1>
					</div>
					<div className="grid gap-8">
						<div className="grid grid-auto-fit-lg gap-8">
							<FormField
								control={form.control}
								name="applicant_declaration_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Name <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="applicant_declaration_position_title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="font-semibold text-sm text-gray-500">
											Position Title <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="applicant_declaration_date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel className="font-semibold text-sm text-gray-500">
										Declaration Date <span className="text-red-500"> *</span>
									</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden",
														!field.value && "text-muted-foreground",
													)}
												>
													<div className="bg-gray-100 h-full px-3 text-gray-900 grid place-items-center">
														<CalenderIcon size={20} />
													</div>
													{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={date => {
													field.onChange(date);
													if (date !== undefined) {
														date.setHours(date.getHours() + 8);
														field.value = new Date(date);
													}
												}}
												disabled={date => {
													const today = new Date();
													return date < today;
												}}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="applicant_declaration_signature"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-semibold text-sm text-gray-500">
										Signature <span className="text-red-500"> *</span>
									</FormLabel>
									<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
										{externalForm.applicant_declaration_signature ? (
											<Image
												src={externalForm.applicant_declaration_signature ?? ""}
												width={300}
												height={200}
												alt="Signature"
											/>
										) : (
											<div className="text-gray-500">No signature uploaded</div>
										)}
									</div>
								</FormItem>
							)}
						/>
					</div>
				</section>

				{externalForm.formStage === 4 && (
					<section className="section-7 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
						<div className="flex gap-3 mb-8">
							<div className="rounded-sm bg-yellow-400 w-4 h-8"></div>
							<h1 className="text-xl font-semibold">Verification</h1>
						</div>
					</section>
				)}

				{externalForm.formStage === 5 && (
					<>
						<section className="section-7 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
							<div className="flex gap-3 mb-8">
								<div className="rounded-sm bg-yellow-400 w-4 h-8"></div>
								<h1 className="text-xl font-semibold">Verification</h1>
							</div>
							<div className="grid gap-8">
								<div className="grid grid-auto-fit-lg gap-8">
									<FormField
										control={form.control}
										name="verification_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-semibold text-sm text-gray-500">
													Name <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="verification_position_title"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-semibold text-sm text-gray-500">
													Position Title <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="verification_date"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel className="font-semibold text-sm text-gray-500">
												Declaration Date <span className="text-red-500"> *</span>
											</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden",
																!field.value && "text-muted-foreground",
															)}
														>
															<div className="bg-gray-100 h-full px-3 text-gray-900 grid place-items-center">
																<CalenderIcon size={20} />
															</div>
															{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={date => {
															field.onChange(date);
															if (date !== undefined) {
																date.setHours(date.getHours() + 8);
																field.value = new Date(date);
															}
														}}
														disabled={date => {
															const today = new Date();
															return date < today;
														}}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="verification_signature"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-semibold text-sm text-gray-500">
												Signature <span className="text-red-500"> *</span>
											</FormLabel>
											<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
												{externalForm.verification_signature ? (
													<Image src={externalForm.verification_signature ?? ""} width={300} height={200} alt="Signature" />
												) : (
													<div className="text-gray-500">No signature uploaded</div>
												)}
											</div>
										</FormItem>
									)}
								/>
							</div>
						</section>

						<section className="section-8 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
							<div className="flex gap-3 mb-8">
								<div className="rounded-sm bg-red-400 w-4 h-8"></div>
								<h1 className="text-xl font-semibold">Approval</h1>
							</div>
							<div className="grid gap-8">
								<div className="grid grid-auto-fit-lg gap-8">
									<FormField
										control={form.control}
										name="approval_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-semibold text-sm text-gray-500">
													Name <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="approval_position_title"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-semibold text-sm text-gray-500">
													Position Title <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="approval_date"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel className="font-semibold text-sm text-gray-500">
												Declaration Date <span className="text-red-500"> *</span>
											</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden",
																!field.value && "text-muted-foreground",
															)}
														>
															<div className="bg-gray-100 h-full px-3 text-gray-900 grid place-items-center">
																<CalenderIcon size={20} />
															</div>
															{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={date => {
															field.onChange(date);
															if (date !== undefined) {
																date.setHours(date.getHours() + 8);
																field.value = new Date(date);
															}
														}}
														disabled={date => {
															const today = new Date();
															return date < today;
														}}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="approval_signature"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-semibold text-sm text-gray-500">
												Signature <span className="text-red-500"> *</span>
											</FormLabel>
											<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
												{externalForm.approval_signature ? (
													<Image src={externalForm.approval_signature ?? ""} width={300} height={200} alt="Signature" />
												) : (
													<div className="text-gray-500">No signature uploaded</div>
												)}
											</div>
										</FormItem>
									)}
								/>
							</div>
						</section>
					</>
				)}
			</form>
		</Form>
	);
}
