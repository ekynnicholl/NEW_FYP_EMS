import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './CustomCalendar.css'; // Import your custom styles


interface CalendarComponentProps {
  onDateChange: (date: Date) => void;
  eventDates: string[];
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ onDateChange, eventDates }) => {
  const [date, setDate] = useState(new Date());

  // Existing functionality remains unchanged
  const handleDateChangeWrapper = (value: any, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (value instanceof Date) {
      setDate(value);
      onDateChange(value);
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      setDate(value[0]);
      onDateChange(value[0]);
    }
    // Additional cases can be handled as needed
  };

  // Helper function to format a date to YYYY-MM-DD based on local time components
  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is zero-based
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  // Adjust isEventDate function to use the local date string for comparison
  const isEventDate = (date: Date): boolean => {
    const formattedDate = toLocalDateString(date); // Use local date string for comparison
    return eventDates.includes(formattedDate);
  };

  return (
    <div className="shadow p-4">
      <Calendar
        onChange={handleDateChangeWrapper}
        value={date}
        locale="en-US"
        className="custom-calendar"
        tileClassName={({ date, view }) => 
          view === 'month' && isEventDate(date) ? 'event-day' : null}
      />
    </div>
  );
};

export default CalendarComponent;
