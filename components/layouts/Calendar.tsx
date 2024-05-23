import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './CustomCalendar.css'; // Import your custom styles


interface CalendarComponentProps {
  onDateChange: (date: Date) => void;
  subEventDates: string[];
  onClickDay: (date: Date) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ onDateChange, subEventDates, onClickDay }) => {
  const [date, setDate] = useState(new Date());

  // Existing functionality remains unchanged
  const handleDateChangeWrapper = (value: any, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (value instanceof Date) {
      setDate(value);
      onDateChange(value);
      onClickDay(value); 
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      setDate(value[0]);
      onDateChange(value[0]);
      onClickDay(value[0]);
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

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && isEventDate(date)) {
      return (
        <>
          <div className="event-icon">●</div>
        </>
      );
    }
    return null;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set today's time to midnight for accurate comparison

  const isEventDate = (date: Date): boolean => {
    if (date < today) {
      return false; // Exclude dates before today
    }
    const formattedDate = toLocalDateString(date);
    return subEventDates.includes(formattedDate);
  };

  return (
    <div className="shadow p-4">
      <Calendar
        onChange={handleDateChangeWrapper}
        value={date}
        locale="en-US"
        className="custom-calendar"
        tileClassName={({ date, view }) => (view === 'month' && isEventDate(date) ? 'event-day' : null)}
        tileContent={tileContent}
      />
    </div>
  );
};

export default CalendarComponent;
