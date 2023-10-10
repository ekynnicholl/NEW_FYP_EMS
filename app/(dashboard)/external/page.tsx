import ExternalTable from "@/components/tables/ExternalTable";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase";

export default async function ExternalPage() {
	const supabase = createServerComponentClient<Database>({ cookies });

	const { data, error } = await supabase.from("external_form").select("*");

	if (error) {
		console.error(error);
	}

	return (
		<div className="w-full grid justify-items-center p-5">
			<div className="w-full bg-white p-5">
				<ExternalTable data={ data ? data : []} />
			</div>
		</div>
	);
}
