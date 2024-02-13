"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CiRead } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';

interface Notification {
    notifID: string;
    notifAccID: string;
    notifDesc: string;
    notifIsRead: number;
    notifType: string;
    notifLink: string;
    notifCreatedAt: string;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const supabase = createClientComponentClient();
    const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        const fetchNotifications = async () => {
            let query = supabase
                .from('notifications')
                .select('*')
                .order('notifCreatedAt', { ascending: false })

            if (selectedTab === 'unread') {
                query = query.eq('notifIsRead', 0);
            }

            const { data, error } = await query;

            if (error) {
                toast.error('Technical error. Please contact the developers of the website... (FENOTIF)');
                // console.error('Error fetching notifications:', error);
            } else {
                setNotifications(data || []);
            }
        };

        fetchNotifications();
    }, [selectedTab]);

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
        if (interval >= 1) {
            if (interval === 1) {
                return `${interval} day ago`;
            } else {
                return `${interval} days ago`;
            }
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
                toast.error('Technical error. Please contact the developers of the website... (HANREAD)');
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
            .select('*')
            .order('notifCreatedAt', { ascending: false })
            .range(0, 9);

        if (updatedError) {
            toast.error('Technical error. Please contact the developers of the website... (HANUP)');
            // console.error('Error fetching updated notifications:', updatedError);
        } else {
            setNotifications(updatedData || []);
        };
    };

    return (
        <div className="h-screen dark:bg-dark_mode_bg">
            <div className="flex-1 w-full lg:w-1/2 ">
                <div className="flex-1 mx-auto px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg">
                    <div className="p-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card max-h-screen overflow-auto">
                        <div className="pl-3">
                            <h1 className="text-xl font-bold dark:text-dark_text">Notification(s)</h1>
                            <div className="border-t border-gray-300 my-2"></div>
                            <div className="flex items-center my-2 mt-2">
                                <button
                                    className={`mr-2 py-2 px-4 rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 hover:text-white ${selectedTab === 'all' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                                    onClick={() => setSelectedTab('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`py-2 px-4 rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 hover:text-white ${selectedTab === 'unread' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                                    onClick={() => setSelectedTab('unread')}
                                >
                                    Unread
                                </button>
                            </div>
                        </div>
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.notifID}
                                    className="items-center hover:bg-gray-100 rounded-md dark:hover:bg-black-500 dark:text-dark_text cursor-pointer hover:text-gray-700 flex-1 flex"
                                    onMouseEnter={() => setHoveredNotification(notification.notifID)}
                                >
                                    <a
                                        href={notification.notifLink}
                                        target="_blank"
                                        className="flex flex-1"
                                    >
                                        <div className="w-full p-3 cursor-pointer ">
                                            <div>
                                                <p><span className="font-bold">[{notification.notifType}]</span> {notification.notifDesc}</p>
                                            </div>
                                            <div className="text-gray-400 text-xs flex justify-start pt-2">
                                                {timeAgo(notification.notifCreatedAt)}
                                            </div>
                                        </div>
                                    </a>
                                    {hoveredNotification === notification.notifID && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <BsThreeDotsVertical
                                                    size={30}
                                                    className="-mt-[2px] bg-gray-200 rounded-full p-1.5 text-black-500"
                                                />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="bottom" sideOffset={-4}>
                                                <DropdownMenuLabel>Action(s)</DropdownMenuLabel>
                                                <div className="cursor-pointer">
                                                    <div className="text-sm flex-1 flex flex-col pl-1">
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
                            ))
                        ) : (
                            <div>
                                {selectedTab == 'all' ? (
                                    <div className="text-gray-400 text-[12px] text-center">
                                        You&apos;re all caught up! You have no new notifications.
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-[12px] text-center">
                                        You&apos;re all caught up! You have no unread notifications.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default NotificationsPage;