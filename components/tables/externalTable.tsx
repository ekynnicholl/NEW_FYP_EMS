"use client";

import { useState, useEffect } from "react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Modal from "@/components/QR_Codes_Modal";
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

import { Calendar } from "@/components/ui/calendar-year";
import { cn } from "@/lib/utils";
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
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QRCodeSVG } from "qrcode.react";
import { LiaQrcodeSolid } from "react-icons/lia";
import { useRouter } from "next/navigation";
import { sendContactForm } from "@/lib/api";

const url = process.env.NEXT_PUBLIC_WEBSITE_URL;
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
	const [selectedRow, setSelectedRow] = useState<any>({});
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState<ExternalForm | null>(null);
	const router = useRouter();

	const handleUndoAction = async (values: z.infer<typeof schema>) => {
		if (values.undoOption != "" || parseInt(values.undoOption, 10) != selectedRow.formStage) {
			console.log("Undo Action clicked!");
			const selectedStage = parseInt(values.undoOption, 10);
			const formID = selectedRow.id;

			const { data, error } = await supabase
				.from("external_forms")
				.update({
					formStage: values.undoOption,
					revertComment: values.revertComment,
				})
				.eq("id", formID);

			if (error) {
				console.error("Error updating formStage:", error.message);
			} else {
				setFormData(selectedRow);
				console.log("FormStage updated successfully:", data);
				showSuccessToast("Action has been submitted.");

				setFormData(prevFormData => ({
					...prevFormData!,
					formStage: selectedStage,
				}));

				// sendContactForm(formData);

				router.refresh();
			}
		}
	};

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

	const isWithinRange = (row, columnId, value) => {
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
			accessorKey: "full_name",
			sortingFn: "text",
			header: ({ column }) => (
				<Button variant="ghost" className="capitalize" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Name (Staff ID)
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const staffID = row.original.staff_id;
				const fullName = row.original.full_name;
				const displayText = staffID ? `${fullName} (${staffID})` : fullName;

				return <div className="capitalize">{displayText}</div>;
			},
		},
		{
			accessorKey: "program_title",
			sortingFn: "text",
			header: ({ column }) => (
				<Button variant="ghost" className="capitalize" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Program Title
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => <div className="capitalize">{row.getValue("program_title")}</div>,
		},
		{
			accessorKey: "formStage",
			sortingFn: "auto",
			header: ({ column }) => (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Form Status
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const formStage = row.original.formStage;

				if (formStage === 1) {
					return <div className="uppercase text-red-500 font-bold">Reverted to Staff</div>;
				} else if (formStage === 2) {
					return <div className="uppercase text-blue-500 font-bold">Reviewing by AAO</div>;
				} else if (formStage === 3) {
					return <div className="uppercase text-blue-500 font-bold">Reviewing by HOS/ ADCR/ MGR</div>;
				} else if (formStage === 4) {
					return <div className="uppercase text-blue-500 font-bold">Reviewing by HMU/ Dean</div>;
				} else if (formStage === 5) {
					return <div className="uppercase text-green-500 font-bold">Approved</div>;
				} else if (formStage === 6) {
					return <div className="uppercase text-red-500 font-bold">Rejected</div>;
				} else {
					return <div className="uppercase">Unknown</div>;
				}
			},
		},
		{
			accessorKey: "created_at",
			sortingFn: "datetime",
			filterFn: isWithinRange,
			header: ({ column }) => {
				return (
					<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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

				return <div className="lowercase">{formattedDate}</div>;
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
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									const formId = row.original.id;
									const newTab = window.open(`${url}/form/external_review/${formId}`, "_blank");
									newTab?.focus();
								}}
							>
								View
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setOpen(true);
									setSelectedRow(row.original);
								}}
							>
								Undo Action
							</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<span>Forward To</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem>example1@gmail.com</DropdownMenuItem>
										<DropdownMenuItem>example1@gmail.com</DropdownMenuItem>
										<DropdownMenuItem>example1@gmail.com</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
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

	const [showQRCodesNTF, setShowQRCodesNTF] = useState(false);
	const [showQRCodesNTFList, setShowQRCodesNTFList] = useState(false);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

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

	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(2022, 0, 20),
		to: addDays(new Date(2022, 0, 20), 20),
	});
	useEffect(() => {
		console.log(date);
	}, [date]);

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

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<button
					type="button"
					className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 shadow-sm md:inline-flex dark:bg-[#242729] mr-5"
					onClick={() => {
						setShowQRCodesNTF(true);
					}}
				>
					<span className="ml-2 lg:mt-[1px] text-slate-800 flex items-center mr-2">
						<LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
						<span className="ml-[3px] lg:ml-[5px] text-[11px] lg:text-[14px] p-[6px] dark:text-[#C1C7C1]">
							Nominations/ Travelling Forms
						</span>
					</span>
				</button>
				<button
					type="button"
					className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 shadow-sm md:inline-flex dark:bg-[#242729]"
					onClick={() => {
						setShowQRCodesNTFList(true);
					}}
				>
					<span className="ml-2 lg:mt-[1px] text-slate-800 flex items-center mr-2">
						<LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
						<span className="ml-[3px] lg:ml-[5px] text-[11px] lg:text-[14px] p-[6px] dark:text-[#C1C7C1]">
							View Submitted Nominations/ Travelling Forms
						</span>
					</span>
				</button>
			</div>
			<div className="flex items-center py-2">
				<Input
					placeholder="Filter names..."
					value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
					onChange={event => table.getColumn("full_name")?.setFilterValue(event.target.value)}
					className="max-w-sm mr-5"
				/>

				<Popover>
					<PopoverTrigger asChild>
						<Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal text-muted-foreground")}>
							<CalendarIcon className="mr-2 h-4 w-4" />
							<span>Select a year range</span>
							{/* {date ? format(date, "PPP") : } */}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="range"
							captionLayout="dropdown-buttons"
							selected={date}
							onSelect={setDate}
							fromYear={1960}
							toYear={new Date().getFullYear()}
						/>
					</PopoverContent>
				</Popover>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto dark:text-dark_text">
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
										onCheckedChange={value => column.toggleVisibility(!!value)}
									>
										{column.id
											.split("_")
											.map(word => word.charAt(0).toUpperCase() + word.slice(1))
											.join(" ")}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead key={header.id} className="text-center bg-gray-100 dark:bg-[#1D2021] dark:text-[#B1ABA1]">
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
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="text-center dark:bg-dark_mode_card dark:text-dark_text"
								>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
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

			<Modal isVisible={showQRCodesNTF} onClose={() => setShowQRCodesNTF(false)}>
				<div className="ml-2 p-5 z-[999]">
					<p className="lg:text-md font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
						Nominations/ Travelling Forms
					</p>
					<p className="lg:text-xs font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200 italic">
						This is where the staff can access to submit their forms.
					</p>
					<div className="flex flex-col items-center justify-center">
						<QRCodeSVG className="bg-white p-1" value={`${url}/form/external`} />
						<button
							onClick={() => copyToClipboard(`${url}/form/external`)}
							className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105"
						>
							Copy Link
						</button>
					</div>
				</div>
			</Modal>

			<Modal isVisible={showQRCodesNTFList} onClose={() => setShowQRCodesNTFList(false)}>
				<div className="ml-2 p-5 z-[999]">
					<p className="lg:text-md font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
						View Nominations/ Travelling Forms List
					</p>
					<p className="lg:text-xs font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200 italic">
						This is where the staff is able to access their past submitted forms.
					</p>
					<div className="flex flex-col items-center justify-center">
						<QRCodeSVG className="bg-white p-1" value={`${url}/attended_events`} />
						<button
							onClick={() => copyToClipboard(`${url}/attended_events`)}
							className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105"
						>
							Copy Link
						</button>
					</div>
				</div>
			</Modal>

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
