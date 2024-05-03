import { ChangeEvent, useEffect, useState } from 'react';
import DoubleRightArrow from '@/components/icons/DoubleRightArrow';
import DoubleLeftArrow from '@/components/icons/DoubleLeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import LeftArrow from '@/components/icons/LeftArrow';
import { MdKeyboardDoubleArrowLeft, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowRight, MdAttachMoney } from "react-icons/md";
import { FaSortAlphaDown, FaSortNumericDown } from "react-icons/fa";
import { IoMdRefresh} from "react-icons/io";
import exportCSV from "@/public/images/export_csv.png";
import arrowLeft from "@/public/images/arrow_left.png";
import arrowRight from "@/public/images/arrow_right.png";
import skipLeft from "@/public/images/skip_left.png";
import skipRight from "@/public/images/skip_right.png";
import filterBar from "@/public/images/filter_bar_black.png";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import * as XLSX from 'xlsx';
import Image from "next/image";

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
            // console.error('Error fetching attendance data:', error);
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

    const [facultyOptions, setFacultyOptions] = useState<string[]>([]);

    useEffect(() => {
		// Function to fetch data from Supabase
		const fetchFacultyOptions = async () => {
			try {
				const { data, error } = await supabase
					.from('attendance_settings')
					.select('attsName')
					.eq('attsType', 1)
					.order('attsName', { ascending: true });

				if (error) {
					// console.error('Error fetching faculty options:', error.message);
					return;
				}

				// Extracting only the 'attsName' values from the data
				const facultyNames = data.map((item) => item.attsName);

				setFacultyOptions(facultyNames);
			} catch (error) {
				// console.error('Error:', error);
			}
		};

		// Fetch the faculty options when the component mounts
		fetchFacultyOptions();
	}, [])

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

    const [dataResults, setDataResults] = useState<ExpenditureDataType[]>([]);
    const [searchQuery, setSearchQuery] = useState(""); // Search queries for search bar
    const [selectedFacultyUnit, setSelectedFacultyUnit] = useState("");
	const [sortBy, setSortBy] = useState(""); // Initialize state for sorting
	const [sortOrder, setSortOrder] = useState("asc"); // Initialize sort order (asc or desc)
	const [showSortOptions, setShowSortOptions] = useState(false); // State to control dropdown visibility

    const filterData = (query: string) => {

		// Clear the data results
		setDataResults([]);	

		let filteredData = currentData;

        if (selectedFacultyUnit !== 'all' && selectedFacultyUnit) {
			filteredData = currentData.filter((item) => selectedFacultyUnit === item.faculty);
		}		

		if (query) {
			filteredData = currentData.filter(
				info => {
					return (
						info.full_name.toLowerCase().includes(query.toLowerCase()) ||
						info.staff_id.toLowerCase().toString().includes(query.toLowerCase())
					);
				}
			);
		}

		setDataResults(filteredData);
	};

    const refreshData = () => {
		setSearchQuery("");
		setSelectedFacultyUnit("");
	};

    const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (currentPage >= 1) {
			setCurrentPage(1);
		}
        filterData(query);
	}; 

    useEffect(() => {
		filterData(searchQuery);
		setCurrentPage(1);
	}, [searchQuery, selectedFacultyUnit]);
    
    // Show Sort Options
	const handleSortButtonClick = () => {
		setShowSortOptions(!showSortOptions); // Toggle dropdown visibility
	};

	// Toggle sort order between 'asc' and 'desc' when ID is selected
	const handleSortButtonMenuClick = () => {
		if (sortBy === "full_name" || sortBy == "grand_total_fees" || sortBy == "staff_id") {
			// If it's already sorted by name, toggle between 'asc' and 'desc'
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			// Set the sorting option to name and default to 'asc'
			setSortBy("staff_id");
			setSortOrder("asc");
		}
		setShowSortOptions(false);
	};

	// An array of sorting options
	const sortOptions = [
		{ label: "Staff Name", value: "full_name" },
		{ label: "Staff ID", value: "staff_id" },
		{ label: "Grand Total (RM)", value: "grand_total_fees" },
	];

	// Modify the sorting logic based on the selected option and sort order
	const sortedData = (dataResults.length > 0 ? dataResults : currentData)
    // const sortedData = (currentData)
		.slice()
		.sort((a, b) => {
			if (sortBy === "staff_id") {
				// Sort by ID
				if (sortOrder === "asc") {
					return a.staff_id.localeCompare(b.staff_id, undefined, { sensitivity: 'base' });
				} else {
					return b.staff_id.localeCompare(a.staff_id, undefined, { sensitivity: 'base' });
				}
			} else if (sortBy === "full_name") {
				if (sortOrder === "asc") {
					return b.full_name.localeCompare(a.full_name, undefined, { sensitivity: 'base' });
				} else {
					return a.full_name.localeCompare(b.full_name, undefined, { sensitivity: 'base' });
				}
			} else if (sortBy === "grand_total_fees") {
				if (sortOrder === "asc") {
					return b.grand_total_fees.localeCompare(a.grand_total_fees, undefined, { sensitivity: 'base' });
				} else {
					return a.grand_total_fees.localeCompare(b.grand_total_fees, undefined, { sensitivity: 'base' });
				}
			}
			return 0;
		});

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

    type ColumnMapping = {
		[key: string]: string;
	};

	const columnMapping: ColumnMapping = {
        full_name: 'Full Name',
        staff_id: 'Staff/ Student ID',
        faculty: 'Faculty / Unit',
        grand_total_fees: 'Grand Total (RM)',
	};

	const convertToXLSX = (data: ExpenditureDataType[], columnMapping: ColumnMapping) => {
		const header = Object.keys(columnMapping).map((key) => columnMapping[key]);
		const body = data.map((row) => {
			const newRow: any = {...row};
			return Object.keys(columnMapping).map((key) => newRow[key as keyof ExpenditureDataType]);
		});

		const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'staff_expenditure_data');

		const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }); // Change type to 'array'

		return wbout;
	};

	const downloadXLSX = (data: ExpenditureDataType[]) => {
		const xlsxContent = convertToXLSX(data, columnMapping);
		const blob = new Blob([xlsxContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'staff_expenditure_data.xlsx';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	};

    return (
        <div>
            {totalsData.length > 0 ? (
                <div>
                    <div className="">
                        <div className="flex items-center justify-between mt-2">
                            {/* Refresh Button */}
                            <button
                                type="button"
                                className="items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden dark:bg-[#242729]"
                                onClick={refreshData}>
                                <IoMdRefresh className="text-xl text-slate-800 dark:text-dark_text" />
                                <span className="ml-2 -mt-[1.25px] text-slate-800 dark:text-dark_text">
                                    Refresh
                                </span>
                            </button>

                            <div className="flex items-center">
                                {/* Search Input */}
                                <div className="max-w-full relative shadow hover:shadow-sm border border-slate-300 rounded mr-3 hover:transition duration-300 transform hover:scale-105">
                                    <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-4 w-4 fill-current text-gray-500">
                                            <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                                        </svg>
                                    </span>
                                    <input
                                        placeholder="Search here..."
                                        className="appearance-none rounded-md block pl-8 pr-6 py-2 bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none dark:bg-dark_mode_card dark:border-[#2E3E50] dark:placeholder:text-[#484945]"
                                        value={searchQuery}
                                        onChange={e => handleSearch(e.target.value)}
                                    />
                                </div>

                                {/* mobile view */}
                                <button
                                    type="button"
                                    className="items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:hidden lg:hidden hover:transition duration-300 transform hover:scale-105"
                                    onClick={refreshData}>
                                    <IoMdRefresh className="text-xl text-slate-800" />
                                </button>
					
                                {/* Sort By Button */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="items-center justify-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 mr-3 shadow-sm md:inline-flex hidden hover:transition duration-300 transform hover:scale-105 dark:bg-[#242729]"
                                        onClick={handleSortButtonClick}>
                                        <Image
                                            src={filterBar.src}
                                            alt=""
                                            width={20}
                                            height={20}
                                            className="text-slate-800"
                                        />
                                        <span className="ml-2 text-slate-800 dark:text-dark_text">Sort By</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div
                                        className={`absolute top-[45px] transform translate-x-0 translate-y-0 transition-transform duration-300 ease-in-out ${showSortOptions ? "translate-x-0" : ""
                                            }`}
                                        style={{ zIndex: 999 }}>
                                        {showSortOptions && (
                                            <div className="bg-white border-l border-t border-r border-gray-200 shadow-md w-72 rounded-lg">
                                                <ul>
                                                    <li className="px-4 py-2 cursor-pointer flex items-center text-gray-600">
                                                        <span className="font-bold text-slate-800">
                                                            Sort By:
                                                        </span>
                                                    </li>
                                                    {sortOptions.map(option => (
                                                        <li
                                                            key={option.value}
                                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center transition-all duration-200 ease-in-out font-medium"
                                                            onClick={() => {
                                                                handleSortButtonMenuClick(); // Hide the dropdown when an option is selected
                                                                setSortBy(option.value); // Set the sorting option
                                                            }}>
                                                            {option.value === "full_name" && (
                                                                <FaSortAlphaDown className="mr-3 ml-2 text-slate-800" />
                                                            )}
                                                            {option.value === "staff_id" && (
                                                                <FaSortNumericDown className="mr-3 ml-2 text-slate-800" />
                                                            )}
                                                            {option.value === "grand_total_fees" && (
                                                                <MdAttachMoney className="mr-3 ml-2 text-md text-slate-800 whitespace-nowrap" />
                                                            )}
                                                            <span className="text-slate-500 ">
                                                                {option.label}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Export Button */}
                                <button
                                    type="button"
                                    className="items-center justify-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex hidden dark:bg-[#242729]"
                                    onClick={()=> downloadXLSX(totalsData)}
                                >
                                    <img
                                        src={exportCSV.src}
                                        alt=""
                                        width={20}
                                        className="text-slate-800"
                                    />
                                    <span className="ml-2 text-slate-800 dark:text-dark_text">Export to Excel (XLSX)</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row justify-between">
                            <div></div>
                            <div>                            
                                <select
                                    name="facultyUnit"
                                    id="facultyUnit"
                                    defaultValue={selectedFacultyUnit}
                                    className="px-4 py-2 mt-8 mb-8 border border-gray-300 focus:outline-none text-xs lg:text-base w-full lg:w-96 lg:float-right"
                                    required
                                    onChange={event => setSelectedFacultyUnit(event.target.value)}
                                >
                                    <option value="" disabled>
                                        Select Faculty/ Unit
                                    </option>
                                    <option value="all">
                                        All
                                    </option>
                                    {facultyOptions.map((faculty, index) => (
                                        <option key={index} value={faculty}>
                                            {faculty}
                                        </option>
                                    ))}
                                </select>
                            </div>
						</div>
                        
                        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                            <div className="inline-block min-w-full shadow rounded-sm overflow-hidden">
                                <table className="lg:w-full w-auto">
                                    <thead>
                                        <tr>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                NO
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                Staff Name 
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider text-left">
                                                Staff ID
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider">
                                                Faculty
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider">
                                                Program Title / Event
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider">
                                                Total (RM)
                                            </th>
                                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-[#363B3D] dark:bg-[#1D2021] text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-[#B0AA9F] uppercase tracking-wider">
                                                Grand Total (RM)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='h-screen'>                        
                                        {dataResults.length === 0 && selectedFacultyUnit || dataResults.length === 0 && searchQuery? (
                                            <p className="lg:text-lg ml-4 lg:ml-0 lg:text-center mt-4">No data available.</p>
                                        ) : (
                                            sortedData
                                            .map((expenditureItem, index) => (
                                            <tr key={expenditureItem.id}>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                    {expenditureItem.full_name}
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                    {expenditureItem.staff_id}
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                    {expenditureItem.faculty}
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                    {groupedData[expenditureItem.staff_id]?.map((programItem) => (
                                                        <div key={programItem.id}>
                                                            {programItem.program_title} - {Number(programItem.grand_total_fees).toFixed(2)}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                    {groupedData[expenditureItem.staff_id]?.map((programItem) => (
                                                        <div key={programItem.id}>
                                                            {Number(programItem.grand_total_fees).toFixed(2)}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white dark:border-[#363B3D] dark:bg-dark_mode_card text-sm text-left text-gray-900 dark:text-dark_text">
                                                    {expenditureItem.grand_total_fees}
                                                </td>
                                            </tr>
                                        ))
                                        )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>                        
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <label htmlFor="itemsPerPageSelect" className="mr-2 text-slate-800 dark:text-dark_text">
                                Show entries:
                            </label>
                            <select
                                id="itemsPerPageSelect"
                                name="itemsPerPage"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="h-full rounded-l border bg-white border-gray-400 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:bg-dark_mode_card dark:border-[#484E51] dark:text-dark_text"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                        </div>

                        {/* Pagination */}
                        <div className="pagination justify-end mt-5 pb-5 ems-center hidden lg:flex">
                            <button
                                className={`px-1 ml-5 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                <MdKeyboardDoubleArrowLeft className="text-3xl"/>
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-1 ml-1 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                            >
                                <MdKeyboardArrowLeft className="text-3xl"/>
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
                                className={`px-1 ml-5 ${currentPage === pageCount ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                            >
                                <MdKeyboardArrowRight className="text-3xl"/>
                            </button>
                            <button
                                className={`px-1 ml-1 ${currentPage === pageCount ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
                                onClick={() => handlePageChange(pageCount)}
                                disabled={currentPage === pageCount}
                            >
                                <MdKeyboardDoubleArrowRight className="text-3xl"/>
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