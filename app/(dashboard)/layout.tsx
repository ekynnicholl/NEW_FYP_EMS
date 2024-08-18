"use client";

import SideBarDesktop from "@/components/layouts/SideBarDesktop_new";
import ModifiedSideBarDesktop from "@/components/layouts/modified-sidebar";
import SideBarMobile from "@/components/layouts/SideBarMobile";
import TopBar from "@/components/layouts/TopBar";
import { useEffect, useState } from "react";
import useViewModeStore from "@/components/zustand/viewModeStorage";
import darkLightStorage from "@/components/zustand/darkLightStorage";
import loadingGIF from "@/public/loading_bird.gif";
import { useRouter } from "next/navigation";
import Chatbot from "@/components/chatbot/chatbot_popup";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const setViewMode = useViewModeStore(state => state.setViewMode);
	const setIsDarkMode = darkLightStorage(state => state.toggleDarkMode);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const auth = getAuth();
		onAuthStateChanged(auth, user => {
			// console.log("user", user);
			if (!user) {
				router.push("/unauthorizedAccess");
				setIsAuthenticated(false);
			} else {
				setIsAuthenticated(true);
			}
			setIsLoading(false);
		});
	}, [router]);

	const handleViewModeChange = (newViewMode: number) => {
		setViewMode(newViewMode);
	};

	const handeIsDarkModeChange = () => {
		setIsDarkMode();
	};

	return (
		<>
			{isLoading && (
				<div className="flex flex-col justify-center items-center h-screen bg-[#ffffff] z-[999]">
					<Image width={100} height={100} src={loadingGIF.src} alt="" className="w-[100px] lg:w-[100px]" />
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
