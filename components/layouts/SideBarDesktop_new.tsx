"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

import classNames from "classnames";

import HamburgerIcon from "@/components/icons/HamburgerButton";
import HomeIcon from "@/components/icons/HomeIcon";
import FormsIcon from "@/components/icons/FormsIcon";
import GraphIcon from "@/components/icons/GraphIcon";
import ReportIcon from "@/components/icons/ReportIcon";
import EventsIcon from "@/components/icons/EventsIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import BsFillChatLeftTextFill from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { IoAnalyticsOutline } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2"
import { FaWpforms } from "react-icons/fa"
import { RxHamburgerMenu } from "react-icons/rx"
import { IoIosArrowBack } from "react-icons/io"
import { FaRegLightbulb } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

// IMPORT THIS TO USE THE DARK/ LIGHT MODE STATE,
import darkLightStorage from '@/components/zustand/darkLightStorage';

// PLEASE DON'T DELETE MY COMMENTED LINES UNTIL FINAL PHASE OF DEVELOPMENT, TQ.

const NavLinks = [
	{ id: 1, name: "Home", icon: FaHome, link: "/dashboard" },
	{ id: 2, name: "Analytical Visualization", icon: IoAnalyticsOutline, link: "/analytics" },
	{ id: 3, name: "Staff Report", icon: TbReportSearch, link: "/staffReport" },
	{ id: 4, name: "EMAT Chatbot", icon: HiOutlineChatBubbleBottomCenterText, link: "/chatbot" },
	{ id: 5, name: "Nominations Travelling Form", icon: FaWpforms, link: "/external" },
	// { id: 6, name: "Suggestions/ Update Logs", icon: FaRegLightbulb, link: "/suggestions" },
	{ id: 7, name: "Settings", icon: IoSettingsSharp, link: "/settings" }
];

const NavigationBarDesktop = () => {
	const [closeNav, setToggleNav] = useState(true);
	// const [isToggleable, setIsToggleable] = useState (true);
	const [isHovered, setIsHovered] = useState(false);
	// const [isHamburgerClicked, setIsHamburgerClicked] = useState(false);

	const pathname = usePathname();

	const activeNavBar = useMemo(
		() => NavLinks.find(nav => nav.link === pathname),
		[pathname],
	);

	// Change hover states,
	const handleHoverEnter = () => {
		setIsHovered(true);
	};

	const handleHoverLeave = () => {
		setIsHovered(false);
	};

	const HandleNavBarToggle = () => {
		setToggleNav(!closeNav);
		// setIsHamburgerClicked(!isHamburgerClicked)
	};

	return (
		<>
			<div
				className={`relative h-full p-5 dark:bg-dark_mode_card bg-white border-r dark:border-[#2D3133] hidden lg:block w-[75px]`}
				onMouseEnter={handleHoverEnter}
				onMouseLeave={handleHoverLeave}
			>
				{/* First Div */}
				<div className="absolute inset-0 z-[1]">
					<div className="flex items-center justify-center p-3">
						<Image
							src="/swinburne_logo.png"
							alt=""
							width={100}
							height={100}
						/>
					</div>

					{/* Use loop to loop through the navigation links */}
					<div className="flex flex-col items-start m-4">
						{NavLinks.map(({ icon: Icon, ...nav }) => {
							const isActive = pathname === nav.link;
							const navItemClasses = classNames(
								"flex items-center cursor-pointer hover:bg-slate-200 rounded w-full overflow-hidden whitespace-wrap dark:hover:bg-[#242729]",
								{
									"bg-light-lighter": activeNavBar?.id === nav.id,
									"bg-slate-200 dark:bg-[#242729]": isActive,
								}
							);

							return (
								<div className={navItemClasses} key={nav.id}>
									<Link href={nav.link} legacyBehavior={true}>
										<a className="flex py-[14px] px-2 items-center w-full h-full text-sm text-slate-800">
											<Icon
												className={`text-[${nav.id === 3 ? '27' : '26'}px] ${nav.id === 4 ? 'mt-[2px]' : ''
													} ${nav.id === 3 ? '-ml-[0.5px]' : ''} text-slate-800 dark:text-dark_text`}
											/>

											{/* If the navigation bar is not closed OR it is hovered, display the items */}
											{(!closeNav || isHovered) && (
												<span className="pl-5 text-[15px] font-medium text-text-light dark:text-dark_text text-slate-800">
													{nav.name}
												</span>
											)}
										</a>
									</Link>
								</div>
							);
						})}
					</div>
				</div>

				{/* Second Div */}
				<div
					className={`absolute inset-0 z-[2] p-5 dark:bg-dark_mode_card bg-white border-r dark:border-[#2D3133] transition-transform duration-100 ${isHovered ? 'transform translate-x-0 opacity-100 w-[250px]' : 'transform -translate-x-full opacity-0'}`}
				>
					<div className="flex flex-col">
						<div className="flex justify-between relative">
							<div className="w-full">
								<div className="flex items-center pl-1 gap-4">
									<span className={`mt-2 text-lg font-medium text-text ${!isHovered ? 'hidden' : ''}`}>
										<Image
											src="/swinburne_logo.png"
											alt=""
											width={500}
											height={400}
										/>
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Use loop to loop through the navigation links */}
					<div className="flex flex-col items-start mt-8">
						{NavLinks.map(({ icon: Icon, ...nav }) => {
							const isActive = pathname === nav.link;
							const navItemClasses = classNames(
								"flex items-center cursor-pointer hover:bg-slate-200 rounded w-full overflow-hidden whitespace-wrap dark:hover:bg-[#242729]",
								{
									"bg-light-lighter": activeNavBar?.id === nav.id,
									"bg-slate-200 dark:bg-[#242729]": isActive,
								}
							);

							return (
								<div className={navItemClasses} key={nav.id}>
									<Link href={nav.link} legacyBehavior={true}>
										<a className="flex py-[14px] px-2 items-center w-full h-full text-sm text-slate-800">
											{/* If the navigation bar is not closed OR it is hovered, display the items */}
											{(isHovered) && (
												<>
													<Icon
														className={`text-[${nav.id === 3 ? '27' : '26'}px] ${nav.id === 4 ? 'mt-[2px]' : ''
															} ${nav.id === 3 ? '-ml-[0.5px]' : ''} text-slate-800 dark:text-dark_text`}
													/>
													<span className="pl-5 text-[15px] font-medium text-text-light dark:text-dark_text text-slate-800">
														{nav.name}
													</span>
												</>
											)}
										</a>
									</Link>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
};

export default NavigationBarDesktop;
