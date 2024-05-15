"use client";

import { useState, useEffect, use, useRef } from "react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Calendar as CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Calendar } from "@/components/ui/calendar-year";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QRCodeCanvas } from "qrcode.react";
import { LiaQrcodeSolid } from "react-icons/lia";
import { useRouter } from 'next-nprogress-bar';
import { sendContactForm } from "@/lib/api";
import { getAuth } from "firebase/auth";

const supabase = createClientComponentClient();

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

export default function DataTable({ data }: { data: ExternalForm[] }) {
	console.log(data);
	const router = useRouter();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [selectedRow, setSelectedRow] = useState<any>({});
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState<ExternalForm | null>(null);
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(2022, 0, 20),
		to: addDays(new Date(2022, 0, 20), 20),
	});

	let displayName: string | null = null;
	let email: string | null = null;
	const auth = getAuth();
	const user = auth.currentUser;
	if (user !== null) {
		displayName = user.displayName;
		email = user.email;
	}

	const schema = z.object({
		undoOption: z.string().min(1, "Please select an option"),
		revertComment: z.string().optional(),
	});

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			undoOption: "",
			revertComment: "",
		},
	});

	const handleUndoAction = async (values: z.infer<typeof schema>) => {
		if (values.undoOption != "" || parseInt(values.undoOption, 10) != selectedRow.formStage) {
			const securityKeyUID = uuidv4();
			const selectedStage = parseInt(values.undoOption, 10);
			const formID = selectedRow.id;

			const securityKey = values.undoOption === "2" ? null : securityKeyUID;

			const { data, error } = await supabase
				.from("external_forms")
				.update({
					formStage: values.undoOption,
					revertComment: values.revertComment,
					securityKey: securityKey,
				})
				.eq("id", formID);

			if (error) {
				console.error("Error updating formStage:", error.message);
			} else {
				await supabase.from("audit_log").insert([
					{
						ntf_id: formID,
						type: "Undo",
						username: displayName,
						email: email,
					},
				]);

				setFormData(selectedRow);
				showSuccessToast("Action has been submitted.");

				setFormData(prevFormData => ({
					...prevFormData!,
					formStage: selectedStage,
				}));

				createNotifications(selectedRow, values.undoOption, values.revertComment!);

				const { data: latestFormsData, error: latestFormsError } = await supabase.from("external_forms").select().eq("id", formID);

				if (latestFormsError) {
					toast.error("Failed to send email. Please contact server administrator.");
				}

				console.log("latest data", latestFormsData);

				sendContactForm(latestFormsData);
				router.refresh();
			}
		}
	};

	const isWithinRange = (row: { getValue: (arg0: any) => string | number | Date }, columnId: any, value: any) => {
		console.log("row: ", row.getValue(columnId));
		console.log("columnId: ", columnId);
		console.log("value: ", value);

		const date = new Date(row.getValue(columnId));
		const [start, end] = [new Date(2024, 0, 1), new Date(2025, 0, 1)]; // value => two date input values

		//If one filter defined and date is null filter it
		if ((start || end) && !date) return false;
		if (start && !end) {
			return date.getTime() >= start.getTime();
		} else if (!start && end) {
			return date.getTime() <= end.getTime();
		} else if (start && end) {
			return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
		} else return true;
	};

	const columns: ColumnDef<ExternalForm>[] = [
		{
			accessorKey: "no",
			sortingFn: "text",
			header: ({ column }) => (
				<Button variant="ghost" className="text-left capitalize pl-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					No.
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				return <div className="text-left capitalize">{row.index + 1}</div>;
			},
		},
		{
			accessorKey: "full_name",
			sortingFn: "text",
			header: ({ column }) => (
				<Button variant="ghost" className="text-left capitalize pl-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Staff Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const fullName = row.original.full_name;

				return <div className="text-left capitalize">{fullName}</div>;
			},
		},
		{
			accessorKey: "staff_id",
			sortingFn: "text",
			header: ({ column }) => (
				<Button variant="ghost" className="text-left capitalize pl-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Staff ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const staffID = row.original.staff_id;

				return <div className="text-left capitalize w-40">{staffID}</div>;
			},
		},
		{
			accessorKey: "faculty",
			sortingFn: "text",
			header: ({ column }) => (
				<Button variant="ghost" className="text-left capitalize pl-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Faculty
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const faculty = row.original.faculty;

				return <div className="text-left capitalize">{faculty}</div>;
			},
		},
		{
			accessorKey: "program_title",
			sortingFn: "text",
			header: ({ column }) => (
				<Button variant="ghost" className="text-left capitalize pl-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Program Title/ Event
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => <div className="text-left capitalize w-fit ">{row.getValue("program_title")}</div>,
		},
		{
			accessorKey: "formStage",
			sortingFn: "auto",
			filterFn: "equals",
			header: ({ column }) => (
				<Button className="text-left pl-0" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Form Status
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const formStage = row.original.formStage;

				if (formStage === 1) {
					return <div className="uppercase text-red-500 font-bold text-left">Reverted to Staff</div>;
				} else if (formStage === 2) {
					return <div className="uppercase text-blue-500 font-bold text-left">Reviewing by AAO</div>;
				} else if (formStage === 3) {
					return <div className="uppercase text-blue-500 font-bold text-left">Reviewing by HOS/ ADCR/ MGR</div>;
				} else if (formStage === 4) {
					return <div className="uppercase text-blue-500 font-bold text-left">Reviewing by HMU/ Dean</div>;
				} else if (formStage === 5) {
					return <div className="uppercase text-green-500 font-bold text-left">Approved</div>;
				} else if (formStage === 6) {
					return <div className="uppercase text-red-500 font-bold text-left">Rejected</div>;
				} else {
					return <div className="uppercase">Unknown</div>;
				}
			},
		},
		{
			accessorKey: "created_at",
			sortingFn: "datetime",
			filterFn: "includesString",
			header: ({ column }) => {
				return (
					<Button variant="ghost" className="w-32 text-left pl-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
						Submitted At
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},

			cell: ({ row }) => {
				const date = new Date(row.getValue("created_at"));
				const day = date.getDate();
				const month = date.getMonth() + 1;
				const year = date.getFullYear();
				const formattedDate = `${day}-${month}-${year}`;

				return <div className="lowercase text-left">{formattedDate}</div>;
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open Menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={e => {
									e.preventDefault();
									router.push(`/form/external/${row.original.id}`);
								}}>
								View
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={e => {
									e.stopPropagation();
									setOpen(true);
									setSelectedRow(row.original);
								}}>
								Undo Action
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={e => {
									e.stopPropagation();
									sendContactForm([row.original]);
								}}>
								Send
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	useEffect(() => {
		if (formData && formData.formStage !== undefined) {
			sendContactForm(formData);
		}
	}, [formData]);

	const copyToClipboard = (text: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				toast.success("Link copied to clipboard!");
			})
			.catch(error => {
				toast.error("Copy failed:", error);
			});
	};

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	const createNotifications = async (form: ExternalForm, stage: string, comment: string) => {
		let formStage = "";
		if (stage === "1") {
			formStage = "Reverted to Staff";
		} else if (stage === "2") {
			formStage = "Reviewing by AAO";
		} else if (stage === "3") {
			formStage = "Reviewing by HOS/ ADCR/ MGR";
		} else if (stage === "4") {
			formStage = "Reviewing by HMU/ Dean";
		} else if (stage === "5") {
			formStage = "Approved";
		} else if (stage === "6") {
			formStage = "Rejected";
		} else {
			formStage = "Unknown";
		}
		let message = `The Nominations/ Travelling Form for ${form.program_title}, submitted by ${form.full_name} (${form.staff_id}) has been undo to "${formStage}" with reason(s): ${comment}`;

		const notifDesc = message;
		const notifType = "Nominations/ Travelling Form";
		const notifLink = `/form/external/${form.id}`;

		const { error: notificationError } = await supabase.from("notifications").insert([
			{
				notifDesc,
				notifType,
				notifLink,
			},
		]);

		if (notificationError) {
			toast.error("Failed to send email. Please contact server administrator.");
		} else {
			sendContactForm(form);
		}
	};

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<Dialog>
					<DialogTrigger>
						<button className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 shadow-sm dark:bg-[#242729] mr-5">
							<span className="ml-2 lg:mt-[1px] text-slate-800 flex items-center mr-2">
								<LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
								<span className="ml-[3px] lg:ml-[5px] text-[11px] lg:text-[14px] p-[6px] dark:text-[#C1C7C1]">
									Nominations/ Travelling Forms
								</span>
							</span>
						</button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="lg:text-md font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
								Nominations/ Travelling Forms
							</DialogTitle>
						</DialogHeader>
						<DialogDescription className="lg:text-s font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200 italic">
							All staff can submit their Nomination/Travelling Form by scanning the QR Code or link.
						</DialogDescription>
						<div className="grid place-items-center">
							<QRCodeCanvas value={`${window.location.origin}/form/external`} size={256} />
						</div>
						<DialogFooter className="sm:justify-center">
							<button
								onClick={() => copyToClipboard(`${window.location.origin}/form/external`)}
								className="mt-4 mr-5 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105">
								Copy Link
							</button>
							<a
								href={`${window.location.origin}/form/external`}
								target="_blank"
								className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105">
								Open Link
							</a>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog>
					<DialogTrigger>
						<button className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 shadow-sm md:inline-flex dark:bg-[#242729]">
							<span className="ml-2 lg:mt-[1px] text-slate-800 flex items-center mr-2">
								<LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
								<span className="ml-[3px] lg:ml-[5px] text-[11px] lg:text-[14px] p-[6px] dark:text-[#C1C7C1]">
									View Submitted Nominations/ Travelling Forms
								</span>
							</span>
						</button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="lg:text-md font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
								Nomination/Travelling Forms Status & Staff Attendance Summary
							</DialogTitle>
						</DialogHeader>
						<DialogDescription className="lg:text-s font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200 italic">
							All staff can view their current application/overall summary of their past Nominations/Travelling Form submission or Past
							Attended Events by scanning the QR Code or link below.
						</DialogDescription>
						<div className="grid place-items-center">
							<QRCodeCanvas className="bg-white p-1" value={`${window.location.origin}/attended_events`} size={256} />
						</div>
						<DialogFooter className="sm:justify-center">
							<button
								onClick={() => copyToClipboard(`${window.location.origin}/attended_events`)}
								className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105">
								Copy Link
							</button>
							<a
								href={`${window.location.origin}/attended_events`}
								target="_blank"
								className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105">
								Open Link
							</a>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			<div className="flex items-center py-2">
				<Input
					placeholder="Filter names..."
					value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
					onChange={event => table.getColumn("full_name")?.setFilterValue(event.target.value)}
					className="max-w-sm mr-5"
				/>

				<div className="ml-auto flex gap-2">
					{/* sort by faculty */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="dark:text-dark_text">
								Faculty <ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("faculty")?.setFilterValue(undefined);
								}}>
								View All
							</DropdownMenuItem>
							{data
								.map(row => row.faculty)
								.filter((value, index, self) => self.indexOf(value) === index)
								.map(faculty => (
									<DropdownMenuItem
										key={faculty}
										onClick={() => {
											table.getColumn("faculty")?.setFilterValue(faculty);
										}}>
										{faculty}
									</DropdownMenuItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="dark:text-dark_text">
								Year <ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("created_at")?.setFilterValue(undefined);
								}}>
								View All
							</DropdownMenuItem>
							{data
								.map(row => {
									const dateValue = row.created_at ? new Date(row.created_at) : null;
									return dateValue ? dateValue.getFullYear() : null;
								})
								.filter((value, index, self) => self.indexOf(value) === index)
								.map(year => (
									<DropdownMenuItem
										key={year}
										onClick={() => {
											table.getColumn("created_at")?.setFilterValue(year?.toString());
											console.log("year: ", year);
										}}>
										{year}
									</DropdownMenuItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="dark:text-dark_text">
								Form Status <ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("formStage")?.setFilterValue(undefined);
								}}>
								View All
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("formStage")?.setFilterValue(1);
								}}>
								Reverted to Staff
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("formStage")?.setFilterValue(2);
								}}>
								Reviewing by AAO
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("formStage")?.setFilterValue(3);
								}}>
								Reviewing by HOS/ ADCR/ MGR
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("formStage")?.setFilterValue(4);
								}}>
								Reviewing by HMU/ Dean
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("formStage")?.setFilterValue(5);
								}}>
								Approved
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									table.getColumn("formStage")?.setFilterValue(6);
								}}>
								Rejected
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="dark:text-dark_text">
								Columns <ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter(column => column.getCanHide())
								.map(column => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={value => column.toggleVisibility(!!value)}>
											{column.id === "no"
												? "No."
												: column.id === "full_name"
													? "Name"
													: column.id === "staff_id"
														? "Staff ID"
														: column.id === "faculty"
															? "Faculty"
															: column.id === "program_title"
																? "Program Title/ Event"
																: column.id === "formStage"
																	? "Form Status"
																	: column.id === "created_at"
																		? "Submitted At"
																		: column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead key={header.id} className="text-left bg-gray-100 dark:bg-[#1D2021] dark:text-[#B1ABA1]">
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<ContextMenu key={row.id}>
									<ContextMenuTrigger asChild>
										<TableRow
											data-prevent-nprogress={true}
											onClick={e => {
												e.preventDefault();
												router.push(`/external/${row.original.id}`);
											}}
											data-state={row.getIsSelected() && "selected"}
											className="text-left cursor-pointer dark:bg-dark_mode_card dark:text-dark_text">
											{row.getVisibleCells().map(cell => (
												<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
											))}
										</TableRow>
									</ContextMenuTrigger>
									<ContextMenuContent>
										<ContextMenuItem
											onClick={e => {
												e.preventDefault();
												router.push(`/external/${row.original.id}`);
											}}>
											View
										</ContextMenuItem>
										<ContextMenuItem
											onClick={e => {
												e.preventDefault();
												setOpen(true);
												setSelectedRow(row.original);
											}}>
											Undo Action
										</ContextMenuItem>
									</ContextMenuContent>
								</ContextMenu>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center dark:text-dark_text">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4 dark:text-dark_text">
				<div className="space-x-2">
					<Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>
					<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
						Next
					</Button>
				</div>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<Form {...form}>
						<DialogHeader>
							<DialogTitle>Undo Action</DialogTitle>
						</DialogHeader>
						<DialogDescription>
							Please <span className="font-bold">CONFIRM</span> your <span className="font-bold">UNDO ACTION</span>. After you click{" "}
							<span className="font-bold">CONFIRM UNDO</span>, it will automatically send the email(s) to the related parties.
						</DialogDescription>
						<form onSubmit={form.handleSubmit(handleUndoAction)} className="space-y-4">
							<FormField
								control={form.control}
								name="undoOption"
								render={({ field }) => (
									<FormItem>
										<Select
											onValueChange={e => {
												field.onChange(e);
												field.value = e;
												console.log("field value: ", field.value);
											}}>
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
								control={form.control}
								name="revertComment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Comment</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Please enter your comment here..." />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button type="submit" disabled={form.getValues("undoOption") === "" ? true : false}>
										Confirm Undo
									</Button>
								</DialogClose>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
