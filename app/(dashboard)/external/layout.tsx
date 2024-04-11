import Link from "next/link";

export default function ExternalPageLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="flex gap-1 px-5 pt-4">
				<Link className="px-3 py-2 rounded-md border bg-white" href="/external">Tab 1</Link>
				<Link className="px-3 py-2 rounded-md border bg-white" href="/external/test">Tab 2</Link>
			</div>
			<div>{children}</div>
		</>
	);
}
