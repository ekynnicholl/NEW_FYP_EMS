"use client";

import CreateEventDialog from "@/components/dialogs/CreateEventDialog";
import EditEventDialog from "@/components/dialogs/EditEventDialog";
import CancelEventDialog from "@/components/dialogs/CancelEventDialog";
import ViewAttendanceListDialog from "@/components/dialogs/ViewAttendanceDialog";
import { Chart } from 'chart.js/auto';

import Image from "next/image";
import { useState, useEffect, SyntheticEvent, useRef } from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faUsers, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";
import { AiOutlineFieldTime } from "react-icons/ai";
import { MdPeople } from "react-icons/md";
import { MdAirlineSeatReclineNormal } from "react-icons/md";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase";

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString("en-US", {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
});

const formatDate = (dateString: string): string => {
	const options: Intl.DateTimeFormatOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return new Date(dateString).toLocaleDateString("en-US", options);
};

const formatTime = (timeString: string): string => {
	const options: Intl.DateTimeFormatOptions = {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	};
	const formattedTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
		"en-US",
		options,
	);

	// Convert to lowercase and remove the space
	return formattedTime.replace(" ", "").toLowerCase();
};

const EventCard = ({ event }: { event: InternalEvent }) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<div className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[495px] relative flex flex-col transition transform hover:scale-105">
					<div className="w-full h-[300px] mb-4 relative">
						<div className="absolute -inset-6">
							<img
								src="https://source.unsplash.com/600x300?party"
								alt="Random"
								className="w-full h-full object-cover"
							/>
						</div>
					</div>

					<div className="mt-6">
						{/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
						<h2 className="text-2xl font-semibold mb-2 text-slate-800">
							{event.intFEventName}
						</h2>
						<p className="text-gray-500 mb-4">{event.intFDescription}</p>
						<div className="flex items-center mt-4">
							<HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
							<p className="text-slate-600 text-sm">
								{formatDate(event.intFStartDate!)}
							</p>
						</div>
						<div className="flex items-center mt-3">
							<FiClock className="text-2xl mr-2 text-slate-800" />
							<p className="text-slate-600 text-sm">
								{formatTime(event.intFStartTime!)}
							</p>
						</div>
						<div className="flex items-center mt-3">
							<FaLocationDot className="text-2xl mr-2 text-slate-800" />
							<p className="text-slate-600 text-sm">{event.intFVenue}</p>
						</div>
						<div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
							<div
								className="h-full bg-orange-300 rounded-full"
								style={{
									width: `${(20 / 60) * 100}%`,
								}}></div>
						</div>
						<div className="text-xs text-gray-600 mt-2 flex justify-between">
							<span className="ml-[2px]">Current Attendees: </span>
							<span className="mr-[2px]">
								Max Attendees: {event.intFMaximumSeats}
							</span>
						</div>

						<div className="flex justify-between items-end mt-5">
							<div onClick={event => event.stopPropagation()}>
								<ViewAttendanceListDialog event={event} />
							</div>

							<span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
								<span
									aria-hidden
									className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
								<AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
								<span className="relative mt-[1px] leading-3 tracking-wider">
									Upcoming
								</span>
							</span>
						</div>
					</div>
				</div>
			</DialogTrigger>
			<DialogContent className="pt-0 px-0">
				<div>
					<img
						src="https://source.unsplash.com/600x300?party"
						alt="Random"
						className="w-full aspect-video object-cover rounded-t-lg transform hover:scale-110 hover:rotate-1 transition duration-300 shadow-sm"
					/>

					<div className="px-4 pt-4">
						<DialogHeader className="font-semibold text-slate-800">
							<DialogTitle>{event.intFEventName}</DialogTitle>
							<DialogDescription>{event.intFDescription}</DialogDescription>
						</DialogHeader>

						<div className="flex items-center mt-4">
							<HiMiniCalendarDays className="text-[32px] lg:text-2xl mr-2 text-slate-800 -mt-[2px]" />
							<p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px] mt-[0.5px]">
								{formatDate(event.intFStartDate!)}
							</p>
							<span className="mx-2 text-slate-800 ml-[15px] lg:ml-[57px] mr-6">
								|
							</span>
							<FiClock className="text-[30px] lg:text-[21px] mr-2 text-slate-800 -mt-[1px]" />
							<p className="text-slate-600 text-[12px] lg:text-[13px]">
								{formatTime(event.intFStartTime!)}
							</p>
							<span className="mx-2 text-slate-800 -mt-[2px]">-</span>
							<p className="text-slate-600 text-[12px] lg:text-[13px]">
								{formatTime(event.intFEndTime!)}
							</p>
						</div>
						<div className="flex items-center mt-[10px] lg:mt-[14px]">
							<FaLocationDot className="text-xl lg:text-2xl -ml-[0.5px] lg:ml-0 mr-2 text-slate-800" />
							<p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px]">
								{event.intFVenue}
							</p>
						</div>
						<div className="flex items-center mt-[11px] lg:mt-[14px]">
							<MdPeople className="text-2xl mr-2 text-slate-800 -ml-[1px] lg:ml-[1px]" />
							<p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] -ml-[2px] lg:ml-0">
								{/* {numberOfAttendees} Attendees */}
								50 Attendees
							</p>
						</div>
						<div className="flex items-center mt-[15px] lg:mb-0 mb-[3px]">
							<MdAirlineSeatReclineNormal className="text-2xl mr-2 text-slate-800 lg:ml-[2px]" />
							<p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] lg:-ml-[1px]">
								{event.intFMaximumSeats} Seats
							</p>
						</div>
					</div>
				</div>
				<DialogFooter className="pr-4">
					<CancelEventDialog event={event} />
					<EditEventDialog event={event} />
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default function Homepage() {
	const supabase = createClientComponentClient<Database>();
	const malaysiaTimezone = "Asia/Kuala_Lumpur";

	const [info, setInfo] = useState<InternalEvent>({} as InternalEvent);
	const [infos, setInfos] = useState<InternalEvent[]>([] as InternalEvent[]);
	const [latestEvent, setLatestEvent] = useState<InternalEvent[]>([]);

	// Function to fetch the 6 latest events
	useEffect(() => {
		const fetchLatestEvent = async () => {
			const { data, error } = await supabase
				.from("internal_events")
				.select(
					"intFID, intFEventName, intFDescription, intFVenue, intFMaximumSeats, intFStartDate, intFStartTime, intFEndTime",
				)
				.gte(
					"intFStartDate",
					new Date().toLocaleString("en-US", { timeZone: malaysiaTimezone }),
				)
				.order("intFStartDate", { ascending: true })
				.order("intFStartTime", { ascending: true })
				.range(0, 5)
				.select();
			if (error) {
				console.error("Error fetching latest event:", error);
			} else {
				setLatestEvent(data);
			}
		};

		fetchLatestEvent();
	}, [supabase]);

	return (
		<div className="p-5 bg-slate-100 space-y-4">
			<div className="mx-auto w-full flex gap-8">
				<div className="lg:flex bg-white border border-slate-200 rounded-lg hidden p-5 gap-4 w-full">
					<div className="flex-1 text-left h-full">
						<div className="bg-[#E5F9FF] p-5 text-slate-700 rounded-lg flex">
							<div className="mr-4">
								<FontAwesomeIcon
									icon={faCalendar}
									className="w-8 mt-[6.5px] text-slate-700"
									size="2x"
								/>
							</div>
							<div className="ml-1">
								<p className="text-[15px]">Today&apos;s Date</p>
								<p className="font-medium">{formattedDate}</p>
							</div>
						</div>
					</div>

					<div className="flex-1 h-full text-left transition transform hover:scale-105">
						<a
							href="/upcomingEvents"
							className="bg-[#FFEDE5] h-full p-5 text-slate-700 rounded-lg flex hover:bg-[#ffdcce]">
							<div className="mr-4">
								<FontAwesomeIcon
									icon={faUsers}
									className="w-8 mt-[6px] text-slate-700"
									size="2x"
								/>
							</div>
							<div className="ml-1">
								<p className="text-[15px]">Upcoming Events</p>
								<p className="font-medium">2</p>
							</div>
						</a>
					</div>

					<div className="flex-1 text-left h-full transition transform hover:scale-105">
						<a
							href="/pastEvents"
							className="bg-[#EAE5FF] p-5 h-full text-slate-700 rounded-lg flex hover:bg-[#e0d8ff]">
							<div className="mr-4">
								<FontAwesomeIcon
									icon={faCheckCircle}
									className="w-[34px] mt-[6px] text-slate-700"
									size="2x"
								/>
							</div>
							<div className="ml-1">
								<p className="text-[15px]">Past Events</p>
								<p className="font-medium">2</p>
							</div>
						</a>
					</div>
				</div>

				<div className="flex justify-end items-start">
					<CreateEventDialog />
				</div>
			</div>

			<div className="w-full bg-slate-100 grid lg:grid-cols-[1fr_35%] pb-28 gap-4">
				<div className="grid grid-auto-fit-lg gap-4">
					{latestEvent.map(event => (
						<EventCard event={event} key={event.intFID} />
					))}
				</div>

				<div className="w-full bg-white border border-slate-200 rounded-lg p-6 h-[500px] transition transform hover:scale-105">
					<h2 className="text-2xl font-semibold mb-2">Calendar</h2>
					{/* <Calendar /> */}
				</div>
			</div>
		</div>
	);
}
