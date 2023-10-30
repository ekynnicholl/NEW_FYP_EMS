// "use client";

import AdminExternalForm from "@/components/forms/AdminExternalForm";
import ExternalForm from "@/components/forms/ApplicantExternalForm";
import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ExternalFormPage({ params }: { params: { ext_id: string } }) {
    const id = params.ext_id;
    const supabase = createServerComponentClient({ cookies });
    const { data } = await supabase
        .from("external_forms")
        .select("*")
        .eq("id", id);

    console.log(data[0]);

    return (
        <div className="mx-auto max-w-6xl px-8 my-8 mt-6 mb-[200px]">
            <div className="ml-10">
                <div className="flex ml-[13px]">
                    <div>
                        <Image
                            src="/swinburne_logo.png"
                            alt=""
                            width={200}
                            height={300}
                        />
                    </div>
                    <div className="ml-8 mt-2">
                        <p className="font-medium">Human Resources</p>
                        <h1 className="text-3xl font-bold text-slate-800 mb-4 mt-4 -ml-[1px]">
                            Nomination / Travelling Application Form
                        </h1>
                    </div>
                </div>

                <div className="mb-4 text-slate-800 mt-2">
                    <p className="mb-2">
                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
                            *
                        </span>
                        <span>
                            Before completing this form, please refer to the separate
                            document on “General Instructions for completing Nomination /
                            Travelling Application Form”, which is available on
                            SharePoint.
                        </span>
                    </p>
                    <p className="mb-2">
                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
                            *
                        </span>
                        <span>
                            All fields are mandatory to complete as required for each
                            applicable section.
                        </span>
                    </p>
                    <p>
                        <span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">
                            *
                        </span>
                        <span>
                            This form is also to be used for any contracted individual as
                            consultant, and is to be completed where applicable.
                        </span>
                    </p>
                </div>
            </div>

            <hr className="mt-8" />

            <AdminExternalForm data={data?.[0]} />
        </div>
    );
}
