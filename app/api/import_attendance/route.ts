import { NextResponse } from "next/server";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const excelDateToJSDate = (serial: number) => {
    const baseDate = new Date(Date.UTC(1899, 11, 30)); // Excel's base date is December 30, 1899
    const msPerDay = 86400000; // Number of milliseconds in a day
    return new Date(baseDate.getTime() + serial * msPerDay);
};

const formatDateToMalaysianTimeZone = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
};

export async function POST(request: Request) {
    try {
        // Parse the request body
        const { selectedSubEvent, data } = await request.json();

        // Create Supabase client
        const supabase = createClientComponentClient();

        // Utility function to remove all whitespace from a string
        const removeAllWhitespace = (str: string) => str.replace(/\s+/g, '');

        // Map the incoming data to match Supabase column names
        const mappedData = data.map((item: any) => {
            // Convert Excel serial date to JavaScript Date
            const date = excelDateToJSDate(item.timestamp);

            // Format date to Malaysian timezone
            const formattedDate = date.toISOString();

            return {
                attFSubEventID: selectedSubEvent,
                attDateSubmitted: formattedDate,
                attFormsStaffName: typeof item['full name'] === 'string' ? item['full name'].trim() : '', // Handle non-string data
                attFormsStaffID: typeof item['staff id / student id'] === 'string'
                    ? removeAllWhitespace(item['staff id / student id'])
                    : removeAllWhitespace(item['staff id / student id']?.toString() || ''), // Handle number or string
                attFormsStaffEmail: typeof item['email'] === 'string' ? item['email'].trim() : '', // Handle non-string data
                attFormsFacultyUnit: typeof item.school === 'string' ? item.school.trim() : '' // Handle non-string data
            };
        });

        // Insert data into Supabase
        const { data: insertedData, error } = await supabase
            .from('attendance_forms')
            .insert(mappedData);

        if (error) {
            // console.error('Error inserting data:', error);
            return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 });
        }

        // console.log('Data inserted:', mappedData);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
