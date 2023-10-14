"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog-no-x";

import PencilNoteIcon from "@/components/icons/PencilNoteIcon";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase";

const ViewAttendanceListDialog = ({ event }: { event: InternalEvent }) => {
	const supabase = createClientComponentClient<Database>();
	const [attendanceList, setAttendanceList] = useState<AttendanceList[]>(
		[] as AttendanceList[],
	);
	const [numberOfAttendees, setNumberOfAttendees] = useState(0);

	useEffect(() => {
		const fetchAttendanceList = async () => {
			const { data, error } = await supabase
				.from("attendance_list")
				.select()
				.eq("attListEventID", event.intFID);

			if (error) {
				console.error("Error fetching attendance list:", error);
				return;
			}

			setAttendanceList(data);
		};
		fetchAttendanceList();
	}, [supabase, event.intFID]);

	attendanceList.forEach(async (entry: AttendanceList) => {
		const { data, count, error } = await supabase
			.from("attendance_forms")
			.select("attFormsListID", { count: "exact" })
			.eq("attFormsListID", entry.attListID);

		if (error) {
			console.error("Error fetching attendance forms:", error);
			return;
		}

		setNumberOfAttendees(count!);
	});

	return (
		<Dialog>
			<DialogTrigger onClick={event => event.stopPropagation()}>
				<div className="cursor-pointer text-slate-500 hover:font-medium text-[14.5px] ml-[1px]">
					Attendance List
				</div>
			</DialogTrigger>
			<DialogContent>
				<div className="flex items-center justify-center">
					<div className="flex items-center justify-center text-text text-[20px] text-center -mt-8">
						<PencilNoteIcon /><span className="ml-2.5">Attendance List</span>
					</div>
					<div className="ml-auto">
						<Link
							href={`/attendance/${event.intFID}`}
							passHref
							legacyBehavior={true}>
							<a className="flex items-center bg-slate-200 rounded-lg text-[15px] hover:bg-slate-300 focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm mb-3.5">
								<span className="text-slate-800 p-[5px]">View More</span>
							</a>
						</Link>
					</div>
				</div>
				<div className="text-left text-black text-[13px] pl-9 pb-5 -mt-[28px]">
					Total Attendees: {attendanceList.length}
				</div>
				{attendanceList && attendanceList.length > 0 ? (
					<div className="overflow-y-auto max-h-[500px]">
						<table className="w-full">
							<thead>
								<tr>
									<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">
										Staff ID
									</th>
									<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
										Staff Name
									</th>
									<th className="flex-1 px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
										Faculty/ Unit
									</th>
								</tr>
							</thead>
							<tbody>
								{attendanceList.map(item => (
									<tr key={item.attFormsID}>
										<td className="flex-1 px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
											{item.attFormsStaffID}
										</td>
										<td className="flex-1 px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
											{item.attFormsStaffName}
										</td>
										<td className="flex-1 px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
											{item.attFormsFacultyUnit}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center text-gray-600 mt-4">
						No attendance data available.
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ViewAttendanceListDialog;