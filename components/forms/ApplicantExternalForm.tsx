"use client";

import { useState, useRef, useEffect } from "react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import SignaturePad from "react-signature-canvas";
import Image from "next/image";

import { SiMicrosoftword } from "react-icons/si";
import { BsFiletypePdf } from "react-icons/bs";

import externalFormSchema from "@/schema/externalFormSchema";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { sendContactForm } from "@/lib/api";

export default function ExternalForm() {
	const supabase = createClientComponentClient();

	const [open, setOpen] = useState(false);
	const [imageURL, setImageURL] = useState("");
	const [externalForm, setExternalForm] = useState<any>();

	// const [externalForm, setExternalForm] = useState<z.infer<typeof externalFormSchema>>({
	// 	formStage: 2,
	// 	name: "",
	// 	email: "",
	// 	staff_id: "",
	// 	course: "",
	// 	faculty: "",
	// 	transport: "",
	// 	traveling: "",
	// 	other_member: "",

	// 	program_title: "",
	// 	program_description: "",
	// 	commencement_date: undefined,
	// 	completion_date: undefined,
	// 	organiser: "",
	// 	venue: "",
	// 	HRDF_claimable: "",

	// 	flight_date: undefined,
	// 	flight_time: "",
	// 	flight_number: "",
	// 	destination_from: "",
	// 	destination_to: "",
	// 	check_in_date: undefined,
	// 	check_out_date: undefined,
	// 	hotel: "",

	// 	course_fee: 0,
	// 	airfare_fee: 0,
	// 	accommodation_fee: 0,
	// 	per_diem_fee: 0,
	// 	transportation_fee: 0,
	// 	travel_insurance_fee: 0,
	// 	other_fee: 0,
	// 	total_fee: 0,
	// 	staff_development_fund: "",
	// 	consolidated_pool_fund: "",
	// 	research_fund: "",
	// 	travel_fund: "",
	// 	student_council_fund: "",
	// 	other_fund: "",
	// 	has_expenditure_cap: "No",
	// 	expenditure_cap_amount: undefined,

	// 	supporting_documents: null,

	// 	applicant_signature: "",
	// 	applicant_name: "",
	// 	applicant_position_title: "",
	// 	applicant_declaration_date: undefined,
	// });

	const sigCanvas = useRef({});
	//@ts-ignore
	const clear = () => sigCanvas.current.clear();
	const save = () => {
		//@ts-ignore
		setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
	};

	const form = useForm<z.infer<typeof externalFormSchema>>({
		resolver: zodResolver(externalFormSchema),
		// defaultValues: externalForm,
		defaultValues: {
			formStage: 2,
			full_name: "",
			email: "",
			staff_id: "",
			course: "",
			faculty: "",
			transport: "",
			travelling: "",
			other_members: "",

			program_title: "",
			program_description: "",
			commencement_date: undefined,
			completion_date: undefined,
			organiser: "",
			venue: "",
			hrdf_claimable: "",

			flight_date: undefined,
			flight_time: "",
			flight_number: "",
			destination_from: "",
			destination_to: "",
			check_in_date: undefined,
			check_out_date: undefined,
			hotel_name: "",

			course_fee: 0,
			airfare_fee: 0,
			accommodation_fee: 0,
			per_diem_fee: 0,
			transportation_fee: 0,
			travel_insurance_fee: 0,
			other_fees: 0,
			grand_total_fees: 0,
			staff_development_fund: "",
			consolidated_pool_fund: "",
			research_fund: "",
			travel_fund: "",
			student_council_fund: "",
			other_funds: "",
			expenditure_cap: "No",
			expenditure_cap_amount: undefined,

			supporting_documents: null,

			applicant_declaration_signature: "",
			applicant_declaration_name: "",
			applicant_declaration_position_title: "",
			applicant_declaration_date: undefined,
		},
	});

	// useEffect(() => {
	// 	if (externalForm) {
	// 		console.log(externalForm);
	// 		sendContactForm(externalForm);
	// 	}
	// }, [externalForm!.formStage!]);

	async function onSubmit(values: z.infer<typeof externalFormSchema>) {
		console.log("Form sent");
		setExternalForm(values);

		const { error } = await supabase.from("external_forms").insert([
			{
				...values,
				formStage: 2,
			},
		]);

		setExternalForm({
			...externalForm,
			formStage: 2,
		});

		if (error) {
			console.log(error);
		}
		console.log(values);
	}

	return (
		<div className="grid grid-cols-[240px_auto] gap-8 items-start">
			<div className="sticky space-y-8 h-[100dvh] top-0 px-8 py-8">
				<a className="block" href="#Personal Details">
					Personal Details
				</a>
				<a className="block" href="#Travel Details">
					Travel Details
				</a>
				<a className="block" href="#Logistic Arrangement">
					Logistic Arrangement
				</a>
				<a className="block" href="#Funding">
					Funding
				</a>
				<a className="block" href="#Supporting Documents">
					Supporting Documents
				</a>
				<a className="block" href="#Applicant Declaration">
					Applicant Declaration
				</a>
			</div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="mt-8 space-y-8 w-full">
					<section className="section-1" id="Personal Details">
						<h2 className="text-2xl font-bold mb-4">1. Personal Details</h2>
						<div className="grid gap-8">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="Email"
												{...field}
											/>
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
											<FormLabel>
												Full Name (Same as I.C / Passport)
											</FormLabel>
											<FormControl>
												<Input placeholder="Name" {...field} />
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
											<FormLabel>Staff ID / Student No.</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Designation / Course</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Faculty / School / Unit</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Type of Transportation</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Please select an option" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="aeroplane">
														Aeroplane
													</SelectItem>
													<SelectItem value="company vehicle">
														Company vehicle
													</SelectItem>
													<SelectItem value="own transport">
														Own transport
													</SelectItem>
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
											<FormLabel>Traveling in</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Please select an option" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="alone">
														Alone
													</SelectItem>
													<SelectItem value="group">
														Group
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="other_members"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Name of other staff / student traveling
											together in group
										</FormLabel>
										<FormControl>
											<Input
												disabled={
													form.getValues("travelling") !==
													"group"
												}
												placeholder=""
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</section>

					<Separator className="my-8" />

					<section className="section-2" id="Travel Details">
						<h2 className="text-2xl font-bold mb-4">2. Travel Details</h2>
						<div className="grid grid-auto-fit-lg gap-8">
							<FormField
								control={form.control}
								name="program_title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Program title / Event</FormLabel>
										<FormControl>
											<Input placeholder="" {...field} />
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
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Input placeholder="" {...field} />
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
										<FormLabel>Commencement Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground",
														)}>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={date => {
														const today = new Date();
														today.setHours(0, 0, 0, 0);
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
								name="completion_date"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Completion Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground",
														)}>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={date => {
														const today = new Date();
														today.setHours(0, 0, 0, 0);
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
								name="organiser"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Organiser</FormLabel>
										<FormControl>
											<Input placeholder="" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="venue"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Venue</FormLabel>
										<FormControl>
											<Input placeholder="" {...field} />
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
										<FormLabel>HDRF Claimable</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Please select an option" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="yes">Yes</SelectItem>
												<SelectItem value="no">No</SelectItem>
												<SelectItem value="not indicated in event brochure / registration form">
													Not indicated in event brochure /
													registration form
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</section>

					<Separator className="my-8" />

					<section className="section-3" id="Logistic Arrangement">
						<h2 className="text-2xl font-bold mb-4">
							3. Logistic Arrangement
						</h2>
						<div className="grid gap-8">
							<div className="grid grid-auto-fit-lg gap-8">
								<FormField
									control={form.control}
									name="flight_date"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Flight Date</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value &&
																	"text-muted-foreground",
															)}>
															{field.value ? (
																format(field.value, "PPP")
															) : (
																<span>Pick a date</span>
															)}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto p-0"
													align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={date => {
															const today = new Date();
															today.setHours(0, 0, 0, 0);
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
									name="flight_time"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Flight Time</FormLabel>
											<FormControl>
												<Input type="time" {...field} />
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
										<FormLabel>Flight Number</FormLabel>
										<FormControl>
											<Input placeholder="" {...field} />
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
												<FormLabel>From</FormLabel>
												<FormControl>
													<Input
														placeholder="Sarawak"
														{...field}
													/>
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
												<FormLabel>To</FormLabel>
												<FormControl>
													<Input
														placeholder="Singapore"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<div className="grid grid-auto-fit-lg gap-8 ">
								<FormField
									control={form.control}
									name="check_in_date"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Check In</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value &&
																	"text-muted-foreground",
															)}>
															{field.value ? (
																format(field.value, "PPP")
															) : (
																<span>Pick a date</span>
															)}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto p-0"
													align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={date => {
															const today = new Date();
															today.setHours(0, 0, 0, 0);
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
									name="check_out_date"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Check Out</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value &&
																	"text-muted-foreground",
															)}>
															{field.value ? (
																format(field.value, "PPP")
															) : (
																<span>Pick a date</span>
															)}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto p-0"
													align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={date => {
															const today = new Date();
															today.setHours(0, 0, 0, 0);
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
							</div>

							<FormField
								control={form.control}
								name="hotel_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Hotel</FormLabel>
										<FormControl>
											<Input placeholder="" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</section>

					<Separator className="my-8" />

					<section className="section-4" id="Funding">
						<h2 className="text-2xl font-bold mb-4">4. Funding</h2>
						<div className="grid grid-auto-fit-lg gap-8">
							<FormField
								control={form.control}
								name="course_fee"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Course Fee</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
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
										<FormLabel>Airfare Fee</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
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
										<FormLabel>Accommodation Fee</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
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
										<FormLabel>Per Diem Fee</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
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
										<FormLabel>Transportation Fee</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
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
										<FormLabel>Travel Insurance Fee</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
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
										<FormLabel>Other Fee</FormLabel>
										<FormControl>
											<Input
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
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
										<FormLabel>Total Fee</FormLabel>
										<FormControl>
											<Input
												disabled
												value={
													form.getValues("course_fee") +
													form.getValues("airfare_fee") +
													form.getValues("accommodation_fee") +
													form.getValues("per_diem_fee") +
													form.getValues("transportation_fee") +
													form.getValues(
														"travel_insurance_fee",
													) +
													form.getValues("other_fees")
												}
											/>
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
									Details of account(s) to be debited. (It is encouraged
									to have a single source of funding)
								</span>
							</h2>
							<div className="grid grid-auto-fit-lg gap-8">
								<FormField
									name="staff_development_fund"
									control={form.control}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Staff Development Fund</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Consolidated Pool Fund</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Research Fund</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Travel Fund</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Student Council Fund</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Other Fund</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
										<FormLabel>
											Any expenditure cap? If yes, please specify
											below
										</FormLabel>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
												className="flex space-x-1">
												<FormItem className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem value="Yes" />
													</FormControl>
													<FormLabel className="font-normal">
														Yes
													</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem value="No" />
													</FormControl>
													<FormLabel className="font-normal">
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
										<FormLabel>Expenditure Cap Amount</FormLabel>
										<FormControl>
											<Input
												disabled={
													form.getValues(
														"expenditure_cap",
													) !== "Yes"
												}
												type="number"
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</section>

					<Separator className="my-8" />

					<section className="section-5" id="Supporting Documents">
						<h1 className="text-2xl font-bold mb-4">
							5. Supporting Documents
						</h1>
						<FormField
							control={form.control}
							name="supporting_documents"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											<svg
												className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
												aria-hidden="true"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 20 16">
												<path
													stroke="currentColor"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
												/>
											</svg>
											<p className="mb-2 text-base text-gray-500 dark:text-gray-400">
												<span className="font-semibold">
													Click to upload
												</span>{" "}
												or drag and drop
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												PDF or Word (maximum 5MB)
											</p>
											{field?.value?.length! > 0 && (
												<p className="mt-2 text-xl text-slate-700">
													{field.value?.length} Files Uploaded
												</p>
											)}
										</div>
									</FormLabel>
									<FormControl>
										<Input
											multiple
											type="file"
											className="hidden"
											accept=".pdf,.doc,.docx"
											{...form.register("supporting_documents", {
												required: false,
											})}
										/>
									</FormControl>
									<FormMessage />
									<div className="flex flex-col gap-2 mt-2 items-start">
										{form.getValues("supporting_documents") &&
											Array.from(
												form.getValues("supporting_documents")!,
											).map((file: File) => (
												<div key={file.name}>
													{
														// extract the extension of the document "process.pdf", remember the last index of the dot and add 1 to get the extension
														file.name.slice(
															file.name.lastIndexOf(".") +
																1,
														) === "pdf" ? (
															<div className="flex gap-2 p-2 items-start">
																<BsFiletypePdf className="w-6 h-6 text-red-500" />
																{file.name}
															</div>
														) : (
															<div className="flex gap-2 p-2 items-start">
																<SiMicrosoftword className="w-6 h-6 text-blue-500" />
																{file.name}
															</div>
														)
													}
												</div>
											))}
									</div>
								</FormItem>
							)}
						/>
					</section>

					<Separator className="my-8" />

					<section className="section-6" id="Applicant Declaration">
						<h1 className="text-2xl font-bold mb-4">
							6. Applicant Declaration
						</h1>
						<p className="text-gray-500 dark:text-gray-400 mb-8">
							I (or acting as representative of group travelling) hereby
							confirm the accuracy of the information (including any
							attachments) provided for this application.
						</p>
						<div className="grid gap-8">
							<div className="grid grid-auto-fit-lg gap-8">
								<FormField
									control={form.control}
									name="applicant_declaration_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
											<FormLabel>Position title</FormLabel>
											<FormControl>
												<Input placeholder="" {...field} />
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
										<FormLabel>Declaration Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground",
														)}>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={date => {
														const today = new Date();
														today.setHours(0, 0, 0, 0);
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
										<FormLabel>Signature</FormLabel>
										<Dialog>
											<FormControl>
												<DialogTrigger asChild>
													<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
														{imageURL && (
															<Image
																src={imageURL}
																width={300}
																height={200}
																alt="Signature"
															/>
														)}
													</div>
												</DialogTrigger>
											</FormControl>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Signature</DialogTitle>
													<DialogClose />
												</DialogHeader>
												<DialogDescription>
													Please sign below
												</DialogDescription>
												<div className="w-full h-[200px] border-2 border-gray-300 rounded-md">
													<SignaturePad
														ref={sigCanvas}
														canvasProps={{
															className: "w-full h-full",
														}}
													/>
												</div>
												<DialogFooter>
													<Button
														variant="outline"
														onClick={clear}>
														Clear
													</Button>
													<DialogClose asChild>
														<Button
															onClick={() => {
																save();
																field.onChange(
																	sigCanvas.current
																		.getTrimmedCanvas()
																		.toDataURL(
																			"image/png",
																		),
																);
																field.value =
																	sigCanvas.current
																		.getTrimmedCanvas()
																		.toDataURL(
																			"image/png",
																		);
																console.log(
																	"Field Value: " +
																		field.value,
																);
															}}>
															Save
														</Button>
													</DialogClose>
												</DialogFooter>
											</DialogContent>
											<FormMessage />
										</Dialog>
									</FormItem>
								)}
							/>
						</div>
					</section>

					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger>
							<Button type="button">Submit for Review</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									Please ensure your information is correct.
								</DialogTitle>
								<DialogDescription>
									Incorrect information may result in your application.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<DialogClose>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button
									onMouseUp={() => {
										setOpen(false);
									}}
									onClick={form.handleSubmit(onSubmit)}>
									Submit
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</form>
			</Form>
		</div>
	);
}
