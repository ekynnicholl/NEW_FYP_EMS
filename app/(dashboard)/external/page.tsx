import ExternalTable from "@/components/tables/externalTable";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase";

export default async function ExternalPage() {
	const cookieStore = cookies()
	const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

	const { data, error } = await supabase.from("external_forms").select("*").order("created_at", { ascending: false });
	// const { data, error } = await supabase.from("external_forms").select("*");

	// const modifiedData = data?.map((form: any) => {
	// 	// convert created_at to 2024-04-12 format, DD-MM-YYYY
	// 	const date = new Date(form.created_at);
	// 	const day = date.getDate();
	// 	const month = date.getMonth() + 1;
	// 	const year = date.getFullYear();
	// 	const formattedDate = `${day}-${month}-${year}`;

	// 	return {
	// 		...form,
	// 		created_at: formattedDate,
	// 	};
	// });

	if (error) {
		console.error(error);
	}

	return (
		<div className="h-screen w-full grid justify-items-center p-5">
			<div className="w-full bg-white p-5 dark:bg-dark_mode_card">
				<ExternalTable data={data ? data : []} />
			</div>
		</div>
	);
}
