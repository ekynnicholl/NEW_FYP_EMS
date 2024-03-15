import ExternalTable from "@/components/tables/externalTable";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase";

export default async function ExternalPage() {
	const cookieStore = cookies()
	const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

	const { data, error } = await supabase.from("external_forms").select("*").order("created_at", { ascending: false });
	// const { data, error } = await supabase.from("external_forms").select("*");

	if (error) {
		console.error(error);
	}

	return (
		<div className="h-screen w-full grid justify-items-center p-5 dark:bg-dark_mode_bg">
			<div className="w-full bg-white p-5 dark:bg-dark_mode_card">
				<ExternalTable data={data ? data : []} />
			</div>
		</div>
	);
}
