"use client";

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import adminExternalFormSchema from "@/schema/adminExternalFormSchema";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-year";
import { Input } from "@/components/ui/external-dashboard-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function DashboardExternalForm({ data }: { data: ExternalForm }) {
	const [externalForm, setExternalForm] = useState<ExternalForm>(data);
	const [useOwnTransport, setUseOwnTransport] = useState(false);
	const [group, setGroup] = useState(false);
	const [faculties, setFaculties] = useState<string[]>([]);
	const [editable, setEditable] = useState(false);

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
									<FormLabel className="font-semibold text-sm">
										Email <span className="text-red-500"> *</span>
									</FormLabel>
									<FormControl>
										<Input disabled={!editable} type="email" {...field} />
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
										<FormLabel className="font-semibold text-sm">
											Full Name (Same as I.C / Passport) <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input disabled={!editable} {...field} />
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
										<FormLabel className="font-semibold text-sm">
											Staff ID / Student No. <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input disabled={!editable} {...field} />
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
										<FormLabel className="font-semibold text-sm">
											Designation / Course <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input disabled={!editable} {...field} />
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
										<FormLabel className="font-semibold text-sm">
											Faculty / School / Unit <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Select disabled={!editable} onValueChange={field.onChange} value={field.value}>
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
										<FormLabel className="font-semibold text-sm">
											Type of Transportation <span className="text-red-500"> *</span>
										</FormLabel>
										<Select
											disabled={!editable}
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
										<FormLabel className="font-semibold text-sm">
											Traveling in <span className="text-red-500"> *</span>
										</FormLabel>
										<Select
											disabled={!editable}
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
										<FormLabel className="font-semibold text-sm">
											Name of other staff / student traveling together in group <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input disabled={!editable} {...field} />
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
									<FormLabel>
										Program title / Event <span className="text-red-500"> *</span>
									</FormLabel>
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
									<FormLabel>
										Description <span className="text-red-500"> *</span>
									</FormLabel>
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
									<FormLabel>
										Commencement Date <span className="text-red-500"> *</span>
									</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													disabled={externalForm.formStage != 1}
													variant={"outline"}
													className={cn(
														"w-full pl-3 text-left font-normal disabled:opacity-100",
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
									<FormLabel>
										Completion Date <span className="text-red-500"> *</span>
									</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													disabled={externalForm.formStage != 1}
													variant={"outline"}
													className={cn(
														"w-full pl-3 text-left font-normal disabled:opacity-100",
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
									<FormLabel>
										Organiser <span className="text-red-500"> *</span>
									</FormLabel>
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
						{externalForm.formStage === 2 && (
							<FormField
								control={form.control}
								name="total_hours"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Total Hours</FormLabel>
										<FormControl>
											<Input
												disabled={externalForm.formStage != 2}
												className="disabled:text-black-500 disabled:opacity-100"
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
									<FormLabel>
										Venue <span className="text-red-500"> *</span>
									</FormLabel>
									<FormControl>
										<Input
											disabled={externalForm.formStage != 1}
											className="disabled:text-black-500 disabled:opacity-100"
											{...field}
											value={field.value || ""}
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
									<FormLabel>
										HDRF Claimable <span className="text-red-500"> *</span>
									</FormLabel>
									<Select disabled={externalForm.formStage != 1} onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger className="disabled:opacity-100">
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
			</form>
		</Form>
	);
}
