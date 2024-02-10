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
import { FaBell } from "react-icons/fa";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { CiRead } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import toast from "react-hot-toast";

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
    const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);

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

    const handleNotificationAction = async (action: 'read' | 'delete', notifID: string) => {
        if (action === 'read') {
            const { data, error } = await supabase
                .from('notifications')
                .update({ notifIsRead: 1 })
                .eq('notifID', notifID);

            if (error) {
                toast.error('Technical error. Please contact the developers of the website... (HANDEL)');
                // console.error(`Error marking notification ${notifID} as read:`, error);
            } else {
                toast.success('Notification has been successfully marked as read.');
                // console.log(`Notification ${notifID} marked as read successfully.`, data);
            }
        } else if (action === 'delete') {
            const { data, error } = await supabase
                .from('notifications')
                .delete()
                .eq('notifID', notifID);

            if (error) {
                toast.error('Technical error. Please contact the developers of the website... (HANDEL)');
                // console.error(`Error deleting notification ${notifID}:`, error);
            } else {
                toast.success('Notification has been successfully deleted.');
                // console.log(`Notification ${notifID} deleted successfully.`, data);
            }
        }

        const { data: updatedData, error: updatedError } = await supabase
            .from('notifications')
            .select('notifID, notifDesc, notifIsRead, notifLink, notifCreatedAt')
            .order('notifCreatedAt', { ascending: false })
            .range(0, 9);

        if (updatedError) {
            toast.error('Technical error. Please contact the developers of the website... (HANUP)');
            // console.error('Error fetching updated notifications:', updatedError);
        } else {
            setNotifications(updatedData || []);
        };
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
                toast.error('Technical error. Please contact the developers of the website... (FENOTIF)');
                // console.error("Error fetching notifications:", error);
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
                    <DropdownMenuLabel>Notification(s)</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="h-[383px] overflow-auto w-[450px]">
                        {notifications.map((notification) => (
                            <DropdownMenuItem key={notification.notifID}
                            // className={`${notification.notifIsRead === 0 ? "bg-gray-200" : ""
                            //     }`}
                            >
                                <div className="items-center pl-2.5 cursor-pointer flex-1 flex hover:bg-gray-100 rounded-md dark:hover:bg-black-500 dark:text-dark_text"
                                    onMouseEnter={() => setHoveredNotification(notification.notifID)}
                                // onMouseLeave={() => setHoveredNotification(null)}
                                >
                                    <a
                                        className="flex flex-1"
                                        href={notification.notifLink}
                                        target="_blank"
                                    >
                                        <div className="flex items-center pl-2.5 cursor-pointer flex-1"
                                        >
                                            <div className="w-8 h-8 -mt-2 -ml-2 -mr-2">
                                                <FaBell className="dark:text-dark_text" />
                                            </div>
                                            <div className="flex flex-col justify-between pl-3 flex-grow">
                                                <div className="text-[12px] pt-2.5 text-justify pr-3">
                                                    {notification.notifDesc}
                                                </div>
                                                {/* Timestamp will be pushed to the end */}
                                                <div className="text-gray-400 text-[10px] cursor-pointer flex justify-start pr-3 pb-2.5 mt-1">
                                                    {timeAgo(notification.notifCreatedAt)}
                                                </div>
                                            </div>
                                            {hoveredNotification === notification.notifID && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger>
                                                        <BsThreeDotsVertical
                                                            size={25}
                                                            className="text-[20px] text-slate-900 -mt-[2px] bg-gray-200 rounded-full p-1"
                                                        />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent side="bottom" sideOffset={-4}>
                                                        <DropdownMenuLabel>Action(s)</DropdownMenuLabel>
                                                        <div className="cursor-pointer">
                                                            <div className="text-sm flex-grow flex flex-col pl-1">
                                                                <div className="hover:bg-gray-100 hover:text-gray-700 p-1.5 rounded-sm flex">
                                                                    <CiRead />
                                                                    <button
                                                                        className="cursor-pointer pl-1.5 -mt-0.5"
                                                                        onClick={() => handleNotificationAction('read', notification.notifID)}
                                                                    >
                                                                        Mark as Read
                                                                    </button>
                                                                </div>
                                                                <div className="hover:bg-gray-100 hover:text-gray-700 p-1.5 rounded-sm flex">
                                                                    <MdDelete />
                                                                    <button
                                                                        className="cursor-pointer pl-1.5 -mt-0.5"
                                                                        onClick={() => handleNotificationAction('delete', notification.notifID)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </a>
                                </div>
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