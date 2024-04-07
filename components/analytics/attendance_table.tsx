"use client";

import PencilNoteIcon from "@/components/icons/PencilNoteIcon";
import DoubleRightArrow from '@/components/icons/DoubleRightArrow';
import DoubleLeftArrow from '@/components/icons/DoubleLeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import LeftArrow from '@/components/icons/LeftArrow';
import { ChangeEvent, useEffect, useState } from "react";

interface Props {
    staffDetails: Array<{ staffName: string; staffID: string; dateSubmitted: string }>;
}

const AttendanceList: React.FC<Props> = ({ staffDetails }) => {
    const [searchAttendanceQuery, setSearchAttendanceQuery] = useState("");

    // This is for attendance table in homepage pagination,
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
    };

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const filteredData = staffDetails.filter((item) =>
        item.staffName.toLowerCase().includes(searchAttendanceQuery.toLowerCase()) ||
        item.staffID.toLowerCase().includes(searchAttendanceQuery.toLowerCase())
    );

    const currentData = filteredData.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(staffDetails.length / itemsPerPage)) {
            setCurrentPage(page);
        }
    };

    const formatDate = (timestamp: string) => {
        const dateObj = new Date(timestamp);
        const date = dateObj.toDateString();
        const time = dateObj.toLocaleTimeString();
        return { date, time };
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    const pageCount = Math.ceil(filteredData.length / itemsPerPage)

    const generatePageNumbers = (): number[] => {
        const displayedPages = 5;
        const halfDisplayed = Math.floor(displayedPages / 2);

        if (pageCount <= displayedPages) {
            return Array.from({ length: pageCount }, (_, index) => index + 1);
        }

        const start = Math.max(currentPage - halfDisplayed, 1);
        const end = Math.min(start + displayedPages - 1, pageCount);

        const pages: number[] = [];

        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push(-1);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < pageCount) {
            if (end < pageCount - 1) {
                pages.push(-1);
            }
            pages.push(pageCount);
        }

        return pages;
    };

    const handleAttendanceSearch = (query: string) => {
        setSearchAttendanceQuery(query);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [staffDetails])

    return (
        <div>
            <div className="lg:flex lg:flex-row relative h-[90vh]">
                <div className="w-full">
                    <div className="flex items-start justify-start text-text text-[20px] text-center">
                        <PencilNoteIcon />{" "}
                        <span className="ml-5 lg:-mt-1 lg:text-[20px] text-[16px]">Attendance List</span>
                    </div>
                    <div className="text-left text-black lg:text-[13px] text-[12px] pb-5 ml-11">
                        Total Attendees: {staffDetails.length}
                    </div>

                    {/* This is to loop through the attendance data. */}
                    {staffDetails && staffDetails.length > 0 ? (
                        <div className="lg:text-[16px] text-[12px]">
                            <div className="flex items-center justify-between mb-5">
                                {/* Show entries */}
                                <div className="items-center hidden lg:flex">
                                    <label htmlFor="itemsPerPageSelect">Show entries:</label>
                                    <select
                                        id="itemsPerPageSelect"
                                        name="itemsPerPage"
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="ml-2 h-full rounded-l border bg-white border-gray-400 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                    </select>
                                </div>

                                {/* Search Input */}
                                <div className="relative shadow hover:shadow-sm border border-slate-300 rounded">
                                    <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-4 w-4 fill-current text-gray-500"
                                        >
                                            <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                                        </svg>
                                    </span>
                                    <input
                                        placeholder="Search here..."
                                        className="appearance-none rounded-md block pl-8 pr-6 py-2 bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none dark:bg-dark_mode_card dark:border-[#2E3E50] dark:placeholder:text-[#484945]"
                                        value={searchAttendanceQuery}
                                        onChange={e => handleAttendanceSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto">
                                {staffDetails.length > 0 ? (
                                    <div>
                                        <div className="w-full">
                                            <table className="lg:w-full w-auto">
                                                <thead>
                                                    <tr>
                                                        <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">
                                                            No.
                                                        </th>
                                                        <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                            Staff/ Student ID
                                                        </th>
                                                        <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                            Date Submitted
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentData.map((attendanceItem, index) => (
                                                        <tr key={index}>
                                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                                {index + 1}
                                                            </td>
                                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                                {attendanceItem.staffName}
                                                            </td>
                                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                                {attendanceItem.staffID}
                                                            </td>
                                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                                {formatDate(attendanceItem.dateSubmitted).date} - {formatDate(attendanceItem.dateSubmitted).time}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination for Desktop */}
                                        <div className="hidden lg:block">
                                            <div className="pagination flex justify-end items-end mt-5 pb-5">
                                                <button
                                                    className="opacity-70 ml-2"
                                                    onClick={() => handlePageChange(1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    <DoubleLeftArrow />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="opacity-70 ml-2 mr-2"
                                                >
                                                    <LeftArrow />
                                                </button>

                                                {generatePageNumbers().map((pageNumber, index) => (
                                                    <button
                                                        key={index}
                                                        className={`py-1 px-3 lg:ml-1 lg:mr-1 ml-2 mr-2 rounded font-medium text-sm lg:text-[15px] ${currentPage === pageNumber ? "text-slate-100 bg-slate-900" : "text-slate-800 bg-slate-200"
                                                            }`}
                                                        onClick={() => handlePageChange(pageNumber)}
                                                    >
                                                        {pageNumber === -1 ? '...' : pageNumber}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === pageCount}
                                                    className="opacity-70 ml-2 mr-2"
                                                >
                                                    <RightArrow />
                                                </button>
                                                <button
                                                    className="opacity-70 mr-2"
                                                    onClick={() => handlePageChange(pageCount)}
                                                    disabled={currentPage === pageCount}
                                                >
                                                    <DoubleRightArrow />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Pagination for Mobile */}
                                        <div className="block lg:hidden">
                                            <div className="pagination flex justify-center items-center mt-5 pb-5">
                                                <button
                                                    className="opacity-70 ml-2"
                                                    onClick={() => handlePageChange(1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    <DoubleLeftArrow />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="opacity-70 ml-2 mr-2"
                                                >
                                                    <LeftArrow />
                                                </button>

                                                <button
                                                    className={`py-1 px-3 lg:ml-1 lg:mr-1 ml-2 mr-2 rounded font-medium text-sm lg:text-[15px] text-slate-100 bg-slate-900`}
                                                    onClick={() => handlePageChange(currentPage)}
                                                >
                                                    {currentPage}/ {pageCount}
                                                </button>

                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === pageCount}
                                                    className="opacity-70 ml-2 mr-2"
                                                >
                                                    <RightArrow />
                                                </button>

                                                <button
                                                    className="opacity-70 mr-2"
                                                    onClick={() => handlePageChange(pageCount)}
                                                    disabled={currentPage === pageCount}
                                                >
                                                    <DoubleRightArrow />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>No data available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-600 mt-4">
                            No attendance data available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceList;