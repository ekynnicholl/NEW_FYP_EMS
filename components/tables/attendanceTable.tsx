import { useEffect, useState } from 'react';
import DoubleRightArrow from '@/components/icons/DoubleRightArrow';
import DoubleLeftArrow from '@/components/icons/DoubleLeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import LeftArrow from '@/components/icons/LeftArrow';
import exportCSV from "@/public/images/export_csv.png";
import { BsFiletypePdf, BsFillTrash3Fill } from 'react-icons/bs';
import { HiPencilAlt } from 'react-icons/hi';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { tr } from 'date-fns/locale';
import DeleteModal from "@/components/EditEvent_Modal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { sendParticipationCert } from "@/lib/api";
import toast from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import * as XLSX from 'xlsx';

type AttendanceDataType = {
    attFormsCertofParticipation: string;
    attFormsID: string;
    attFSubEventID: string;
    attFormsStaffID: string;
    attFormsStaffName: string;
    attFormsFacultyUnit: string;
    attDateSubmitted: string;
    sub_eventName: string;
    sub_eventVenue: string;
    attFormsStaffEmail: string;
};

type FacultyUnit = {
    attsID: string;
    attsName: string;
    attsCategory: number;
    attsSubcategory: number;
    attsType: number;
    attsPosition: number;
    attsFacultyUnit: number;
};

interface Props {
    attendanceData: AttendanceDataType[];
    itemsPerPage: number;
    isAllTabActive: boolean;
    attendanceMainEventID: string;
}

// const convertToCSV = (data: AttendanceDataType[], columnMapping: ColumnMapping) => {
//     const header = Object.keys(columnMapping).map((key) => columnMapping[key]).join(',');
//     const body = data.map((row) => {
//         const newRow = { ...row };

//         Object.keys(columnMapping).forEach((key) => {
//             if (key === 'attDateSubmitted') {
//                 const formattedDate = convertDateToLocale(newRow[key as keyof AttendanceDataType]);
//                 newRow[key as keyof AttendanceDataType] = formattedDate.includes(',')
//                     ? `"${formattedDate}"`
//                     : formattedDate;
//             } else if (typeof newRow[key as keyof AttendanceDataType] === 'string' && newRow[key as keyof AttendanceDataType].includes(',')) {
//                 newRow[key as keyof AttendanceDataType] = `"${newRow[key as keyof AttendanceDataType]}"`;
//             }
//         });

//         return Object.keys(columnMapping).map((key) => newRow[key as keyof AttendanceDataType]).join(',');
//     }).join('\n');
//     return `${header}\n${body}`;
// };

// const downloadCSV = (data: AttendanceDataType[]) => {
//     const firstRow = data[0];
//     const subEventName = firstRow ? firstRow.sub_eventName : '';

//     const csv = convertToCSV(data, columnMapping);

//     // Create a data URI for the CSV content
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement('a');
//     a.style.display = 'none';
//     a.href = url;
//     // a.download = `attendance_data_${subEventName}.csv`;
//     a.download = `attendance_data.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);

//     window.URL.revokeObjectURL(url);
// };

