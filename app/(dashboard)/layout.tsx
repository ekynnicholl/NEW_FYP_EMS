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
import { signOut, useSession } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const setViewMode = useViewModeStore(state => state.setViewMode);
	const setIsDarkMode = darkLightStorage(state => state.toggleDarkMode);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const { data: session, status } = useSession();

	useEffect(() => {
		const auth = getAuth();
		const checkAuthState = async () => {
			const currentTime = new Date();
			const sessionExpires = session?.expires ? new Date(session.expires) : null;

			// Check if the session has expired
			if (sessionExpires && currentTime > sessionExpires) {
				await signOut();
				router.push("/unauthorizedAccess");
				setIsAuthenticated(false);
				setIsLoading(false);
				return;
			}

			// Check Firebase authentication state
			onAuthStateChanged(auth, user => {
				if (!user && !session) {
					router.push("/unauthorizedAccess");
					setIsAuthenticated(false);
				} else {
					setIsAuthenticated(true);
				}
				setIsLoading(false);
			});
		};

		checkAuthState();
	}, [router, session]);

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
