"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

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

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase";

const CancelEventDialog = ({ event } : { event: InternalEvent}) => {
	const supabase = createClientComponentClient<Database>()
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const deleteEvent = async () => {
		const { data, error } = await supabase
			.from("internal_events")
			.delete()
			.eq("intFID", event.intFID);

		if (error) {
			console.error("Error deleting event:", error);
			return;
		}

		console.log("Event deleted successfully:", data);
		setOpen(false);	
		router.refresh();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary">Cancel Event</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<h3 className="text-[16px] lg:text-[19px] font-semibold text-slate-800 mb-1">
						Cancel Event
					</h3>
					<DialogClose />
				</DialogHeader>
				<DialogDescription>
					<p className="-mb-1 lg:mb-5 font-normal text-slate-500">
						Are you sure you want to cancel this event?
					</p>
				</DialogDescription>
				<DialogFooter>
					<DialogClose>
						<Button className="rounded-lg px-[7px] py-[5px] lg:px-[10px] lg:py-[5px] border border-slate-800 hover:bg-slate-100 mr-4 text-[12px] lg:text-[15px] focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-medium">
							Cancel
						</Button>
					</DialogClose>

					<Button onClick={deleteEvent} className="rounded-lg px-[7px] py-[5px] lg:px-[10px] lg:py-[5px] border border-slate-800 hover:bg-slate-100 mr-4 text-[12px] lg:text-[15px] focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 font-medium">
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CancelEventDialog;