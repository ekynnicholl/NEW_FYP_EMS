"use client";

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
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar-year";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { sendReminderEmail } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ImportantForms({ data }: { data: ExternalForm[] }) {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [open, setOpen] = useState(false);
    const [confirmOpenAll, setConfirmOpenAll] = useState(false);
    const [openReminderDialogs, setOpenReminderDialogs] = useState<{ [key: string]: boolean }>({});
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2022, 0, 20),
        to: addDays(new Date(2022, 0, 20), 20),
    });

    const toggleReminderDialog = (formId: string) => {
        setOpenReminderDialogs((prev) => ({
            ...prev,
            [formId]: !prev[formId],
        }));
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
                <Button variant="ghost" className="capitalize pl-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Program Title/ Event
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="capitalize text-left">{row.getValue("program_title")}</div>,
        },
        {
            accessorKey: "formStage",
            sortingFn: "auto",
            filterFn: "equals",
            header: ({ column }) => (
                <Button variant="ghost" className="pl-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Form Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const formStage = row.original.formStage;

                if (formStage === 1) {
                    return <div className="uppercase text-left bg-red-400 text-white p-2 rounded-lg">Reverted to Staff</div>;
                } else if (formStage === 2) {
                    return <div className="uppercase text-left bg-blue-400 text-white p-2 rounded-lg">Reviewing by AAO</div>;
                } else if (formStage === 3) {
                    return <div className="uppercase text-left bg-blue-400 text-white p-2 rounded-lg">Reviewing by HOS/ ADCR/ MGR</div>;
                } else if (formStage === 4) {
                    return <div className="uppercase text-left bg-blue-400 text-white p-2 rounded-lg">Reviewing by HMU/ Dean</div>;
                } else if (formStage === 5) {
                    return <div className="uppercase text-left bg-green-400 text-white p-2 rounded-lg">Approved</div>;
                } else if (formStage === 6) {
                    return <div className="uppercase text-left bg-red-400 text-white p-2 rounded-lg">Rejected</div>;
                } else {
                    return <div className="uppercase">Unknown</div>;
                }
            },
        },
        {
            accessorKey: "last_updated",
            sortingFn: "datetime",
            filterFn: isWithinRange,
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Last Updated
                        <ArrowUpDown className="text-left ml-2 h-4 w-4" />
                    </Button>
                );
            },

            cell: ({ row }) => {
                // const date = new Date(row.getValue("last_updated"));
                // const day = date.getDate();
                // const month = date.getMonth() + 1;
                // const year = date.getFullYear();
                // const formattedDate = `${day}-${month}-${year}`;
                const lastUpdated = row.original.last_updated;

                return <div className="lowercase text-left ml-4">{lastUpdated}</div>;
            },
        },
        // Update the last_updated column to now() once they remind.
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                let emailToSendTo = "null";
                if (row.original.formStage === 1) {
                    emailToSendTo = row.original.email;
                } else if (row.original.formStage === 3) {
                    emailToSendTo = row.original.verification_email || "null";
                } else if (row.original.formStage === 4) {
                    emailToSendTo = row.original.approval_email || "null";
                }

                return (
                    // <Button onClick={() => sendReminder(row.original)}>REMIND</Button>

                    <Dialog
                        open={openReminderDialogs[row.original.id]}
                        onOpenChange={() => toggleReminderDialog(row.original.id)}
                    >
                        <DialogTrigger asChild>
                            <Button
                                type="button">
                                Remind
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Send Reminder</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                Are you sure you want to send a reminder to <span className="font-bold">{emailToSendTo}</span>?
                            </DialogDescription>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button>Cancel</Button>
                                </DialogClose>
                                <Button
                                    onMouseUp={() => {
                                        toggleReminderDialog(row.original.id);
                                        sendReminder(row.original);
                                    }}>
                                    Confirm
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            },
        },
    ];

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

    const sendReminder = async (row: ExternalForm) => {
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from("external_forms")
            .update({ last_updated: todayDateString })
            .eq("id", row.id)
            .select();

        if (error) {
            toast.error("Failed to send reminder.")
        } else {
            toast.success("Successfully sent a reminder for the selected forms.")
            sendReminderEmail(data[0]);
            router.refresh();
        }
    }

    const sendReminderAll = async () => {
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];

        const rowIds = data.map(row => row.id);
        const { data: updatedData, error: updateError } = await supabase
            .from("external_forms")
            .update({ last_updated: todayDateString })
            .in("id", rowIds)
            .select();

        if (updateError) {
            toast.error("Failed to update forms.");
            return;
        }

        updatedData.forEach(async (updatedRow: ExternalForm) => {
            toast.success(`Successfully sent reminder to all forms for today.`);
            sendReminderEmail(updatedRow);
            // Optionally refresh if needed
            router.refresh();
        });
    }

    return (
        <>
            <div className="flex items-center py-2">
                <Input
                    placeholder="Filter names..."
                    value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
                    onChange={event => table.getColumn("full_name")?.setFilterValue(event.target.value)}
                    className="max-w-sm mr-5"
                />

                <div className="ml-auto flex gap-2">
                    {/* <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Select a year range</span>
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
                </Popover> */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto dark:text-dark_text">
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
                        </DropdownMenuContent>
                    </DropdownMenu>

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
                                                                    : column.id === "last_updated"
                                                                        ? "Last Updated"
                                                                        : column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="mb-2 flex items-end justify-end">
                <Dialog open={confirmOpenAll} onOpenChange={setConfirmOpenAll}>
                    <DialogTrigger asChild>
                        <Button
                            className="p-[22px]"
                            type="button">
                            Remind All
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Send Reminder</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Are you sure you want to send a reminder to <span className="font-bold">all the forms</span>?
                        </DialogDescription>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button>Cancel</Button>
                            </DialogClose>
                            <Button
                                onMouseUp={() => {
                                    setConfirmOpenAll(false);
                                    sendReminderAll();
                                }}>
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                                            onClick={() => {
                                                // router.push(`/external/${row.original.id}`);
                                            }}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="cursor-pointer text-center pl-0 dark:bg-dark_mode_card dark:text-dark_text"
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                            ))}
                                        </TableRow>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                        <ContextMenuItem
                                            onClick={() => {
                                                // router.push(`/external/${row.original.id}`);
                                            }}
                                        >
                                            View
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            onClick={() => {
                                                setOpen(true);
                                                setSelectedRow(row.original);
                                            }}
                                        >
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
        </>
    )
}
