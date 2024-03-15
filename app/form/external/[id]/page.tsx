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
		.eq("id", id);

	return (
		<div>
			<AdminExternalForm data={data?.[0]} />
		</div>
	);
}
