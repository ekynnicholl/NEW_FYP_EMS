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
import { v4 as uuidv4 } from "uuid";
import { AiOutlineExclamationCircle } from "react-icons/ai";

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
	Pencil,
	X,
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

const colFlightClass = "grid grid-cols-[150px_120px_120px_150px_150px_1fr_150px_150px_50px]";
const colHotelClass = "grid grid-cols-[1fr_200px_200px_50px]";

export default function DashboardExternalForm({ data, faculties, auditLog }: { data: ExternalForm; faculties: string[]; auditLog: AuditLog[] }) {
	console.log("rendered")
	const supabase = createClientComponentClient();
	const [externalForm, setExternalForm] = useState<ExternalForm>(data);
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>(auditLog);
	const [useOwnTransport, setUseOwnTransport] = useState<boolean | null>(
		data && data.transport ? (data.transport === "aeroplane" ? false : true) : null,
	);

	const [nonFlightLogistic, setNonFlightLogistic] = useState<any[]>(data && data.transport !== "aeroplane" ? data.logistic_arrangement || [] : []);
	const [flightLogistic, setFlightLogistic] = useState<any[]>(data && data.transport === "aeroplane" ? data.logistic_arrangement || [] : []);

	const [group, setGroup] = useState(data && data.travelling === "group" ? true : false);
	const [emails, setEmails] = useState<any[]>([]);
	const [revertOpen, setRevertOpen] = useState(false);
	const [undoOpen, setUndoOpen] = useState(false);
	const [forwardOpen, setForwardOpen] = useState(false);
	const [edit, setEdit] = useState(false);
	const [editSaveLoading, setEditSaveLoading] = useState(false);
	const [forwardSaveLoading, setForwardSaveLoading] = useState(false);
	const [revertSaveLoading, setRevertSaveLoading] = useState(false);

	const [courseFee, setCourseFee] = useState(externalForm?.course_fee || 0);
	const [airfareFee, setAirfareFee] = useState(externalForm?.airfare_fee || 0);
	const [accommodationFee, setAccommodationFee] = useState(externalForm?.accommodation_fee || 0);
	const [perDiemFee, setPerDiemFee] = useState(externalForm?.per_diem_fee || 0);
	const [transportationFee, setTransportationFee] = useState(externalForm?.transportation_fee || 0);
	const [travelInsuranceFee, setTravelInsuranceFee] = useState(externalForm?.travel_insurance_fee || 0);
	const [otherFees, setOtherFees] = useState(externalForm?.other_fees || 0);
	const [grandTotal, setGrandTotal] = useState(0);

	useEffect(() => {
		setGrandTotal(courseFee + airfareFee + accommodationFee + perDiemFee + transportationFee + travelInsuranceFee + otherFees);
	}, [courseFee, airfareFee, accommodationFee, perDiemFee, transportationFee, travelInsuranceFee, otherFees]);

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

	// Enable this to see the form errors
	// useEffect(() => {
	// 	console.log(forwardForm.formState.errors);
	// }, [forwardForm.formState.errors]);

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

			// @ts-ignore
			logistic_arrangement: externalForm.logistic_arrangement,
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

	async function onSaveSubmit(values: z.infer<typeof adminExternalFormSchema>) {
		setEditSaveLoading(true);
		const { verification_email, approval_email, ...rest } = values;
		const updatedExternalForm = { ...externalForm, ...rest };

		const { error } = await supabase
			.from("external_forms")
			.update({
				...updatedExternalForm,
				last_updated: new Date(),
			})
			.eq("id", externalForm.id);

		setEditSaveLoading(false);
		setEdit(false);
		if (error) {
			toast.error("Error updating external form");
			return;
		} else {
			toast.success("External form updated successfully!");

			const { data: auditLogData, error: auditLogError } = await supabase
				.from("audit_log")
				.insert({
					ntf_id: externalForm.id,
					type: "Edit",
					username: user?.displayName,
					email: user?.email,
				})
				.select();

			if (!auditLogError) {
				setAuditLogs([...auditLogs, auditLogData![0]]);
			}
		}
	}

	async function onRevertSubmit(values: z.infer<typeof revertSchema>) {
		setRevertOpen(false);
		setRevertSaveLoading(true);
		const securityKeyUID = uuidv4();
		if (externalForm.formStage === 2) {
			const { revertComment } = values;
			const updatedExternalForm = { ...externalForm, revertComment, formStage: 1, securityKey: securityKeyUID };

			const { data, error } = await supabase
				.from("external_forms")
				.update({
					...updatedExternalForm,
					last_updated: new Date(),
					aao_email: user?.email,
				})
				.eq("id", externalForm.id)
				.select();

			if (error) {
				toast.error("Error reverting external form");
			} else {
				sendContactForm(data);
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
		} else {
			toast.error("External form cannot be reverted");
		}
		revertForm.reset();
		setRevertSaveLoading(false);
	}

	async function onUndoSubmit(values: z.infer<typeof undoSchema>) {
		const securityKeyUID = uuidv4();
		const { formStage, revertComment } = values;
		const updatedExternalForm = { ...externalForm, formStage, revertComment, securityKey: securityKeyUID };

		const { data, error } = await supabase
			.from("external_forms")
			.update({
				...updatedExternalForm,
				last_updated: new Date(),
			})
			.eq("id", externalForm.id)
			.select();

		if (error) {
			toast.error("Error undoing external form");
			return;
		} else {
			sendContactForm(data);
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
		setForwardSaveLoading(true);
		const securityKeyUID = uuidv4();
		const { verification_email, approval_email } = values;
		const updatedExternalForm = { ...externalForm, verification_email, approval_email, securityKey: securityKeyUID };
		console.log(user?.email);

		const { data, error } = await supabase
			.from("external_forms")
			.update({
				...updatedExternalForm,
				formStage: 3,
				last_updated: new Date(),
				aao_email: user?.email,
			})
			.eq("id", externalForm.id)
			.select();

		if (error) {
			toast.error("Error forwarding external form");
		} else {
			sendContactForm(data);
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
		setForwardSaveLoading(false);
	}

	const [appealOpen, setAppealOpen] = useState(true);

	const closeAppeal = () => {
		setAppealOpen(false);
	}

	return (
		<>
			{externalForm.formStage === 7 && (
				<Dialog open={appealOpen} onOpenChange={setAppealOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>NOTE</DialogTitle>
							<DialogDescription>
								This form is in the appeal stage. To re-open the form, please use the &apos;Undo Action&apos; feature to revert back to staff or to any other parties. Otherwise, you may reject this form once more and they will not be able to appeal again.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={closeAppeal}>
								Understood
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
			<div className="flex-1">
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSaveSubmit)}>
						<div className="flex justify-between items-center bg-white p-3 pr-8 pl-4 rounded-xl">
							<div className="flex gap-3">
								<Link href="/external" className="px-4 flex h-10 items-center gap-2">
									<ArrowLeftIcon className="cursor-pointer text-gray-500" />
									<span>Back</span>
								</Link>

								{externalForm.formStage === 1 && (
									<div className="flex gap-3 text-red-500 items-center">
										<CircleX size={20} />
										<h1 className="text-xl font-semibold">Reverted to Staff</h1>
									</div>
								)}

								{externalForm.formStage === 2 && (
									<div className="flex gap-3 text-blue-500 items-center">
										<CircleDashed size={20} />
										<h1 className="text-xl font-semibold">Reviewing by Academic Administration Office</h1>
									</div>
								)}

								{externalForm.formStage === 3 && (
									<div className="flex gap-3 text-blue-500 items-center">
										<CircleDashed size={20} />
										<h1 className="text-xl font-semibold">Pending for Verification</h1>
									</div>
								)}

								{externalForm.formStage === 4 && (
									<div className="flex gap-3 text-blue-500 items-center">
										<CircleDashed size={20} />
										<h1 className="text-xl font-semibold">Pending for Approval</h1>
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
								{externalForm.formStage === 7 && (
									<div className="flex gap-3 text-red-500 items-center">
										<AiOutlineExclamationCircle size={26} />
										<h1 className="text-xl font-semibold">Requested for Appeal</h1>
									</div>
								)}
							</div>

							<div className="flex gap-3">
								{edit && (
									<>
										<Button
											variant="outline"
											className="flex items-center gap-2 shadow-[0_0_0_2px_#EFEFEF_inset] border-none px-5 h-12 text-[15px] rounded-xl font-bold"
											onClick={() => {
												setEdit(false);
												form.reset();
											}}
										>
											Cancel
										</Button>
										<Button
											variant="default"
											className="px-5 h-12 text-[15px] rounded-xl font-bold"
											type="submit"
											disabled={editSaveLoading || !form.formState.isDirty}
										>
											Save / Update
										</Button>
									</>
								)}

								{externalForm.formStage === 2 && !edit && (
									<>
										<Button
											variant="destructive"
											type="button"
											className="px-5 h-12 text-[15px] rounded-xl font-bold flex gap-2"
											onClick={() => {
												setRevertOpen(true);
											}}
											disabled={revertSaveLoading}
										>
											<Undo2 size={20} />
											Revert to Staff
										</Button>
										<Button
											type="button"
											className="px-5 h-12 text-[15px] rounded-xl font-bold flex gap-2 bg-green-500"
											onClick={() => {
												setForwardOpen(true);
											}}
											disabled={forwardSaveLoading}
										>
											<Forward size={20} />
											Forward
										</Button>
									</>
								)}
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
												setEdit(true);
											}}
										>
											<Pencil size={20} />
											Edit
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
									<h1 className="text-xl font-semibold">Personal Details</h1>
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
												<Input type="email" {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
													<Select onValueChange={field.onChange} value={field.value} disabled={!edit}>
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
													disabled={!edit}
													onValueChange={e => {
														field.onChange(e);
														if (e === "own transport" || e === "company vehicle") {
															setUseOwnTransport(true);
															if (nonFlightLogistic.length > 0) {
																form.setValue("logistic_arrangement", nonFlightLogistic);
															} else {
																form.setValue("logistic_arrangement", null);
															}
														} else {
															setUseOwnTransport(false);
															if (flightLogistic.length > 0) {
																form.setValue("logistic_arrangement", flightLogistic);
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
															}
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
												<FormLabel className="font-semibold text-sm text-gray-500">
													Traveling in <span className="text-red-500"> *</span>
												</FormLabel>
												<Select
													disabled={!edit}
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
												<FormLabel className="font-semibold text-sm text-gray-500">
													Name of other staff / student traveling together in group <span className="text-red-500"> *</span>
												</FormLabel>
												<FormControl>
													<Input disabled={!edit} {...field} />
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
												<Input {...field} disabled={!edit} />
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
												<Input {...field} disabled={!edit} />
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
															disabled={!edit}
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
															disabled={!edit}
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
												<Input {...field} disabled={!edit} />
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
												<FormLabel className="font-semibold text-sm text-gray-500">
													Total Hours <span className="text-red-500"> (Fill in by AAO)</span>
												</FormLabel>
												<FormControl>
													<Input
														disabled={!edit}
														type="number"
														{...field}
														onChange={e => {
															field.onChange(e);
															console.log(field.value);
															if (e.target.value === "") {
																field.onChange(0);
															} else {
																field.onChange(parseFloat(e.target.value));
																field.value = parseFloat(e.target.value);
																console.log(field.value);
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
												<Input {...field} value={field.value || ""} disabled={!edit} />
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
											<Select onValueChange={field.onChange} defaultValue={field.value} disabled={!edit}>
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
								<div className="flex justify-between w-full">
									<h2 className="text-xl font-semibold">Logistic Arrangement</h2>
									{useOwnTransport !== null && useOwnTransport === false ? (
										<Button
											disabled={!edit}
											type="button"
											onClick={() => {
												const old = form.getValues("logistic_arrangement") ?? [];
												const newLogistic = {
													flight_date: null,
													flight_time: null,
													flight_number: "",
													destination_from: "",
													destination_to: "",
													hotel_name: "",
													check_in_date: null,
													check_out_date: null,
												};
												old.push(newLogistic);
												setFlightLogistic(old);
												form.setValue("logistic_arrangement", old);
											}}
										>
											Add Flight
										</Button>
									) : (
										<Button
											disabled={!edit}
											type="button"
											onClick={() => {
												if (useOwnTransport === null) {
													toast.error("Please select a transport type first");
												} else {
													const old = form.getValues("logistic_arrangement") ?? [];
													const newLogistic = {
														flight_date: null,
														flight_time: null,
														flight_number: "",
														destination_from: "",
														destination_to: "",
														hotel_name: "",
														check_in_date: null,
														check_out_date: null,
													}

													old.push(newLogistic);
													nonFlightLogistic.push(newLogistic);
													form.setValue("logistic_arrangement", old);
													setNonFlightLogistic(old);
												}
											}}
										>
											Add Hotel
										</Button>
									)}
								</div>
							</div>
							{form.getValues("transport") === "aeroplane" && form.getValues("logistic_arrangement") ? (
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
										{[...Array(form.watch("logistic_arrangement")?.length)].map((_, i) => (
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
																			disabled={!edit}
																			variant={"outline"}
																			className={cn(
																				"w-full text-left font-normal border-none disabled:opacity-100",
																			)}
																		>
																			{field.value && field.value[i] && field.value[i].flight_date ? (
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
																				field.onChange(
																					field.value?.map((item, index) =>
																						index === i ? { ...item, flight_date: date } : item,
																					),
																				);
																				setFlightLogistic(
																					field.value?.map((item, index) =>
																						index === i ? { ...item, flight_date: date } : item,
																					) || [],
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
																	disabled={!edit}
																	className="border-none shadow-none disabled:hover:shadow-none"
																	type="time"
																	value={field.value?.[i]?.flight_time || ""}
																	onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																		const newValue = field.value?.map((item, index) =>
																			index === i ? { ...item, flight_time: e.target.value } : item,
																		);
																		field.onChange(newValue);
																		setFlightLogistic(
																			field.value?.map((item, index) =>
																				index === i ? { ...item, flight_time: e.target.value } : item,
																			) || [],
																		);
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
																	disabled={!edit}
																	className="border-none shadow-none disabled:hover:shadow-none"
																	value={field.value?.[i]?.flight_number || ""}
																	onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																		const newValue = field.value?.map((item, index) =>
																			index === i ? { ...item, flight_number: e.target.value } : item,
																		);
																		field.onChange(newValue);
																		setFlightLogistic(
																			field.value?.map((item, index) =>
																				index === i ? { ...item, flight_number: e.target.value } : item,
																			) || [],
																		);
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
																	disabled={!edit}
																	className="border-none shadow-none disabled:hover:shadow-none"
																	value={field.value?.[i]?.destination_from || ""}
																	onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																		const newValue = field.value?.map((item, index) =>
																			index === i ? { ...item, destination_from: e.target.value } : item,
																		);
																		field.onChange(newValue);
																		setFlightLogistic(
																			field.value?.map((item, index) =>
																				index === i ? { ...item, destination_from: e.target.value } : item,
																			) || [],
																		);
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
																	disabled={!edit}
																	className="border-none shadow-none disabled:hover:shadow-none"
																	value={field.value?.[i]?.destination_to || ""}
																	onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																		const newValue = field.value?.map((item, index) =>
																			index === i ? { ...item, destination_to: e.target.value } : item,
																		);
																		field.onChange(newValue);
																		setFlightLogistic(
																			field.value?.map((item, index) =>
																				index === i ? { ...item, destination_to: e.target.value } : item,
																			) || [],
																		);
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
																	disabled={!edit}
																	className="border-none shadow-none disabled:hover:shadow-none"
																	value={field.value?.[i]?.hotel_name || ""}
																	onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																		const newValue = field.value?.map((item, index) =>
																			index === i ? { ...item, hotel_name: e.target.value } : item,
																		);
																		field.onChange(newValue);
																		setFlightLogistic(
																			field.value?.map((item, index) =>
																				index === i ? { ...item, hotel_name: e.target.value } : item,
																			) || [],
																		);
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
																			disabled={!edit}
																			variant={"outline"}
																			className={cn(
																				"w-full text-left font-normal rounded-none border-none pl-2 disabled:opacity-100",
																				!field.value && "text-muted-foreground",
																			)}
																		>
																			{field.value && field.value[i] && field.value[i].check_in_date ? (
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
																				setFlightLogistic(
																					field.value?.map((item, index) =>
																						index === i ? { ...item, check_in_date: date } : item,
																					) || [],
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
																			disabled={!edit}
																			variant={"outline"}
																			className={cn(
																				"w-full text-left font-normal rounded-none border-none pl-2 disabled:opacity-100",
																			)}
																		>
																			{field.value && field.value[i] && field.value[i].check_out_date ? (
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
																				field.value[i].check_out_date
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
																				setFlightLogistic(
																					field.value?.map((item, index) =>
																						index === i ? { ...item, check_out_date: date } : item,
																					) || [],
																				);
																			}
																		}}
																		disabled={date => {
																			let today = form.getValues("logistic_arrangement")?.[i].check_in_date;
																			if (!today) {
																				today = new Date();
																				today.setHours(0, 0, 0, 0);
																			} else if (typeof today === "string") {
																				today = new Date(today);
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
														className={`text-red-500 hover:text-red-600 transition-all hover:scale-125 ${edit ? "cursor-pointer" : "cursor-not-allowed"
															}`}
														onClick={() => {
															if (!edit) return;
															const values = form.getValues("logistic_arrangement");
															if (values?.length! <= 2) {
																toast.error("2 flights are needed for go and return");
																return;
															}
															if (Array.isArray(values) && i >= 0 && i < values.length) {
																values.splice(i, 1);
																setFlightLogistic(values);
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
												{[...Array(form.watch("logistic_arrangement")?.length)].map((_, i) => (
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
																			disabled={!edit}
																			placeholder="Hotel Name"
																			className="border-none shadow-none disabled:hover:shadow-none"
																			value={field.value?.[i]?.hotel_name || ""}
																			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																				const newValue = field.value?.map((item, index) =>
																					index === i ? { ...item, hotel_name: e.target.value } : item,
																				);
																				field.onChange(newValue);
																				setNonFlightLogistic(prevState => prevState.map((item, index) =>
																					index === i ? { ...item, hotel_name: e.target.value } : item
																				));
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
																					disabled={!edit}
																					variant={"outline"}
																					className={cn(
																						"w-full text-center font-normal rounded-none border-none pl-2 disabled:opacity-100",
																						!field.value && "text-muted-foreground",
																					)}
																				>
																					{field.value && field.value[i] && field.value[i].check_in_date ? (
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
																						// date.setHours(date.getHours() + 8);
																						field.onChange(
																							field.value?.map((item, index) =>
																								index === i
																									? { ...item, check_in_date: new Date(date) }
																									: item,
																							),
																						);
																						setNonFlightLogistic(prevState => prevState.map((item, index) =>
																							index === i ? { ...item, check_in_date: new Date(date) } : item
																						));
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
																					disabled={!edit}
																					variant={"outline"}
																					className={cn(
																						"w-full text-left font-normal rounded-none border-none pl-2 disabled:opacity-100",
																					)}
																				>
																					{field.value &&
																						field.value[i] &&
																						field.value[i].check_out_date ? (
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
																						field.value[i].check_out_date
																						? (field.value[i].check_out_date as Date)
																						: undefined
																				}
																				onSelect={date => {
																					if (date !== undefined) {
																						// date.setHours(date.getHours() + 8);
																						field.onChange(
																							field.value?.map((item, index) =>
																								index === i
																									? { ...item, check_out_date: new Date(date) }
																									: item,
																							),
																						);
																						setNonFlightLogistic(prevState => prevState.map((item, index) =>
																							index === i ? { ...item, check_out_date: new Date(date) } : item
																						));
																					}
																				}}
																				disabled={date => {
																					let today = form.getValues("logistic_arrangement")?.[i].check_in_date;
																					if (!today) {
																						today = new Date();
																						today.setHours(0, 0, 0, 0);
																					} else if (typeof today === "string") {
																						today = new Date(today);
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
																className={`text-red-500 hover:text-red-600 transition-all hover:scale-125 ${edit ? "cursor-pointer" : "cursor-not-allowed"
																	}`}
																onClick={() => {
																	if (!edit) return;
																	const values = form.getValues("logistic_arrangement");
																	if (Array.isArray(values) && i >= 0 && i < values.length) {
																		values.splice(i, 1);
																		setNonFlightLogistic(values);
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
										<div className="text-center text-muted-foreground w-full h-44 rounded-xl grid place-items-center bg-gray-50 text-gray-500">
											No logistic arrangement added
										</div>
									)}
								</>
							)}
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
														disabled={!edit}
														type="number"
														className="bg-white border border-gray-200 pl-14"
														{...field}
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															// write a regex that only allows numbers and decimal points
															let regex = /^\d*\.?\d*$/;
															if (regex.test(value)) {
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
														disabled={!edit}
														className="bg-white border border-gray-200 pl-14"
														{...field}
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															let regex = /^\d*\.?\d*$/;
															if (regex.test(value)) {
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
														disabled={!edit}
														className="bg-white border border-gray-200 pl-14"
														{...field}
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															let regex = /^\d*\.?\d*$/;
															if (regex.test(value)) {
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
														disabled={!edit}
														className="bg-white border border-gray-200 pl-14"
														{...field}
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															let regex = /^\d*\.?\d*$/;
															if (regex.test(value)) {
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
														disabled={!edit}
														className="bg-white border border-gray-200 pl-14"
														{...field}
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															let regex = /^\d*\.?\d*$/;
															if (regex.test(value)) {
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
														disabled={!edit}
														className="bg-white border border-gray-200 pl-14"
														{...field}
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															let regex = /^\d*\.?\d*$/;
															if (regex.test(value)) {
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
														disabled={!edit}
														className="bg-white border border-gray-200 pl-14"
														{...field}
														value={field.value === 0 ? "" : field.value.toString()}
														onChange={e => {
															const value = e.target.value;
															let regex = /^\d*\.?\d*$/;
															if (regex.test(value)) {
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
													<Input {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
												<RadioGroup
													onValueChange={field.onChange}
													defaultValue={field.value}
													className="flex space-x-1"
													disabled={!edit}
												>
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
														disabled={form.getValues("expenditure_cap") !== "Yes" || !edit}
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
								<h1 className="text-xl font-semibold">Supporting Document(s)</h1>
							</div>
							<div className="w-full">
								<Document documents={externalForm.supporting_documents ?? []} />
								{externalForm.supporting_documents?.length === 0 && (
									<div className="flex items-center justify-center h-44 bg-gray-50">
										<p className="text-gray-500">No supporting documents uploaded.</p>
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
													<Input {...field} disabled={!edit} />
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
													<Input {...field} disabled={!edit} />
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
															disabled={!edit}
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
														<Input {...field} disabled={!edit} />
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
														<Input {...field} disabled={!edit} />
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
																disabled={!edit}
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
															<Input {...field} disabled={!edit} />
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
															<Input {...field} disabled={!edit} />
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
																	disabled={!edit}
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
															<Input {...field} disabled={!edit} />
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
															<Input {...field} disabled={!edit} />
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
																	disabled={!edit}
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

				<div className="flex flex-col gap-3 top-3 bg-white rounded-lg p-4">
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
