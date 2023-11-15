import { ChangeEvent, useEffect, useState } from 'react';
import DoubleRightArrow from '@/components/icons/DoubleRightArrow';
import DoubleLeftArrow from '@/components/icons/DoubleLeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import LeftArrow from '@/components/icons/LeftArrow';
import exportCSV from "@/public/images/export_csv.png";
import arrowLeft from "@/public/images/arrow_left.png";
import arrowRight from "@/public/images/arrow_right.png";
import skipLeft from "@/public/images/skip_left.png";
import skipRight from "@/public/images/skip_right.png";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type ExpenditureDataType = {
    id: string;
    full_name: string;
    staff_id: string;
    faculty: string;
    program_title: string;
    commencement_date: string;
    completion_date: string;
    grand_total_fees: string;
};


const ExpenditureUser = () => {
    const [expenditureData, setExpenditureData] = useState<ExpenditureDataType[]>([]);

    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
    };

    const supabase = createClientComponentClient();
    const fetchFeedbackData = async () => {
        try {
            const { data, error } = await supabase
                .from('external_forms')
                .select('id, full_name, staff_id, faculty, program_title, commencement_date, completion_date, grand_total_fees');
            if (error) {
                throw error;
            }
            setExpenditureData(data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };

    const groupedData: Record<string, ExpenditureDataType[]> = expenditureData.reduce(
        (sid, currentItem) => {
            // Map and reduce,
            const key = currentItem.staff_id.trim();
            if (!sid[key]) {
                sid[key] = [];
            }
            sid[key].push(currentItem);
            return sid;
        },
        {} as Record<string, ExpenditureDataType[]>
    );

    const totalsData: ExpenditureDataType[] = Object.values(groupedData).map((group) => {
        // Map and reduce,
        const grandTotalFees = group.reduce((total, currentItem) => total + parseFloat(currentItem.grand_total_fees), 0);
        return {
            ...group[0],
            grand_total_fees: grandTotalFees.toFixed(2),
        };
    });

    totalsData.sort((a, b) => {
        const totalA = parseFloat(a.grand_total_fees);
        const totalB = parseFloat(b.grand_total_fees);

        return totalB - totalA;
    });


    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentData = totalsData.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(totalsData.length / itemsPerPage)) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        fetchFeedbackData();
        setCurrentPage(1);
    }, [itemsPerPage]);

    const pageCount = Math.ceil(totalsData.length / itemsPerPage);

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
            {totalsData.length > 0 ? (
                <div>
                    <div className="">
                        {/* <div className="mb-5">
                            <button
                                type="button"
                                className="flex rounded-md items-center py-2 px-4 mr-3 font-medium hover:bg-slate-300 bg-slate-200 shadow-sm md:inline-flex dark:bg-[#242729]"
                            >
                                <img
                                    src={exportCSV.src}
                                    alt=""
                                    width={14}
                                    className="text-slate-800"
                                />
                                <span className="ml-2 text-slate-800 dark:text-dark_text">Export to CSV</span>
                            </button>
                        </div> */}
                        <div className="-mx-4 hidden sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto lg:block">
                            <div className="inline-block min-w-full shadow rounded-sm overflow-hidden">
                                <table className="lg:w-full w-auto">
                                    <thead>
                                        <tr>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">
                                                Staff Name (Staff ID)
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                Faculty
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                Grand Total (RM)
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                                Program Name(s) - Total (RM)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.map((expenditureItem) => (
                                            <tr key={expenditureItem.id}>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                    {expenditureItem.full_name} ({expenditureItem.staff_id})
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                    {expenditureItem.faculty}
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                    {expenditureItem.grand_total_fees}
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                    {groupedData[expenditureItem.staff_id]?.map((programItem) => (
                                                        <div key={programItem.id}>
                                                            {programItem.program_title} - {Number(programItem.grand_total_fees).toFixed(2)}
                                                        </div>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <label htmlFor="itemsPerPageSelect" className="mr-2">
                                Show entries:
                            </label>
                            <select
                                id="itemsPerPageSelect"
                                name="itemsPerPage"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="h-full rounded-l border bg-white border-gray-400 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                        </div>

                        {/* Pagination */}
                        <div className="pagination justify-end mt-5 pb-5 ems-center hidden lg:flex">
                            <button
                                className={`py-2 px-1 ml-5 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                <img
                                    src={skipLeft.src}
                                    alt=""
                                    width={20}
                                    className="lg:w-[22px]"
                                />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`py-2 px-1 ml-5 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                            >
                                <img
                                    src={arrowLeft.src}
                                    alt=""
                                    width={12}
                                    className="lg:w-[13px]"
                                />
                            </button>

                            {generatePageNumbers().map((pageNumber, index) => (
                                <button
                                    key={index}
                                    className={`py-1 px-3 ml-5 rounded font-medium text-sm lg:text-[15px] ${currentPage === pageNumber ? "text-slate-100 bg-slate-900" : "text-slate-800 bg-slate-200"
                                        }`}
                                    onClick={() => handlePageChange(pageNumber)}
                                >
                                    {pageNumber === -1 ? '...' : pageNumber}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pageCount}
                                className={`py-2 px-1 ml-5 ${currentPage === pageCount ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                            >
                                <img
                                    src={arrowRight.src}
                                    alt=""
                                    width={12}
                                    className="lg:w-[13px]"
                                />
                            </button>
                            <button
                                className={`py-2 px-1 ml-5 ${currentPage === pageCount ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                                onClick={() => handlePageChange(pageCount)}
                                disabled={currentPage === pageCount}
                            >
                                <img
                                    src={skipRight.src}
                                    alt=""
                                    width={17}
                                    className="lg:w-[18px]"
                                />
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
    );
};

export default ExpenditureUser;
