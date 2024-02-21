"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";

interface VerifiedAccesProps {
    atExpiredAt: string | null;
    atCreatedAt: string | null;
    token: string;
}

const VerifiedAccess: React.FC<VerifiedAccesProps> = ({ atExpiredAt, atCreatedAt, token }) => {
    const supabase = createClientComponentClient();
    const [timeRemaining, setTimeRemaining] = useState<string | null>('Processing...');
    const [atExpiredAtNew, setAtExpiredAtNew] = useState<string | null>(null);
    const [expiredClicked, setExpiredClicked] = useState<boolean>(false);

    const updateExpiration = async () => {
        try {
            await supabase
                .from('access_tokens')
                .update({ atExpiredAt: new Date().toISOString() })
                .eq('atID', token);

            setAtExpiredAtNew(new Date().toISOString());
            setExpiredClicked(true);
            toast.success("Access token has been disabled. You won't be able to use this access token anymore.");
        } catch (error) {
            // console.error('Error updating expiration:', error);
            toast.error('Access token failed to be disabled. Please contact the webmaster.');
        }
    };

    useEffect(() => {
        if (atCreatedAt && atExpiredAt) {
            const createdAtTime = new Date(atCreatedAt);
            const expiredAtTime = new Date(atExpiredAt);

            const interval = setInterval(() => {
                const now = new Date();
                const remaining = expiredAtTime.getTime() - now.getTime();

                if (remaining > 0) {
                    const hours = Math.floor(remaining / (60 * 60 * 1000));
                    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

                    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
                } else {
                    clearInterval(interval);
                    setTimeRemaining("Expired");
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [atCreatedAt, atExpiredAt]);

    const formattedDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZoneName: 'short',
        };

        return date.toLocaleString('en-US', options);
    };

    const isExpiredBool = atExpiredAt && new Date() > new Date(atExpiredAt);

    return (
        <div className="mt-3 p-5">
            <div className="text-justify pr-5">
                <p className="text-sm italic mt-1">Take note that your access tokens have a life span of 4 hours. After 4 hours, you will need to request for a new access token to be able to access this list.</p>
            </div>

            {atCreatedAt && (
                <p className="text-sm mt-2 mb-2 text-left">
                    Access token generated at: {formattedDate(atCreatedAt)} (Expires in: {timeRemaining})
                </p>
            )}

            {!isExpiredBool && (
                <button
                    onClick={updateExpiration}
                    disabled={expiredClicked}
                    className={`${expiredClicked ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500'
                        } text-white font-bold py-[11px] lg:py-3 px-8 rounded focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm lg:text-base`}
                >
                    Disable Access Token
                </button>
            )}
        </div>
    )
};

export default VerifiedAccess;