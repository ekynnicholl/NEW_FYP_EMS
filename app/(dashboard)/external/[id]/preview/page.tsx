import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

import { ArrowLeftIcon } from "lucide-react";

import NTFPDF from "@/components/forms/NTFPDF";
import { Button } from "@/components/ui/button";

export default async function PreviewPDF({ params }: { params: { id: string } }) {
	const supabase = createServerComponentClient({ cookies: () => cookies() });

	return (
		<div className="w-full p-5 space-y-4">
			<div className="flex gap-3 bg-white p-3 relative">
				<Link
					href={`/external/${params.id}`}
					className="px-4 flex h-10 items-center gap-2 absolute shadow-[0_0_0_2px_#EFEFEF_inset] rounded-xl hover:shadow-black-500 transition-all duration-200 ease-in-out"
				>
					<ArrowLeftIcon className="cursor-pointer text-gray-500" />
					<span>Back</span>
				</Link>
				<NTFPDF id={params.id} />
			</div>
		</div>
	);
}
