"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import classNames from "classnames";

import { FaHome } from "react-icons/fa";
import { IoAnalyticsOutline } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { FaWpforms } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaRegLightbulb } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

const NavLinks = [
	{ id: 1, name: "Home", icon: FaHome, link: "/homepage" },
	{ id: 2, name: "Analytical Visualization", icon: IoAnalyticsOutline, link: "/analytics" },
	{ id: 3, name: "Reports", icon: TbReportSearch, link: "/staffReport" },
	// { id: 4, name: "Chatbot", icon: HiOutlineChatBubbleBottomCenterText, link: "/chatbot" },
	{ id: 5, name: "Nominations Travelling Form", icon: FaWpforms, link: "/external" },
	{ id: 6, name: "Suggestions/ Update Logs", icon: FaRegLightbulb, link: "/suggestions" },
	{ id: 7, name: "Settings", icon: IoSettingsSharp, link: "/settings" },
];

const NavigationBarDesktop = () => {
	const [active, setActive] = useState(false);
	const pathname = usePathname();

	const activeNavBar = useMemo(() => NavLinks.find(nav => nav.link === pathname), [pathname]);

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
		<div className="md:block sm:hidden hover:w-auto w-14">
			<div className="flex justify-between">
				<Image src="/swinburne_logo.png" alt="" width={300} height={250} />
				<RxHamburgerMenu className="text-slate-800 dark:text-dark_text w-6" />
				{/* <IoIosArrowBack className="text-[35px] text-slate-800 dark:text-dark_text mt-[5px]" /> */}
			</div>

			{/* Use loop to loop through the navigation links, */}
			<div className="flex flex-col items-start mt-8">
				{NavLinks.map(({ icon: Icon, ...nav }) => {
					const NavLinkResults = displayNavItems(nav);
					return (
						<div className={NavLinkResults} key={nav.id}>
							{/* Use legacy behaviour to allow to wrap <a> tag inside <Link> tag, */}
							<Link href={nav.link} legacyBehavior={true}>
								<span className="flex py-[14px] px-2 items-center w-full h-full text-sm text-slate-800">
									<Icon
										className={`text-[${nav.id === 3 ? "27" : "26"}px] ${nav.id === 4 ? "mt-[2px]" : ""} ${
											nav.id === 3 ? "-ml-[0.5px]" : ""
										} text-slate-800 dark:text-dark_text`}
									/>

									{/* If the navigation bar is not closed OR it is hovered, display the items, */}
									<span
										className={classNames("pl-5 text-[15px] font-medium text-text-light dark:text-dark_text", {
											"text-slate-800": true,
										})}
									>
										{nav.name}
									</span>
								</span>
							</Link>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default NavigationBarDesktop;
