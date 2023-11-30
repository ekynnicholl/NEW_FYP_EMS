"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

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
	const [isOpen, setIsOpen] = useState(false);
	
	useEffect(() => {
		console.log("isOpen", isOpen);
	}, [isOpen]);

	return (
		<div className="hidden max-md:block">
			<div onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</div>
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger>
					{/* <div onClick={() => {console.log("clicked")}}>{isOpen ? <X /> : <Menu />}</div> */}
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
