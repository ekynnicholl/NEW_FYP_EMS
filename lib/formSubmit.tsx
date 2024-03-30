"use client";

import * as z from "zod";
import externalFormSchema from "@/schema/externalFormSchema";

export function onSubmit(values: z.infer<typeof externalFormSchema>) {
	console.log("Form data submitted:", values);
}
