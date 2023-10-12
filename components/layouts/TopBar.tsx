"use client";

import React, { useEffect, useRef, useState } from "react";
import { auth } from "../../google_config";

import ProfileIcon from "@/components/icons/ProfileIcon";
import NotifIcon from "@/components/icons/NotifIcon";
import LightIcon from "@/components/icons/LightIcon";
import DarkIcon from "@/components/icons/DarkIcon";
import ArrowDownIcon from "@/components/icons/ArrowDownIcon";
import ThreeDotIcon from "@/components/icons/ThreeDotIcon";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import useViewModeStore from '@/components/zustand/viewModeStorage';
import LogoutIcon from "@/components/icons/LogoutIcon";
import SettingsIcon from "@/components/icons/SettingsIcon";
import ProfileRoundIcon from "@/components/icons/ProfileRoundIcon";
import PropTypes from 'prop-types';
import { useRouter } from "next/navigation";
import cookie from 'js-cookie';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
							<div className="w-8 h-8">
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
							<div className="w-8 h-8">
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
	)
}

interface TopBarProps {
	onViewModeChange: (id: number) => void; // Define the type as a function
}

const TopBar: React.FC<TopBarProps> = ({ onViewModeChange }) => {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);
	const supabase = createClientComponentClient();
	const [homepageView, setHomepageView] = useState(1);

	useEffect(() => {
		const storedUserId = localStorage.getItem('concatenatedID');
		if (storedUserId) {
			setUserId(storedUserId);
		}
	}, []);

	useEffect(() => {
		fetchHomepageView();
	})

	const fetchHomepageView = async () => {
		const { data, error } = await supabase
			.from('accounts')
			.select('accHomeView')
			.eq('accID', '8f505ae4-8a5e-465b-bf32-3f7843554e58'); // Use the appropriate accID

		if (error) {
			console.error('Error fetching homepageView:', error);
			return;
		}

		// Set the homepageView based on the fetched value
		setHomepageView(data[0].accHomeView);
		useViewModeStore.setState({ viewMode: data[0].accHomeView });
	}

	const toggleDarkMode = () => {
		setIsDarkMode(!isDarkMode);
	};

	const handleLogoutClick = () => {
		// Clear user data from localStorage
		localStorage.removeItem('concatenatedID');

		// Remove the cookies,
		cookie.remove('authToken');
		cookie.remove('accountRank');

		// Redirect to the login page after logout
		window.location.href = '/login'; // You can replace with the actual login page URL
	};

	const updateHomepageView = async (id: number) => {
		const { data, error } = await supabase
			.from('accounts')
			.update({ accHomeView: id })
			.eq('accID', '8f505ae4-8a5e-465b-bf32-3f7843554e58');

		if (error) {
			console.error('Update failed:', error);
			return;
		} else {
			fetchHomepageView();
			onViewModeChange(id);
		}
	};

	return (
		<div className="top-0 left-0 w-full bg-white p-4 flex justify-end items-center border-b">
			<div className="flex space-x-6 pr-2 pl-12">
				<div className="rounded-full px-2 py-2 bg-slate-100 cursor-pointer mt-[2px] opacity-80 hover:opacity-90">
					{isDarkMode ? (
						<LightIcon onClick={toggleDarkMode} />
					) : (
						<DarkIcon onClick={toggleDarkMode} />
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
							<DropdownMenuItem onClick={() => updateHomepageView(1)} className={homepageView === 1 ? 'text-blue-500' : ''}>Card View</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => updateHomepageView(2)} className={homepageView === 2 ? 'text-blue-500' : ''}>Grid View</DropdownMenuItem>
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
							<DropdownMenuItem onClick={handleLogoutClick}>Logout</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
};

export default TopBar;
