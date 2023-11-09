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
import { useRouter, useSearchParams } from "next/navigation";
import NTFPDF from "@/components/forms/NTFPDF";
import TooltipIcon from "@/components/icons/TooltipIcon";

import { SiMicrosoftword } from "react-icons/si";
import { BsFiletypePdf } from "react-icons/bs";

import adminExternalFormSchema from "@/schema/adminExternalFormSchema";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

import { toast } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { sendContactForm } from "@/lib/api";
import { fi } from "date-fns/locale";
import type { FieldValues } from "react-hook-form";

export default function AdminExternalForm({ data }: { data: ExternalForm }) {
	const supabase = createClientComponentClient();
	const router = useRouter();

	const [revertOpen, setRevertOpen] = useState(false);
	const [submitOpen, setSubmitOpen] = useState(false);
	const [applicantOpen, setApplicantOpen] = useState(false);
	const [externalForm, setExternalForm] = useState<ExternalForm>(data);
	const [applicantImageURL, setApplicantImageURL] = useState(data.applicant_declaration_signature);
	const [verificationImageURL, setVerificationImageURL] = useState(data.verification_signature);
	const [approvalImageURL, setApprovalImageURL] = useState(data.approval_signature);

	// Keep track of the revert comment,
	const [showCommentInput, setShowCommentInput] = useState(false);

	// Check whether the user is logged in,
	const [authToken, setAuthToken] = useState<string | undefined>("");
	useEffect(() => {
		setAuthToken(cookie.get("authToken"));
		console.log(!authToken);
		console.log("Logged auth token: " + authToken);
	}, [authToken]);

	const searchParams = useSearchParams();
	const secKey = searchParams.get("secKey");

	// Real-time security key validation,
	const [securityKeyError, setSecurityKeyError] = useState(false);

	// // Fetch the current stage of the form to capture whether the stage has changed to submit email,
	const [fetchedFormStage, setFetchedFormStage] = useState<number>(data.formStage ?? 0);

	useEffect(() => {
		if (externalForm.formStage != fetchedFormStage) {
			console.log(externalForm);
			sendContactForm(externalForm);
		}
	}, [externalForm.formStage]);

	const applicantSigCanvas = useRef({});
	const applicantSigClear = (field: FieldValues) => {
		//@ts-ignore
		applicantSigCanvas.current.clear();
		setApplicantImageURL(null);
		field.onChange("");
		field.value = "";
	};

	const verificationSigCanvas = useRef({});
	const verificationSigClear = (field: FieldValues) => {
		//@ts-ignore
		verificationSigCanvas.current.clear();
		setVerificationImageURL(null);
		field.onChange("");
		field.value = "";
	};

	const approvalSigCanvas = useRef({});
	const approvalSigClear = (field: FieldValues) => {
		//@ts-ignore
		approvalSigCanvas.current.clear();
		setApprovalImageURL(null);
		field.onChange("");
		field.value = "";
	};

	const showSuccessToast = (message: string) => {
		toast.success(message, {
			duration: 3500,
			style: {
				border: "1px solid #86DC3D",
				padding: "16px",
				color: "#000000",
				textAlign: "justify",
			},
			iconTheme: {
				primary: "#86DC3D",
				secondary: "#FFFAEE",
			},
		});
	};

	const [verificationDate, setVerificationDate] = useState<Date | null>(null);
	const [approvalDate, setApprovalDate] = useState<Date | null>(null);
	useEffect(() => {
		if (externalForm.verification_date) {
			setVerificationDate(new Date(externalForm.verification_date));
		}
		if (externalForm.approval_date) {
			setApprovalDate(new Date(externalForm.approval_date));
		}
	}, [externalForm.verification_date, externalForm.approval_date]);

	const form = useForm<z.infer<typeof adminExternalFormSchema>>({
		resolver: zodResolver(adminExternalFormSchema),
		defaultValues: {
			revertComment: externalForm.revertComment ?? "",
			formStage: externalForm.formStage!,
			securityKey: secKey ?? "",
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

			flight_date: new Date(externalForm.flight_date!),
			flight_time: externalForm.flight_time!,
			flight_number: externalForm.flight_number!,
			destination_from: externalForm.destination_from!,
			destination_to: externalForm.destination_to!,
			check_in_date: new Date(externalForm.check_in_date!),
			check_out_date: new Date(externalForm.check_out_date!),
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

			supporting_documents: undefined,

			applicant_declaration_signature: externalForm.applicant_declaration_signature!,
			applicant_declaration_name: externalForm.applicant_declaration_name!,
			applicant_declaration_position_title: externalForm.applicant_declaration_position_title!,
			applicant_declaration_date: new Date(externalForm.applicant_declaration_date!),

			verification_signature: externalForm.verification_signature ?? "",
			verification_name: externalForm.verification_name ?? "",
			verification_position_title: externalForm.verification_position_title ?? "",
			verification_date: verificationDate,

			approval_signature: externalForm.approval_signature ?? "",
			approval_name: externalForm.approval_name ?? "",
			approval_position_title: externalForm.approval_position_title ?? "",
			approval_date: approvalDate,
		},
	});

	const checkFormStatus = () => {
		setApplicantOpen(false);
		if (form.getValues("check_out_date") < form.getValues("check_in_date")) {
			toast.error("Check out date cannot be earlier than check in date");
		}
		if (form.getValues("completion_date") < form.getValues("commencement_date")) {
			toast.error("Commencement date must be before completion date.");
		}
		if (form.getValues("travelling") === "group" && form.getValues("other_members") === "") {
			toast.error("Please enter the name of other members traveling together");
		}
		if (externalForm.formStage === 3) {
			if (
				form.getValues("verification_name") === "" ||
				form.getValues("verification_position_title") === "" ||
				form.getValues("verification_signature") === "" ||
				form.getValues("verification_signature") === null ||
				form.getValues("verification_date") === undefined
			) {
				toast.error("Please fill in all the required verification fields");
			}
		}

		if (externalForm.formStage === 4) {
			if (
				form.getValues("approval_name") === "" ||
				form.getValues("approval_position_title") === "" ||
				form.getValues("approval_signature") === "" ||
				form.getValues("approval_signature") === null ||
				form.getValues("approval_date") === undefined
			) {
				toast.error("Please fill in all the required approval fields");
			}
		}
	};

	useEffect(() => {
		console.log(form.formState.errors);
	}, [form.formState.errors]);

	async function onSubmit(values: z.infer<typeof adminExternalFormSchema>) {
		// Generate the security key,
		const securityKeyUID = uuidv4();

		// This part is for submission for review from AAO to HOS/ MGR/ ADCR, Stage 2 -> Stage 3,
		if (externalForm.formStage === 2) {
			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						expenditure_cap: externalForm.expenditure_cap,
						expenditure_cap_amount: externalForm.expenditure_cap_amount,
						revertComment: "None",
						securityKey: securityKeyUID,
						formStage: 3,
						verification_email: values.verification_email,
						approval_email: values.approval_email,
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				toast.error("Error submitting form");
				console.error("Error updating data:", error);
			} else {
				showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");
				console.log("Data updated successfully:", data);

				setExternalForm({
					...externalForm,
					revertComment: "",
					expenditure_cap: externalForm.expenditure_cap,
					expenditure_cap_amount: externalForm.expenditure_cap_amount,
					verification_email: values.verification_email!,
					approval_email: values.approval_email!,
					securityKey: securityKeyUID,
					formStage: 3,
				});

				router.push("/external_status");
				// window.location.reload();
			}
		}
		// This part is when the staff re-submits the form to the AAO after being reverted,
		else if (externalForm.formStage === 1) {
			console.log("Updating...");
			console.log(values);
			const { error } = await supabase
				.from("external_forms")
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
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				console.log(error);

				toast.error("Error submitting form");
			} else {
				showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");

				setExternalForm({
					...externalForm,
					securityKey: null,
					formStage: 2,
				});

				router.push("/external_status?status=re-submission-1f0e4020-ca9a-42d8-825a-3f8af95c1e39");
				// window.location.reload();
			}
		}

		// This is for submitting the forms for further review to HMU/ Dean BY HOS/ MGR/ ADCR, Stage 3 -> Stage 4,
		else if (externalForm.formStage === 3) {
			console.log(values.verification_signature);

			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 4,
						securityKey: securityKeyUID,
						// TO-DO: ADD IN HOS/ ADCR/ MGR DETAILS INTO THE DATABASE.

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
				.eq("id", externalForm.id);

			if (error) {
				console.error("Error inserting data:", error);
			} else {
				console.log("Data inserted successfully:", values);
				showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");

				setExternalForm({
					...externalForm,
					securityKey: securityKeyUID,
					formStage: 4,
				});

				router.push("/external_status");
				// window.location.reload();
			}
		}

		// 	// This is for approving the forms by HMU/ Dean, Stage 4 -> Stage 5,
		else if (externalForm.formStage === 4) {
			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 5,
						securityKey: securityKeyUID,
						// TO-DO: ADD IN HMU/ DEAN DETAILS INTO THE DATABASE.
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
				.eq("id", externalForm.id);

			if (error) {
				console.error("Error inserting data:", error);
			} else {
				console.log("Data inserted successfully:", data);
				showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");

				setExternalForm({
					...externalForm,
					formStage: 5,
				});

				router.push("/external_status");
				// window.location.reload();
			}
		}
	}

	const handleRevert = async (values: z.infer<typeof adminExternalFormSchema>) => {
		const securityKeyUID = uuidv4();

		// This is for rejecting the forms by HOS/ ADCR/ MGR, Stage 3 -> Stage 6,
		if (externalForm.formStage === 3) {
			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 6,
						securityKey: securityKeyUID,
						// TO-DO: ADD IN HOS/ ADCR/ MGR DETAILS INTO THE DATABASE.
						revertComment: values.revertComment,
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
				.eq("id", externalForm.id);

			if (error) {
				console.error("Error updating data:", error);
			} else {
				console.log("Data updated successfully:", data);
				showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");

				setExternalForm({
					...externalForm,
					revertComment: values.revertComment!,
					formStage: 6,
				});

				router.push("/external_status");
				// window.location.reload();
			}
		} else if (externalForm.formStage === 4) {
			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 6,
						securityKey: securityKeyUID,
						// TO-DO: ADD IN HMU/ DEAN DETAILS INTO THE DATABASE.
						revertComment: values.revertComment,
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
				.eq("id", externalForm.id);

			if (error) {
				console.log(error);
			} else {
				console.log("Data updated successfully:", data);
				showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");

				setExternalForm({
					...externalForm,
					revertComment: values.revertComment!,
					formStage: 6,
				});

				router.push("/external_status");
				// window.location.reload();
			}
		}

		// This is for the AAO to revert to the staff with the comments, Stage 2 -> Stage 1,
		if (externalForm.formStage === 2 && (showCommentInput == true || externalForm.revertComment != "None")) {
			console.log("Reverting");
			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						expenditure_cap: values.expenditure_cap,
						expenditure_cap_amount: values.expenditure_cap_amount,
						revertComment: values.revertComment,
						securityKey: securityKeyUID,
						formStage: 1,
						verification_email: values.verification_email,
						approval_email: values.approval_email,
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				console.error("Error updating data:", error);
			} else {
				console.log("Data updated successfully:", data);
				showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");

				// showSuccessToast('You have successfully reverted the form. Emails have been sent out.');

				setExternalForm({
					...externalForm,
					securityKey: securityKeyUID,
					revertComment: values.revertComment!,
					formStage: 1,
				});

				router.push("/external_status");
				// window.location.reload();
			}
		} else if (showCommentInput == false) {
			setShowCommentInput(true);
		}
	};

	const [group, setGroup] = useState(true);
	console.log(authToken);

	return (
		<div>
			{/* TO-DO: ADD 3 MORE ADDITIONAL FIELDS. I DON'T THINK THIS EXIST IN THE DATABASE YET. */}
			{/* 1. STAFF EMAIL (INPUT FIELD WITH EMAIL VALIDATION), 2. HOS/ MGR/ ADCR EMAIL (DROPDOWN SELECT), 3. HMU/ DEAN EMAIL (DROPDOWN SELECT) */}
			{externalForm.formStage !== 5 && externalForm.formStage !== 6 ? (
				<div className="mx-auto max-w-6xl px-8 my-8 mt-6 mb-[200px]">
					<div className="ml-10">
						<div className="flex ml-[13px]">
							<div>
								<Image src="/swinburne_logo.png" alt="" width={200} height={300} />
							</div>
							<div className="ml-8 mt-2">
								<p className="font-medium">Human Resources</p>
								<h1 className="text-3xl font-bold text-slate-800 mb-4 mt-4 -ml-[1px]">Nomination / Travelling Application Form</h1>
							</div>
						</div>

						<div className="mb-4 text-slate-800 mt-2">
							<p className="mb-2">
								<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">*</span>
								<span>
									Before completing this form, please refer to the separate document on “General Instructions for completing
									Nomination / Travelling Application Form”, which is available on SharePoint.
								</span>
							</p>
							<p className="mb-2">
								<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">*</span>
								<span>All fields are mandatory to complete as required for each applicable section.</span>
							</p>
							<p>
								<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">*</span>
								<span>
									This form is also to be used for any contracted individual as consultant, and is to be completed where applicable.
								</span>
							</p>
						</div>
					</div>
					<hr className="mt-8" />
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
							<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8 w-full">
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
															disabled={externalForm.formStage != 1}
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
												name="full_name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Full Name (Same as I.C / Passport)</FormLabel>
														<FormControl>
															<Input
																disabled={externalForm.formStage != 1}
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
														<FormLabel>Staff ID / Student No.</FormLabel>
														<FormControl>
															<Input
																disabled={externalForm.formStage != 1}
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
														<FormLabel>Designation / Course</FormLabel>
														<FormControl>
															<Input
																disabled={externalForm.formStage != 1}
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
														<FormLabel>Faculty / School / Unit</FormLabel>
														<FormControl>
															<Input
																disabled={externalForm.formStage != 1}
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
														<FormLabel>Type of Transportation</FormLabel>
														<Select
															disabled={externalForm.formStage != 1}
															onValueChange={field.onChange}
															defaultValue={field.value}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Please select an option" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectItem value="aeroplane">Aeroplane</SelectItem>
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
														<FormLabel>Traveling in</FormLabel>
														<Select
															disabled={externalForm.formStage != 1}
															onValueChange={e => {
																field.onChange(e);
																if (e === "group") {
																	setGroup(false);
																} else {
																	setGroup(true);
																}
															}}
															defaultValue={field.value}>
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
										<FormField
											control={form.control}
											name="other_members"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Name of other staff / student traveling together in group</FormLabel>
													<FormControl>
														<Input
															disabled={externalForm.formStage != 1 || group}
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

								<section className="section-2" id="Travel Details<">
									<h2 className="text-2xl font-bold mb-4">2. Travel Details</h2>
									<div className="grid grid-auto-fit-lg gap-8">
										<FormField
											control={form.control}
											name="program_title"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Program title / Event</FormLabel>
													<FormControl>
														<Input
															disabled={externalForm.formStage != 1}
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
															disabled={externalForm.formStage != 1}
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
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	disabled={externalForm.formStage != 1}
																	variant={"outline"}
																	className={cn(
																		"w-full pl-3 text-left font-normal",
																		!field.value && "text-muted-foreground",
																	)}>
																	{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent className="w-auto p-0" align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={date => {
																	console.log("Date: " + date);
																	if (date !== undefined) {
																		date.setHours(date.getHours() + 8);
																		field.onChange(date);
																		field.value = date;
																	}
																	console.log(field.value);
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
											name="completion_date"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Completion Date</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	disabled={externalForm.formStage != 1}
																	variant={"outline"}
																	className={cn(
																		"w-full pl-3 text-left font-normal",
																		!field.value && "text-muted-foreground",
																	)}>
																	{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent className="w-auto p-0" align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={date => {
																	console.log("Date: " + date);
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
											name="organiser"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Organiser</FormLabel>
													<FormControl>
														<Input
															disabled={externalForm.formStage != 1}
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
															disabled={externalForm.formStage != 1}
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
											name="hrdf_claimable"
											render={({ field }) => (
												<FormItem>
													<FormLabel>HDRF Claimable</FormLabel>
													<Select
														disabled={externalForm.formStage != 1}
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

								<Separator className="my-8" />

								<section className="section-3" id="Logistic Arrangement">
									<h2 className="text-2xl font-bold mb-4">3. Logistic Arrangement</h2>
									<div className="grid gap-8">
										<div className="grid grid-auto-fit-lg gap-8">
											<FormField
												control={form.control}
												name="flight_date"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Flight Date</FormLabel>
														<FormControl>
															<Popover>
																<PopoverTrigger asChild>
																	<FormControl>
																		<Button
																			disabled={externalForm.formStage != 1}
																			variant={"outline"}
																			className={cn(
																				"w-full pl-3 text-left font-normal",
																				!field.value && "text-muted-foreground",
																			)}>
																			{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																		</Button>
																	</FormControl>
																</PopoverTrigger>
																<PopoverContent className="w-auto p-0" align="start">
																	<Calendar
																		mode="single"
																		selected={field.value}
																		onSelect={date => {
																			console.log("Date: " + date);
																			field.onChange(date);
																			if (date !== undefined) {
																				date.setHours(date.getHours() + 8);
																				field.value = new Date(date);
																			}
																		}}
																		disabled={date => {
																			const today = form.getValues("flight_date");
																			return date < today;
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
														<FormLabel>Flight Time</FormLabel>
														<FormControl>
															<Input
																disabled={externalForm.formStage != 1}
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
															disabled={externalForm.formStage != 1}
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
																	disabled={externalForm.formStage != 1}
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
																	disabled={externalForm.formStage != 1}
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
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		disabled={externalForm.formStage != 1}
																		variant={"outline"}
																		className={cn(
																			"w-full pl-3 text-left font-normal",
																			!field.value && "text-muted-foreground",
																		)}>
																		{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent className="w-auto p-0" align="start">
																<Calendar
																	mode="single"
																	selected={field.value}
																	onSelect={date => {
																		console.log("Date: " + date);
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
												name="check_out_date"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Check Out</FormLabel>
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		disabled={externalForm.formStage != 1}
																		variant={"outline"}
																		className={cn(
																			"w-full pl-3 text-left font-normal",
																			!field.value && "text-muted-foreground",
																		)}>
																		{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent className="w-auto p-0" align="start">
																<Calendar
																	mode="single"
																	selected={field.value}
																	onSelect={date => {
																		console.log("Date: " + date);
																		field.onChange(date);
																		if (date !== undefined) {
																			date.setHours(date.getHours() + 8);
																			field.value = new Date(date);
																		}
																	}}
																	disabled={date => {
																		const today = form.getValues("check_in_date");
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
														<Input
															disabled={externalForm.formStage != 1}
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
															disabled={externalForm.formStage != 1}
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
															onChange={e => {
																field.onChange(Number(e.target.value));
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
															disabled={externalForm.formStage != 1}
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
															onChange={e => {
																field.onChange(Number(e.target.value));
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
															disabled={externalForm.formStage != 1}
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
															onChange={e => {
																field.onChange(Number(e.target.value));
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
															disabled={externalForm.formStage != 1}
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
															onChange={e => {
																field.onChange(Number(e.target.value));
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
															disabled={externalForm.formStage != 1}
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
															onChange={e => {
																field.onChange(Number(e.target.value));
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
															disabled={externalForm.formStage != 1}
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
															onChange={e => {
																field.onChange(Number(e.target.value));
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
															disabled={externalForm.formStage != 1}
															className="disabled:text-black-500 disabled:opacity-100"
															{...field}
															onChange={e => {
																field.onChange(Number(e.target.value));
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
																form.getValues("travel_insurance_fee") +
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
												Details of account(s) to be debited. (It is encouraged to have a single source of funding)
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
															<Input
																disabled={externalForm.formStage != 1}
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
														<FormLabel>Consolidated Pool Fund</FormLabel>
														<FormControl>
															<Input
																disabled={externalForm.formStage != 1}
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
																disabled={externalForm.formStage != 1}
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
																disabled={externalForm.formStage != 1}
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
														<FormLabel>Student Council Fund</FormLabel>
														<FormControl>
															<Input
																disabled={externalForm.formStage != 1}
																className="disabled:text-black-500 disabled:opacity-100"
																{...field}
															/>
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
															<Input
																disabled={externalForm.formStage != 1}
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
											name="expenditure_cap"
											render={({ field }) => (
												<FormItem className="space-y-3">
													<FormLabel>Any expenditure cap? If yes, please specify below, </FormLabel>
													<FormControl>
														<RadioGroup
															disabled={externalForm.formStage !== 2 || !authToken}
															onValueChange={field.onChange}
															defaultValue={field.value}
															className="flex space-x-1 disabled:text-gray-500">
															<FormItem className="flex items-center space-x-3 space-y-0">
																<FormControl>
																	<RadioGroupItem value="Yes" />
																</FormControl>
																<FormLabel
																	className={
																		"font-normal " +
																		(externalForm.formStage !== 2 || !authToken ? "text-gray-500" : "")
																	}>
																	Yes
																</FormLabel>
															</FormItem>
															<FormItem className="flex items-center space-x-3 space-y-0">
																<FormControl>
																	<RadioGroupItem value="No" />
																</FormControl>
																<FormLabel
																	className={
																		"font-normal " +
																		(externalForm.formStage !== 2 || !authToken ? "text-gray-500" : "")
																	}>
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
																form.getValues("expenditure_cap") !== "Yes" ||
																(externalForm.formStage !== 2 && !authToken)
															}
															type="number"
															{...field}
															onChange={e => {
																field.onChange(Number(e.target.value));
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
									<h1 className="text-2xl font-bold mb-4">5. Supporting Documents</h1>
									<FormField
										control={form.control}
										name="supporting_documents"
										render={({ field }) => (
											<FormItem>
												<FormMessage />
												<div className="flex flex-col gap-2 mt-2 items-start">
													{form.getValues("supporting_documents") &&
														Array.from(form.getValues("supporting_documents")!).map((file: any) => (
															<div key={file.name}>
																{
																	// extract the extension of the document "process.pdf", remember the last index of the dot and add 1 to get the extension
																	file.name.slice(file.name.lastIndexOf(".") + 1) === "pdf" ? (
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
									<h1 className="text-2xl font-bold mb-4">6. Applicant Declaration</h1>
									<p className="text-gray-500 dark:text-gray-400 mb-8">
										I (or acting as representative of group travelling) hereby confirm the accuracy of the information (including
										any attachments) provided for this application.
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
															<Input
																disabled={externalForm.formStage != 1}
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
												name="applicant_declaration_position_title"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Position Title</FormLabel>
														<FormControl>
															<Input
																disabled={externalForm.formStage != 1}
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
																	disabled={externalForm.formStage != 1}
																	variant={"outline"}
																	className={cn(
																		"w-full pl-3 text-left font-normal",
																		!field.value && "text-muted-foreground",
																	)}>
																	{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent className="w-auto p-0" align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={date => {
																	console.log("Date: " + date);
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
													<FormLabel>Signature</FormLabel>
													<Dialog>
														{externalForm.formStage !== 1 ? (
															<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
																{applicantImageURL && (
																	<Image src={applicantImageURL} width={300} height={200} alt="Signature" />
																)}
															</div>
														) : (
															<>
																<FormControl>
																	<DialogTrigger asChild>
																		<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
																			{applicantImageURL && (
																				<Image
																					src={applicantImageURL}
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
																	<DialogDescription>Please sign below</DialogDescription>
																	<div className="w-full h-[200px] border-2 border-gray-300 rounded-md">
																		<SignaturePad
																			// @ts-ignore
																			ref={applicantSigCanvas}
																			canvasProps={{
																				className: "w-full h-full",
																			}}
																		/>
																	</div>
																	<DialogFooter>
																		<Button variant="outline" onClick={() => applicantSigClear(field)}>
																			Clear
																		</Button>
																		<DialogClose asChild>
																			<Button
																				onClick={() => {
																					//@ts-ignore
																					if (applicantSigCanvas.current.isEmpty()) {
																						toast.error("Please sign the form");
																					} else {
																						setApplicantImageURL(
																							applicantSigCanvas.current
																								//@ts-ignore
																								.getTrimmedCanvas()
																								.toDataURL("image/png"),
																						);
																						field.onChange(
																							applicantSigCanvas.current
																								//@ts-ignore
																								.getTrimmedCanvas()
																								.toDataURL("image/png"),
																						);

																						field.value =
																							applicantSigCanvas.current
																								//@ts-ignore
																								.getTrimmedCanvas()
																								.toDataURL("image/png") ?? "";
																						console.log("Field Value: " + field.value);
																					}
																				}}>
																				Save
																			</Button>
																		</DialogClose>
																	</DialogFooter>
																</DialogContent>
															</>
														)}

														<FormMessage />
													</Dialog>
												</FormItem>
											)}
										/>
									</div>
								</section>

								<Separator className="my-8" />

								{externalForm.formStage! >= 3 ? (
									<section className="section-7" id="Verification">
										<h1 className="text-2xl font-bold mb-4">7. Verification</h1>
										<p className="text-gray-500 dark:text-gray-400 mb-8">I have verified and support of this application.</p>
										<div className="grid gap-8">
											<div className="grid grid-auto-fit-lg gap-8">
												<FormField
													control={form.control}
													name="verification_name"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Name</FormLabel>
															<FormControl>
																<Input disabled={externalForm.formStage != 3} placeholder="" {...field} />
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
															<FormLabel>Position Title</FormLabel>
															<FormControl>
																<Input disabled={externalForm.formStage != 3} placeholder="" {...field} />
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
														<FormLabel>Declaration Date</FormLabel>
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		disabled={externalForm.formStage != 3}
																		variant={"outline"}
																		className={cn(
																			"w-full pl-3 text-left font-normal",
																			!field.value && "text-muted-foreground",
																		)}>
																		{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent className="w-auto p-0" align="start">
																<Calendar
																	mode="single"
																	selected={field.value!}
																	onSelect={date => {
																		console.log("Date: " + date);
																		field.onChange(date);
																		if (date !== undefined) {
																			date.setHours(date.getHours() + 8);
																			field.value = new Date(date);
																		}
																	}}
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
												name="verification_signature"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Signature</FormLabel>
														<Dialog>
															{externalForm.formStage != 3 ? (
																<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
																	{verificationImageURL && (
																		<Image src={verificationImageURL} width={300} height={200} alt="Signature" />
																	)}
																</div>
															) : (
																<>
																	<FormControl>
																		<DialogTrigger asChild>
																			<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
																				{verificationImageURL && (
																					<Image
																						src={verificationImageURL}
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
																		<DialogDescription>Please sign below</DialogDescription>
																		<div className="w-full h-[200px] border-2 border-gray-300 rounded-md">
																			<SignaturePad
																				// @ts-ignore
																				ref={verificationSigCanvas}
																				canvasProps={{
																					className: "w-full h-full",
																				}}
																			/>
																		</div>
																		<DialogFooter>
																			<Button variant="outline" onClick={() => verificationSigClear(field)}>
																				Clear
																			</Button>
																			<DialogClose asChild>
																				<Button
																					onClick={() => {
																						//@ts-ignore
																						if (verificationSigCanvas.current.isEmpty()) {
																							toast.error("Please sign the form");
																						} else {
																							setVerificationImageURL(
																								verificationSigCanvas.current
																									//@ts-ignore
																									.getTrimmedCanvas()
																									.toDataURL("image/png"),
																							);
																							field.onChange(
																								verificationSigCanvas.current
																									//@ts-ignore
																									.getTrimmedCanvas()
																									.toDataURL("image/png"),
																							);

																							field.value =
																								verificationSigCanvas.current
																									//@ts-ignore
																									.getTrimmedCanvas()
																									.toDataURL("image/png") ?? "";
																							console.log("Field Value: " + field.value);
																						}
																					}}>
																					Save
																				</Button>
																			</DialogClose>
																		</DialogFooter>
																	</DialogContent>
																</>
															)}

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
										<h1 className="text-2xl font-bold mb-4">8. Approval</h1>
										<p className="text-gray-500 dark:text-gray-400 mb-8">I have reviewed, and approve this application.</p>
										<div className="grid gap-8">
											<div className="grid grid-auto-fit-lg gap-8">
												<FormField
													control={form.control}
													name="approval_name"
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
													name="approval_position_title"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Position Title</FormLabel>
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
												name="approval_date"
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
																			!field.value && "text-muted-foreground",
																		)}>
																		{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent className="w-auto p-0" align="start">
																<Calendar
																	mode="single"
																	selected={field.value!}
																	onSelect={date => {
																		console.log("Date: " + date);
																		field.onChange(date);
																		if (date !== undefined) {
																			date.setHours(date.getHours() + 8);
																			field.value = new Date(date);
																		}
																	}}
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
												name="approval_signature"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Signature</FormLabel>
														<Dialog>
															<FormControl>
																<DialogTrigger asChild>
																	<div className="w-full h-[200px] border-2 border-gray-300 rounded-md grid place-items-center">
																		{approvalImageURL && (
																			<Image src={approvalImageURL} width={300} height={200} alt="Signature" />
																		)}
																	</div>
																</DialogTrigger>
															</FormControl>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Signature</DialogTitle>
																	<DialogClose />
																</DialogHeader>
																<DialogDescription>Please sign below</DialogDescription>
																<div className="w-full h-[200px] border-2 border-gray-300 rounded-md">
																	<SignaturePad
																		// @ts-ignore
																		ref={approvalSigCanvas}
																		canvasProps={{
																			className: "w-full h-full",
																		}}
																	/>
																</div>
																<DialogFooter>
																	<Button variant="outline" onClick={() => approvalSigClear(field)}>
																		Clear
																	</Button>
																	<DialogClose asChild>
																		<Button
																			onClick={() => {
																				//@ts-ignore
																				if (approvalSigCanvas.current.isEmpty()) {
																					toast.error("Please sign the form");
																				} else {
																					setApprovalImageURL(
																						approvalSigCanvas.current
																							//@ts-ignore
																							.getTrimmedCanvas()
																							.toDataURL("image/png"),
																					);
																					field.onChange(
																						approvalSigCanvas.current
																							//@ts-ignore
																							.getTrimmedCanvas()
																							.toDataURL("image/png"),
																					);

																					field.value =
																						approvalSigCanvas.current
																							//@ts-ignore
																							.getTrimmedCanvas()
																							.toDataURL("image/png") ?? "";
																					console.log("Field Value: " + field.value);
																				}
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

								{externalForm.formStage === 1 ? (
									<div>
										<FormField
											control={form.control}
											name="securityKey"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														<div className="group relative w-max cursor-pointer">
															<span className="flex items-center">
																<span className="mr-2">Security Key</span>
																<TooltipIcon />
															</span>
															<span className="bg-slate-100 pointer-events-none absolute ml-2 rounded-md w-[200px] text-justify opacity-0 transition-opacity group-hover:opacity-100 p-3 border-2">
																This is to ensure that you are the appropriate individual for the authorization or
																rejection of this form. It can be found in your email.
															</span>
														</div>
													</FormLabel>
													<FormControl>
														<Input
															autoComplete="off"
															placeholder=""
															{...field}
															onChange={e => {
																field.onChange(e.target.value);
																if (e.target.value === externalForm.securityKey) {
																	setSecurityKeyError(false);
																} else {
																	setSecurityKeyError(true);
																}
															}}
														/>
													</FormControl>
													<FormMessage>{securityKeyError && <span>The security key does not match.</span>}</FormMessage>
												</FormItem>
											)}
										/>
										<Dialog open={applicantOpen} onOpenChange={setApplicantOpen}>
											<DialogTrigger asChild>
												<Button className="mt-5" type="button">
													Submit for Review
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Please re-confirm your details!</DialogTitle>
													<DialogDescription>
														Please confirm your email is correct: {form.getValues("email")}
														. <br />
														Wrong email will result in you not receiving any updates of your form status.
													</DialogDescription>
												</DialogHeader>
												<DialogFooter>
													<DialogClose asChild>
														<Button variant="outline">Cancel</Button>
													</DialogClose>
													<Button onMouseUp={checkFormStatus} onClick={form.handleSubmit(onSubmit)}>
														Submit
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								) : null}

								{externalForm.formStage === 2 ? (
									<div>
										<section className="submission-details mb-5">
											<h1 className="text-2xl font-bold mb-4">Submission Details</h1>
											<div className="grid grid-auto-fit-lg gap-8">
												<FormField
													control={form.control}
													name="verification_email"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Verification Email</FormLabel>
															<Select
																// disabled={!authToken}
																onValueChange={field.onChange}
																defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Please select an option" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="fypemsmaster369@gmail.com">
																		fypemsmaster369@gmail.com
																	</SelectItem>
																	<SelectItem value="newfypems369@gmail.com">newfypems369@gmail.com</SelectItem>
																	<SelectItem value="email3@gmail.com">email3@gmail.com</SelectItem>
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
																// disabled={!authToken}
																onValueChange={field.onChange}
																defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Please select an option" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="fypemsmaster369@gmail.com">
																		fypemsmaster369@gmail.com
																	</SelectItem>
																	<SelectItem value="newfypems369@gmail.com">newfypems369@gmail.com</SelectItem>
																	<SelectItem value="email3@gmail.com">email3@gmail.com</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										</section>

										<Dialog open={revertOpen} onOpenChange={setRevertOpen}>
											<DialogTrigger asChild>
												<Button
													disabled={!authToken}
													type="button"
													className="mr-5"
													onClick={() => {
														setShowCommentInput(true);
													}}>
													Revert
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Revert</DialogTitle>
												</DialogHeader>
												<DialogDescription>
													Are you sure you want to REVERT this form? Please enter a comment below.
												</DialogDescription>
												<FormField
													control={form.control}
													name="revertComment"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Comments</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<DialogFooter>
													<DialogClose asChild>
														<Button>Cancel</Button>
													</DialogClose>
													<Button
														onMouseUp={() => {
															setRevertOpen(false);
														}}
														onClick={form.handleSubmit(handleRevert)}>
														Revert
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>

										<Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
											<DialogTrigger asChild>
												<Button disabled={!authToken} type="button">
													Submit for Review
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Confirm your action!</DialogTitle>
												</DialogHeader>
												<DialogDescription>
													Wrong email information will result in the form being sent to the wrong person.
												</DialogDescription>
												<DialogFooter>
													<DialogClose asChild>
														<Button variant="outline">Cancel</Button>
													</DialogClose>
													<Button
														onMouseUp={() => {
															setSubmitOpen(false);
														}}
														onClick={form.handleSubmit(onSubmit)}>
														Submit
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								) : externalForm.formStage === 3 || externalForm.formStage === 4 ? (
									<div>
										<FormField
											control={form.control}
											name="securityKey"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="group relative w-max cursor-pointer">
														<div className="flex items-center">
															<span className="mr-2">Security Key</span>
															<TooltipIcon />
														</div>
														<div className="bg-slate-100 pointer-events-none absolute ml-2 rounded-md w-[200px] text-justify opacity-0 transition-opacity group-hover:opacity-100 p-3 border-2">
															This is to ensure that you are the appropriate individual for the authorization or
															rejection of this form. It can be found in your email.
														</div>
													</FormLabel>
													<FormControl>
														<Input
															autoComplete="off"
															placeholder=""
															{...field}
															onChange={e => {
																field.onChange(e.target.value);
																if (e.target.value === externalForm.securityKey) {
																	setSecurityKeyError(false);
																} else {
																	setSecurityKeyError(true);
																}
															}}
														/>
													</FormControl>
													<FormMessage>{securityKeyError && <span>The security key does not match.</span>}</FormMessage>
												</FormItem>
											)}
										/>
										{externalForm.formStage === 3 ? (
											<div className="mt-5">
												<Dialog open={revertOpen} onOpenChange={setRevertOpen}>
													<DialogTrigger asChild>
														<Button
															type="button"
															className="mr-5"
															disabled={form.getValues("securityKey") !== externalForm.securityKey}>
															Reject
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Please confirm your action.</DialogTitle>
														</DialogHeader>
														<DialogDescription>
															You are trying to REJECT this Nominations/ Travelling Form, is this correct?
														</DialogDescription>
														<FormField
															control={form.control}
															name="revertComment"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Comments</FormLabel>
																	<FormControl>
																		<Input {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<DialogFooter>
															<DialogClose asChild>
																<Button>Cancel</Button>
															</DialogClose>
															<Button
																onMouseUp={() => {
																	setRevertOpen(false);
																}}
																onClick={form.handleSubmit(handleRevert)}>
																Reject
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>

												<Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
													<DialogTrigger asChild>
														<Button type="button" disabled={form.getValues("securityKey") !== externalForm.securityKey}>
															Submit for Review
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Please confirm your action.</DialogTitle>
														</DialogHeader>
														<DialogDescription>
															You are trying to SUBMIT this Nominations/ Travelling Form FOR FURTHER REVIEW, is this
															correct?
														</DialogDescription>
														<DialogFooter>
															<DialogClose asChild>
																<Button variant="outline">Cancel</Button>
															</DialogClose>
															<Button
																onMouseUp={() => {
																	checkFormStatus();
																	setSubmitOpen(false);
																}}
																onClick={form.handleSubmit(onSubmit)}>
																Submit
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											</div>
										) : externalForm.formStage === 4 ? (
											<div className="mt-5">
												<Dialog open={revertOpen} onOpenChange={setRevertOpen}>
													<DialogTrigger asChild>
														<Button
															variant="destructive"
															type="button"
															className="mr-5"
															disabled={form.getValues("securityKey") !== externalForm.securityKey}>
															Reject
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Please confirm your action.</DialogTitle>
														</DialogHeader>
														<DialogDescription>
															You are trying to REJECT this Nominations/ Travelling Form, is this correct?
														</DialogDescription>
														<FormField
															control={form.control}
															name="revertComment"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Comments</FormLabel>
																	<FormControl>
																		<Input {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<DialogFooter>
															<DialogClose asChild>
																<Button>Cancel</Button>
															</DialogClose>
															<Button
																onMouseUp={() => {
																	setRevertOpen(false);
																}}
																onClick={form.handleSubmit(handleRevert)}>
																Reject
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>

												<Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
													<DialogTrigger asChild>
														<Button type="button" disabled={form.getValues("securityKey") !== externalForm.securityKey}>
															Approve
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Please confirm your action.</DialogTitle>
														</DialogHeader>
														<DialogDescription>
															You are trying to APPROVE this Nominations/ Travelling Form, is this correct?
														</DialogDescription>
														<DialogFooter>
															<DialogClose asChild>
																<Button variant="outline">Cancel</Button>
															</DialogClose>
															<Button
																onMouseUp={() => {
																	setSubmitOpen(false);
																}}
																onClick={form.handleSubmit(onSubmit)}>
																Submit
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											</div>
										) : null}
									</div>
								) : null}
							</form>
						</Form>
					</div>
				</div>
			) : (
				// DO NOT TOUCH THIS.
				// This is the final stage of the form,
				<div>
					<NTFPDF id={data.id} />
				</div>
			)}
		</div>
	);
}
