import { useEffect, useState } from 'react';
import DoubleRightArrow from '@/components/icons/DoubleRightArrow';
import DoubleLeftArrow from '@/components/icons/DoubleLeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import LeftArrow from '@/components/icons/LeftArrow';

type AttendanceDataType = {
    attFormsID: string;
    attFSubEventID: string;
    attFormsStaffID: string;
    attFormsStaffName: string;
    attFormsFacultyUnit: string;
};

interface Props {
    attendanceData: AttendanceDataType[];
    itemsPerPage: number;
}

const AttendanceTable: React.FC<Props> = ({ attendanceData, itemsPerPage }) => {
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

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    const pageCount = Math.ceil(attendanceData.length / itemsPerPage);

    const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

    return (
        <div>
            <div className="">
                <table className="lg:w-full w-auto">
                    <thead>
                        <tr>
                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">
                                Staff ID
                            </th>
                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Staff Name
                            </th>
                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Faculty/ Unit
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination flex justify-end items-end mt-5">
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

                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        className={`py-1 px-3 lg:ml-1 lg:mr-1 ml-2 mr-2 rounded font-medium text-sm lg:text-[15px] text-slate-800 bg-slate-200 ${currentPage === pageNumber ? 'currentPage' : 'page-item'
                            }`}
                        onClick={() => handlePageChange(pageNumber)}
                    >
                        {pageNumber}
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
    );
};

export default AttendanceTable;
