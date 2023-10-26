"use client"
import React, { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import SideBarDesktop from '@/components/layouts/SideBarDesktop';
import SideBarMobile from '@/components/layouts/SideBarMobile';
import TopBar from '@/components/layouts/TopBar';

const CreateEventForm: React.FC = () => {
  const [faculty, setFaculty] = useState('Engineering'); // Default value is Engineering
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFaculty(e.target.value);
  };

  const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVenue(e.target.value);
  };

  const handleOrganizerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrganizer(e.target.value);
  };

  const handleCancel = () => {
    // Handle cancel button logic here
  };
  return (
    <div className=" flex flex-row justify-start bg-slate-100">
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
  
        <div className="h-full flex justify-center items-center">
        <div className="bg-[#e5f9ffad] p-8 rounded-lg shadow-2xl w-4/5 h-8/9 transition duration-300 hover:shadow-3xl hover:scale-105">
            <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
              Create Event
            </h1>
            <form className="flex flex-col space-y-4">
              {/* Event Name */}
              <label htmlFor="eventName" className="block text-lg mb-1 tracking-wide">
                Event Name
              </label>
              <input
                id="eventName"
                className="p-4 border rounded-md text-lg w-1/2"
                type="text"
                required
              />
  
              {/* Event Description */}
              <label htmlFor="eventDescription" className="block text-lg mb-1 tracking-wide">
                Event Description
              </label>
              <textarea
                id="eventDescription"
                className="p-4 border rounded-md h-32 resize-none text-lg"
                required
              />
  
              {/* Faculty */}
              <label htmlFor="faculty" className="block text-lg mb-1 tracking-wide">
                Faculty/Unit
              </label>
              <select
              id="faculty"
              className="p-4 border rounded-md text-lg bg-white text-slate-800 appearance-none"
              value={faculty}
              onChange={handleFacultyChange}
            >
              <option value="-">Select Faculty/Unit</option>
              <option value="Engineering">Engineering</option>
              <option value="Computing">Computing</option>
              <option value="Business">Business</option>
            </select>
             {/* ...Date and Time Fields */}
             <div className="flex flex-row space-x-4">
                <div className="flex-1">
                  <label htmlFor="startDate" className="block text-lg mb-1 tracking-wide">
                   Date
                  </label>
                  <input
                    id="startDate"
                    className="p-4 border rounded-md text-lg"
                    type="date"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="startTime" className="block text-lg mb-1 tracking-wide">
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    className="p-4 border rounded-md text-lg"
                    type="time"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="endTime" className="block text-lg mb-1 tracking-wide">
                    End Time
                  </label>
                  <input
                    id="endTime"
                    className="p-4 border rounded-md text-lg"
                    type="time"
                    required
                  />
                </div>
              </div>

  
              {/* Venue */}
              <label htmlFor="venue" className="block text-lg mb-1 tracking-wide">
                Venue
              </label>
              <input
                id="venue"
                className="p-4 border rounded-md text-lg w-1/3"
                type="text"
                required
              />
  
              {/* Organizer */}
              <label htmlFor="organizer" className="block text-lg mb-1 tracking-wide">
                Organizer
              </label>
              <input
                id="organizer"
                className="p-4 border rounded-md text-lg w-1/3"
                type="text"
                required
              />
  

{/* Submit Button */}
<div className="flex mt-6 w-full justify-between">
  <div className="w-1/2">
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md text-lg transition duration-300 w-full"
      type="submit"
    >
      Create Event
    </button>
  </div>
  <div className="w-1/2 ml-2">
    <button
      className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-md text-lg transition duration-300 w-full"
      type="button"
      onClick={handleCancel}
    >
      Cancel
    </button>
  </div>
</div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventForm;
