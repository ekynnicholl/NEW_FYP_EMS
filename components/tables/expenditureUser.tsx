import { useEffect, useState } from 'react';
import DoubleRightArrow from '@/components/icons/DoubleRightArrow';
import DoubleLeftArrow from '@/components/icons/DoubleLeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import LeftArrow from '@/components/icons/LeftArrow';
import exportCSV from "@/public/images/export_csv.png";
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

interface Props {
    itemsPerPage: number;
}

const ExpenditureUser: React.FC<Props> = ({ itemsPerPage }) => {
    const [expenditureData, setExpenditureData] = useState<ExpenditureDataType[]>([]);

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
        (acc, currentItem) => {
            const key = currentItem.staff_id;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(currentItem);
            return acc;
        },
        {} as Record<string, ExpenditureDataType[]>
    );

    const totalsData: ExpenditureDataType[] = Object.values(groupedData).map((group) => {
        const grandTotalFees = group.reduce((total, currentItem) => total + parseFloat(currentItem.grand_total_fees), 0);
        return {
            ...group[0],
            grand_total_fees: grandTotalFees.toFixed(2),
        };
    });

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentData = totalsData.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(expenditureData.length / itemsPerPage)) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        fetchFeedbackData();
        setCurrentPage(1);
    }, [itemsPerPage]);

    const pageCount = Math.ceil(expenditureData.length / itemsPerPage);

    const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

    return (
        <div>
            {expenditureData.length > 0 ? (
                <div>
                    <div className="">
                        <div className="mb-5">
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
                        </div>
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
                                        Program Name(s)
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
                                            Placeholder
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
            ) : (
                <div>
                    <p>No data available.</p>
                </div>
            )}
        </div>
    );
};

export default ExpenditureUser;
