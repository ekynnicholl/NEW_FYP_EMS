"use client";

import { usePathname } from 'next/navigation';
import Link from "next/link";

export default function Tabs() {
	const pathname = usePathname();

	const isExternalPage = pathname === "/external";
	const isImportantPage = pathname === "/external/important";

	return (
		<div className="flex gap-1 px-5 pt-4">
			<Link className={`rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-slate-300 shadow-sm md:inline-flex ${isExternalPage ? "bg-red-600 text-white" : "bg-slate-200 text-slate-800"}`} href="/external">All</Link>
			<Link className={`rounded-md items-center pt-2 pb-2 pl-3 pr-3 mr-3 font-bold hover:bg-slate-300 shadow-sm md:inline-flex ${isImportantPage ? "bg-red-600 text-white" : "bg-slate-200 text-slate-800"}`} href="/external/important">Important</Link>
		</div>
	);
}
