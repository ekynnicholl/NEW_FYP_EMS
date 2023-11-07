import AdminExternalForm from "@/components/forms/AdminExternalForm";
import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export default async function ExternalFormPage({ params }: { params: { ext_id: string } }) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const id = params.ext_id;
    // const supabase = createServerComponentClient({ cookies });
    const { data } = await supabase
        .from("external_forms")
        .select("*")
        .eq("id", id);

    console.log(data?.[0]);
    console.log(data?.[0].formStage);

    return (
        <div>
            <AdminExternalForm data={data?.[0]} />
        </div>
    );
}
