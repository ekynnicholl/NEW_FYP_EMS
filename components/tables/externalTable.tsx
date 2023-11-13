"use client";

import Modal from "@/components/QR_Codes_Modal";
import * as React from "react";
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

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { QRCodeSVG } from "qrcode.react";
import { LiaQrcodeSolid } from "react-icons/lia";
import { useRouter } from "next/navigation";

const url = process.env.NEXT_PUBLIC_WEBSITE_URL;

export const columns: ColumnDef<ExternalForm>[] = [
	{
		accessorKey: "full_name",
		header: "Name (Staff ID)",
		// cell: ({ row }) => <div className="capitalize">{row.getValue("full_name")}</div>,
		cell: ({ row }) => {
			const staffID = row.original.staff_id;
			const fullName = row.original.full_name;

			const displayText = staffID ? `${fullName} (${staffID})` : fullName;

			return <div className="capitalize">{displayText}</div>;
		},
	},
	{
		accessorKey: "program_title",
		header: "Program Title",
		cell: ({ row }) => <div className="capitalize">{row.getValue("program_title")}</div>
	},
	{
		accessorKey: "form_status",
		header: "Form Status",
		cell: ({ row }) => {
			// let status = row.getValue("review_status");
			const formStage = row.original.formStage;

			// if (status) {
			// 	return <div className="capitalize">Reviewed</div>;
			// } else if (status === null) {
			// 	return <div className="capitalize">Pending</div>;
			// } else if (status === false) {
			// 	return <div className="capitalize">Reverted</div>;
			// } else {
			// 	return <div className="capitalize">Unknown</div>;
			// }
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
	// {
	// 	accessorKey: "program_duration",
	// 	header: "Duration",
	// 	cell: ({ row }) => {

	// 		const startDate = new Date(row.getValue("commencement_date"));
	// 		const startDay = startDate.getDate();
	// 		const startMonth = startDate.getMonth() + 1;
	// 		const startYear = startDate.getFullYear();
	// 		const formattedStartDate = `${startDay}-${startMonth}-${startYear}`;

	// 		const endDate = new Date(row.getValue("completion_date"));
	// 		const endDay = endDate.getDate();
	// 		const endMonth = endDate.getMonth() + 1;
	// 		const endYear = endDate.getFullYear();
	// 		const formattedEndDate = `${endDay}-${endMonth}-${endYear}`;

	// 		const dateDetails = formattedStartDate && formattedEndDate ? `${formattedStartDate} - ${formattedEndDate}` : "No date details available";

	// 		return (
	// 			<div>
	// 				<div>{dateDetails}</div>
	// 			</div>
	// 		);
	// 	},
	// },
	// {
	// 	accessorKey: "verification_status",
	// 	header: "Verification Status",
	// 	cell: ({ row }) => (
	// 		<div className="capitalize">
	// 			{row.getValue("verification_status") ? "" : "Pending"}
	// 		</div>
	// 	),
	// },
	// {
	// 	accessorKey: "approval_status",
	// 	header: "Approval Status",
	// 	cell: ({ row }) => (
	// 		<div className="capitalize">
	// 			{row.getValue("approval_status") ? "" : "Pending"}
	// 		</div>
	// 	),
	// },
	{
		accessorKey: "created_at",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
								const newTab = window.open(`${url}/form/external_review/${formId}`, '_blank');
								newTab?.focus();
							}}
						>View</DropdownMenuItem>
						<DropdownMenuItem>Undo Action</DropdownMenuItem>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<span>Forward To</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<DropdownMenuItem>
										example1@gmail.com
									</DropdownMenuItem>
									<DropdownMenuItem>
										example1@gmail.com
									</DropdownMenuItem>
									<DropdownMenuItem>
										example1@gmail.com
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export default function DataTable({ data }: { data: ExternalForm[] }) {
	console.log(data);
	const [showQRCodesAttendance, setShowQRCodesAttendance] = React.useState(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});

	const copyToClipboard = (text: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				alert("Link copied to clipboard!");
			})
			.catch(error => {
				console.error("Copy failed:", error);
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

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter names..."
					value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
					onChange={event =>
						table.getColumn("full_name")?.setFilterValue(event.target.value)
					}
					className="max-w-sm mr-5"
				/>
				<button
					type="button"
					className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 shadow-sm md:inline-flex dark:bg-[#242729]"
					onClick={() => {
						setShowQRCodesAttendance(true);
					}}
				>
					<span className="ml-2 lg:mt-[1px] text-slate-800 flex items-center mr-2">
						<LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
						<span className="ml-[3px] lg:ml-[5px] text-[11px] lg:text-[14px] p-[6px] dark:text-[#C1C7C1]">
							Nominations/ Travelling Forms
						</span>
					</span>
				</button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
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
										onCheckedChange={value =>
											column.toggleVisibility(!!value)
										}>
										{column.id
											.split("_")
											.map(
												word =>
													word.charAt(0).toUpperCase() +
													word.slice(1),
											)
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
										<TableHead
											key={header.id}
											className="text-center bg-gray-100">
											{header.isPlaceholder
												? null
												: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
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
									className="text-center">
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						Next
					</Button>
				</div>
			</div>
			<Modal isVisible={showQRCodesAttendance} onClose={() => setShowQRCodesAttendance(false)}>
				<div className="ml-2 p-5 z-[999]">
					<h3 className="lg:text-2xl font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
						NTF
					</h3>
					<QRCodeSVG
						value={`${url}/form/external`}
					/>
					<button
						onClick={() =>
							copyToClipboard(
								`${url}/form/external`
							)
						}
						className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] lg:ml-2 transform hover:scale-105"
					>
						Copy Link
					</button>
				</div>
			</Modal>
		</div>
	);
}
