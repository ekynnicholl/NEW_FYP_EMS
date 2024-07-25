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

        newRow.attFormsStaffID = newRow.attFormsStaffID === '0' ? 'External Visitor' : newRow.attFormsStaffID === '1' ? 'Secondary Student' : newRow.attFormsStaffID === '2' ? 'Teacher' : newRow.attFormsStaffID;

        return Object.keys(columnMapping).map((key) => newRow[key as keyof AttendanceDataType]);
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Data');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }); // Change type to 'array'

    return wbout;
};

export const downloadXLSX = (data: AttendanceDataType[]) => {
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
    attFormsFacultyUnit: 'Unit/ Organization',
    sub_eventName: 'Session',
    attDateSubmitted: 'Date Submitted',
};