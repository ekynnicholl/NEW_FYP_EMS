"use client";

import React, { useEffect, useState } from 'react';

const BottomLeftPopup = () => {
    const [isPopupVisible, setIsPopupVisible] = useState(true);
    const [countdown, setCountdown] = useState(5);

    const closePopup = () => {
        setIsPopupVisible(false);
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        const timeoutId = setTimeout(() => {
            closePopup();
        }, 5000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [isPopupVisible]);

    return (
        <div
            className={`cursor-pointer fixed bottom-0 right-0 m-4 p-2 bg-white border border-gray-300 rounded shadow-md dark:bg-dark_mode_card transition-opacity duration-500 ease-in-out ${isPopupVisible ? 'opacity-100' : 'opacity-0'
                } max-w-[200px]`}
            onClick={closePopup}
        >
            <div className="flex flex-col">
                <div className="p-2 text-justify">
                    <p className="text-lg font-bold">NOTICE</p>
                    <p className="text-md">Are you looking for a way to view your past submitted forms? Click <span className="text-blue-500"><a href="../../ntf_view">here</a></span>.</p>
                    <p className="text-xs">Closing in {countdown} seconds...</p>
                </div>
            </div>
        </div>
    );
};

export default BottomLeftPopup;