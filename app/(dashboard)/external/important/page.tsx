import ImportantForms from "@/components/ntf/important_forms";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase";

export default async function Important() {
	const cookieStore = cookies()
	const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

	// Get today's date and format it in YYYY-MM-DD format
	const today = new Date();
	const todayDateString = today.toISOString().split('T')[0];

	// Fetch data where last_updated is not equal to today's date
	const { data, error } = await supabase
		.from("external_forms")
		.select("*")
		.order("last_updated", { ascending: true })
		.eq("isHidden", 0)
		.not("last_updated", "eq", todayDateString)
		.not("formStage", "eq", 5)
		.not("formStage", "eq", 6);

	return (
		<div className="h-screen w-full grid justify-items-center p-5">
			<div className="w-full bg-white p-5 dark:bg-dark_mode_card">
				<div>
					<h1 className="font-bold text-[26px]">Important!</h1>
					<p>These form&apos;s have not been updated for a day. You may manually trigger an email to relevant party.</p>
				</div>
				<ImportantForms data={data ? data : []} />
			</div>
		</div>
	);
}
