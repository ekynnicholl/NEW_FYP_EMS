"use client";

import SideBarDesktop from "@/components/layouts/SideBarDesktop";
import ModifiedSideBarDesktop from "@/components/layouts/modified-sidebar";
import SideBarMobile from "@/components/layouts/SideBarMobile";
import TopBar from "@/components/layouts/TopBar";
import React, { useEffect, useState } from "react";
import useViewModeStore from "@/components/zustand/viewModeStorage";
import darkLightStorage from "@/components/zustand/darkLightStorage";
import cookie from "js-cookie";
import loadingGIF from "@/public/loading_bird.gif";
import { useRouter } from "next/navigation";
import Chatbot from "@/components/chatbot/chatbot";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const setViewMode = useViewModeStore(state => state.setViewMode);
	const setIsDarkMode = darkLightStorage(state => state.toggleDarkMode);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkIsUserLoggedIn = () => {
			try {
				const authToken = cookie.get("authToken");
				setIsAuthenticated(!!authToken);

				if (!authToken) {
					router.push("/unauthorizedAccess");
				}
			} finally {
				// Set loading to false after the authentication check is complete
				setIsLoading(false);
			}
		};

		checkIsUserLoggedIn();
	}, [router]);

	// Define a function to change the view mode
	const handleViewModeChange = (newViewMode: number) => {
		setViewMode(newViewMode);
		// console.log(children);
	};

	const handeIsDarkModeChange = () => {
		setIsDarkMode();
	};

	return (
		<>
			{isLoading && (
				<div className="flex flex-col justify-center items-center h-screen bg-[#ffffff] z-[999]">
					<img src={loadingGIF.src} alt="" className="w-[100px] lg:w-[100px]" />
				</div>
			)}
			{!isLoading && isAuthenticated && (
				<div className="flex justify-start bg-slate-100">
					<div className="sm:hidden">
						<SideBarMobile />
					</div>

					<div className="hidden sm:flex">
						<SideBarDesktop />
						{/* <ModifiedSideBarDesktop /> */}
					</div>

					<div className="w-full">
						<div>
							<TopBar onViewModeChange={handleViewModeChange} onIsDarkModeChange={handeIsDarkModeChange} />
						</div>
						{isAuthenticated && children}
					</div>
					<Chatbot />
				</div>
			)}
		</>
	);
}
