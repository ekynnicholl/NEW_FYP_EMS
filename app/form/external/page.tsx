import AdminExternalForm from "@/components/forms/AdminExternalForm";
import ExternalForm from "@/components/forms/ApplicantExternalForm";
import BottomLeftPopup from "@/components/ntf/bottomleftpopup";
import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ExternalFormPage() {
	const cookieStore = cookies();
	const supabase = createServerComponentClient({ cookies: () => cookieStore });

	const { data, error } = await supabase
		.from("attendance_settings")
		.select("attsName")
		.eq("attsType", 1)
		.order("attsName", { ascending: true });

	if (error) {
		console.error("Error fetching faculty options:", error.message);
		return;
	}

	const facultyNames = data.map(item => item.attsName);

	return (
		<div>
			<ExternalForm faculties={facultyNames} />
			<BottomLeftPopup />
		</div>
	);
}
