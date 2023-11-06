import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './CustomCalendar.css'; // Import your custom styles


interface CalendarComponentProps {
  onDateChange: (date: Date) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ onDateChange }) => {
  const [date, setDate] = useState(new Date());
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday (0) or Saturday (6)
  };

  const handleDateChangeWrapper = (value: any, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (value instanceof Date) {
      setDate(value);
      onDateChange(value);
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      // Handle the first date in the array (you can customize this logic as needed)
      setDate(value[0]);
      onDateChange(value[0]);
    }
    // You can optionally handle other cases here, such as `null`
  };


  return (
    <div className="w-full h-[700px] bg-white border border-slate-200 rounded-lg transition transform hover:scale-105 hidden lg:inline dark:bg-dark_mode_card dark:text-slate-300 dark:border dark:border-[#363B3D]">
      <h2 className="text-2xl font-semibold mb-4 p-4 border-b border-slate-200 text-center dark:border-[#202C3B]">Calendar</h2>
      <div className="shadow p-4">
        <Calendar
          onChange={handleDateChangeWrapper}
          value={date}
          className="custom-calendar"
        />
      </div>
    </div>
  );
};
export default CalendarComponent;
