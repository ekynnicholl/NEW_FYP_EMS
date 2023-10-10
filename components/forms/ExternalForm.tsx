"use client";

import { useState, useRef } from "react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import SignaturePad from "react-signature-canvas";
import Image from "next/image";

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

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ExternalForm() {
	const supabase = createClientComponentClient();

	const [imageURL, setImageURL] = useState("");

	const sigCanvas = useRef({});
	const clear = () => sigCanvas.current.clear();
	const save = () => {
		setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
	};

	const form = useForm<z.infer<typeof externalFormSchema>>({
		resolver: zodResolver(externalFormSchema),
		defaultValues: {
			name: "",
			email: "",
			staff_id: "",
			course: "",
			faculty: "",
			transport: "",
			traveling: "",
			other_member: "",

			program_title: "",
			program_description: "",
			commencement_date: undefined,
			completion_date: undefined,
			organiser: "",
			venue: "",
			HRDF_claimable: "",

			flight_date: undefined,
			flight_time: "",
			flight_number: "",
			destination_from: "",
			destination_to: "",
			check_in_date: undefined,
			check_out_date: undefined,
			hotel: "",

			course_fee: 0,
			airfare_fee: 0,
			accommodation_fee: 0,
			per_diem_fee: 0,
			transportation_fee: 0,
			travel_insurance_fee: 0,
			other_fee: 0,
			total_fee: 0,
			staff_development_fund: "",
			consolidated_pool_fund: "",
			research_fund: "",
			travel_fund: "",
			student_council_fund: "",
			other_fund: "",
			// has_expenditure_cap: false,
			// expenditure_cap_amount: 0,

			applicant_signature: "",
			applicant_name: "",
			applicant_position_title: "",
			applicant_declaration_date: undefined,
		},
	});

	async function onSubmit(values: z.infer<typeof externalFormSchema>) {
		console.log("Form sent");
		const { error } = await supabase.from("external_form").insert([
			{
				...values,
			},
		]);

		if (error) {
			console.log(error);
		}

		console.log(values);
	}

	return (
		<div className="grid grid-cols-[240px_auto] gap-8 items-start">
			<div className="sticky space-y-8 h-[100dvh] top-0 px-8 py-8">
				<div>Persona Details</div>
				<div>Travel Details</div>
				<div>Logistic Arrangement</div>
				<div>Funding</div>
				<div>Applicant Declaration</div>
			</div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="mt-8 space-y-8 w-full">
					<section className="section-1">
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
									name="name"
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
									name="traveling"
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
								name="other_member"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Name of other staff / student traveling
											together in group
										</FormLabel>
										<FormControl>
											<Input
												disabled={
													form.getValues("traveling") !==
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

					<section className="section-2">
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
								name="HRDF_claimable"
								render={({ field }) => (
									<FormItem>
										<FormLabel>HDRF Claimable</FormLabel>
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

					<section className="section-3">
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
												<Input {...field} />
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
								name="hotel"
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

					<section className="section-4">
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
								name="other_fee"
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
								name="total_fee"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Total Fee</FormLabel>
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
									name="other_fund"
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
					</section>

					<Separator className="my-8" />

					<section className="section-5">
						<h1 className="text-2xl font-bold mb-4">
							5. Applicant Declaration
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
									name="applicant_name"
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
									name="applicant_position_title"
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
													disabled={date => date <= new Date()}
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
								name="applicant_signature"
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

					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</div>
	);
}
