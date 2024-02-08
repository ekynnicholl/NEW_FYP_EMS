"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdNotificationsActive } from "react-icons/md";
import NotifIcon from "@/components/icons/NotifIcon";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

interface Notification {
    notifID: string;
    notifDesc: string;
    notifIsRead: number;
    notifLink: string;
    notifCreatedAt: string;
}

const Notification = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const supabase = createClientComponentClient();

    const timeAgo = (timestamp: string | number | Date) => {
        const now = new Date();
        const createdAt = new Date(timestamp);

        const seconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return `${interval} years ago`;
        }

        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return `${interval} months ago`;
        }

        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return `${interval} days ago`;
        }

        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return `${interval} hours ago`;
        }

        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return `${interval} minute${interval === 1 ? "" : "s"} ago`;
        }

        return `${Math.floor(seconds)} seconds ago`;
    };

    useEffect(() => {
        // Fetch latest 10 notifications
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from("notifications")
                .select("notifID, notifDesc, notifIsRead, notifLink, notifCreatedAt")
                .order("notifCreatedAt", { ascending: false })
                .range(0, 9);

            if (error) {
                console.error("Error fetching notifications:", error);
            } else {
                setNotifications(data || []);
            }
        };

        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(notification => notification.notifIsRead === 0).length;

    return (
        <div className="cursor-pointer">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="rounded-full bg-slate-100 opacity-80 mt-[4px] p-2 hover:opacity-90 dark:bg-[#1D1F1F]">
                        <MdNotificationsActive className="text-[25px] text-slate-900 dark:text-dark_text -mt-[2px]" />
                        {unreadCount > 0 && (
                            <div className="absolute top-3 right-64 h-5 w-5 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">
                                {unreadCount}
                            </div>
                        )}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" sideOffset={-4}>
                    <DropdownMenuLabel>Notification</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="h-[383px] overflow-auto w-[450px]">
                        {notifications.map((notification) => (
                            <DropdownMenuItem key={notification.notifID}
                            // className={`${notification.notifIsRead === 0 ? "bg-gray-200" : ""
                            //     }`}
                            >
                                <a
                                    href={notification.notifLink}
                                    className="flex items-center hover:bg-gray-100 pl-2.5 cursor-pointer hover:text-gray-700 flex-1"
                                    target="_blank"
                                >
                                    <div className="flex items-center hover:bg-gray-100 pl-2.5 cursor-pointer hover:text-gray-700 flex-1">
                                        <div className="w-8 h-8 -mt-2 -ml-2 -mr-2">
                                            <NotifIcon />
                                        </div>
                                        <div className="flex flex-col justify-between pl-3 flex-grow">
                                            <div className="text-[12px] text-gray-700 hover:text-gray-900 pt-2.5 text-justify pr-3">
                                                {notification.notifDesc}
                                            </div>
                                            {/* Timestamp will be pushed to the end */}
                                            <div className="text-gray-400 text-[10px] cursor-pointer flex justify-start pr-3 pb-2.5 mt-1">
                                                {timeAgo(notification.notifCreatedAt)}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </DropdownMenuItem>
                        ))}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <a href="/notifications">
                            <div className="text-center text-blue-500 cursor-pointer">
                                View All Notification(s)
                            </div>
                        </a>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default Notification;