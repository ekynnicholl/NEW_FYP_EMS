"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "../../google_config";

import Link from "next/link";
import ProfileIcon from "@/components/icons/ProfileIcon";
import NotifIcon from "@/components/icons/NotifIcon";
import LightIcon from "@/components/icons/LightIcon";
import DarkIcon from "@/components/icons/DarkIcon";
import ArrowDownIcon from "@/components/icons/ArrowDownIcon";
import ThreeDotIcon from "@/components/icons/ThreeDotIcon";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import useViewModeStore from "@/components/zustand/viewModeStorage";
import LogoutIcon from "@/components/icons/LogoutIcon";
import SettingsIcon from "@/components/icons/SettingsIcon";
import ProfileRoundIcon from "@/components/icons/ProfileRoundIcon";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import cookie from "js-cookie";
import useDarkLight from "@/components/zustand/darkLightStorage";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePathname } from "next/navigation";

const Notification = () => {
	return (
		<div className="cursor-pointer mt">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="rounded-full bg-slate-100 opacity-80 mt-1 p-2 hover:opacity-90">
						<NotifIcon />
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="top" sideOffset={-4}>
					<DropdownMenuLabel>Notification</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<div className="flex items-center hover:bg-gray-100 pl-2.5 cursor-pointer hover:text-gray-700">
							<div className="w-8 h-8 -mt-2 -ml-2 -mr-2">
								<NotifIcon />
							</div>
							<div className="flex flex-col flex-grow pl-2">
								<div className="text-[12px] text-gray-700 hover:text-gray-900 pt-2.5 text-justify pr-3">
									You have a pending NTF Form to approve. Submitted by
									User A.
								</div>
								<div className="text-gray-400 text-[10px] cursor-pointer flex justify-end pr-3 ml-1 pb-2.5 mt-1">
									11:59 PM, 15 September 2023
								</div>
							</div>
						</div>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<div className="flex items-center hover:bg-gray-100 pl-2.5 cursor-pointer hover:text-gray-700">
							<div className="w-8 h-8 -mt-2 -ml-2 -mr-2">
								<NotifIcon />
							</div>
							<div className="flex flex-col flex-grow pl-2">
								<div className="text-[12px] text-gray-700 hover:text-gray-900 pt-2.5 text-justify pr-3">
									You have a pending NTF Form to approve. Submitted by
									User A.
								</div>
								<div className="text-gray-400 text-[10px]  cursor-pointer flex justify-end pr-3 ml-1 pb-2.5 mt-1">
									11:59 PM, 15 September 2023
								</div>
							</div>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

const User = () => {
	return (
		<div className="cursor-pointer">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px]">
						<ProfileIcon />
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Logout</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

const BreadCrumb = () => {
	const pathname = usePathname();

	if (pathname === "/homepage") {
		return (
			<div className="flex items-center space-x-2 text-sm">
				<Link href="/homepage">Home</Link>
				<p>/</p>
				<Link href="/homepage" className="underline underline-offset-4">
					Dashboard
				</Link>
			</div>
		);
	}

	// convert /homepage to Homepage
	const path = pathname.substring(1, pathname.length);
	const pathArray = path.split("/");
	const pathArrayLength = pathArray.length;
	const lastPath = pathArray[pathArrayLength - 1];
	const lastPathCapitalized = lastPath.charAt(0).toUpperCase() + lastPath.slice(1);

	return (
		<div className="flex items-center space-x-2 text-sm">
			<Link href="/homepage">Home</Link>
			<p>/</p>
			<Link href={pathname} className="underline underline-offset-4">
				{lastPathCapitalized}
			</Link>
		</div>
	);
};

interface TopBarProps {
	onViewModeChange: (id: number) => void;
	onIsDarkModeChange: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onViewModeChange, onIsDarkModeChange }) => {
	const supabase = createClientComponentClient();
	const [userId, setUserId] = useState<string | null>(null);
	const [homepageView, setHomepageView] = useState(1);
	const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

	useEffect(() => {
		const storedUserId = localStorage.getItem("concatenatedID");
		if (storedUserId) {
			setUserId(storedUserId);
		}
	}, []);

	useEffect(() => {
		fetchHomepageView();
		fetchIsDarkMode();
	}, []);

	const fetchHomepageView = async () => {
		const { data, error } = await supabase
			.from("accounts")
			.select("accHomeView")
			.eq("accID", "8f505ae4-8a5e-465b-bf32-3f7843554e58"); // Use the appropriate accID

		if (error) {
			console.error("Error fetching homepageView:", error);
			return;
		}

		// Set the homepageView based on the fetched value
		setHomepageView(data[0].accHomeView);
		useViewModeStore.setState({ viewMode: data[0].accHomeView });
	};

	const fetchIsDarkMode = async () => {
		const { data, error } = await supabase
			.from("accounts")
			.select("accIsDarkMode")
			.eq("accID", "8f505ae4-8a5e-465b-bf32-3f7843554e58"); // Use the appropriate accID

		if (error) {
			console.error("Error fetching IsDarkMode:", error);
			return;
		}

		// Set the homepageView based on the fetched value
		setIsDarkMode(data[0].accIsDarkMode);
		useDarkLight.setState({ isDarkMode: data[0].accIsDarkMode });
	};

	// 0 is vanilla, 1 is dark mode.
	const updateIsDarkMode = async (status: boolean) => {
		const { data, error } = await supabase
			.from("accounts")
			.update({ accIsDarkMode: status })
			.eq("accID", "8f505ae4-8a5e-465b-bf32-3f7843554e58")
			.select();

		if (error) {
			console.error("Update failed:", error);
			return;
		} else {
			fetchIsDarkMode();
			onIsDarkModeChange();
		}
	};

	const handleLogoutClick = () => {
		// Clear user data from localStorage
		localStorage.removeItem("concatenatedID");

		// Remove the cookies,
		cookie.remove("authToken");
		cookie.remove("accountRank");

		// Redirect to the login page after logout
		window.location.href = "/login"; // You can replace with the actual login page URL
	};

	const updateHomepageView = async (id: number) => {
		const { data, error } = await supabase
			.from("accounts")
			.update({ accHomeView: id })
			.eq("accID", "8f505ae4-8a5e-465b-bf32-3f7843554e58");

		if (error) {
			console.error("Update failed:", error);
			return;
		} else {
			fetchHomepageView();
			onViewModeChange(id);
		}
	};

	return (
		// <div className={`top-0 left-0 w-full ${isDarkMode ? 'bg-black-500' : 'bg-white border-b'} p-4 flex justify-end items-center`}>
		<div className="w-full p-4 flex justify-between items-center bg-white dark:bg-dark_mode_card">
			<BreadCrumb />
			<div className="flex space-x-6 pr-2 pl-12">
				<div className="rounded-full px-2 py-2 bg-slate-100 cursor-pointer mt-[2px] opacity-80 hover:opacity-90">
					{!isDarkMode ? (
						<LightIcon onClick={() => updateIsDarkMode(true)} />
					) : (
						<DarkIcon onClick={() => updateIsDarkMode(false)} />
					)}
				</div>
				<Notification />
				<div className="cursor-pointer">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px]">
								<ThreeDotIcon />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={() => updateHomepageView(1)}
								className={homepageView === 1 ? "text-blue-500" : ""}>
								Card View
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => updateHomepageView(2)}
								className={homepageView === 2 ? "text-blue-500" : ""}>
								List View
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<User />
				<div className="flex items-center justify-center">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className="flex items-center gap-3 cursor-pointer">
								<p className=" text-slate-700 text-sm font-medium">
									Administrator
								</p>
								<ArrowDownIcon />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogoutClick}>
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
};

export default TopBar;
