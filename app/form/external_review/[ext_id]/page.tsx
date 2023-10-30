"use client";

import AdminExternalForm from "@/components/forms/AdminExternalForm";
import ExternalForm from "@/components/forms/ApplicantExternalForm";
import Image from "next/image";
import { useParams } from 'next/navigation';

export default function ExternalFormPage() {
    const { ext_id } = useParams();
    const id = Array.isArray(ext_id) ? ext_id.join() : ext_id;

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

            <AdminExternalForm id={id} />
        </div>
    );
}
