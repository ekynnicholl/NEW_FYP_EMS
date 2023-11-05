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
import {IoAnalyticsOutline} from "react-icons/io5";

// IMPORT THIS TO USE THE DARK/ LIGHT MODE STATE,
import darkLightStorage from '@/components/zustand/darkLightStorage';

// PLEASE DON'T DELETE MY COMMENTED LINES UNTIL FINAL PHASE OF DEVELOPMENT, TQ.

const NavLinks = [
	{ id: 1, name: "Home", icon: FaHome, link: "/homepage" },
	{ id: 2, name: "Analytical Visualization", icon: IoAnalyticsOutline, link: "/analytics" },
	{ id: 3, name: "Reports", icon: ReportIcon, link: "/report" },
	{ id: 4, name: "Chatbot", icon: ChatIcon, link: "/chatbot" },
	{ id: 5, name: "Nominations Travelling Form", icon: FormsIcon, link: "/external" }
];

const NavigationBarDesktop = () => {
	const [closeNav, setToggleNav] = useState(true);
	// const [isToggleable, setIsToggleable] = useState (true);
	const [isHovered, setIsHovered] = useState(false);
	// const [isHamburgerClicked, setIsHamburgerClicked] = useState(false);

	// USE THIS TO GET THE DARK/ LIGHT MODE STATE,
	const isDarkMode = darkLightStorage((state) => state.isDarkMode);

	const pathname = usePathname();

	const activeNavBar = useMemo(
		() => NavLinks.find(nav => nav.link === pathname),
		[pathname],
	);

	// Put fixed if want the navigation bar to scroll together but if I put fixed, the side elements will not change size when navigation bar is open.
	const wrapper = classNames(
		"h-screen p-5 flex flex-col top-0 left-0 dark:bg-dark_mode_card", {
		/* Display the whole navigation IF it is NOT CLOSED OR IT IS HOVERED, */
		["w-72"]: !closeNav || isHovered,

		["w-20"]: closeNav,
		["bg-white border-r"]: !isDarkMode,
		["bg-black-500"]: isDarkMode,
	});

	const ToggleNavBarClass = classNames(
		"mt-10 mr-1.5 items-center rounded bg-light-lighter absolute right-0",
		{
			"rotate-180": !closeNav,
		},
	);

	// const OnMouseEnter = () => {
	//     // setIsToggleable(true);
	//     setIsHovered(true);
	// };

	// const OnMouseLeave = () => {
	//     // setIsToggleable(true);
	//     setIsHovered(false);
	// };

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

	// Used to loop the navigation bar items and use same design,
	const displayNavItems = (nav: { link: string; id: number }) => {
		const isActive = pathname === nav.link;
		return classNames(
			"flex items-center cursor-pointer hover:bg-slate-200 rounded w-full overflow-hidden whitespace-wrap dark:hover:bg-[#242729]",
			{
				["bg-light-lighter"]: activeNavBar?.id === nav.id,
				["bg-slate-200 dark:bg-[#242729]"]: isActive,
			},
		);
	};


	return (
		<div
			className={wrapper}
			onMouseEnter={handleHoverEnter}
			onMouseLeave={handleHoverLeave}
			style={{ transition: "width 300ms cubic-bezier(0.2, 0, 0, 1)" }}
		>
			<div className="flex flex-col">
				<div className="flex justify-between relative">
					{/* {(closeNav) && (
                        <div className="items-center h-10 absolute right-0 left-0 transform -rotate-90 text-lg font-bold text-text whitespace-nowrap w-10">
                            Event Management System
                        </div>
                    )} */}
					{/* The logo will take 3/4 width of the top side, */}
					<div className="w-3/4">
						<div className="flex items-center pl-1 gap-4">
							<span
								className={classNames(
									"mt-2 text-lg font-medium text-text",
									{
										hidden: closeNav && !isHovered,
									},
								)}>
								<Image
									src="/swinburne_logo.png"
									alt=""
									width={400}
									height={300}
								/>
							</span>
						</div>
					</div>
					{/* The arrow right and hamburger icon will take 1/4 width of the top side, */}
					<div className="w-1/4 flex items-center justify-center pb-10">
						<button
							className={ToggleNavBarClass}
							onClick={HandleNavBarToggle}>
							{closeNav ? (
								<HamburgerIcon />
							) : (
								<Image
									src="/images/arrow_right.png"
									alt=""
									width={27}
									height={27}
								/>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Use loop to loop through the navigation links, */}
			<div className="flex flex-col items-start mt-8 ">
				{NavLinks.map(({ icon: Icon, ...nav }) => {
					const NavLinkResults = displayNavItems(nav);
					return (
						<div className={NavLinkResults} key={nav.id}>
							{/* Use legacy behaviour to allow to wrap <a> tag inside <Link> tag, */}
							<Link href={nav.link} legacyBehavior={true}>
								<a className="flex py-[14px] px-2 items-center w-full h-full text-sm -mt-1text-slate-800">
									<Icon className="text-[24px] text-slate-800 dark:text-dark_text" />
									{/* If the navigation bar is not closed OR it is hovered, display the items, */}
									{(!closeNav || isHovered) && (
										<span
											className={classNames(
												"pl-5 text-md font-medium text-text-light dark:text-dark_text",
												{
													"text-slate-800": true
												}
											)}>
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
	);
};

export default NavigationBarDesktop;
