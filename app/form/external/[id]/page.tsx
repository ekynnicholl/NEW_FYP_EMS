import AdminExternalForm from "@/components/forms/AdminExternalForm";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ExternalFormPage({ params }: { params: { id: string } }) {
	const cookieStore = cookies();
	const supabase = createServerComponentClient({ cookies: () => cookieStore });

	const id = params.id;
	const { data } = await supabase
		.from("external_forms")
		.select("*")
		.eq("id", id)
		.single();

	const formData = data;
	if (data.logistic_arrangement && data.logistic_arrangement.length > 0) {
		data.logistic_arrangement.forEach((item: any, i: number) => {
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
		<div>
			<AdminExternalForm data={formData} />
		</div>
	);
}
