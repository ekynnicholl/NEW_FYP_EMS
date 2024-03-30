import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import DashboardExternalForm from "@/components/forms/DashboardExternalForm";
import { Button } from "@/components/ui/button";

const formatDateAndTime = (dateString: string): string => {
	const date = new Date(dateString);
	const month = date.toLocaleDateString("en-GB", { month: "long" });
	const day = date.toLocaleDateString("en-GB", { day: "numeric" });
	const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
	return `${day} ${month} ${date.getFullYear()}, ${time}`;
};

export default async function ExternalPage({ params }: { params: { id: string } }) {
	const supabase = createServerComponentClient({ cookies: () => cookies() });

	const { data: externalForm, error: externalFormError } = await supabase
		.from("external_forms")
		.select("*")
		.eq("id", params.id);

	const { data: auditLog, error: auditLogError } = await supabase
		.from("audit_log")
		.select("*")
		.eq("ntf_id", params.id);

	const navigationBarHeight = "75px";
	const padding = "40px";
	const auditLogHeight = `calc(100vh-75px-20px)`;

	return (
		<div className="w-full p-5 space-y-4">
			<div className="flex gap-3">
				<div className="flex-1">
					<DashboardExternalForm data={externalForm?.[0]} />
				</div>

				<div className={`flex flex-col gap-3 sticky h-[calc(100vh-20px)] top-3 w-96 bg-white rounded-lg p-4`}>
					<aside className="flex flex-col justify-between h-full">
						<div>
							{auditLog?.map((log, index) => (
								<div key={index} className="my-3">
									{log.type?.toLocaleLowerCase() === "create" && (
										<div>
											<p className="font-semibold">Created By:</p>
											<span>
												{log.username} ({log.email})
											</span>
											<p>Time: {formatDateAndTime(log.created_at)}</p>
										</div>
									)}

									{log.type?.toLocaleLowerCase() === "undo" && (
										<div>
											<p className="font-semibold">Undo By:</p>
											<span>
												{log.username} ({log.email})
											</span>
											<p>Time: {formatDateAndTime(log.created_at)}</p>
										</div>
									)}

									{log.type?.toLocaleLowerCase() === "verified" && (
										<div>
											<p className="font-semibold">Verified By:</p>
											<span>{externalForm?.[0]?.approval_email}</span>
											<p>Time: {formatDateAndTime(log.created_at)}</p>
										</div>
									)}

									{log.type?.toLocaleLowerCase() === "approved" && (
										<div>
											<p className="font-semibold">Approved By:</p>
											<span>{externalForm?.[0]?.verification_email}</span>
											<p>Time: {formatDateAndTime(log.created_at)}</p>
										</div>
									)}

									{log.type?.toLocaleLowerCase() === "reject" && (
										<div>
											<p className="font-semibold">Rejected:</p>
											<p>Time: {formatDateAndTime(log.created_at)}</p>
										</div>
									)}
								</div>
							))}
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
