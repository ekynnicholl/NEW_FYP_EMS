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
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { FaFileImport } from "react-icons/fa";

interface RowData {
    [key: string]: string | number | null;
}

interface ImportAttendanceProps {
    selectedSubEvent: string;
}

const ImportAttendanceComponent: React.FC<ImportAttendanceProps> = ({ selectedSubEvent }) => {
    const [isImportOpen, setImportOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const normalizeHeader = (header: string) =>
        header.trim().replace(/\s+/g, ' ').toLowerCase();

    const handleImportAttendance = async () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e: ProgressEvent<FileReader>) => {
                const target = e.target as FileReader;
                const result = target.result as ArrayBuffer | null;

                if (result) {
                    const data = new Uint8Array(result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];

                    // Read the data including headers
                    const rawData: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | null)[][];

                    // Define acceptable header formats and expected column count
                    const acceptableHeaders: string[][] = [
                        ['Timestamp', 'Full Name', 'Staff ID / Student ID', 'Email', 'School'],
                        ['Timestamp', 'Full Name', 'Staff ID/ Student ID', 'Email', 'School'],
                        ['Timestamp', 'Full Name', 'Staff ID /Student ID', 'Email', 'School']
                    ];
                    const expectedColumnCount = 5; // The exact number of columns expected

                    // Extract actual headers
                    const actualHeaders = rawData[0] as string[];
                    const normalizedActualHeaders = actualHeaders.map(normalizeHeader);

                    // Check if the normalized actual headers match any of the acceptable header formats
                    const headersMatch = acceptableHeaders.some(acceptableFormat =>
                        acceptableFormat.every((header, index) =>
                            normalizeHeader(header) === normalizedActualHeaders[index]
                        ) && actualHeaders.length === expectedColumnCount // Check for exact column count
                    );

                    if (!headersMatch) {
                        toast.error('Invalid file format. Please ensure the file has exactly ' + expectedColumnCount + ' columns with the correct headers.');
                        return;
                    }

                    // Get index of 'Staff ID / Student ID' column
                    const staffIDIndex = normalizedActualHeaders.indexOf(normalizeHeader('Staff ID / Student ID'));

                    // Process and clean data
                    const formattedData = rawData.slice(1) // Remove header row
                        .map((row: (string | number | null)[]) => {
                            // Convert row to RowData
                            const rowData: RowData = row.reduce((acc, cell, index) => {
                                acc[normalizedActualHeaders[index] || index] = cell;
                                return acc;
                            }, {} as RowData);

                            // Trim whitespace from the specific column if it exists
                            if (staffIDIndex !== -1) {
                                const staffID = rowData[normalizedActualHeaders[staffIDIndex]];
                                if (typeof staffID === 'string') {
                                    rowData[normalizedActualHeaders[staffIDIndex]] = staffID.trim();
                                }
                            }

                            return rowData;
                        })
                        .filter((row: RowData) => {
                            // Filter out empty rows
                            return Object.values(row).some(cell => cell !== null && cell !== '');
                        });

                    try {
                        const response = await fetch('/api/import_attendance', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                selectedSubEvent,  // Include selectedSubEvent in the payload
                                data: formattedData
                            }),
                        });

                        const result = await response.json();
                        // console.log('Upload success:', result);
                        if (result) {
                            toast.success("Imported successfully. Please refresh to see the new list.")
                        }
                    } catch (error) {
                        // console.error('Error uploading data:', error);
                    }
                } else {
                    // console.error('File read error: No result');
                }
            };

            reader.readAsArrayBuffer(file);
        }
        setImportOpen(false);
    };

    return (
        <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
            <DialogTrigger>
                <button className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 shadow-sm dark:bg-[#242729] mr-5">
                    <span className="ml-2 lg:mt-[1px] text-slate-800 flex items-center mr-2">
                        <FaFileImport />
                        <span className="ml-[3px] lg:ml-[5px] text-[11px] lg:text-[15px] p-[5px] dark:text-[#C1C7C1]">
                            Import Attendance
                        </span>
                    </span>
                </button>
            </DialogTrigger>
            <DialogContent className="z-[9999]">
                <DialogHeader>
                    <DialogTitle>
                        <div className="ml-3 mr-3">
                            Import Attendance (.csv/ .xlsx)
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <div>
                        <div className=" text-black-500">
                            Please ensure the .csv/ .xlsx follows the requirements: <br />
                            <ul className="list-disc p-5">
                                <li>Your file MUST consist of only 4 columns: <br /> Timestamp, Full Name, Staff ID / Student ID, Email, School.</li>
                                <li>
                                    If you&apos;re uploading for teachers, secondary students, or external visitors, ensure the Staff ID / Student ID columns are numbered as such:
                                    <br />
                                    External Visitor: 0 <br />
                                    Secondary Students: 1 <br />
                                    Teachers: 2
                                </li>
                                <li>The system DOES NOT check for duplicates. Ensure the event is empty or cross-check for duplicates.</li>
                            </ul>
                        </div>
                        <div className="border border-slate-500 border-dashed flex items-center justify-center p-6">
                            <input
                                type="file"
                                accept=".csv, .xlsx"
                                onChange={handleFileChange}
                                className="mb-4"
                            />
                        </div>
                    </div>
                </DialogDescription>
                <DialogFooter className="sm:justify-center">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleImportAttendance}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ImportAttendanceComponent;