const convertToXLSX = (data: AttendanceDataType[], columnMapping: ColumnMapping) => {
    const header = Object.keys(columnMapping).map((key) => columnMapping[key]);
    const body = data.map((row) => {
        const newRow: any = { ...row };

        Object.keys(columnMapping).forEach((key) => {
            if (key === 'attDateSubmitted') {
                const formattedDate = convertDateToLocale(newRow[key as keyof AttendanceDataType]);
                newRow[key as keyof AttendanceDataType] = formattedDate.includes(',')
                    ? `${formattedDate}`
                    : formattedDate;
            } else if (typeof newRow[key as keyof AttendanceDataType] === 'string' && newRow[key as keyof AttendanceDataType].includes(',')) {
                newRow[key as keyof AttendanceDataType] = `${newRow[key as keyof AttendanceDataType]}`;
            }
        });

        return Object.keys(columnMapping).map((key) => newRow[key as keyof AttendanceDataType]);
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Data');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }); // Change type to 'array'

    return wbout;
};

const downloadXLSX = (data: AttendanceDataType[]) => {
    const xlsxContent = convertToXLSX(data, columnMapping);
    const blob = new Blob([xlsxContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const firstRow = data[0];
    const subEventName = firstRow ? firstRow.sub_eventName : '';
    const subEventDate = firstRow ? new Date(firstRow.attDateSubmitted) : null;
    const formattedDate = subEventDate ? `${subEventDate.getDate()}.${subEventDate.getMonth() + 1}.${subEventDate.getFullYear()}` : '';

    const a = document.createElement('a');
    a.href = url;
    a.download = `${subEventName} (${formattedDate}) - Attendance Data.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
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
    attFormsFacultyUnit: 'Faculty/ Unit',
    sub_eventName: 'Session',
    attDateSubmitted: 'Date Submitted',
};

const AttendanceTable: React.FC<Props> = ({ attendanceData, itemsPerPage, isAllTabActive, attendanceMainEventID }) => {
    const supabase = createClientComponentClient();

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

    useEffect(() => {
        setCurrentPage(1);
    }, [attendanceData]);

    const [editOption, setEditOption] = useState("");
    const [cancelOptionUpdate, setCancelOptionUpdate] = useState(false);
    const [updateOption, setUpdateOption] = useState(false);
    const [editedStaffName, setEditedStaffName] = useState("");
    const [editedStaffID, setEditedStaffID] = useState("");
    const [editedFacultyUnit, setEditedFacultyUnit] = useState("");
    const [deletingAttendance, setDeletingAttendance] = useState({ attFormsID: "", attFormsStaffName: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [attendanceInfo, setAttendanceInfo] = useState<AttendanceDataType[]>([]);
    const [facultyOptions, setFacultyOptions] = useState<string[]>([]);
    const [facultyStudents, setFacultyStudents] = useState<{ facultyName: string; facultyCategory: number; }[]>([]);
    const [facultyUnits, setFacultyUnits] = useState<FacultyUnit[]>([]);

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

    const [eventName, setEventName] = useState<string>("");

    useEffect(() => {
        const fetchEventDetails = async () => {
            const { data, error } = await supabase
                .from("internal_events")
                .select("intFEventName")
                .eq("intFID", attendanceMainEventID)

            if (error) {
                return;
            }

            setEventName(data[0].intFEventName || "")
        }
        fetchEventDetails();
    }, [])

    useEffect(() => {
        const fetchFacultyStudent = async () => {
            const { data, error } = await supabase
                .from('attendance_settings')
                // .select('attsName')
                .select('attsCategory, attsName')
                .eq('attsType', 0)
                .order('attsName', { ascending: true });

            if (error) {
                // console.error('Error fetching faculty units:', error);
                return;
            }

            // const facultyStudents = data.map((item) => item.attsName);
            const facultyStudentsData = data.map((item: any) => ({
                facultyName: item.attsName,
                facultyCategory: item.attsCategory,
            }));

            setFacultyStudents(facultyStudentsData);
        };

        fetchFacultyStudent();
    }, []);


    const [categories, setCategories] = useState<{ id: number; category: number; name: string; subcategories: { name: string; facultyUnit: number }[]; }[]>([]);

    // retrieve units according categories
    useEffect(() => {
        const fetchFacultyUnits = async () => {
            const { data, error } = await supabase
                .from('attendance_settings')
                .select('attsID, attsName, attsCategory, attsSubcategory, attsType, attsPosition, attsFacultyUnit')
                .eq('attsType', 2)
                .order('attsCategory, attsName');
            // .order('attsCategory, attsPosition');

            if (error) {
                // console.error('Error fetching faculty units:', error);
                return;
            }

            if (data) {
                setFacultyUnits(data);
                // console.log(data);

                // Extract unique categories and subcategories
                const uniqueCategories = Array.from(new Set(data
                    .filter(unit => unit.attsCategory > 0)));

                const uniqueSubcategories = Array.from(new Set(data
                    .filter(unit => unit.attsSubcategory > 0)));

                // Create categories array with subcategories
                const categoriesArray = uniqueCategories.map((category) => ({
                    id: category.attsCategory,
                    category: category.attsPosition,
                    name: category.attsName,
                    subcategories: uniqueSubcategories
                        .filter((subcategory) => category.attsCategory === subcategory.attsSubcategory)
                        .map(subcategory => ({
                            name: subcategory.attsName,
                            facultyUnit: subcategory.attsFacultyUnit
                        }))
                }));

                setCategories(categoriesArray);
            }
        };

        fetchFacultyUnits();
    }, []);


    const handleEdit = (attFormsID: string, attFormsStaffID: string, attFormsStaffName: string, attFormsFacultyUnit: string) => {
        setEditOption(attFormsID);
        setUpdateOption(true);
        setCancelOptionUpdate(false);
        setEditedStaffID(attFormsStaffID);
        setEditedStaffName(attFormsStaffName);
        setEditedFacultyUnit(attFormsFacultyUnit);
        // console.log("Edit clicked for:", attendanceItem);
    };

    const handleUpdateAttendanceData = async (formsID: string, staffID: string, staffName: string, facultyUnit: string) => {
        try {
            const { error } = await supabase
                .from('attendance_forms')
                .update({ attFormsStaffName: staffName, attFormsStaffID: staffID, attFormsFacultyUnit: facultyUnit })
                .eq('attFormsID', formsID)

            if (error) {
                return;
            }

            setEditedStaffID('');
            setEditedStaffName('');
            setEditedFacultyUnit('');
            setUpdateOption(false);

        } catch (error) {

        }
    }

    const openDeleteModal = (attFormID: string, attFormsStaffName: string) => {
        setDeletingAttendance({ attFormsID: attFormID, attFormsStaffName: attFormsStaffName });
        setShowDeleteModal(true);
    }

    const handleDelete = (attFormID: string, attFormsStaffName: string) => {
        openDeleteModal(attFormID, attFormsStaffName);
        // console.log("Delete clicked for:", attendanceItem);
    };

    //Delete attendance data selected
    const handleDeleteAttendanceData = async (attFormsID: string) => {
        try {
            const { error } = await supabase
                .from('attendance_forms')
                .delete()
                .eq('attFormsID', attFormsID);

            if (error) {
                // console.error('Errror deleting faculty name: ', error);
                return;
            }

            // Remove the deleted faculty member from facultyUnits
            setAttendanceInfo(prevAttendanceData => prevAttendanceData.filter(data => data.attFormsID !== attFormsID));

            setShowDeleteModal(false);

        } catch (error) {
            // console.log(error);
        }
    }

    useEffect(() => {
        setSelectedAttendanceData(new Array(attendanceData.length).fill(true));
    }, [attendanceData]);

    const [isDistributeSelected, setIsDistributeSelected] = useState<boolean>(true);
    const [isDistributeOpen, setDistributeOpen] = useState(false);
    const [selectedAttendanceData, setSelectedAttendanceData] = useState<boolean[]>([]);

    const distributeCertificates = async () => {
        try {
            const selectedAttendance = attendanceData.filter((_, index) => selectedAttendanceData[index]);

            const selectedAttendanceWithEventName = selectedAttendance.map(attendanceItem => ({
                ...attendanceItem,
                eventName: eventName,
            }));

            await toast.promise(
                sendParticipationCert(selectedAttendanceWithEventName),
                {
                    loading: 'Distributing certificates...',
                    success: (response) => {
                        // console.log('Response message:', response);
                        return response.message || 'Successfully generated PDF.';
                    },
                    error: () => 'Error distributing certificates.',
                }
            );
        } catch (error) {
            toast.error('Error distributing certificates.');
        }
    };

    const toggleSelection = (index: number) => {
        const updatedSelectedData = [...selectedAttendanceData];
        updatedSelectedData[index] = !updatedSelectedData[index];
        setSelectedAttendanceData(updatedSelectedData);
    };

    // Determine whether there are more than 1 sub-events,
    const uniqueSubEventNames = new Set(attendanceData.map(item => item.sub_eventName));
    const hasMultipleSubEvents = uniqueSubEventNames.size > 1;

    return (
        <div>
            {attendanceData.length > 0 ? (
                <div>
                    <div className="w-full">
                        <div className="mb-5">
                            <button
                                type="button"
                                className="flex rounded-md items-center py-[2px] lg:py-2 px-4 mr-3s font-medium hover:bg-slate-300 bg-slate-200 shadow-sm md:inline-flex dark:bg-[#242729] mr-3"
                                onClick={() => downloadXLSX(attendanceData)}
                            >
                                <img
                                    src={exportCSV.src}
                                    alt=""
                                    width={14}
                                    className="text-slate-800"
                                />
                                <span className="ml-2 text-slate-800 dark:text-dark_text">Export to Excel (XLSX)</span>
                            </button>
                            {/* <button
                                type="button"
                                className={`flex rounded-md items-center py-[2px] lg:py-2 px-4 mr-3s font-medium hover:bg-slate-300 bg-slate-200 shadow-sm md:inline-flex dark:bg-[#242729]`}
                                onClick={() => setIsDistributeSelected(true)}
                            >
                                <span className="ml-2 text-slate-800 dark:text-dark_text">Distribute Certificates</span>
                            </button> */}
                            {isDistributeSelected ? (
                                <Dialog open={isDistributeOpen} onOpenChange={setDistributeOpen}>
                                    <DialogTrigger>
                                        <button className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 shadow-sm dark:bg-[#242729] mr-5">
                                            <span className="ml-2 lg:mt-[1px] text-slate-800 flex items-center mr-2">
                                                <span className="ml-[3px] lg:ml-[5px] text-[11px] lg:text-[14px] p-[6px] dark:text-[#C1C7C1]">
                                                    {/* Confirm Selection */}
                                                    Distribute Certificates
                                                </span>
                                            </span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="z-[9999]">
                                        <DialogHeader>
                                            <DialogTitle className="lg:text-md font-medium text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
                                                Certificate of Participation
                                            </DialogTitle>
                                        </DialogHeader>
                                        <DialogDescription className="lg:text-sm text-gray-600 -ml-[6px] mb-3 mt-1 text-center dark:text-slate-200">
                                        Please confirm you are about to distribute certificates to these emails:
                                        <div className="flex items-center mb-2">
                                            <input
                                            type="checkbox"
                                            checked={selectedAttendanceData.every(Boolean)}
                                            onChange={() => {
                                                const allSelected = selectedAttendanceData.every(Boolean);
                                                setSelectedAttendanceData(attendanceData.map(() => !allSelected));
                                            }}
                                            className="mr-3"
                                            />
                                            <span>Select/Deselect All</span>
                                        </div>
                                        <div className="max-h-[200px] overflow-auto">
                                            {attendanceData.map((attendee, index) => (
                                            <div key={index} className="flex items-center text-left">
                                                <input
                                                type="checkbox"
                                                checked={selectedAttendanceData[index]}
                                                onChange={() => toggleSelection(index)}
                                                className="mr-3 ml-5"
                                                />
                                                <span>
                                                {attendee.attFormsStaffName} - {attendee.attFormsStaffEmail}
                                                </span>
                                            </div>
                                            ))}
                                        </div>
                                        </DialogDescription>
                                        <DialogFooter className="sm:justify-center">
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button onClick={() => {
                                                distributeCertificates();
                                                setDistributeOpen(false);
                                            }}>
                                                Confirm
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ) : null}
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
                                    {isAllTabActive && hasMultipleSubEvents && (
                                        <th className={`flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider`}>
                                            Sub-Event
                                        </th>
                                    )}
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        Date Submitted
                                    </th>
                                    <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((attendanceItem) => (
                                    attendanceItem.attFormsID === editOption && updateOption && !cancelOptionUpdate ? (
                                        <tr key={attendanceItem.attFormsID}>
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                <input type="text"
                                                    placeholder="Enter Staff / Student ID..."
                                                    className="border-2 ml-3 px-2 py-1 text-base w-28"
                                                    value={editedStaffID}
                                                    onChange={e => setEditedStaffID(e.target.value)} />
                                            </td>
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                <input type="text"
                                                    placeholder="Enter Staff / Student Name..."
                                                    className="border-2 ml-3 px-2 py-1 text-base w-28"
                                                    value={editedStaffName}
                                                    onChange={e => setEditedStaffName(e.target.value)} />
                                            </td>
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                <select
                                                    name="facultyUnit"
                                                    id="facultyUnit"
                                                    defaultValue={editedFacultyUnit}
                                                    className="w-28 px-4 py-2 border border-gray-300 focus:outline-none mt-1 text-xs lg:text-base"
                                                    required
                                                    onChange={event => { setEditedFacultyUnit(event.target.value); }
                                                    }

                                                >
                                                    <option value="" disabled>
                                                        Select Faculty/ Unit
                                                    </option>
                                                    {facultyOptions.map((faculty, index) => (
                                                        <option key={index} value={faculty}>
                                                            {faculty}
                                                        </option>
                                                    ))}
                                                    {facultyStudents.map((faculty) => (
                                                        categories
                                                            .filter(category => category.category === faculty.facultyCategory || (category.category === 0 && (faculty.facultyCategory === 1 || faculty.facultyCategory === 2)))
                                                            .map((cat) => (
                                                                cat.subcategories
                                                                    .filter(subcategory => faculty.facultyCategory === subcategory.facultyUnit || subcategory.facultyUnit === 3)
                                                                    .map((subcategory, index) => (
                                                                        <option key={index} value={`${faculty.facultyName} - ${subcategory.name}`}>
                                                                            {faculty.facultyName} - {subcategory.name}
                                                                        </option>
                                                                    ))))

                                                    ))}
                                                    <option value="Other">Other</option>
                                                </select>
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
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                <button
                                                    className="border-[0.5px] rounded-md bg-slate-900 p-2 text-white hover:bg-red-600 duration-300 ease-in-out"
                                                    onClick={() => {
                                                        handleUpdateAttendanceData(attendanceItem.attFormsID, editedStaffID, editedStaffName, editedFacultyUnit)
                                                    }}
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    className="border-[0.5px] rounded-md bg-slate-100 mt-2 px-3 py-2 hover:bg-slate-200 duration-300 ease-in-out"
                                                    onClick={() => { setCancelOptionUpdate(true); }}
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={attendanceItem.attFormsID}>
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                {attendanceItem.attFormsCertofParticipation ? (
                                                    <a
                                                        href={`https://chyamrnpbrtxhsvkqpry.supabase.co/storage/v1/object/public/attFormsCertofParticipation/${attendanceItem.attFormsCertofParticipation}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        {attendanceItem.attFormsStaffID}
                                                    </a>
                                                ) : (
                                                    attendanceItem.attFormsStaffID
                                                )}
                                            </td>
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                {attendanceItem.attFormsStaffName}
                                            </td>
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                {attendanceItem.attFormsFacultyUnit}
                                            </td>
                                            {isAllTabActive && hasMultipleSubEvents && (
                                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                    {attendanceItem.sub_eventName}
                                                </td>
                                            )}
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                {formatDate(attendanceItem.attDateSubmitted).date}
                                                <br />
                                                {formatDate(attendanceItem.attDateSubmitted).time}
                                            </td>
                                            <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                                <button
                                                    onClick={() => handleEdit(attendanceItem.attFormsID, attendanceItem.attFormsStaffID, attendanceItem.attFormsStaffName, attendanceItem.attFormsFacultyUnit)}>
                                                    <HiPencilAlt className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] text-[24px] lg:text-base dark:text-dark_text2" />
                                                </button>
                                                <button onClick={() => handleDelete(attendanceItem.attFormsID, attendanceItem.attFormsStaffName)}>
                                                    <BsFillTrash3Fill className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] lg:ml-4 ml-0 text-[24px] lg:text-base dark:text-dark_text2" />
                                                </button>
                                            </td>
                                        </tr>
                                    )))}
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

            <DeleteModal
                isVisible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}>
                <div className="p-4 text-lg text-center">
                    <IoIosCloseCircleOutline className="m-auto text-8xl text-red-600" />
                    <p className="mt-6">Are you sure to delete the attendance record of <span className="font-bold">{deletingAttendance.attFormsStaffName}</span>? This action cannot be undone.</p>

                    <div className="mt-12">
                        <button
                            className="border-[0.5px] rounded-md bg-white px-6 py-2 font-semibold hover:bg-slate-100 duration-300 ease-in-out"
                            onClick={() => setShowDeleteModal(false)}>Cancel</button>

                        <button
                            className="border-2 rounded-md bg-red-600 ml-2 text-white px-6 py-2 font-semibold hover:bg-red-700 duration-300 ease-in-out"
                            onClick={() => handleDeleteAttendanceData(deletingAttendance.attFormsID)}>Delete</button>
                    </div>
                </div>
            </DeleteModal>
        </div>
    );
};

export default AttendanceTable;
