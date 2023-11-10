import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";

export default function MobileTopBar() {
	return (
		<div className="md:hidden sm:block">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="space-y-1 transition-all">
						<div className="w-4 h-[2px] bg-black-500"></div>
						<div className="w-4 h-[2px] bg-black-500"></div>
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="mt-3 border-0 shadow-none w-screen h-screen">
					<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
						<Link href="/homepage">Dashboard</Link>
					</DropdownMenuItem>
					<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
						<Link href="/analytics">Analytic</Link>
					</DropdownMenuItem>
					<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
						<Link href="/report">Report</Link>
					</DropdownMenuItem>
					<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
						<Link href="/external">External Event</Link>
					</DropdownMenuItem>
					<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
						<Link href="/chatbot">Chatbot</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}