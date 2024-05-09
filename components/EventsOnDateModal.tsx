// EventsOnDateModal.tsx
import React from 'react';
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FiClock } from 'react-icons/fi';
import { FaLocationDot } from "react-icons/fa6";
import { MdPeople } from 'react-icons/md';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  events: any[];
  selectedDate: string;
  onAddEvent: (selectedDate: string) => void; // Add this line
}
const EventsOnDateModal: React.FC<ModalProps> = ({ isVisible, onClose, events, selectedDate, onAddEvent }) => {
  if (!isVisible) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target && (e.target as HTMLDivElement).id === 'wrapper') {
      onClose();
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, -3);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[100]"
      id="wrapper"
      onClick={handleClose}
    >
      <div className="w-[500px] lg:w-[800px] flex flex-col relative p-4 lg:p-6">
        <div>
          <button
            className="text-slate-100 font-medium text-2xl lg:text-3xl absolute top-1 right-3 transform hover:scale-105"
            onClick={() => onClose()}
          >
            x
          </button>
          <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto dark:bg-dark_mode_card">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-slate-800 dark:text-dark_text">
              Events on {selectedDate}
            </h2>
            <button
          className="flex items-center bg-slate-800 rounded-lg py-2 px-4 font-medium hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm hover:text-slate-50 justify-end text-right hover:transition duration-300 transform hover:scale-105 cursor-pointer dark:bg-slate-800"
          onClick={() => onAddEvent(selectedDate)}
            >
          <span className="text-lg lg:text-xl text-slate-100">Add Events</span>
        </button>
            {events.length === 0 ? (
              <p className="text-slate-600 text-lg lg:text-xl dark:text-dark_text">No events found on this date.</p>
            ) : (
              <ul>
                {events.map((event, index) => (
                  <li key={index} className="mb-8">
                    <h3 className="text-xl lg:text-2xl font-semibold mb-4 text-slate-800 dark:text-dark_text">
                      {event.sub_eventsName}
                    </h3>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <FaLocationDot className="text-2xl lg:text-3xl mr-2 text-slate-800 dark:text-dark_text" />
                        <p className="text-slate-600 text-lg lg:text-xl dark:text-dark_text">{event.sub_eventsVenue}</p>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="text-2xl lg:text-3xl mr-2 text-slate-800 dark:text-dark_text" />
                        <p className="text-slate-600 text-lg lg:text-xl dark:text-dark_text">
                          {formatTime(event.sub_eventsStartTime)}
                        </p>
                        <span className="mx-2 text-slate-800 dark:text-dark_text">-</span>
                        <p className="text-slate-600 text-lg lg:text-xl dark:text-dark_text">
                          {formatTime(event.sub_eventsEndTime)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <MdPeople className="text-2xl lg:text-3xl mr-2 text-slate-800 dark:text-dark_text" />
                        <p className="text-slate-600 text-lg lg:text-xl dark:text-dark_text">
                          Organized by {event.sub_eventsOrganizer}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsOnDateModal;