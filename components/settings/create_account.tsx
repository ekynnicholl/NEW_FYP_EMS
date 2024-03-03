"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle } from "react-icons/io";
import React, { useState } from 'react';

const CreateAdminAccount = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    return (

        <div className={`pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left transition-max-w duration-300 ease-in-out ${isExpanded ? 'max-w-full' : 'max-w-[25%]'}`}>
            <div className="flex items-center">
                <h1 className="font-bold text-[20px] dark:text-dark_text">Administrator Account Registration</h1>
                <div onClick={toggleExpansion} className="ml-auto cursor-pointer">
                    {isExpanded ? (
                        <IoMdArrowDropleftCircle className="text-[30px] dark:text-dark_text" />
                    ) : (
                        <IoMdArrowDroprightCircle className="text-[30px] dark:text-dark_text" />
                    )}
                </div>
            </div>
            <div className="border-t border-gray-300 my-2"></div>
            {isExpanded ? (
                <div className="overflow-y-auto max-h-80">
                    <p className="text-slate-800 dark:text-dark_text">Placeholder</p>
                </div>
            ) : (
                <div>
                    <p className="text-slate-800 dark:text-dark_text">Register an account for new administrator with their own email and password.</p>
                </div>
            )}
        </div>
    );
};

export default CreateAdminAccount;