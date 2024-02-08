"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

    useEffect(() => {

        // Fetch notifications
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('notifCreatedAt', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching notifications:', error);
            } else {
                setNotifications(data || []);
            }
        };

        fetchNotifications();
    }, []);

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

    return (
        <div className="h-screen">
            <div className="flex-1 w-full lg:w-1/2">
                <div className="flex-1 mx-auto px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg">
                    <div className="p-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card">
                        <h1 className="text-xl font-bold">Notifications</h1>
                        <div className="border-t border-gray-300 my-2"></div>
                        {notifications.map((notification) => (
                            <div key={notification.notifID}>
                                <a href={notification.notifLink} target="_blank">
                                    <div className="w-full p-5 cursor-pointer hover:bg-gray-100 rounded-md">
                                        <div>
                                            <p><span className="font-bold">[{notification.notifType}]</span> {notification.notifDesc}</p>
                                        </div>
                                        <div className="text-gray-400 text-xs flex justify-start pt-2">
                                            {timeAgo(notification.notifCreatedAt)}
                                        </div>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default NotificationsPage;