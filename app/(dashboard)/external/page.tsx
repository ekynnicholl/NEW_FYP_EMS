import ExternalTable from "@/components/tables/externalTable";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export default async function ExternalPage() {
	// const supabase = createClient(
	// 	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	// 	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	// );
	const cookieStore = cookies()
	const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

	const { data, error } = await supabase.from("external_forms").select("*");

	if (error) {
		console.error(error);
	}

	return (
		<div className="w-full grid justify-items-center p-5">
			<div className="w-full bg-white p-5">
				<ExternalTable data={data ? data : []} />
			</div>
		</div>
	);
}
