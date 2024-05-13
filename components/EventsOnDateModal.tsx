import React, { useState } from 'react';
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FiClock } from 'react-icons/fi';
import { FaLocationDot } from "react-icons/fa6";
import { MdPeople } from 'react-icons/md';
import { IoIosAddCircleOutline } from "react-icons/io";
import { LiaQrcodeSolid } from "react-icons/lia";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  events: any[];
  selectedDate: string;
  onAddEvent: (selectedDate: string) => void;
}

const EventsOnDateModal: React.FC<ModalProps> = ({ isVisible, onClose, events, selectedDate, onAddEvent }) => {
  const [showQRCodesAttendance, setShowQRCodesAttendance] = useState(false);
  const [showQRCodesFeedback, setShowQRCodesFeedback] = useState(false);
  const [selectedSubEventID, setSelectedSubEventID] = useState<string>("");

  if (!isVisible) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target && (e.target as HTMLDivElement).id === 'wrapper') {
      onClose();
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, -3);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(error => {
        toast.error("Copy failed:", error);
      });
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
            <h2 className="flex items-center justify-between text-2xl lg:text-3xl font-semibold mb-6 text-slate-800 dark:text-dark_text">
              <span>Events on {selectedDate}</span>
              <button
                className="bg-slate-800 rounded py-1 px-3 font-medium hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm hover:text-slate-50 hover:transition duration-300 transform hover:scale-105 cursor-pointer flex items-center dark:hover:bg-slate-800"
                onClick={() => onAddEvent(selectedDate)}
              >
                <IoIosAddCircleOutline className="text-[18px] text-slate-100" />
                <span className="text-slate-100 ml-1 text-sm">Add Event</span>
              </button>
            </h2>

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

                    <div className="flex justify-center mt-4">
                      <button
                        type="button"
                        className="flex items-center bg-slate-200 rounded-lg py-1 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ml-2 lg:ml-3 px-[5px] dark:bg-[#242729]"
                        onClick={() => {
                          setSelectedSubEventID(event.sub_eventsID);
                          setShowQRCodesAttendance(true);
                        }}
                      >
                        <span className="ml-2 text-slate-800 flex items-center mr-2">
                          <LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
                          <span className="ml-[3px] lg:ml-[5px] -mt-[1px] text-[11px] lg:text-[14px] dark:text-[#C1C7C1]">
                            Attendance
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        className="flex items-center bg-slate-200 rounded-lg py-2 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ml-2 lg:ml-9 px-[9px] dark:bg-[#242729]"
                        onClick={() => {
                          setSelectedSubEventID(event.sub_eventsID);
                          setShowQRCodesFeedback(true);
                        }}
                      >
                        <span className="ml-2 text-slate-800 flex items-center mr-2">
                          <LiaQrcodeSolid className="text-[23px] dark:text-[#C1C7C1]" />
                          <span className="ml-[3px] lg:ml-[5px] -mt-[1px] text-[11px] lg:text-[14px] dark:text-[#C1C7C1]">
                            Feedback
                          </span>
                        </span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showQRCodesAttendance && (
      <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[100]">
        <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto dark:bg-dark_mode_card relative">
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={() => setShowQRCodesAttendance(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="lg:text-2xl font-medium text-gray-600 mb-3 mt-1 text-center dark:text-slate-200">
            Attendance Forms
          </h3>
          <div className="flex flex-col items-center justify-center">
            <QRCodeCanvas
              className="bg-white p-1"
              value={`${window.location.origin}/form/${selectedSubEventID}`}
              size={256}
            />
            <button
              onClick={() =>
                copyToClipboard(
                  `${window.location.origin}/form/${selectedSubEventID}`
                )
              }
              className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px]  dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    )}

{showQRCodesFeedback && (
  <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[100]">
    <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto dark:bg-dark_mode_card relative">
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={() => setShowQRCodesFeedback(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 className="lg:text-2xl font-medium text-gray-600 mb-3 mt-1 text-center dark:text-slate-200">
        Feedback Forms
      </h3>
      <div className="flex flex-col items-center justify-center">
        <QRCodeCanvas
          className="bg-white p-1"
          value={`${window.location.origin}/form/feedback/${selectedSubEventID}`}
          size={256}
        />
        <button
          onClick={() =>
            copyToClipboard(
              `${window.location.origin}/form/feedback/${selectedSubEventID}`
            )
          }
          className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg px-[20px] py-[7px] dark:bg-[#242729] dark:text-[#C1C7C1] transform hover:scale-105"
        >
          Copy Link
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default EventsOnDateModal;