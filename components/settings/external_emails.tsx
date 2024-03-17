"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle } from "react-icons/io";
import React, { useState, useEffect, SetStateAction } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { HiPencilAlt } from "react-icons/hi";
import { BsFillTrash3Fill } from "react-icons/bs";
import { IoMdAdd, IoIosAddCircleOutline, IoIosCloseCircleOutline, IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { Tab } from '@headlessui/react';
import DeleteModal from "@/components/EditEvent_Modal";
import AddFacultyUnitModal from "@/components/EditEvent_Modal";

const AttendanceSettings = () => {
    const supabase = createClientComponentClient();
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('Verification');
    const [emails, setEmails] = useState<any[]>([]);
    const [editOption, setEditOption] = useState("");
    const [cancelOptionUpdate, setCancelOptionUpdate] = useState(false);
    const [updateOption, setUpdateOption] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        const fetchEmails = async () => {
            const { data, error } = await supabase
                .from("external_emails")
                .select("*");

            if (error) {
                return;
            }

            console.log(data);
            setEmails(data || []);
        };

        fetchEmails();
    }, [])

    return (
        <div className={`pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left transition-max-w duration-300 ease-in-out ${isExpanded ? 'max-w-full' : 'max-w-[25%]'}`}>
            <div className="flex items-center">
                <h1 className="font-bold text-[20px] dark:text-dark_text">External Forms Emails</h1>
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
                <div>
                    <div className="text-slate-900 dark:text-dark_text mb-3">
                        <p>Please take note,</p>
                        <p>Verification - Head of School/ Manager/ Associate Dean of Research</p>
                        <p>Approval - Head of Management Unit/ Dean</p>
                    </div>
                    <Tab.Group>
                        <Tab.List className="">
                            <Tab
                                className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 dark:hover:bg-[#2F3335] shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 focus:outline-none
                                        ${activeTab === 'Verification' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'}`}
                                onClick={() => setActiveTab('Verification')}>
                                Verification
                            </Tab>
                            <Tab
                                className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 dark:hover:bg-[#2F3335] shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 focus:outline-none
                                        ${activeTab === 'Approval' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]'}`}
                                onClick={() => setActiveTab('Approval')}>
                                Approval
                            </Tab>
                        </Tab.List>

                        <Tab.Panel>
                            <Tab.Panel>
                                <table className="w-1/2 float-left">
                                    <thead>
                                        <tr>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                No
                                            </th>

                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                <p className="-ml-56">Email</p>
                                            </th>

                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emails.map((emails, index) => (
                                            emails.extEID === editOption && updateOption && !cancelOptionUpdate && 1 ? (
                                                <tr key={index} className="">
                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4 ">
                                                        {index + 1}
                                                    </td>

                                                    <td className="flex-1 lg:px-[33px] py-3s border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                                                        <input type="text"
                                                            placeholder="Enter Faculty / Unit..."
                                                            className="border-2 ml-3 px-2 py-1 text-base w-full"
                                                        // value={editedFacultyName}
                                                        //  onChange={e => setEditedFacultyName(e.target.value)} 
                                                        />
                                                    </td>

                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-3/4">
                                                        <button
                                                            className="border-[0.5px] rounded-md bg-slate-900 p-2 text-white hover:bg-red-600 duration-300 ease-in-out"
                                                        // onClick={() => {
                                                        //     if (editedFacultyName.length > 0) {
                                                        //         setFacultyUnits(prevFacultyUnits => {
                                                        //             const updatedFacultyUnits = [...prevFacultyUnits];
                                                        //             updatedFacultyUnits[index].attsName = editedFacultyName;
                                                        //             return updatedFacultyUnits;
                                                        //         });

                                                        //         handleUpdateFacultyName(faculty.attsID, editedFacultyName);
                                                        //     }

                                                        //     setUpdateOption(false);
                                                        // }}
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            className="border-[0.5px] rounded-md bg-slate-100 ml-4 px-3 py-2  hover:bg-slate-200 duration-300 ease-in-out"
                                                        // onClick={() => { setCancelOptionUpdate(true); }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr key={index}>
                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-1/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                        {index + 1}
                                                    </td>

                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-left w-1/2 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                        <p className="ml-4">{emails.extEMail}</p>
                                                    </td>

                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-3/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                        <div className="flex ml-12">
                                                            <button onClick={() => {
                                                                // handleEditOption(faculty.attsID, faculty.attsName);
                                                            }}>
                                                                <HiPencilAlt className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
                                                            </button>
                                                            <button
                                                            // onClick={() => openDeleteModal(faculty.attsID, faculty.attsName)}
                                                            >
                                                                <BsFillTrash3Fill className="text-slate-700 hover:scale-105 ml-6 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </Tab.Panel>

                            <Tab.Panel>
                                <table className="w-1/2 float-left">
                                    <thead>
                                        <tr>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                No
                                            </th>

                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                <p className="-ml-56">Email</p>
                                            </th>

                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emails.map((emails, index) => (
                                            emails.extEID === editOption && updateOption && !cancelOptionUpdate ? (
                                                <tr key={index} className="">
                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4 ">
                                                        {index + 1}
                                                    </td>

                                                    <td className="flex-1 lg:px-[33px] py-3s border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                                                        <input type="text"
                                                            placeholder="Enter Faculty / Unit..."
                                                            className="border-2 ml-3 px-2 py-1 text-base w-full"
                                                        // value={editedFacultyName}
                                                        //  onChange={e => setEditedFacultyName(e.target.value)} 
                                                        />
                                                    </td>

                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-3/4">
                                                        <button
                                                            className="border-[0.5px] rounded-md bg-slate-900 p-2 text-white hover:bg-red-600 duration-300 ease-in-out"
                                                        // onClick={() => {
                                                        //     if (editedFacultyName.length > 0) {
                                                        //         setFacultyUnits(prevFacultyUnits => {
                                                        //             const updatedFacultyUnits = [...prevFacultyUnits];
                                                        //             updatedFacultyUnits[index].attsName = editedFacultyName;
                                                        //             return updatedFacultyUnits;
                                                        //         });

                                                        //         handleUpdateFacultyName(faculty.attsID, editedFacultyName);
                                                        //     }

                                                        //     setUpdateOption(false);
                                                        // }}
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            className="border-[0.5px] rounded-md bg-slate-100 ml-4 px-3 py-2  hover:bg-slate-200 duration-300 ease-in-out"
                                                        // onClick={() => { setCancelOptionUpdate(true); }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr key={index}>
                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-1/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                        {index + 1}
                                                    </td>

                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-left w-1/2 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                        <p className="ml-4">{emails.extEMail}</p>
                                                    </td>

                                                    <td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-3/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                                        <div className="flex ml-12">
                                                            <button onClick={() => {
                                                                // handleEditOption(faculty.attsID, faculty.attsName);
                                                            }}>
                                                                <HiPencilAlt className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
                                                            </button>
                                                            <button
                                                            // onClick={() => openDeleteModal(faculty.attsID, faculty.attsName)}
                                                            >
                                                                <BsFillTrash3Fill className="text-slate-700 hover:scale-105 ml-6 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </Tab.Panel>
                        </Tab.Panel>
                    </Tab.Group>
                </div>
            ) : (
                <div>
                    <p className="text-slate-900 dark:text-dark_text">Change the email options for HOS/ MGR/ ADCR/ HMU/ Dean in Nominations/ Travelling Form's (NTF) for verification and approval.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceSettings;


