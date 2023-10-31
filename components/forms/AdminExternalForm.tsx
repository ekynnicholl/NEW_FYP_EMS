"use client";

import { useState, useRef, useEffect } from "react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, set } from "date-fns";
import SignaturePad from "react-signature-canvas";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import cookie from "js-cookie";
import { useRouter } from "next/navigation";

import { SiMicrosoftword } from "react-icons/si";
import { BsFiletypePdf } from "react-icons/bs";

import adminExternalFormSchema from "@/schema/adminExternalFormSchema";
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

export default function AdminExternalForm({ data }: { data: ExternalForm }) {
	const supabase = createClientComponentClient();
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [externalForm, setExternalForm] = useState<ExternalForm>(data);
	const [imageURL, setImageURL] = useState("");

	// Keep track of the revert comment,
	const [showCommentInput, setShowCommentInput] = useState(false);

	// Check whether the user is logged in,
	const authToken = cookie.get("authToken");

	// Fetch the current stage of the form to capture whether the stage has changed to submit email,
	const [fetchedFormStage, setFetchedFormStage] = useState<number>(0);

	const sigCanvas = useRef({});
	//@ts-ignore
	const clear = () => sigCanvas.current.clear();
	const save = () => {
		//@ts-ignore
		setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
	};

	// TO-DO: UNCOMMENT THIS TO ENABLE THE EMAIL SENDING FEATURE. YOU DON'T NEED TO UPDATE ANYTHING IN THE API, JUST ENSURE THE FORM CAN BE PASSED INTO IT,
	// I'M USING USEEFFECT TO CHECK WHETHER THE EXTERNALFORM IS UPDATED THROUGH SETEXTERNALFORM IN THE onSubmit or onRevert, IF ANY CHANGES,
	// PASS INTO THE API AND SEND THE EMAIL.
	// useEffect(() => {
	// 	if (externalForm.formStage != fetchedFormStage) {
	// 		console.log(externalForm);
	// 		sendContactForm(externalForm);
	// 	}
	// }, [externalForm.formStage])

	const form = useForm<z.infer<typeof adminExternalFormSchema>>({
		resolver: zodResolver(adminExternalFormSchema),
		defaultValues: {
			// TO-DO: PLEASE FIX ALL THE ERRORS HERE, TQ.
			revertComment: externalForm.revertComment ?? "",
			formStage: externalForm.formStage?.toString(),
			securityKey: externalForm.securityKey!,

			name: externalForm.full_name!,
			email: externalForm.email ?? "",
			staff_id: externalForm.staff_id!,
			course: externalForm.course!,
			faculty: externalForm.faculty!,
			transport: externalForm.transport!,
			traveling: externalForm.travelling,
			other_member: externalForm.other_members!,

			program_title: externalForm.program_title!,
			program_description: externalForm.program_description!,
			commencement_date: externalForm.commencement_date!,
			completion_date: externalForm.completion_date!,
			organiser: externalForm.organiser!,
			venue: externalForm.venue!,
			HRDF_claimable: externalForm.hrdf_claimable!,

			flight_date: externalForm.flight_date!,
			flight_time: externalForm.flight_time!,
			flight_number: externalForm.flight_number!,
			destination_from: externalForm.destination_from!,
			destination_to: externalForm.destination_to!,
			check_in_date: externalForm.check_in_date!,
			check_out_date: externalForm.check_out_date!,
			hotel: externalForm.hotel_name!,

			course_fee: externalForm.course_fee!,
			airfare_fee: externalForm.airfare_fee!,
			accommodation_fee: externalForm.accommodation_fee!,
			per_diem_fee: externalForm.per_diem_fee!,
			transportation_fee: externalForm.transportation_fee!,
			travel_insurance_fee: externalForm.travel_insurance_fee!,
			other_fee: externalForm.other_fees!,
			total_fee: externalForm.grand_total_fees!,
			staff_development_fund: externalForm.staff_development_fund!,
			consolidated_pool_fund: externalForm.consolidated_pool_fund!,
			research_fund: externalForm.research_fund!,
			travel_fund: externalForm.travel_fund!,
			student_council_fund: externalForm.student_council_fund!,
			other_fund: externalForm.other_funds!,
			expenditure_cap: externalForm.expenditure_cap!,
			expenditure_cap_amount: externalForm.expenditure_cap_amount!,

			supporting_documents: null,

			applicant_signature: externalForm.applicant_declaration_signature!,
			applicant_name: externalForm.applicant_declaration_name!,
			applicant_position_title: externalForm.applicant_declaration_position_title!,
			applicant_declaration_date: externalForm.applicant_declaration_date!,

			verification_signature: null,
			verification_name: "",
			verification_position_title: "",
			verification_date: undefined,

			approval_signature: null,
			approval_name: "",
			approval_position_title: "",
			approval_date: undefined,
		},
	});

	async function onSubmit(values: z.infer<typeof adminExternalFormSchema>) {
		const { error } = await supabase
			.from("external_form")
			.update([
				{
					...values,
				},
			])
			.eq("id", externalForm.id);

		if (error) {
			console.log(error);
		}

		console.log("Form updated successfully.");
		console.log(values);

		// Generate the security key,
		const securityKeyUID = uuidv4();

		// This part is for submission for review from AAO to HOS/ MGR/ ADCR, Stage 2 -> Stage 3,
		if (externalForm.formStage === 2) {
			const { data, error } = await supabase
				.from("external_testing")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						expenditure_cap: externalForm.expenditure_cap,
						expenditure_cap_amount: externalForm.expenditure_cap_amount,
						revertComment: "None",
						securityKey: securityKeyUID,
						formStage: 3,
					},
				])
				.eq("formID", externalForm.id);

			if (error) {
				console.error("Error updating data:", error);
			} else {
				console.log("Data updated successfully:", data);

				setExternalForm({
					...externalForm,
					revertComment: "",
					expenditure_cap: externalForm.expenditure_cap,
					expenditure_cap_amount: externalForm.expenditure_cap_amount,
					securityKey: securityKeyUID,
					formStage: 3,
				});

				window.location.reload();
			}
		}
		// This part is when the staff re-submits the form to the AAO after being reverted,
		else if (externalForm.formStage === 1) {
			const { error } = await supabase
				.from("external_form")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						...values,
						formStage: 2,
						securityKey: null,
						// THIS IS WHAT YOU'RE SUPPOSE TO UPDATE,
						// fundSourceName: formDetails.fundSourceName,
						// fundAmount: formDetails.fundAmount,
						// formStage: 2,
						// securityKey: null,
						// hosEmail: formDetails.hosEmail,
						// deanEmail: formDetails.deanEmail
						staff_email: values.staff_email,
						hosEmail: values.verification_email,
						deanEmail: values.approval_email,
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				console.log(error);
			}
		}

		// This is for submitting the forms for further review to HMU/ Dean BY HOS/ MGR/ ADCR, Stage 3 -> Stage 4,
		else if (externalForm.formStage === 3) {
			const { data, error } = await supabase
				.from("external_testing")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 4,
						securityKey: null,
						// TO-DO: ADD IN HOS/ ADCR/ MGR DETAILS INTO THE DATABASE.
						staff_email: values.staff_email,

						verification_email: values.verification_email,
						verification_name: values.verification_name,
						verification_position_title: values.verification_position_title,
						verification_date: values.verification_date,
						verification_signature: values.verification_signature,

						approval_email: values.approval_email,
						approval_name: values.approval_name,
						approval_position_title: values.approval_position_title,
						approval_date: values.approval_date,
						approval_signature: values.approval_signature,
					},
				])
				.eq("formID", externalForm.id);

			if (error) {
				console.error("Error inserting data:", error);
			} else {
				console.log("Data inserted successfully:", data);

				setExternalForm({
					...externalForm,
					formStage: 4,
				});

				router.refresh();
				// window.location.reload();
			}
		}

		// This is for approving the forms by HMU/ Dean, Stage 4 -> Stage 5,
		else if (externalForm.formStage === 4) {
			const { data, error } = await supabase
				.from("external_testing")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 5,
						securityKey: null,
						// TO-DO: ADD IN HMU/ DEAN DETAILS INTO THE DATABASE.
						staff_email: values.staff_email,

						verification_email: values.verification_email,
						verification_name: values.verification_name,
						verification_position_title: values.verification_position_title,
						verification_date: values.verification_date,
						verification_signature: values.verification_signature,

						approval_email: values.approval_email,
						approval_name: values.approval_name,
						approval_position_title: values.approval_position_title,
						approval_date: values.approval_date,
						approval_signature: values.approval_signature,
					},
				])
				.eq("formID", externalForm.id);

			if (error) {
				console.error("Error inserting data:", error);
			} else {
				console.log("Data inserted successfully:", data);

				setExternalForm({
					...externalForm,
					formStage: 5,
				});

				router.refresh();
				// window.location.reload();
			}
		}
	}

	const handleRevert = async (values: z.infer<typeof adminExternalFormSchema>) => {
		const securityKeyUID = uuidv4();

		// This is for rejecting the forms by HOS/ ADCR/ MGR, Stage 3 -> Stage 6,
		if (externalForm.formStage === 3) {
			const { data, error } = await supabase
				.from("external_testing")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 6,
						securityKey: null,
						// TO-DO: ADD IN HOS/ ADCR/ MGR DETAILS INTO THE DATABASE.
						staff_email: values.staff_email,

						verification_email: values.verification_email,
						verification_name: values.verification_name,
						verification_position_title: values.verification_position_title,
						verification_date: values.verification_date,
						verification_signature: values.verification_signature,

						approval_email: values.approval_email,
						approval_name: values.approval_name,
						approval_position_title: values.approval_position_title,
						approval_date: values.approval_date,
						approval_signature: values.approval_signature,
					},
				])
				.eq("formID", externalForm.id);

			if (error) {
				console.error("Error updating data:", error);
			} else {
				console.log("Data updated successfully:", data);

				setExternalForm({
					...externalForm,
					formStage: 6,
				});

				router.refresh();
				// window.location.reload();
			}
		} else if (externalForm.formStage === 4) {
			const { data, error } = await supabase
				.from("external_testing")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 6,
						securityKey: null,
						// TO-DO: ADD IN HMU/ DEAN DETAILS INTO THE DATABASE.
						staff_email: values.staff_email,

						verification_email: values.verification_email,
						verification_name: values.verification_name,
						verification_position_title: values.verification_position_title,
						verification_date: values.verification_date,
						verification_signature: values.verification_signature,

						approval_email: values.approval_email,
						approval_name: values.approval_name,
						approval_position_title: values.approval_position_title,
						approval_date: values.approval_date,
						approval_signature: values.approval_signature,
					},
				])
				.eq("formID", externalForm.id);

			if (error) {
				console.error("Error updating data:", error);
			} else {
				console.log("Data updated successfully:", data);

				setExternalForm({
					...externalForm,
					formStage: 6,
				});

				router.refresh();
				// window.location.reload();
			}
		}

		// This is for the AAO to revert to the staff with the comments, Stage 2 -> Stage 1,
		if (
			externalForm.formStage === 2 &&
			(showCommentInput == true || externalForm.revertComment != "None")
		) {
			const { data, error } = await supabase
				.from("external_testing")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						expenditure_cap: externalForm.expenditure_cap,
						expenditure_cap_amount: externalForm.expenditure_cap_amount,
						revertComment: externalForm.revertComment,
						securityKey: securityKeyUID,
						formStage: 1,
					},
				])
				.eq("formID", externalForm.id);

			if (error) {
				console.error("Error updating data:", error);
			} else {
				console.log("Data updated successfully:", data);

				// showSuccessToast('You have successfully reverted the form. Emails have been sent out.');

				setExternalForm({
					...externalForm,
					formStage: 1,
					securityKey: securityKeyUID,
				});

				router.refresh();
				// window.location.reload();
			}
		} else if (showCommentInput == false) {
			setShowCommentInput(true);
		}
	};

	return (
		<div>
			{/* TO-DO: ADD 3 MORE ADDITIONAL FIELDS. I DON'T THINK THIS EXIST IN THE DATABASE YET. */}
			{/* 1. STAFF EMAIL (INPUT FIELD WITH EMAIL VALIDATION), 2. HOS/ MGR/ ADCR EMAIL (DROPDOWN SELECT), 3. HMU/ DEAN EMAIL (DROPDOWN SELECT) */}
			{externalForm.formStage !== 5 && externalForm.formStage !== 6 ? (
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
						<a className="block" href="#Verification">
							Verification
						</a>
						<a className="block" href="#Approval">
							Approval
						</a>
					</div>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="mt-8 space-y-8 w-full">
							<section className="section-1" id="Personal Details">
								<h2 className="text-2xl font-bold mb-4">
									1. Personal Details
								</h2>
								<div className="grid gap-8">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
													<FormLabel>
														Staff ID / Student No.
													</FormLabel>
													<FormControl>
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
													<FormLabel>
														Designation / Course
													</FormLabel>
													<FormControl>
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
													<FormLabel>
														Faculty / School / Unit
													</FormLabel>
													<FormControl>
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
													<FormLabel>
														Type of Transportation
													</FormLabel>
													<Select
														disabled
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
														disabled
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
													Name of other staff / student
													traveling together in group
												</FormLabel>
												<FormControl>
													<Input
														disabled={
															form.getValues(
																"traveling",
															) !== "group"
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

							<section className="section-2" id="Travel Details<">
								<h2 className="text-2xl font-bold mb-4">
									2. Travel Details
								</h2>
								<div className="grid grid-auto-fit-lg gap-8">
									<FormField
										control={form.control}
										name="program_title"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Program title / Event
												</FormLabel>
												<FormControl>
													<Input
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
														{...field}
													/>
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
													<Input
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
														{...field}
													/>
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
												<FormControl>
													<Button
														disabled
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground",
														)}>
														<span>
															{field.value.toLocaleString()}
														</span>
													</Button>
												</FormControl>
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
												<FormControl>
													<Button
														disabled
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground",
														)}>
														{field.value.toLocaleString()}
													</Button>
												</FormControl>
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
													<Input
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
														{...field}
													/>
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
													<Input
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
														{...field}
													/>
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
												<Select
													disabled
													onValueChange={field.onChange}
													defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Please select an option" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="yes">
															Yes
														</SelectItem>
														<SelectItem value="no">
															No
														</SelectItem>
														<SelectItem value="not indicated in event brochure / registration form">
															Not indicated in event
															brochure / registration form
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
													<FormControl>
														<Button
															disabled
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value &&
																	"text-muted-foreground",
															)}>
															{field.value.toLocaleString()}
														</Button>
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
													<FormLabel>Flight Time</FormLabel>
													<FormControl>
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
													<Input
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
														{...field}
													/>
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
																disabled
																className="disabled:text-black-500 disabled:opacity-100"
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
																disabled
																className="disabled:text-black-500 disabled:opacity-100"
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
													<FormControl>
														<Button
															disabled
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value &&
																	"text-muted-foreground",
															)}>
															{field.value.toLocaleString()}
														</Button>
													</FormControl>
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
													<FormControl>
														<Button
															disabled
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value &&
																	"text-muted-foreground",
															)}>
															{field.value.toLocaleString()}
														</Button>
													</FormControl>
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
													<Input
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
												<FormLabel>
													Travel Insurance Fee
												</FormLabel>
												<FormControl>
													<Input
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
														disabled
														className="disabled:text-black-500 disabled:opacity-100"
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
														disabled
														value={
															form.getValues("course_fee") +
															form.getValues(
																"airfare_fee",
															) +
															form.getValues(
																"accommodation_fee",
															) +
															form.getValues(
																"per_diem_fee",
															) +
															form.getValues(
																"transportation_fee",
															) +
															form.getValues(
																"travel_insurance_fee",
															) +
															form.getValues("other_fee")
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
											Details of account(s) to be debited. (It is
											encouraged to have a single source of funding)
										</span>
									</h2>
									<div className="grid grid-auto-fit-lg gap-8">
										<FormField
											name="staff_development_fund"
											control={form.control}
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Staff Development Fund
													</FormLabel>
													<FormControl>
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
													<FormLabel>
														Consolidated Pool Fund
													</FormLabel>
													<FormControl>
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
													<FormLabel>
														Student Council Fund
													</FormLabel>
													<FormControl>
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
										name="has_expenditure_cap"
										render={({ field }) => (
											<FormItem className="space-y-3">
												<FormLabel>
													Any expenditure cap? If yes, please
													specify below
												</FormLabel>
												<FormControl>
													<RadioGroup
														disabled={
															externalForm.formStage !== 2
														}
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
												<FormLabel>
													Expenditure Cap Amount
												</FormLabel>
												<FormControl>
													<Input
														// disabled={
														// 	form.getValues("has_expenditure_cap") !== "Yes" || externalForm.formStage !== 2
														// }
														disabled={
															externalForm.formStage !== 2
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
											<FormMessage />
											<div className="flex flex-col gap-2 mt-2 items-start">
												{form.getValues("supporting_documents") &&
													Array.from(
														form.getValues(
															"supporting_documents",
														)!,
													).map((file: File) => (
														<div key={file.name}>
															{
																// extract the extension of the document "process.pdf", remember the last index of the dot and add 1 to get the extension
																file.name.slice(
																	file.name.lastIndexOf(
																		".",
																	) + 1,
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
									I (or acting as representative of group travelling)
									hereby confirm the accuracy of the information
									(including any attachments) provided for this
									application.
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
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
														<Input
															disabled
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
														/>
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
																disabled
																variant={"outline"}
																className={cn(
																	"w-full pl-3 text-left font-normal",
																	!field.value &&
																		"text-muted-foreground",
																)}>
																{field.value ? (
																	format(
																		field.value,
																		"PPP",
																	)
																) : (
																	<span>
																		Pick a date
																	</span>
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
															disabled={date =>
																date <= new Date()
															}
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
												<FormControl>
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
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</section>

							<Separator className="my-8" />

							{externalForm.formStage! >= 3 ? (
								<section className="section-7" id="Verification">
									<h1 className="text-2xl font-bold mb-4">
										7. Verification
									</h1>
									<p className="text-gray-500 dark:text-gray-400 mb-8">
										I have verified and support of this application.
									</p>
									<div className="grid gap-8">
										<div className="grid grid-auto-fit-lg gap-8">
											<FormField
												control={form.control}
												name="verification_name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Name</FormLabel>
														<FormControl>
															<Input
																placeholder=""
																{...field}
															/>
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
														<FormLabel>
															Position title
														</FormLabel>
														<FormControl>
															<Input
																placeholder=""
																{...field}
															/>
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
													<FormLabel>
														Declaration Date
													</FormLabel>
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
																		format(
																			field.value,
																			"PPP",
																		)
																	) : (
																		<span>
																			Pick a date
																		</span>
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
																disabled={date =>
																	date <= new Date()
																}
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
																<DialogTitle>
																	Signature
																</DialogTitle>
																<DialogClose />
															</DialogHeader>
															<DialogDescription>
																Please sign below
															</DialogDescription>
															<div className="w-full h-[200px] border-2 border-gray-300 rounded-md">
																<SignaturePad
																	ref={sigCanvas}
																	canvasProps={{
																		className:
																			"w-full h-full",
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
							) : null}

							{externalForm.formStage! >= 4 ? (
								<section className="section-8" id="Approval">
									<h1 className="text-2xl font-bold mb-4">
										8. Approval
									</h1>
									<p className="text-gray-500 dark:text-gray-400 mb-8">
										I have reviewed, and approve this application.
									</p>
									<div className="grid gap-8">
										<div className="grid grid-auto-fit-lg gap-8">
											<FormField
												control={form.control}
												name="approval_name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Name</FormLabel>
														<FormControl>
															<Input
																placeholder=""
																{...field}
															/>
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
														<FormLabel>
															Position title
														</FormLabel>
														<FormControl>
															<Input
																placeholder=""
																{...field}
															/>
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
													<FormLabel>
														Declaration Date
													</FormLabel>
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
																		format(
																			field.value,
																			"PPP",
																		)
																	) : (
																		<span>
																			Pick a date
																		</span>
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
																disabled={date =>
																	date <= new Date()
																}
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
																<DialogTitle>
																	Signature
																</DialogTitle>
																<DialogClose />
															</DialogHeader>
															<DialogDescription>
																Please sign below
															</DialogDescription>
															<div className="w-full h-[200px] border-2 border-gray-300 rounded-md">
																<SignaturePad
																	ref={sigCanvas}
																	canvasProps={{
																		className:
																			"w-full h-full",
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
							) : null}

							<section className="submission-details">
								<h1 className="text-2xl font-bold mb-4">
									Submission Details
								</h1>
								<div className="grid grid-auto-fit-lg gap-8">
									<FormField
										control={form.control}
										name="staff_email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Staff Email</FormLabel>
												<FormControl>
													<Input
														disabled={
															externalForm.formStage == 1
														}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="verification_email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Verification Email</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Please select an option" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="email1@gmail.com">
															email1@gmail.com
														</SelectItem>
														<SelectItem value="email2@gmail.com">
															email2@gmail.com
														</SelectItem>
														<SelectItem value="email3@gmail.com">
															email3@gmail.com
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="approval_email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Approval Email</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Please select an option" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="email1@gmail.com">
															email1@gmail.com
														</SelectItem>
														<SelectItem value="email2@gmail.com">
															email2@gmail.com
														</SelectItem>
														<SelectItem value="email3@gmail.com">
															email3@gmail.com
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</section>

							{/* TO-DO: THIS INPUT WILL ONLY BE SHOWN IF THEY CLICK ON THE REVERT BUTTON IN STAGE 2. */}
							{/* THEY NEED TO CLICK ON REVERT AGAIN TO REVERT IT. THIS CHECK ALREADY EXISTS IN onRevert. */}
							{/* THE FIRST REVERT CLICK WILL ONLY DISPLAY THE COMMENT INPUT AND HIDE (OR DISABLE IDK?) THE SUBMIT BUTTON. */}
							{(showCommentInput ||
								(externalForm.revertComment != "None" &&
									externalForm.formStage == 2)) && (
								<FormField
									control={form.control}
									name="revertComment"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Comments</FormLabel>
											<FormControl>
												<Input
													disabled={externalForm.formStage == 1}
													className="disabled:text-black-500 disabled:opacity-100"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* Show the buttons according to the current form stage, */}
							{/* TO-DO: IMPLEMENT THE onRevert and onSubmit functionality to the buttons. */}
							{externalForm.formStage == 2 ? (
								<div>
									<Button
										className="mr-5"
										onClick={form.handleSubmit(handleRevert)}>
										Revert
									</Button>
									<Button type="submit">Submit for Review</Button>
								</div>
							) : externalForm.formStage == 3 ||
							  externalForm.formStage == 4 ? (
								<div>
									<Button type="submit">Reject</Button>
									<Button type="button">Submit for Review</Button>
								</div>
							) : externalForm.formStage == 4 ? (
								<div>
									<Button type="submit">Reject</Button>
									<Button type="submit">Approve</Button>
								</div>
							) : null}
						</form>
					</Form>
				</div>
			) : (
				// DO NOT TOUCH THIS.
				// This is the final stage of the form,
				<div>
					<p>Show PDF!</p>
					{externalForm.formStage === 5 ? (
						<p className="bg-green-500">Status: Approved</p>
					) : externalForm.formStage === 6 ? (
						<p className="bg-red-500">Status: Rejected</p>
					) : null}
				</div>
			)}
		</div>
	);
}