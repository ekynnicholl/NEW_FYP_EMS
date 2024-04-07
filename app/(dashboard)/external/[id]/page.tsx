import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import DashboardExternalForm from "@/components/forms/DashboardExternalForm";

export default async function ExternalPage({ params }: { params: { id: string } }) {
	const supabase = createServerComponentClient({ cookies: () => cookies() });

	const { data: externalForm, error: externalFormError } = await supabase
		.from("external_forms")
		.select("*")
		.eq("id", params.id)
		.single();

	const { data: auditLog, error: auditLogError } = await supabase
		.from("audit_log")
		.select("*")
		.eq("ntf_id", params.id)
		.order("created_at", { ascending: true });

	const { data: faculties } = await supabase
		.from("attendance_settings")
		.select("attsName")
		.eq("attsType", 1)
		.order("attsName", { ascending: true });

	const facultyNames = faculties?.map(item => item.attsName);

	return (
		<div className="w-full p-5 space-y-4">
			<div className="flex gap-3">
				<DashboardExternalForm data={externalForm} faculties={facultyNames || []} auditLog={auditLog || []} />
			</div>
		</div>
	);
}
