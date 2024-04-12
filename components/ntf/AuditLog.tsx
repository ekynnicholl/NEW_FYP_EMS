const formatDateAndTime = (dateString: string): string => {
	const date = new Date(dateString);
	const month = date.toLocaleDateString("en-GB", { month: "long" });
	const day = date.toLocaleDateString("en-GB", { day: "numeric" });
	const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
	return `${day} ${month} ${date.getFullYear()}, ${time}`;
};

export default function AuditLog({ auditLogs, externalForm }: { auditLogs: AuditLog[]; externalForm: ExternalForm }) {
	return (
		<div>
			{auditLogs?.map((log, index) => (
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

					{log.type?.toLocaleLowerCase() === "forward" && (
						<div>
							<p className="font-semibold">Reviewed and Forwarded By:</p>
							<span>
								{log.username} ({log.email})
							</span>
							<p>Time: {formatDateAndTime(log.created_at)}</p>
						</div>
					)}

					{log.type?.toLocaleLowerCase() === "revert" && (
						<div>
							<p className="font-semibold">Reverted By:</p>
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
							<span>{externalForm.approval_email}</span>
							<p>Time: {formatDateAndTime(log.created_at)}</p>
						</div>
					)}

					{log.type?.toLocaleLowerCase() === "approved" && (
						<div>
							<p className="font-semibold">Approved By:</p>
							<span>{externalForm.verification_email}</span>
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
	);
}
