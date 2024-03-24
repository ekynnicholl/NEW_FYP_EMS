import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import DashboardExternalForm from "@/components/forms/DashboardExternalForm";
import Link from "next/link";

export default async function ExternalPage({ params }: { params: { id: string } }) {
	const supabase = createServerComponentClient({ cookies: () => cookies() });

	const { data: externalForm, error } = await supabase
		.from("external_forms")
		.select("*")
		.eq("id", params.id);

	return (
		<div className="w-full p-5 space-y-4">
			<div className="flex gap-3">
				<div className="flex-1">
					<DashboardExternalForm data={externalForm?.[0]} />
				</div>

				<div className="flex gap-3">
					<aside className="w-96 bg-white rounded-lg p-4">Audit Trails</aside>
				</div>
			</div>
		</div>
	);
}
