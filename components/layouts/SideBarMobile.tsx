"use client";

import { useMemo } from "react";
import Link from "next/link";

import classNames from "classnames";
import HomeIcon from "@/components/icons/HomeIcon";
import FormsIcon from "@/components/icons/FormsIcon";
import AddIcon from "@/components/icons/AddIcon";
import ReportIcon from "@/components/icons/ReportIcon";
import NotifIconMobile from "@/components/icons/NotifIconMobile";

import { usePathname } from "next/navigation";

const NavLinks = [
    { id: 1, name: "Home", icon: HomeIcon, link: "/dashboard" },
    { id: 2, name: "Notifications", icon: NotifIconMobile, link: "/notifications" },
    { id: 3, name: "Add Events", icon: AddIcon, link: "/test1" },
    { id: 4, name: "Reports", icon: ReportIcon, link: "/analytics" },
    { id: 5, name: "NT Forms", icon: FormsIcon, link: "/staffReport" },
    { id: 6, name: "EMAT Chatbot", icon: FormsIcon, link: "/chatbot" },
];

const NavigationBarMobile = () => {
    const pathname = usePathname();

    const activeNavBar = useMemo(
        () => NavLinks.find(nav => nav.link === pathname),
        [pathname],
    );

    const displayNavItems = (nav: { link: string; id: number }) => {
        const isActive = pathname === nav.link;
        return classNames(
            "flex items-center justify-center cursor-pointer hover:bg-slate-200 rounded w-full overflow-hidden whitespace-wrap p-2.5",
            {
                ["bg-light-lighter"]: activeNavBar?.id === nav.id,
                ["bg-slate-200"]: isActive,
            }
        );
    };

    return (
        <div
            className={classNames(
                " bg-white fixed bottom-0 left-0 right-0 z-[999]",
                "flex justify-between"
            )}
        >
            <div className="flex justify-between w-full hidden">
                {NavLinks.map(({ icon: Icon, ...nav }) => {
                    const navItemClassName = displayNavItems(nav); // Call the function here

                    return (
                        <div
                            className={navItemClassName} // Assign the result to className
                            key={nav.id}
                        >
                            <Link href={nav.link} legacyBehavior={true}>
                                <a className="flex pt-1 items-center justify-center w-full h-full text-sm -mt-1">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`rounded-full flex items-center justify-center ${pathname === nav.link ? "opacity-100" : "opacity-60"
                                                }`}
                                        >
                                            <Icon />
                                        </div>
                                        <div className={`mt-2 text-xs ${pathname === nav.link ? "opacity-100" : "opacity-60"
                                            }`}>{nav.name}</div>
                                    </div>
                                </a>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NavigationBarMobile;