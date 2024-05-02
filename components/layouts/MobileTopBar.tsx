"use client";

import { useEffect, useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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


	const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

	return (
		// <div className="hidden max-md:block">
		// 	<div onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</div>
		// 	<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
		// 		<DropdownMenuTrigger>
		// 			{/* <div onClick={() => {console.log("clicked")}}>{isOpen ? <X /> : <Menu />}</div> */}
		// 		</DropdownMenuTrigger>
		// 		<DropdownMenuContent className="mt-2 border-0 shadow-none w-screen h-screen">
		// 			<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
		// 				<Link href="/dashboard">Dashboard</Link>
		// 			</DropdownMenuItem>
		// 			<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
		// 				<Link href="/analytics">Analytic</Link>
		// 			</DropdownMenuItem>
		// 			<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
		// 				<Link href="/report">Report</Link>
		// 			</DropdownMenuItem>
		// 			<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
		// 				<Link href="/external">External Event</Link>
		// 			</DropdownMenuItem>
		// 			<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
		// 				<Link href="/suggestions">Suggestions</Link>
		// 			</DropdownMenuItem>
		// 			<DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
		// 				<Link href="/settings">Settings</Link>
		// 			</DropdownMenuItem>
		// 			{/* <DropdownMenuItem className="h-12 border-b-2 border-gray-200" asChild>
		// 				<Link href="/chatbot">Chatbot</Link>
		// 			</DropdownMenuItem> */}
		// 		</DropdownMenuContent>
		// 	</DropdownMenu>
		// </div>
		<div>
			<div id="navbar" className="fixed top-0 left-0 w-full flex items-center justify-between px-8 py-[16px] bg-white z-50 transition-all duration-300 lg:hidden mb-10">
				<div>
					<h1 className="text-xl font-bold text-slate-900 font-Nudito -ml-5">
						<span className="text-slate-900"><span className="text-[#014167]">&lt;</span><span className="text-slate-900">SWINBURNE</span><span className="text-[#014167]">/&gt;</span></span>
					</h1>
				</div>

				<div>
					<div className="relative">
						<button
							type="button"
							className="text-slate-900 hover:text-gray-800 focus:outline-none focus:text-gray-800 -mt-[4px] float-right -mr-5"
							onClick={() => setMenuOpen(!menuOpen)}
							aria-label="Toggle menu"
						>
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
							</svg>
						</button>

						{menuOpen && (
							<div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 flex justify-center items-center">
								<div
									ref={menuRef}
									tabIndex={-1}
									className="absolute right-0 top-0 h-full w-64 bg-white border border-gray-200"
								>
									<button
										type="button"
										className="text-gray-600 hover:text-gray-800 absolute top-2 right-2 mr-[2px] mt-1"
										onClick={() => setMenuOpen(false)}
										aria-label="Close menu"
									>
										<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>

									<div className="p-4 text-right mt-6">
										<Link legacyBehavior href="/dashboard">
											<a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-2 font-semibold" onClick={() => setMenuOpen(false)}>HOME</a>
										</Link>
										<Link legacyBehavior href="/analytics">
											<a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-1 font-semibold" onClick={() => setMenuOpen(false)}>ANALYTICS</a>
										</Link>
										<Link legacyBehavior href="/report">
											<a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-1 font-semibold" onClick={() => setMenuOpen(false)}>REPORT</a>
										</Link>
										<Link legacyBehavior href="/external">
											<a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-1 font-semibold" target="_blank" onClick={() => setMenuOpen(false)}>
												EXTERNAL EVENT
											</a>
										</Link>
										<Link legacyBehavior href="/suggestions">
											<a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-1 font-semibold" target="_blank" onClick={() => setMenuOpen(false)}>
												SUGGESTIONS
											</a>
										</Link>
										<Link legacyBehavior href="/settings">
											<a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-1 mb-4 font-semibold" target="_blank" onClick={() => setMenuOpen(false)}>
												SETTINGS
											</a>
										</Link>
										<Link legacyBehavior href="/logout">
											<Button className="bg-white text-black border-2 border-black-500 font-bold hover:bg-slate-200 transition-all ease-in-out whitespace-nowrap px-2 py-1 text-[12px]" onClick={() => setMenuOpen(false)}>
												Logout
											</Button>
										</Link>
									</div>
								</div>
							</div>
						)}


					</div>
				</div>
			</div>
		</div>
	);
}
