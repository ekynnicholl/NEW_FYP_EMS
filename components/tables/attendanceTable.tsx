import { useEffect, useState } from 'react';
import DoubleRightArrow from '@/components/icons/DoubleRightArrow';
import DoubleLeftArrow from '@/components/icons/DoubleLeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import LeftArrow from '@/components/icons/LeftArrow';
import exportCSV from "@/public/images/export_csv.png";

type AttendanceDataType = {
    attFormsID: string;
    attFSubEventID: string;
    attFormsStaffID: string;
    attFormsStaffName: string;
    attFormsFacultyUnit: string;
    attDateSubmitted: string;
    sub_eventName: string;
};

interface Props {
    attendanceData: AttendanceDataType[];
    itemsPerPage: number;
    isAllTabActive: boolean;
}

const convertToCSV = (data: AttendanceDataType[], columnMapping: ColumnMapping) => {
    const header = Object.keys(columnMapping).map((key) => columnMapping[key]).join(',');
    const body = data.map((row) => {
        const newRow = { ...row };

        Object.keys(columnMapping).forEach((key) => {
            if (key === 'attDateSubmitted') {
                const formattedDate = convertDateToLocale(newRow[key as keyof AttendanceDataType]);
                newRow[key as keyof AttendanceDataType] = formattedDate.includes(',')
                    ? `"${formattedDate}"`
                    : formattedDate;
            } else if (typeof newRow[key as keyof AttendanceDataType] === 'string' && newRow[key as keyof AttendanceDataType].includes(',')) {
                newRow[key as keyof AttendanceDataType] = `"${newRow[key as keyof AttendanceDataType]}"`;
            }
        });

        return Object.keys(columnMapping).map((key) => newRow[key as keyof AttendanceDataType]).join(',');
    }).join('\n');
    return `${header}\n${body}`;
};

type ColumnMapping = {
    [key: string]: string;
};

const convertDateToLocale = (utcDate: string) => {
    const utcDateTime = new Date(utcDate);
    const localDateTime = utcDateTime.toLocaleString(undefined, {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    return localDateTime;
};

const columnMapping: ColumnMapping = {
    attFormsStaffID: 'Staff/ Student ID',
    attFormsStaffName: 'Staff Name',
    attFormsFacultyUnit: 'Faculty/Unit',
    sub_eventName: 'Session',
    attDateSubmitted: 'Date Submitted',
};

const downloadCSV = (data: AttendanceDataType[]) => {
    const firstRow = data[0];
    const subEventName = firstRow ? firstRow.sub_eventName : '';

    const csv = convertToCSV(data, columnMapping);

    // Create a data URI for the CSV content
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // a.download = `attendance_data_${subEventName}.csv`;
    a.download = `attendance_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
};

const AttendanceTable: React.FC<Props> = ({ attendanceData, itemsPerPage, isAllTabActive }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentData = attendanceData.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(attendanceData.length / itemsPerPage)) {
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

    const pageCount = Math.ceil(attendanceData.length / itemsPerPage);

    // const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

    const generatePageNumbers = (): number[] => {
        const displayedPages = 5; // Adjust the number of pages to display
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
                pages.push(-1); // Ellipsis
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < pageCount) {
            if (end < pageCount - 1) {
                pages.push(-1); // Ellipsis
            }
            pages.push(pageCount);
        }

        return pages;
    };

    return (
        <div>
            {attendanceData.length > 0 ? (
                <div>
                    <div className="">
                        <div className="mb-5">
                            <button
                                type="button"
                                className="flex rounded-md items-center py-2 px-4 mr-3 font-medium hover:bg-slate-300 bg-slate-200 shadow-sm md:inline-flex dark:bg-[#242729]"
                                onClick={() => downloadCSV(attendanceData)}>
                                <img
                                    src={exportCSV.src}
                                    alt=""
                                    width={14}
                                    className="text-slate-800"
                                />
                                <span className="ml-2 text-slate-800 dark:text-dark_text">Export to CSV</span>
                            </button>
                        </div>
                        <table className="lg:w-full w-auto">
                            <thead>
                                <tr>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">
                                        Staff/ Student ID
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        Faculty/ Unit
                                    </th>
                                    {isAllTabActive && (
                                        <th className={`flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider`}>
                                            Sub-Event
                                        </th>
                                    )}
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        Date Submitted
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((attendanceItem) => (
                                    <tr key={attendanceItem.attFormsID}>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {attendanceItem.attFormsStaffID}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {attendanceItem.attFormsStaffName}
                                        </td>
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {attendanceItem.attFormsFacultyUnit}
                                        </td>
                                        {isAllTabActive && (
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                {attendanceItem.sub_eventName}
                                            </td>
                                        )}
                                        <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            {formatDate(attendanceItem.attDateSubmitted).date}
                                            <br />
                                            {formatDate(attendanceItem.attDateSubmitted).time}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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
            ) : (
                <div>
                    <p>No data available.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceTable;
