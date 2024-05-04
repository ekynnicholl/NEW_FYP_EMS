"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, set } from "date-fns";
import SignaturePad from "react-signature-canvas";
import NTFHeader from "@/components/layouts/NTFHeader";

import Image from "next/image";

import { BsFiletypePdf } from "react-icons/bs";

import { toast } from "react-hot-toast";
import externalFormSchema from "@/schema/externalFormSchema";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { sendContactForm } from "@/lib/api";
import { X } from "lucide-react";

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

let files: File[] = [];

export default function ExternalForm({ faculties }: { faculties: string[] }) {
	const supabase = createClientComponentClient();
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [imageURL, setImageURL] = useState<any>();

	const [group, setGroup] = useState(false);
	const [useOwnTransport, setUseOwnTransport] = useState<boolean | null>(null);

	const [courseFee, setCourseFee] = useState(0);
	const [airfareFee, setAirfareFee] = useState(0);
	const [accommodationFee, setAccommodationFee] = useState(0);
	const [perDiemFee, setPerDiemFee] = useState(0);
	const [transportationFee, setTransportationFee] = useState(0);
	const [travelInsuranceFee, setTravelInsuranceFee] = useState(0);
	const [otherFees, setOtherFees] = useState(0);
	const [grandTotal, setGrandTotal] = useState(0);

	const [applicantName, setApplicantName] = useState("");
	const [applicantPosition, setApplicantPosition] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const sigCanvas = useRef({});
	//@ts-ignore
	const clear = () => sigCanvas.current.clear();
	const save = () => {
		//@ts-ignore
		setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
	};

	const form = useForm<z.infer<typeof externalFormSchema>>({
		resolver: zodResolver(externalFormSchema),
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
			commencement_date: null,
			completion_date: null,
			organiser: "",
			venue: "",
			hrdf_claimable: "",

			logistic_arrangement: null,

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
			expenditure_cap_amount: 0,

			supporting_documents: null,

			applicant_declaration_signature: "",
			applicant_declaration_name: "",
			applicant_declaration_position_title: "",
			applicant_declaration_date: new Date(),
		},
	});

	// Load form content from session storage
	useEffect(() => {
		const savedForm = sessionStorage.getItem("form");
		if (savedForm) {
			const parsedForm = JSON.parse(savedForm);
			form.reset(parsedForm);
			form.setValue("commencement_date", parsedForm.commencement_date ? new Date(parsedForm.commencement_date) : null);
			form.setValue("completion_date", parsedForm.completion_date ? new Date(parsedForm.completion_date) : null);
			form.setValue("applicant_declaration_date", new Date(parsedForm.applicant_declaration_date));
			setUseOwnTransport(parsedForm.transport === "own transport" || parsedForm.transport === "company vehicle");

			toast.success("Form content loaded from previous session");
		}
	}, [form]);

	const checkFormStatus = () => {
		setOpen(false);

		if (form.getValues("logistic_arrangement") !== undefined) {
			if ((form.getValues("logistic_arrangement")?.length ?? 0) > 0) {
				for (let i = 0; i < (form.getValues("logistic_arrangement")?.length ?? 0); i++) {
					const checkOutDate = form.getValues("logistic_arrangement")?.[i]?.flight_date;
					const checkInDate = form.getValues("logistic_arrangement")?.[i]?.check_in_date;

					if (checkOutDate && checkInDate && checkOutDate < checkInDate) {
						toast.error("Check out date cannot be earlier than check in date");
					}
				}
			}
		}

		const completionDate = form.getValues("completion_date");
		const commencementDate = form.getValues("commencement_date");

		if (completionDate && commencementDate && completionDate < commencementDate) {
			toast.error("Commencement date must be before completion date.");
		}

		if (form.getValues("travelling") === "group" && form.getValues("other_members") === "") {
			toast.error("Please enter the name of other members traveling together");
		}
	};

	const formReset = () => {
		form.reset({
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
			commencement_date: null,
			completion_date: null,
			organiser: "",
			venue: "",
			hrdf_claimable: "",

			logistic_arrangement: null,

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
			expenditure_cap_amount: 0,

			supporting_documents: null,

			applicant_declaration_signature: "",
			applicant_declaration_name: "",
			applicant_declaration_position_title: "",
			applicant_declaration_date: new Date(),
		});
		setImageURL("");
		sessionStorage.removeItem("form");
		router.refresh();
	};

	// useEffect(() => {
	// 	if (form.formState.isDirty) {
	// 		sessionStorage.setItem("form", JSON.stringify(form.getValues()));
	// 	}
	// }, [form, form.formState]);

	async function onSubmit(values: z.infer<typeof externalFormSchema>) {
		setIsSubmitting(true);
		console.log("Form sent");
		console.log(values);

		if (values.commencement_date !== null) {
			if (values.commencement_date.getHours() < 8) {
				new Date(values.commencement_date.setHours(values.commencement_date.getHours() + 8));
			}
		}

		let documentPaths: string[] = [];
		if (values.supporting_documents && values.supporting_documents.length > 0) {
			const uniqueName = uuidv4();
			for (const file of values.supporting_documents) {
				const upload = await supabase.storage.from("supporting_documents").upload(`${uniqueName}_${file.name}`, file, {
					cacheControl: "3600",
					upsert: false,
				});

				if (upload.data) {
					const { data } = supabase.storage.from("supporting_documents").getPublicUrl(upload?.data.path);

					if (data) {
						documentPaths.push(data.publicUrl);
					}
				}

				if (upload.error) {
					console.log(upload.error);
				}
			}
		}

		if (values.applicant_declaration_signature instanceof File) {
			const newUniqueName = uuidv4();
			const upload = await supabase.storage
				.from("signatures")
				.upload(`${newUniqueName}_signature.png`, values.applicant_declaration_signature, {
					cacheControl: "3600",
					upsert: false,
				});

			if (upload.data) {
				const { data } = supabase.storage.from("signatures").getPublicUrl(upload?.data.path);

				if (data) {
					values.applicant_declaration_signature = data.publicUrl;
				}
			}

			if (upload.error) {
				console.log(upload.error);
				toast.error("Error uploading signature");
			}
		}

		const grand_total =
			values.course_fee +
			values.airfare_fee +
			values.accommodation_fee +
			values.per_diem_fee +
			values.transportation_fee +
			values.travel_insurance_fee +
			values.other_fees;

		const { data, error } = await supabase
			.from("external_forms")
			.insert([
				{
					...values,
					grand_total_fees: grand_total,
					last_updated: new Date(),
					formStage: 2,
					supporting_documents: documentPaths,
				},
			])
			.select();

		if (error) {
			console.log(error);
			toast.error("Error submitting form");
		} else {
			await supabase.from("audit_log").insert([
				{
					ntf_id: data[0].id,
					type: "Create",
					username: data[0].full_name,
					email: data[0].email,
				},
			]);

			formReset();
			showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");
			setIsSubmitting(false);
			const { data: fetchedForms, error: fetchedError } = await supabase
				.from("external_forms")
				.select("*")
				.eq("id", data[0].id);

			if (!fetchedError) {
				const notificationDescription = `A Nominations/ Travelling Form has been submitted by ${data[0].full_name} (${data[0].staff_id}).`;
				const notificationType = "Nominations/ Travelling Form";
				const notificationLink = `/form/external/${data[0].id}`;

				const { error: notificationError } = await supabase.from("notifications").insert([
					{
						notifDesc: notificationDescription,
						notifType: notificationType,
						notifLink: notificationLink,
					},
				]);

				if (notificationError) {
					toast.success("We have notified AAO about your submission.");
				}

				// Send email
				sendContactForm(fetchedForms);
				router.push("/form/external/success");
			}
			router.refresh();
		}
	}

	useEffect(() => {
		setGrandTotal(courseFee + airfareFee + accommodationFee + perDiemFee + transportationFee + travelInsuranceFee + otherFees);
	}, [courseFee, airfareFee, accommodationFee, perDiemFee, transportationFee, travelInsuranceFee, otherFees]);

	useEffect(() => {
		setApplicantName(form.getValues("full_name"));
		setApplicantPosition(form.getValues("course"));
	}, [form.getValues("full_name"), form.getValues("course")]);

	const colFlightClass = "grid grid-cols-[150px_120px_120px_150px_150px_1fr_150px_150px_50px]";
	const colHotelClass = "grid grid-cols-[1fr_200px_200px_50px]";

	return (
		<div className="mx-auto max-w-7xl px-8 mt-6 mb-[200px]">
			<NTFHeader />
			<Separator className="mt-8" />
			<div className="grid gap-8 place-items-center">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8">
						<section className="section-1" id="Personal Details">
							<h2 className="text-2xl font-bold mb-4">1. Personal Details</h2>
							<div className="grid gap-8">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
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
												<FormLabel>
													Full Name (Same as I.C / Passport) <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Input
														// {...field}
														onChange={e => {
															setApplicantName(e.target.value);
															field.onChange(e.target.value);
															form.setValue("applicant_declaration_name", e.target.value);
															field.value = e.target.value;
														}}
														value={field.value}
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
												<FormLabel>
													Designation / Course <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														onChange={e => {
															setApplicantPosition(e.target.value);
															field.onChange(e.target.value);
															form.setValue("applicant_declaration_position_title", e.target.value);
														}}
														value={field.value}
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
												<FormLabel>
													Type of Transportation <span className="text-red-500"> *</span>
												</FormLabel>
												<Select
													onValueChange={e => {
														field.onChange(e);
														if (e === "own transport" || e === "company vehicle") {
															setUseOwnTransport(true);
															form.setValue("logistic_arrangement", null);
														} else {
															const logisticObject = {
																flight_date: null,
																flight_time: null,
																flight_number: "",
																destination_from: "",
																destination_to: "",
																hotel_name: "",
																check_in_date: null,
																check_out_date: null,
															};
															form.setValue("logistic_arrangement", [logisticObject, logisticObject]);
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
												<FormLabel>
													Traveling in <span className="text-red-500"> *</span>
												</FormLabel>
												<Select
													onValueChange={e => {
														field.onChange(e);
														if (e === "group") {
															setGroup(true);
														} else {
															setGroup(false);
															form.setValue("other_members", "");
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
												<FormLabel>
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

						<Separator className="my-8" />

						<section className="section-2" id="Travel Details">
							<h2 className="text-2xl font-bold mb-4">2. Travel Details</h2>
							<FormField
								control={form.control}
								name="program_title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Program title / Event <span className="text-red-500"> *</span>
										</FormLabel>
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
									<FormItem className="my-8">
										<FormLabel>
											Description <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Textarea placeholder="" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-auto-fit-lg gap-8">
								<FormField
									control={form.control}
									name="commencement_date"
									render={({ field }) => (
										<FormItem className="flex flex-col gap-2">
											<FormLabel>
												Commencement Date <span className="text-red-500"> *</span>
											</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground",
															)}
														>
															{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value!}
														onSelect={date => {
															if (date !== undefined) {
																date.setHours(8, 0, 0, 0);
																field.onChange(date);
																field.value = new Date(date);
															}
														}}
														disabled={date => {
															const today = new Date();
															today.setHours(0, 0, 0, 0);
															return date < today;
														}}
														fromYear={1960}
														toYear={2030}
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
										<FormItem className="flex flex-col gap-2">
											<FormLabel>
												Completion Date <span className="text-red-500"> *</span>
											</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground",
															)}
														>
															{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value!}
														onSelect={date => {
															if (date !== undefined) {
																date.setHours(date.getHours() + 8);
																field.onChange(date);
																field.value = new Date(date);
															}
														}}
														disabled={date => {
															let today = form.getValues("commencement_date");
															if (today === undefined) {
																today = new Date();
																today.setHours(0, 0, 0, 0);
															} else {
																today?.setHours(0, 0, 0, 0);
															}
															return date < today!;
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
											<FormLabel>
												Organiser <span className="text-red-500"> *</span>
											</FormLabel>
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
											<FormLabel>
												Venue <span className="text-red-500"> *</span>
											</FormLabel>
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
											<FormLabel>
												HDRF Claimable <span className="text-red-500"> *</span>
											</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
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
							<div className="mb-4 flex justify-between">
								<h2 className="text-2xl font-bold">3. Logistic Arrangement</h2>
								{useOwnTransport !== null && useOwnTransport === false ? (
									<Button
										type="button"
										onClick={() => {
											const old = form.getValues("logistic_arrangement") ?? [];
											old.push({
												flight_date: null,
												flight_time: null,
												flight_number: "",
												destination_from: "",
												destination_to: "",
												hotel_name: "",
												check_in_date: null,
												check_out_date: null,
											});
											form.setValue("logistic_arrangement", old);
											form.trigger("logistic_arrangement");
											console.log(form.getValues("logistic_arrangement"));
										}}
									>
										Add Flight
									</Button>
								) : (
									<>
										<Button
											type="button"
											onClick={() => {
												const old = form.getValues("logistic_arrangement") ?? [];
												old.push({
													flight_date: null,
													flight_time: null,
													flight_number: "",
													destination_from: "",
													destination_to: "",
													hotel_name: "",
													check_in_date: null,
													check_out_date: null,
												});
												form.setValue("logistic_arrangement", old);
												form.trigger("logistic_arrangement");
												console.log(form.getValues("logistic_arrangement"));
											}}
										>
											Add Hotel
										</Button>
									</>
								)}
							</div>
							<div className="grid">
								{useOwnTransport !== null && useOwnTransport === false ? (
									<>
										<div className={colFlightClass + " p-3 pl-5 bg-amber-50 rounded-xl mb-6 [&>*]:mx-3"}>
											<div>
												Flight Date <span className="text-red-500"> *</span>
											</div>
											<div>
												Flight Time <span className="text-red-500"> *</span>
											</div>
											<div>
												Flight No. <span className="text-red-500"> *</span>
											</div>
											<div>
												From <span className="text-red-500"> *</span>
											</div>
											<div>
												To <span className="text-red-500"> *</span>
											</div>
											<div>Hotel Name</div>
											<div>Check In</div>
											<div>Check Out</div>
										</div>
										<div className="rounded-xl shadow-[0_0_0_2px_#EFEFEF_inset] p-2 divide-y-2 divide-solid divide-[#EFEFEF]">
											{[...Array(form.getValues("logistic_arrangement")?.length)].map((_, i) => (
												<div key={i} className={colFlightClass + " divide-x-2 divide-solid divide-[#EFEFEF] [&>*]:my-2 " + i}>
													<FormField
														control={form.control}
														name="logistic_arrangement"
														render={({ field }) => (
															<FormItem>
																<Popover>
																	<PopoverTrigger asChild>
																		<FormControl>
																			<Button
																				variant={"outline"}
																				className={cn("w-full text-left font-normal border-none")}
																			>
																				{field.value &&
																				field.value[i] &&
																				field.value[i].flight_date instanceof Date ? (
																					format(new Date(field.value[i].flight_date!), "PPP")
																				) : (
																					<span>Pick a date</span>
																				)}
																			</Button>
																		</FormControl>
																	</PopoverTrigger>
																	<PopoverContent className="w-auto p-0" align="start">
																		<Calendar
																			mode="single"
																			selected={field.value?.[i]?.flight_date!}
																			onSelect={date => {
																				if (date !== undefined) {
																					date.setHours(date.getHours() + 8);
																					field.onChange(
																						field.value?.map((item, index) =>
																							index === i ? { ...item, flight_date: date } : item,
																						),
																					);
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
														name="logistic_arrangement"
														render={({ field }) => (
															<FormItem>
																<FormControl>
																	<Input
																		className="border-none"
																		type="time"
																		value={field.value?.[i]?.flight_time || ""}
																		onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																			const newValue = field.value?.map((item, index) =>
																				index === i ? { ...item, flight_time: e.target.value } : item,
																			);
																			field.onChange(newValue);
																		}}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="logistic_arrangement"
														render={({ field }) => (
															<FormItem>
																<FormControl>
																	<Input
																		placeholder="FD 3261"
																		className="border-none focus:ring-transparent"
																		value={field.value?.[i]?.flight_number || ""}
																		onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																			const newValue = field.value?.map((item, index) =>
																				index === i ? { ...item, flight_number: e.target.value } : item,
																			);
																			field.onChange(newValue);
																		}}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="logistic_arrangement"
														render={({ field }) => (
															<FormItem>
																<FormControl>
																	<Input
																		className="border-none focus:ring-transparent"
																		placeholder="From"
																		value={field.value?.[i]?.destination_from || ""}
																		onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																			const newValue = field.value?.map((item, index) =>
																				index === i ? { ...item, destination_from: e.target.value } : item,
																			);
																			field.onChange(newValue);
																		}}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="logistic_arrangement"
														render={({ field }) => (
															<FormItem>
																<FormControl>
																	<Input
																		className="border-none focus:ring-transparent"
																		placeholder="To"
																		value={field.value?.[i]?.destination_to || ""}
																		onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																			const newValue = field.value?.map((item, index) =>
																				index === i ? { ...item, destination_to: e.target.value } : item,
																			);
																			field.onChange(newValue);
																		}}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="logistic_arrangement"
														render={({ field }) => (
															<FormItem>
																<FormControl>
																	<Input
																		placeholder="Hotel Name"
																		className="border-none focus:ring-transparent"
																		value={field.value?.[i]?.hotel_name || ""}
																		onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																			const newValue = field.value?.map((item, index) =>
																				index === i ? { ...item, hotel_name: e.target.value } : item,
																			);
																			field.onChange(newValue);
																		}}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="logistic_arrangement"
														render={({ field }) => (
															<FormItem>
																<Popover>
																	<PopoverTrigger asChild>
																		<FormControl>
																			<Button
																				variant={"outline"}
																				className={cn(
																					"w-full text-left font-normal rounded-none border-none pl-2",
																					!field.value && "text-muted-foreground",
																				)}
																			>
																				{field.value &&
																				field.value[i] &&
																				field.value[i].check_in_date instanceof Date ? (
																					format(new Date(field.value?.[i].check_in_date!), "PPP")
																				) : (
																					<span>Pick a date</span>
																				)}
																			</Button>
																		</FormControl>
																	</PopoverTrigger>
																	<PopoverContent className="w-auto p-0" align="start">
																		<Calendar
																			mode="single"
																			selected={
																				field.value && field.value[i]
																					? (field.value[i].check_in_date as Date)
																					: undefined
																			}
																			onSelect={date => {
																				if (date !== undefined) {
																					date.setHours(date.getHours() + 8);
																					field.onChange(
																						field.value?.map((item, index) =>
																							index === i ? { ...item, check_in_date: date } : item,
																						),
																					);
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
														name="logistic_arrangement"
														render={({ field }) => (
															<FormItem>
																<Popover>
																	<PopoverTrigger asChild>
																		<FormControl>
																			<Button
																				variant={"outline"}
																				className={cn(
																					"w-full text-left font-normal rounded-none border-none pl-2",
																				)}
																			>
																				{field.value &&
																				field.value[i] &&
																				field.value[i].check_out_date instanceof Date ? (
																					format(new Date(field.value?.[i].check_out_date!), "PPP")
																				) : (
																					<span>Pick a date</span>
																				)}
																			</Button>
																		</FormControl>
																	</PopoverTrigger>
																	<PopoverContent className="w-auto p-0" align="start">
																		<Calendar
																			mode="single"
																			selected={
																				field.value &&
																				field.value[i] &&
																				field.value[i].check_out_date !== null &&
																				field.value[i].check_out_date instanceof Date
																					? (field.value[i].check_out_date as Date)
																					: undefined
																			}
																			onSelect={date => {
																				if (date !== undefined) {
																					date.setHours(date.getHours() + 8);
																					field.onChange(
																						field.value?.map((item, index) =>
																							index === i ? { ...item, check_out_date: date } : item,
																						),
																					);
																				}
																			}}
																			disabled={date => {
																				let today = form.getValues("logistic_arrangement")?.[i]
																					.check_out_date;
																				if (today === undefined) {
																					today = new Date();
																					today.setHours(0, 0, 0, 0);
																				} else {
																					today?.setHours(0, 0, 0, 0);
																				}
																				return date < today!;
																			}}
																			initialFocus
																		/>
																	</PopoverContent>
																</Popover>
																<FormMessage />
															</FormItem>
														)}
													/>

													<div className="grid place-items-center">
														<X
															className="text-red-500 cursor-pointer hover:text-red-600 transition-all hover:scale-125"
															onClick={() => {
																const values = form.getValues("logistic_arrangement");
																if (values?.length! <= 2) {
																	toast.error("2 flights are needed for go and return");
																	return;
																}
																if (Array.isArray(values) && i >= 0 && i < values.length) {
																	values.splice(i, 1);
																	form.setValue("logistic_arrangement", values);
																	form.trigger("logistic_arrangement");
																	console.log(form.getValues("logistic_arrangement"));
																}
															}}
														/>
													</div>
												</div>
											))}
										</div>
									</>
								) : (
									<>
										{form.getValues("logistic_arrangement") && form.getValues("logistic_arrangement")?.length! > 0 ? (
											<>
												<div className={colHotelClass + " p-3 pl-5 bg-amber-50 rounded-xl mb-6 [&>*]:mx-3"}>
													<div>Hotel Name</div>
													<div>Check In</div>
													<div>Check Out</div>
												</div>
												<div className="rounded-xl shadow-[0_0_0_2px_#EFEFEF_inset] p-2 divide-y-2 divide-solid divide-[#EFEFEF]">
													{[...Array(form.getValues("logistic_arrangement")?.length)].map((_, i) => (
														<div
															key={i}
															className={colHotelClass + " divide-x-2 divide-solid divide-[#EFEFEF] [&>*]:my-2 " + i}
														>
															<FormField
																control={form.control}
																name="logistic_arrangement"
																render={({ field }) => (
																	<FormItem>
																		<FormControl>
																			<Input
																				placeholder="Hotel Name"
																				className="border-none focus:ring-transparent"
																				value={field.value?.[i]?.hotel_name || ""}
																				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																					const newValue = field.value?.map((item, index) =>
																						index === i ? { ...item, hotel_name: e.target.value } : item,
																					);
																					field.onChange(newValue);
																				}}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<FormField
																control={form.control}
																name="logistic_arrangement"
																render={({ field }) => (
																	<FormItem>
																		<Popover>
																			<PopoverTrigger asChild>
																				<FormControl>
																					<Button
																						variant={"outline"}
																						className={cn(
																							"w-full text-left font-normal rounded-none border-none pl-2",
																							!field.value && "text-muted-foreground",
																						)}
																					>
																						{field.value &&
																						field.value[i] &&
																						field.value[i].check_in_date instanceof Date ? (
																							format(new Date(field.value?.[i].check_in_date!), "PPP")
																						) : (
																							<span>Pick a date</span>
																						)}
																					</Button>
																				</FormControl>
																			</PopoverTrigger>
																			<PopoverContent className="w-auto p-0" align="start">
																				<Calendar
																					mode="single"
																					selected={
																						field.value && field.value[i]
																							? (field.value[i].check_in_date as Date)
																							: undefined
																					}
																					onSelect={date => {
																						if (date !== undefined) {
																							date.setHours(date.getHours() + 8);
																							field.onChange(
																								field.value?.map((item, index) =>
																									index === i
																										? { ...item, check_in_date: date }
																										: item,
																								),
																							);
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
																name="logistic_arrangement"
																render={({ field }) => (
																	<FormItem>
																		<Popover>
																			<PopoverTrigger asChild>
																				<FormControl>
																					<Button
																						variant={"outline"}
																						className={cn(
																							"w-full text-left font-normal rounded-none border-none pl-2",
																						)}
																					>
																						{field.value &&
																						field.value[i] &&
																						field.value[i].check_out_date instanceof Date ? (
																							format(new Date(field.value?.[i].check_out_date!), "PPP")
																						) : (
																							<span>Pick a date</span>
																						)}
																					</Button>
																				</FormControl>
																			</PopoverTrigger>
																			<PopoverContent className="w-auto p-0" align="start">
																				<Calendar
																					mode="single"
																					selected={
																						field.value &&
																						field.value[i] &&
																						field.value[i].check_out_date !== null &&
																						field.value[i].check_out_date instanceof Date
																							? (field.value[i].check_out_date as Date)
																							: undefined
																					}
																					onSelect={date => {
																						if (date !== undefined) {
																							date.setHours(date.getHours() + 8);
																							field.onChange(
																								field.value?.map((item, index) =>
																									index === i
																										? { ...item, check_out_date: date }
																										: item,
																								),
																							);
																						}
																					}}
																					disabled={date => {
																						let today = form.getValues("logistic_arrangement")?.[i]
																							.check_out_date;
																						if (today === undefined) {
																							today = new Date();
																							today.setHours(0, 0, 0, 0);
																						} else {
																							today?.setHours(0, 0, 0, 0);
																						}
																						return date < today!;
																					}}
																					initialFocus
																				/>
																			</PopoverContent>
																		</Popover>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<div className="grid place-items-center">
																<X
																	className="text-red-500 cursor-pointer hover:text-red-600 transition-all hover:scale-125"
																	onClick={() => {
																		const values = form.getValues("logistic_arrangement");
																		if (Array.isArray(values) && i >= 0 && i < values.length) {
																			values.splice(i, 1);
																			form.setValue("logistic_arrangement", values);
																			form.trigger("logistic_arrangement");
																		}

																		// set null if the array is empty
																		if (values?.length === 0) {
																			form.setValue("logistic_arrangement", null);
																		}
																	}}
																/>
															</div>
														</div>
													))}
												</div>
											</>
										) : (
											<div className="text-center text-muted-foreground w-full h-48 rounded-xl grid place-items-center bg-gray-100">
												No logistic arrangement added
											</div>
										)}
									</>
								)}
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
													type="text"
													value={field.value === 0 ? "" : field.value.toString()}
													onChange={e => {
														const value = e.target.value;
														if (/^\d*$/.test(value)) {
															field.onChange(value === "" ? 0 : Number(value));
															setCourseFee(Number(value));
														}
													}}
													onBlur={() => {
														field.onChange(field.value || 0);
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
													type="text"
													value={field.value === 0 ? "" : field.value.toString()}
													onChange={e => {
														const value = e.target.value;
														if (/^\d*$/.test(value)) {
															field.onChange(value === "" ? 0 : Number(value));
															setAirfareFee(Number(value));
														}
													}}
													onBlur={() => {
														field.onChange(field.value || 0);
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
													type="text"
													value={field.value === 0 ? "" : field.value.toString()}
													onChange={e => {
														const value = e.target.value;
														if (/^\d*$/.test(value)) {
															field.onChange(value === "" ? 0 : Number(value));
															setAccommodationFee(Number(value));
														}
													}}
													onBlur={() => {
														field.onChange(field.value || 0);
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
													type="text"
													value={field.value === 0 ? "" : field.value.toString()}
													onChange={e => {
														const value = e.target.value;
														if (/^\d*$/.test(value)) {
															field.onChange(value === "" ? 0 : Number(value));
															setPerDiemFee(Number(value));
														}
													}}
													onBlur={() => {
														field.onChange(field.value || 0);
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
													type="text"
													value={field.value === 0 ? "" : field.value.toString()}
													onChange={e => {
														const value = e.target.value;
														if (/^\d*$/.test(value)) {
															field.onChange(value === "" ? 0 : Number(value));
															setTransportationFee(Number(value));
														}
													}}
													onBlur={() => {
														field.onChange(field.value || 0);
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
													type="text"
													value={field.value === 0 ? "" : field.value.toString()}
													onChange={e => {
														const value = e.target.value;
														if (/^\d*$/.test(value)) {
															field.onChange(value === "" ? 0 : Number(value));
															setTravelInsuranceFee(Number(value));
														}
													}}
													onBlur={() => {
														field.onChange(field.value || 0);
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
													type="text"
													value={field.value === 0 ? "" : field.value.toString()}
													onChange={e => {
														const value = e.target.value;
														if (/^\d*$/.test(value)) {
															field.onChange(value === "" ? 0 : Number(value));
															setOtherFees(Number(value));
														}
													}}
													onBlur={() => {
														field.onChange(field.value || 0);
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
												<Input disabled value={grandTotal} />
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
						</section>

						<Separator className="my-8" />

						<section className="section-5" id="Supporting Documents">
							<h1 className="text-2xl font-bold mb-4">
								5. Supporting Documents <span className="text-red-500"> *</span>
							</h1>
							<FormField
								control={form.control}
								name="supporting_documents"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
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
													<span className="font-semibold">Click or drag to upload</span>
												</p>
												<p className="text-sm text-gray-500 dark:text-gray-400">PDF (maximum 5MB)</p>
												{field?.value?.length! > 0 && (
													<p className="mt-2 text-xl text-slate-700">{field.value?.length} File Uploaded</p>
												)}
											</div>
											<FormControl className="absolute">
												<Input
													multiple
													className="absolute w-full h-full opacity-0 cursor-pointer"
													type="file"
													accept=".pdf"
													{...form.register("supporting_documents", {
														required: false,
													})}
													onChange={event => {
														if (event.target.files) {
															console.log(event.target.files);
															const newFiles = Array.from(event.target.files as FileList);
															newFiles.forEach(newFile => {
																if (!files.some(file => file.name === newFile.name)) {
																	files.push(newFile);
																} else {
																	toast.error("File already exists");
																}
															});
															field.onChange(files);
															form.trigger("supporting_documents");
															console.log(form.getValues("supporting_documents"));
														}
													}}
												/>
											</FormControl>
										</FormLabel>
										<FormMessage />
										<div className="grid gap-2 mt-2 items-start">
											{form.getValues("supporting_documents") &&
												Array.from(form.getValues("supporting_documents")!).map((file: any, index: number) => (
													<div key={file.name}>
														<div className="grid grid-cols-[400px_100px]">
															<div className="flex gap-2 p-2 items-start text-ellipsis overflow-hidden whitespace-nowrap">
																<BsFiletypePdf className="w-6 h-6 text-red-500" />
																{file.name}
															</div>
															<div className="grid place-ite">
																<X
																	className="text-red-500 cursor-pointer hover:text-red-600 transition-all hover:scale-125"
																	onClick={() => {
																		let supporting_documents = form.getValues("supporting_documents"); // FileList
																		supporting_documents = Array.from(supporting_documents);
																		supporting_documents.splice(index, 1);
																		files.splice(index, 1);
																		form.setValue("supporting_documents", supporting_documents);
																		form.trigger("supporting_documents");
																	}}
																/>
															</div>
														</div>
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
								I (or acting as representative of group travelling) hereby confirm the accuracy of the information (including any
								attachments) provided for this application.
							</p>
							<div className="grid gap-8">
								<div className="grid grid-auto-fit-lg gap-8">
									<FormField
										control={form.control}
										name="applicant_declaration_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Name <span className="text-gray-500"> (Auto filled) </span>
												</FormLabel>
												<FormControl>
													<Input disabled {...field} value={applicantName} className="disabled:opacity-90" />
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
												<FormLabel>
													Position title <span className="text-gray-500"> (Auto filled) </span>
												</FormLabel>
												<FormControl>
													<Input disabled {...field} value={applicantPosition} className="disabled:opacity-90" />
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
											<FormLabel>
												Declaration Date <span className="text-red-500"> *</span>
											</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground",
															)}
														>
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
											<FormLabel>
												Signature <span className="text-red-500"> *</span>
											</FormLabel>
											<Dialog>
												<DialogTrigger asChild>
													<div className="w-full border-2 min-h-[200px] h-fit border-gray-300 rounded-md grid place-items-center relative">
														{field.value ? (
															<Image
																src={imageURL}
																width={300}
																height={200}
																alt="Signature"
																className="w-[300px] h-fit"
															/>
														) : (
															<div>Click to upload or draw signature</div>
														)}
													</div>
												</DialogTrigger>
												<DialogContent>
													<Tabs defaultValue="upload">
														<TabsList className="grid w-full grid-cols-2 my-3">
															<TabsTrigger value="upload">Upload</TabsTrigger>
															<TabsTrigger value="draw">Draw</TabsTrigger>
														</TabsList>
														<TabsContent value="upload">
															<DialogHeader>
																<DialogTitle className="mb-4">Upload Signature Image</DialogTitle>
															</DialogHeader>
															<FormLabel className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
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
																		<span className="font-semibold">Click or drag to upload</span>
																	</p>
																	{field?.value instanceof File && (
																		<p className="mt-2 text-xl text-slate-700">Image Uploaded</p>
																	)}
																</div>
																<FormControl className="absolute">
																	<Input
																		className="absolute w-full h-full opacity-0 cursor-pointer"
																		type="file"
																		accept="image/*"
																		onChange={event => {
																			if (event.target.files) {
																				console.log(event.target.files[0]);
																				field.onChange(event.target.files[0]);
																				form.trigger("applicant_declaration_signature");
																				console.log(form.getValues("applicant_declaration_signature"));
																			}
																		}}
																	/>
																</FormControl>
															</FormLabel>
															<DialogFooter className="mt-8">
																<DialogClose asChild>
																	<Button
																		onClick={() => {
																			setImageURL(URL.createObjectURL(field.value));
																		}}
																	>
																		Save
																	</Button>
																</DialogClose>
															</DialogFooter>
														</TabsContent>
														<TabsContent value="draw">
															<DialogHeader className="my-3">
																<DialogTitle>Draw Signature</DialogTitle>
															</DialogHeader>
															<DialogDescription className="mb-4">Please sign below</DialogDescription>
															<div className="w-full h-[200px] border-2 border-gray-300 rounded-md relative">
																<SignaturePad
																	// @ts-ignore
																	ref={sigCanvas}
																	canvasProps={{
																		className: "w-full h-full",
																	}}
																/>
															</div>
															<DialogFooter className="mt-8">
																<Button variant="outline" onClick={clear}>
																	Clear
																</Button>
																<DialogClose asChild>
																	<Button
																		onClick={() => {
																			save();
																			field.onChange(
																				sigCanvas.current
																					// @ts-ignore
																					.getTrimmedCanvas()
																					.toDataURL("image/png"),
																			);
																			field.value = sigCanvas.current
																				// @ts-ignore
																				.getTrimmedCanvas()
																				.toDataURL("image/png");
																		}}
																	>
																		Save
																	</Button>
																</DialogClose>
															</DialogFooter>
														</TabsContent>
													</Tabs>
												</DialogContent>
												<FormMessage />
											</Dialog>
										</FormItem>
									)}
								/>
							</div>
						</section>

						<div className="flex justify-end items-end gap-4">
							<Button type="reset" onClick={formReset}>
								Reset
							</Button>

							<Dialog open={open} onOpenChange={setOpen}>
								<DialogTrigger asChild>
									<Button type="button" disabled={isSubmitting}>
										{isSubmitting ? <span>Submitting...</span> : <span>Submit for Review</span>}
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Please re-confirm your details!</DialogTitle>
										<DialogDescription>
											Please confirm your email is correct: {form.getValues("email")}. <br />
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
					</form>
				</Form>
			</div>
		</div>
	);
}
