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

	if (externalFormError) {
		return <div>Something wrong happen, it could be database problem or network problem. Please contact IT development team.</div>;
	}

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

	const formData = externalForm;
	if (externalForm.logistic_arrangement && externalForm.logistic_arrangement.length > 0) {
		externalForm.logistic_arrangement.forEach((item: any, i: number) => {
			if (item.flight_date) {
				formData.logistic_arrangement[i].flight_date = new Date(item.flight_date);
			}

			if (item.check_in_date) {
				formData.logistic_arrangement[i].check_in_date = new Date(item.check_in_date);
			}

			if (item.check_out_date) {
				formData.logistic_arrangement[i].check_out_date = new Date(item.check_out_date);
			}
		});
	}

	return (
		<div className="w-full p-5 space-y-4">
			<div className="flex gap-3">
				<DashboardExternalForm data={formData} faculties={facultyNames || []} auditLog={auditLog || []} />
			</div>
		</div>
	);
}
