import ImportantForms from "@/components/ntf/important_forms";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase";
import { useState } from "react";

export default async function Important() {
	const cookieStore = cookies()
	const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

	// Get today's date and format it in YYYY-MM-DD format
	const today = new Date();
	const todayDateString = today.toISOString().split('T')[0];

	let aaoDuration = 3;

	const { data: externalSettingsData, error: externalSettingsError } = await supabase
		.from("external_reminder")
		.select("extSID, extSType, extSDays")

	if (externalSettingsError) {
		// toast.error("There was an error fetching the times.")
	} else {
		const aaoData = externalSettingsData.find(item => item.extSType === "AAO");

		if (aaoData) {
			aaoDuration = aaoData.extSDays;
		}
	}

	const adjustedDate = new Date(today.getTime() - aaoDuration * 24 * 60 * 60 * 1000);
	const adjustedDateString = adjustedDate.toISOString().split('T')[0];

	// Fetch data where last_updated is not equal to today's date
	const { data, error } = await supabase
		.from("external_forms")
		.select("*")
		.order("last_updated", { ascending: true })
		.eq("isHidden", 0)
		.lt("last_updated", adjustedDateString)
		.not("formStage", "eq", 2)
		.not("formStage", "eq", 5)
		.not("formStage", "eq", 6);

	return (
		<div className="h-screen w-full grid justify-items-center p-5">
			<div className="w-full bg-white p-5 dark:bg-dark_mode_card">
				{aaoDuration !== 0 ? (
					<>
						<div>
							<h1 className="font-bold text-[26px]">Important!</h1>
							<p>These form&apos;s have not been updated for {aaoDuration} day(s) - this can be changed in the Settings Page. You may manually trigger an email to the relevant party.</p>
						</div>
						<ImportantForms data={data ? data : []} /></>
				) : (
					<div>
						<p>This feature has been disabled. To re-enable this feature, please change the duration for Academic Administration Office under Nominations/ Travelling Forms Reminder in <span className="font-bold">Settings Page</span>.</p>
					</div>
				)}
			</div>
		</div>
	);
}
