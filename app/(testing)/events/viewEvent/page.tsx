import React from 'react';
import {
  FaInfoCircle,
  FaUserCheck,
  FaCheckCircle,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';
import { FaLocationDot } from 'react-icons/fa6';
import SideBarDesktop from '@/components/layouts/SideBarDesktop';
import SideBarMobile from '@/components/layouts/SideBarMobile';
import TopBar from '@/components/layouts/TopBar';
import { HiMiniCalendarDays, } from "react-icons/hi2";

const ViewEventDetails: React.FC = () => {
  const eventData = {
    eventName: 'Business Training',
    eventDescription: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquaipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquaipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquaipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquaipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua  ',
    status: 'Completed',
    staffAttended: 50,
    venue: 'Lecture Hall',
    date: '2023-12-31',
    startTime: '18:00',
    endTime: '20:00',
  };

  return (
    <div className="h-screen flex flex-row justify-start bg-slate-100">
    <div className="sm:hidden">
      <SideBarMobile />
    </div>

    <div className="hidden sm:flex">
      <SideBarDesktop />
    </div>

    <div className="flex-1">
      <div className="hidden sm:block">   
        <TopBar />
      </div>
    <div className="h-screen flex flex-row justify-center items-center bg-slate-200">
      <div className="bg-white p-8 rounded-xl shadow-lg space-y-8 w-full max-w-4xl flex flex-col items-start">

        <div className="flex items-center space-x-4">
          <FaInfoCircle className="text-3xl text-slate-800" />
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{eventData.eventName}</h1>
          </div>
        </div>

        <div className="flex w-full">
          <div className="w-2/3 pr-8">
            <div className="bg-white rounded-lg p-4 shadow-md transform hover:scale-105 hover:rotate-2 transition duration-300">
              <div className="text-slate-700">
                <p className="h-full">{eventData.eventDescription}</p>
              </div>
            </div>
          </div>

          <div className="w-1/3 flex flex-col space-y-4 max-w-xs">
            <div className="bg-white rounded-lg p-4 shadow-md transform hover:scale-105 hover:rotate-2 transition duration-300">
              <h2 className="text-lg font-semibold">Status:</h2>
              <p className="text-green-500 font-bold">{eventData.status}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md transform hover:scale-105 hover:rotate-2 transition duration-300">
              <h2 className="text-lg font-semibold">Total Staff Attended:</h2>
              <p>{eventData.staffAttended}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md transform hover:scale-105 hover:rotate-2 transition duration-300">
              <h2 className="text-lg font-semibold mb-2">Details</h2>
              <div className="flex items-center space-x-2">
                <FaLocationDot className="text-2xl mr-2 text-slate-800" />
                <p>{eventData.venue}</p>
              </div>

              <div className="flex items-center space-x-2">
                <HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 -mt-[2px]" />
                <p>{eventData.date}</p>
              </div>

              <div className="flex items-center space-x-2">
                <FiClock className="text-2xl mr-2 text-slate-800" />
                <p>Start: {eventData.startTime}</p>
              </div>

              <div className="flex items-center space-x-2">
                <FiClock className="text-2xl mr-2 text-slate-800" />
                <p>End: {eventData.endTime}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-4">
          {/* Buttons for Attendance, Cancel Event, and Edit Event */}
          <button className="bg-slate-500 hover:bg-slate-600 text-white py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105">
            <FaUserCheck className="text-lg inline-block mr-2" />
            Attendance
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105">
            <FaEdit className="text-lg inline-block mr-2" />
            Edit Event
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105">
            <FaTrash className="text-lg inline-block mr-2" />
            Cancel Event
          </button>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default ViewEventDetails;
