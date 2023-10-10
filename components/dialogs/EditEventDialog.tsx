"use client"

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase";

const EditEventDialog = ({ event }: { event: InternalEvent }) => {
	const supabase = createClientComponentClient<Database>();
	const [open, setOpen] = useState(false);

	const formSchema = z.object({
		name: z.string().min(1, "Name is required"),
		description: z.string().nonempty({ message: "Description is required" }),
		venue: z.string().nonempty({ message: "Venue is required" }),
		maximumSeats: z.number().positive({ message: "Maximum seats is required" }),
		date: z.date(),
		startTime: z.string(),
		endTime: z.string(),
		organizer: z.string().nonempty({ message: "Organizer is required" }),
		faculty: z.string().nonempty({ message: "Faculty is required" }),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: event.intFEventName,
			description: event.intFDescription!,
			venue: event.intFVenue!,
			maximumSeats: Number(event.intFMaximumSeats),
			date: new Date(event.intFStartDate!),
			startTime: event.intFStartTime!,
			endTime: event.intFEndTime!,
			organizer: event.intFOrganizer!,
			faculty: event.intFFaculty!,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		const { error } = await supabase
			.from("internal_events")
			.update({
				intFEventName: values.name,
				intFDescription: values.description,
				intFStartDate: values.date!,
				intFStartTime: values.startTime,
				intFEndTime: values.endTime,
				intFVenue: values.venue,
				intFMaximumSeats: values.maximumSeats,
				intFOrganizer: values.organizer,
				intFFaculty: values.faculty,
			})
			.eq("intFID", event.intFID);

		if (error) {
			toast.error("Error edit event!");
			console.error("Error updating event:", error);
			return;
		}

		toast.success("Event edited successfully!");
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<Button className="bg-slate-900 hover:bg-slate-900/90">Edit Event</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Event</DialogTitle>
				</DialogHeader>
				<Separator className="my-1" />
				<Form {...form}>
					<form className=" space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-auto-fit-xs gap-8">
							<FormField
								control={form.control}
								name="venue"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Venue</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="maximumSeats"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Maximum Seats</FormLabel>
										<FormControl>
											<Input
												{...field}
												onChange={e => {
													field.onChange(
														Number(e.target.value),
													);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-full pl-3 text-left font-normal",
														!field.value &&
															"text-muted-foreground",
													)}>
													{field.value ? (
														format(field.value, "PPP")
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
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

						<div className="grid grid-auto-fit-xs gap-8">
							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Time</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
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
							name="organizer"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organizer</FormLabel>
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
									<FormLabel>Faculty</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								className="rounded-lg bg-slate-900 text-slate-100 hover:bg-slate-900/90">
								Submit
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditEventDialog;