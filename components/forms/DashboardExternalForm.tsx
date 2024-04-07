"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import adminExternalFormSchema from "@/schema/adminExternalFormSchema";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";
import { sendContactForm } from "@/lib/api";

import AuditLog from "@/components/ntf/AuditLog";
import { BsFiletypePdf } from "react-icons/bs";
import {
	EllipsisVertical,
	File,
	RotateCcw,
	Undo2,
	ArrowLeftIcon,
	Calendar as CalenderIcon,
	DollarSign,
	CheckCheck,
	CircleDashed,
	CircleX,
	Forward,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-year";
import { Input } from "@/components/ui/external-dashboard-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/external-dashboard-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from "@/components/ui/dialog";

const auth = getAuth();
const user = auth.currentUser;

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

export default function DashboardExternalForm({ data, faculties, auditLog }: { data: ExternalForm; faculties: string[]; auditLog: AuditLog[] }) {
	const supabase = createClientComponentClient();
	const [externalForm, setExternalForm] = useState<ExternalForm>(data);
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>(auditLog);
	const [useOwnTransport, setUseOwnTransport] = useState(false);
	const [group, setGroup] = useState(false);
	const [emails, setEmails] = useState<any[]>([]);
	const [revertOpen, setRevertOpen] = useState(false);
	const [undoOpen, setUndoOpen] = useState(false);
	const [forwardOpen, setForwardOpen] = useState(false);

	const [courseFee, setCourseFee] = useState(0);
	const [airfareFee, setAirfareFee] = useState(0);
	const [accommodationFee, setAccommodationFee] = useState(0);
	const [perDiemFee, setPerDiemFee] = useState(0);
	const [transportationFee, setTransportationFee] = useState(0);
	const [travelInsuranceFee, setTravelInsuranceFee] = useState(0);
	const [otherFees, setOtherFees] = useState(0);
	const [grandTotal, setGrandTotal] = useState(0);

	useEffect(() => {
		setGrandTotal(courseFee + airfareFee + accommodationFee + perDiemFee + transportationFee + travelInsuranceFee + otherFees);
	}, [courseFee, airfareFee, accommodationFee, perDiemFee, transportationFee, travelInsuranceFee, otherFees]);

	useEffect(() => {
		if (externalForm) {
			setCourseFee(externalForm.course_fee!);
			setAirfareFee(externalForm.airfare_fee!);
			setAccommodationFee(externalForm.accommodation_fee!);
			setPerDiemFee(externalForm.per_diem_fee!);
			setTransportationFee(externalForm.transportation_fee!);
			setTravelInsuranceFee(externalForm.travel_insurance_fee!);
			setOtherFees(externalForm.other_fees!);
		}
	}, [externalForm]);

	useEffect(() => {
		const fetchEmails = async () => {
			const { data, error } = await supabase.from("external_emails").select("*");
			if (!error) {
				setEmails(data || []);
			}
		};

		fetchEmails();
	}, []);

	const revertSchema = z.object({
		revertComment: z.string().nonempty(),
	});

	const revertForm = useForm<z.infer<typeof revertSchema>>({
		resolver: zodResolver(revertSchema),
		defaultValues: {
			revertComment: "",
		},
	});

	const undoSchema = z.object({
		formStage: z
			.number()
			.min(1)
			.max(6),
		revertComment: z.string().nonempty(),
	});

	const undoForm = useForm<z.infer<typeof undoSchema>>({
		resolver: zodResolver(undoSchema),
		defaultValues: {
			formStage: externalForm.formStage!,
			revertComment: "",
		},
	});

	const forwardSchema = z.object({
		verification_email: z.string().email(),
		approval_email: z.string().email(),
	});

	const forwardForm = useForm<z.infer<typeof forwardSchema>>({
		resolver: zodResolver(forwardSchema),
		defaultValues: {
			verification_email: "",
			approval_email: "",
		},
	});

	useEffect(() => {
		console.log(forwardForm.formState.errors);
	}, [forwardForm.formState.errors]);

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
			transit_flight_date: externalForm.transit_flight_date ? new Date(externalForm.transit_flight_date) : null,
			transit_flight_time: externalForm.transit_flight_time ?? null,
			transit_flight_number: externalForm.transit_flight_number!,
			transit_destination_from: externalForm.transit_destination_from!,
			transit_destination_to: externalForm.transit_destination_to!,

			check_in_date: externalForm.check_in_date ? new Date(externalForm.check_in_date) : null,
			check_out_date: externalForm.check_out_date ? new Date(externalForm.check_out_date) : null,
			hotel_name: externalForm.hotel_name!,
			total_hours: externalForm.total_hours! ?? null,

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

	async function onSubmit(values: z.infer<typeof adminExternalFormSchema>) {
		const { verification_email, approval_email, ...rest } = values;
		const updatedExternalForm = { ...externalForm, ...rest };

		const { error } = await supabase
			.from("external_forms")
			.update(updatedExternalForm)
			.eq("id", externalForm.id);

		if (error) {
			toast.error("Error updating external form");
			return;
		} else {
			toast.success("External form updated successfully");
		}
	}

	async function onRevertSubmit(values: z.infer<typeof revertSchema>) {
		if (externalForm.formStage === 2) {
			const { revertComment } = values;
			const updatedExternalForm = { ...externalForm, revertComment, formStage: 1 };

			const { data, error } = await supabase
				.from("external_forms")
				.update(updatedExternalForm)
				.eq("id", externalForm.id)
				.select();

			if (error) {
				toast.error("Error reverting external form");
				return;
			} else {
				sendContactForm([externalForm]);
				toast.success("External form reverted successfully");
				setExternalForm(data![0]);
				setRevertOpen(false);

				const { data: auditLogData, error: auditLogError } = await supabase
					.from("audit_log")
					.insert({
						ntf_id: externalForm.id,
						type: "Revert",
						username: user?.displayName,
						email: user?.email,
					})
					.select();

				if (!auditLogError) {
					setAuditLogs([...auditLogs, auditLogData![0]]);
				}
			}
		} else if (externalForm.formStage === 1) {
			toast.error("External form is already reverted to staff");
			setRevertOpen(false);
		} else {
			toast.error("External form cannot be reverted");
			setRevertOpen(false);
		}
		revertForm.reset();
	}

	async function onUndoSubmit(values: z.infer<typeof undoSchema>) {
		const { formStage, revertComment } = values;
		const updatedExternalForm = { ...externalForm, formStage, revertComment };

		const { data, error } = await supabase
			.from("external_forms")
			.update(updatedExternalForm)
			.eq("id", externalForm.id)
			.select();

		if (error) {
			toast.error("Error undoing external form");
			return;
		} else {
			sendContactForm([externalForm]);
			toast.success("External form undone successfully");
			setUndoOpen(false);
			setExternalForm(data![0]);

			const { data: auditLogData, error: auditLogError } = await supabase
				.from("audit_log")
				.insert({
					ntf_id: externalForm.id,
					type: "Undo",
					username: user?.displayName,
					email: user?.email,
				})
				.select();

			if (!auditLogError) {
				setAuditLogs([...auditLogs, auditLogData![0]]);
			}
		}
		undoForm.reset();
	}

	async function onForwardSubmit(values: z.infer<typeof forwardSchema>) {
		const { verification_email, approval_email } = values;
		const updatedExternalForm = { ...externalForm, verification_email, approval_email };
		console.log(updatedExternalForm);

		const { data, error } = await supabase
			.from("external_forms")
			.update(updatedExternalForm)
			.eq("id", externalForm.id)
			.select();

		if (error) {
			toast.error("Error forwarding external form");
			return;
		} else {
			sendContactForm([externalForm]);
			toast.success("External form forwarded successfully");
			setForwardOpen(false);
			setExternalForm(data![0]);

			const { data: auditLogData, error: auditLogError } = await supabase
				.from("audit_log")
				.insert({
					ntf_id: externalForm.id,
					type: "Forward",
					username: user?.displayName,
					email: user?.email,
				})
				.select();

			if (!auditLogError) {
				setAuditLogs([...auditLogs, auditLogData![0]]);
			}
		}
		forwardForm.reset();
	}

	return (
		<>
			<div className="flex-1">
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex justify-between items-center bg-white p-3 pr-8 pl-4 rounded-xl">
							<div className="flex gap-3">
								<Link href="/external" className="px-4 flex h-10 items-center gap-2">
									<ArrowLeftIcon className="cursor-pointer text-gray-500" />
									<span>Back</span>
								</Link>

								{externalForm.formStage === 1 && (
									<div className="flex gap-3 text-red-500 items-center">
										<CircleX size={20} />
										<h1 className="text-xl font-semibold">Reverted to staff</h1>
									</div>
								)}

								{externalForm.formStage === 2 && (
									<div className="flex gap-3 text-blue-500 items-center">
										<CircleDashed size={20} />
										<h1 className="text-xl font-semibold">Reviewing by AAO</h1>
									</div>
								)}

								{externalForm.formStage === 3 && (
									<div className="flex gap-3 text-blue-500 items-center">
										<CircleDashed size={20} />
										<h1 className="text-xl font-semibold">Pending for verification</h1>
									</div>
								)}

								{externalForm.formStage === 4 && (
									<div className="flex gap-3 text-blue-500 items-center">
										<CircleDashed size={20} />
										<h1 className="text-xl font-semibold">Pending for approve</h1>
									</div>
								)}

								{externalForm.formStage === 5 && (
									<div className="flex gap-3 text-green-500 items-center">
										<CheckCheck size={20} />
										<h1 className="text-xl font-semibold">Approved</h1>
									</div>
								)}
								{externalForm.formStage === 6 && (
									<div className="flex gap-3 text-red-500 items-center">
										<CircleX size={20} />
										<h1 className="text-xl font-semibold">Rejected</h1>
									</div>
								)}
							</div>

							<div className="flex gap-3">
								<Button
									variant="outline"
									className="shadow-[0_0_0_2px_#EFEFEF_inset] border-none px-5 h-12 text-[15px] rounded-xl font-bold"
									asChild
								>
									<Link href="/external" className="px-4 flex h-10 items-center gap-2">
										Cancel
									</Link>
								</Button>
								<Button variant="default" className="px-5 h-12 text-[15px] rounded-xl font-bold" type="submit">
									Save / Update
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger className="text-gray-500 outline-none">
										<div className="border-2 p-2 rounded-xl hover:bg-slate-100 transition-all">
											<EllipsisVertical />
										</div>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="p-3 w-64 font-semibold text-[15px] rounded-2xl text-gray-500">
										<DropdownMenuItem
											className="p-3 cursor-pointer rounded-xl flex gap-2"
											onClick={() => {
												setForwardOpen(true);
											}}
										>
											<Forward size={20} />
											Forward
										</DropdownMenuItem>
										<DropdownMenuItem
											className="p-3 cursor-pointer rounded-xl flex gap-2"
											onClick={() => {
												setRevertOpen(true);
											}}
										>
											<Undo2 size={20} />
											Revert to Staff
										</DropdownMenuItem>
										<DropdownMenuItem
											className="p-3 cursor-pointer rounded-xl flex gap-2"
											onClick={() => {
												setUndoOpen(true);
											}}
										>
											<RotateCcw size={20} />
											Undo
										</DropdownMenuItem>
										<DropdownMenuItem className="p-3 cursor-pointer rounded-xl flex gap-2" asChild>
											<Link href={`/external/${externalForm.id}/preview`}>
												<File size={20} />
												Preview PDF
											</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>

						<section className="section-1 bg-white rounded-lg p-4 dark:bg-dark_mode_card">
							<div className="flex justify-between mb-8">
								<div className="flex gap-3">
									<div className="rounded-sm bg-green-200 w-4 h-8"></div>
									<h1 className="text-xl font-semibold">Persona Details</h1>
								</div>
							</div>
							<div>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem className="mb-8">
											<FormLabel className="font-semibold text-sm text-gray-500">
												Email <span className="text-red-500"> *</span>
											</FormLabel>
											<FormControl>
												<Input type="email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-auto-fit-xl gap-8">
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
							<div className="grid grid-auto-fit-xl gap-8">
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
																"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden shadow-[0_0_0_2px_#EFEFEF_inset] hover:shadow-[0_0_0_2px_#9A9FA5_inset] hover:border-[#dbdbdb] focus:shadow-[0_0_0_2px_#9A9FA5_inset] focus:border-[#dbdbdb] border-none hover:bg-white transition-all",
																!field.value && "text-muted-foreground",
															)}
														>
															<div className="bg-gray-100 h-[43px] w-[44px] px-3 text-gray-900 grid place-items-center relative left-[2px] rounded-l-xl">
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
																"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden shadow-[0_0_0_2px_#EFEFEF_inset] hover:shadow-[0_0_0_2px_#9A9FA5_inset] hover:border-[#dbdbdb] focus:shadow-[0_0_0_2px_#9A9FA5_inset] focus:border-[#dbdbdb] border-none hover:bg-white transition-all",
																!field.value && "text-muted-foreground",
															)}
														>
															<div className="bg-gray-100 h-[43px] w-[44px] px-3 text-gray-900 grid place-items-center relative left-[2px] rounded-l-lg">
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
																				"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden shadow-[0_0_0_2px_#EFEFEF_inset] hover:shadow-[0_0_0_2px_#9A9FA5_inset] hover:border-[#dbdbdb] focus:shadow-[0_0_0_2px_#9A9FA5_inset] focus:border-[#dbdbdb] border-none hover:bg-white transition-all",
																				!field.value && "text-muted-foreground",
																			)}
																		>
																			<div className="bg-gray-100 h-[43px] w-[44px] px-3 text-gray-900 grid place-items-center relative left-[2px] rounded-l-xl">
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
															<Input type="time" {...field} value={field.value || ""} />
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

										<div className="grid gap-8">
											<div className="grid grid-auto-fit-lg gap-8">
												<FormField
													control={form.control}
													name="transit_flight_date"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Transit Flight Date</FormLabel>
															<Popover>
																<PopoverTrigger asChild>
																	<FormControl>
																		<Button
																			variant={"outline"}
																			className={cn(
																				"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden shadow-[0_0_0_2px_#EFEFEF_inset] hover:shadow-[0_0_0_2px_#9A9FA5_inset] hover:border-[#dbdbdb] focus:shadow-[0_0_0_2px_#9A9FA5_inset] focus:border-[#dbdbdb] border-none hover:bg-white transition-all",
																				!field.value && "text-muted-foreground",
																			)}
																		>
																			<div className="bg-gray-100 h-[43px] w-[44px] px-3 text-gray-900 grid place-items-center relative left-[2px] rounded-l-xl">
																				<CalenderIcon size={20} />
																			</div>
																			{field.value ? (
																				format(new Date(field.value), "PPP")
																			) : (
																				<span>Pick a date</span>
																			)}
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
													name="transit_flight_time"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Transit Flight Time</FormLabel>
															<FormControl>
																<Input type="time" {...field} value={field.value || ""} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<FormField
												control={form.control}
												name="transit_flight_number"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Transit Flight Number</FormLabel>
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
													name="transit_destination_from"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Transit From</FormLabel>
															<FormControl>
																<Input placeholder="" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="transit_destination_to"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Transit To</FormLabel>
															<FormControl>
																<Input placeholder="" {...field} />
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
												<FormLabel className="font-semibold text-sm text-gray-500">Hotel Check In</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={"outline"}
																className={cn(
																	"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden shadow-[0_0_0_2px_#EFEFEF_inset] hover:shadow-[0_0_0_2px_#9A9FA5_inset] hover:border-[#dbdbdb] focus:shadow-[0_0_0_2px_#9A9FA5_inset] focus:border-[#dbdbdb] border-none hover:bg-white transition-all",
																	!field.value && "text-muted-foreground",
																)}
															>
																<div className="bg-gray-100 h-[43px] w-[44px] px-3 text-gray-900 grid place-items-center relative left-[2px] rounded-l-xl">
																	<CalenderIcon size={20} />
																</div>
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
												<FormLabel className="font-semibold text-sm text-gray-500">Hotel Check Out</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={"outline"}
																className={cn(
																	"w-full h-12 flex items-center justify-start p-0 gap-2 font-semibold text-[15px] mt-0 rounded-xl overflow-hidden shadow-[0_0_0_2px_#EFEFEF_inset] hover:shadow-[0_0_0_2px_#9A9FA5_inset] hover:border-[#dbdbdb] focus:shadow-[0_0_0_2px_#9A9FA5_inset] focus:border-[#dbdbdb] border-none hover:bg-white transition-all",
																	!field.value && "text-muted-foreground",
																)}
															>
																<div className="bg-gray-100 h-[43px] w-[44px] px-3 text-gray-900 grid place-items-center relative left-[2px] rounded-l-xl">
																	<CalenderIcon size={20} />
																</div>
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
								<FormField
									control={form.control}
									name="total_hours"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-semibold text-sm text-gray-500">
												Total Hours <span className="text-red-500"> (Fill in by AAO)</span>
											</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															if (/^\d*$/.test(value)) {
																field.onChange(value === "" ? 0 : Number(value));
																setCourseFee(Number(e.target.value));
															}
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
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															if (/^\d*$/.test(value)) {
																field.onChange(value === "" ? 0 : Number(value));
																setAirfareFee(Number(e.target.value));
															}
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
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															if (/^\d*$/.test(value)) {
																field.onChange(value === "" ? 0 : Number(value));
																setAccommodationFee(Number(e.target.value));
															}
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
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															if (/^\d*$/.test(value)) {
																field.onChange(value === "" ? 0 : Number(value));
																setPerDiemFee(Number(e.target.value));
															}
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
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															if (/^\d*$/.test(value)) {
																field.onChange(value === "" ? 0 : Number(value));
																setTransportationFee(Number(e.target.value));
															}
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
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															if (/^\d*$/.test(value)) {
																field.onChange(value === "" ? 0 : Number(value));
																setTravelInsuranceFee(Number(e.target.value));
															}
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
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															if (/^\d*$/.test(value)) {
																field.onChange(value === "" ? 0 : Number(value));
																setOtherFees(Number(value));
															}
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
													<Input className="bg-white border border-gray-200 pl-14" value={grandTotal} />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="mt-8">
								<h2 className="font-medium mb-3">Source of Fund</h2>
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
												Any expenditure cap? If yes, please specify below
												<span className="text-red-500"> (Fill in by AAO)</span>
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
														type="text"
														className="bg-white border border-gray-200 pl-14 disabled:cursor-not-allowed"
														disabled={form.getValues("expenditure_cap") !== "Yes"}
														{...field}
														value={field.value === 0 ? "" : field.value?.toString() ?? ""}
														onChange={e => {
															const value = e.target.value;
															if (/^\d*$/.test(value)) {
																field.onChange(value === "" ? 0 : Number(value));
															}
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
											<div className="w-full h-[300px] border-2 border-gray-300 rounded-md grid place-items-center">
												{externalForm.applicant_declaration_signature ? (
													<Image
														src={externalForm.applicant_declaration_signature ?? ""}
														width={300}
														height={300}
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
															selected={field.value || undefined}
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
												<div className="w-full h-[300px] border-2 border-gray-300 rounded-md grid place-items-center">
													{externalForm.verification_signature ? (
														<Image
															src={externalForm.verification_signature ?? ""}
															width={300}
															height={300}
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
																selected={field.value || undefined}
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
													<div className="w-full h-[300px] border-2 border-gray-300 rounded-md grid place-items-center">
														{externalForm.verification_signature ? (
															<Image
																src={externalForm.verification_signature ?? ""}
																width={300}
																height={300}
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
																selected={field.value || undefined}
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
													<div className="w-full h-[300px] border-2 border-gray-300 rounded-md grid place-items-center">
														{externalForm.approval_signature ? (
															<Image
																src={externalForm.approval_signature ?? ""}
																width={300}
																height={300}
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
							</>
						)}
					</form>
				</Form>
			</div>

			<div className="flex flex-col gap-4 w-80">
				{externalForm.verification_email && (
					<div className="flex flex-col gap-3 top-3 bg-white rounded-lg p-4">
						<aside className="flex flex-col justify-between">
							<div className="flex gap-3">
								<div className="rounded-sm bg-yellow-500 w-4 h-8"></div>
								<h1 className="text-xl font-semibold">Verifier</h1>
							</div>
							<p className="mt-2">{externalForm.verification_email}</p>
						</aside>
					</div>
				)}

				{externalForm.approval_email && (
					<div className="flex flex-col gap-3 top-3 bg-white rounded-lg p-4">
						<aside className="flex flex-col justify-between">
							<div className="flex gap-3">
								<div className="rounded-sm bg-green-500 w-4 h-8"></div>
								<h1 className="text-xl font-semibold">Approver</h1>
							</div>
							<p className="mt-2">{externalForm.approval_email}</p>
						</aside>
					</div>
				)}

				{externalForm?.revertComment?.toLowerCase() !== "none" && externalForm?.revertComment && (
					<div className="flex flex-col gap-3 top-3 bg-white rounded-lg p-4">
						<aside className="flex flex-col justify-between">
							<div className="flex gap-3">
								<div className="rounded-sm bg-red-500 w-4 h-8"></div>
								<h1 className="text-xl font-semibold">Revert / Undo Comment</h1>
							</div>
							<p className="mt-2">{externalForm.revertComment}</p>
						</aside>
					</div>
				)}

				<div className="flex flex-col gap-3 sticky top-3 bg-white rounded-lg p-4">
					<aside className="flex flex-col justify-between">
						<div className="flex gap-3">
							<div className="rounded-sm bg-cyan-400 w-4 h-8"></div>
							<h1 className="text-xl font-semibold">Audit Log</h1>
						</div>
						<AuditLog auditLogs={auditLogs} externalForm={externalForm} />
					</aside>
				</div>
			</div>

			<Dialog
				open={revertOpen}
				onOpenChange={() => {
					setRevertOpen(false);
					revertForm.reset();
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Revert to applicant / staff</DialogTitle>
						<DialogDescription>
							Please provide a reason or comment for reverting this form. This will be sent to the applicant / staff.
						</DialogDescription>
					</DialogHeader>
					<Form {...revertForm}>
						<form onSubmit={revertForm.handleSubmit(onRevertSubmit)}>
							<FormField
								control={revertForm.control}
								name="revertComment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reason</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter className="mt-4">
								<DialogClose>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button type="submit">Revert</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={undoOpen}
				onOpenChange={() => {
					setUndoOpen(false);
					undoForm.reset();
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Undo</DialogTitle>
						<DialogDescription>Are you sure you want to undo this form?</DialogDescription>
					</DialogHeader>
					<Form {...undoForm}>
						<form onSubmit={undoForm.handleSubmit(onUndoSubmit)}>
							<FormField
								control={undoForm.control}
								name="formStage"
								render={({ field }) => (
									<FormItem>
										<Select
											onValueChange={e => {
												field.onChange(Number(e));
												field.value = Number(e);
											}}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Choose an option" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Options</SelectLabel>
													<SelectItem value="1">Reverted to Staff</SelectItem>
													<SelectItem value="2">Review by AAO</SelectItem>
													<SelectItem value="3">Review by HOS/ ADCR/ MGR</SelectItem>
													<SelectItem value="4">Review by HMU/ Dean</SelectItem>
													<SelectItem value="5">Approved</SelectItem>
													<SelectItem value="6">Rejected</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={undoForm.control}
								name="revertComment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reason</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter className="mt-4">
								<DialogClose>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button type="submit">Undo</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={forwardOpen}
				onOpenChange={() => {
					setForwardOpen(false);
					forwardForm.reset();
				}}
			>
				<DialogContent className="w-[500px]">
					<DialogHeader>
						<DialogTitle>Forward for verification and approval</DialogTitle>
						<DialogDescription>
							Please select verifier and approver for this form. This form will be sent to the verifier and approver via email.
						</DialogDescription>
					</DialogHeader>
					<Form {...forwardForm}>
						<form onSubmit={forwardForm.handleSubmit(onForwardSubmit)}>
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={forwardForm.control}
									name="verification_email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Verifier</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Please select an option" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{emails
														.filter(email => email.extECategory === 1)
														.map((email, index) => (
															<SelectItem key={index} value={email.extEMail}>
																{email.extEMail}
															</SelectItem>
														))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={forwardForm.control}
									name="approval_email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Approval</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Please select an option" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{emails
														.filter(email => email.extECategory === 2)
														.map((email, index) => (
															<SelectItem key={index} value={email.extEMail}>
																{email.extEMail}
															</SelectItem>
														))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter className="mt-16">
								<DialogClose>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button type="submit">Forward</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
}
