"use client"
import React, { useState } from 'react';
import SideBarDesktop from '@/components/layouts/SideBarDesktop';
import SideBarMobile from '@/components/layouts/SideBarMobile';
import TopBar from '@/components/layouts/TopBar';

const EditEventForm: React.FC = () => {
  const [eventName, setEventName] = useState('Sample Event');
  const [eventDescription, setEventDescription] = useState('This is a sample event description.');
  const [faculty, setFaculty] = useState('Engineering');
  const [startDate, setStartDate] = useState('2023-12-31');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [venue, setVenue] = useState('Sample Venue');
  const [organizer, setOrganizer] = useState('Sample Organizer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  const handleCancel = () => {
    // Handle cancel button logic here
  };

  return (
    <div className="flex flex-row justify-start bg-slate-100 ">
      {/* Sidebar */}
      <div className="sm:hidden">
      <SideBarMobile />
      </div>
      <div className="hidden sm:flex">
      <SideBarDesktop />
      </div>

      {/* Main Content */}
      <div className="flex-1">
      <div className="hidden sm:block">
          <TopBar />
        </div>
        {/* TopBar component */}
        <div className="h-full flex justify-center items-center">
          <div className="bg-[#e5f9ffad] p-8 rounded-lg shadow-2xl w-4/5 h-8/9 transition duration-300 hover:shadow-3xl hover:scale-105">
            <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
              Edit Event
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <label htmlFor="eventName" className="block text-lg mb-1 tracking-wide">
                Event Name
              </label>
              <input
                className="p-4 border rounded-md text-lg w-1/2"
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
              {/* Event Description */}
              <label htmlFor="eventDescription" className="block text-lg mb-1 tracking-wide">
                Event Description
              </label>        
              <textarea
                className="p-4 border rounded-md h-32 resize-none text-lg"
                placeholder="Event Description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                required
              />
              <div className="flex flex-row space-x-4">
                <div className="flex-1">
                  <label className="block text-lg mb-1">Date</label>
                  <input
                    className="p-4 border rounded-md text-lg"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-lg mb-1">Start Time</label>
                  <input
                    className="p-4 border rounded-md text-lg"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-lg mb-1">End Time</label>
                  <input
                    className="p-4 border rounded-md text-lg"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-lg mb-1">Faculty/Unit</label>
                  <select
                    className="p-4 border rounded-md text-lg"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    required
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Computing">Computing</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>
              {/* Venue */}
              <label htmlFor="venue" className="block text-lg mb-1 tracking-wide">
                Venue
              </label>
              <input
                className="p-4 border rounded-md text-lg w-1/3"
                type="text"
                placeholder="Venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
              {/* Organizer */}
              <label htmlFor="organizer" className="block text-lg mb-1 tracking-wide">
                Organizer
              </label>              
              <input
                className="p-4 border rounded-md text-lg w-1/3"
                type="text"
                placeholder="Organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                required
              />

          {/* Submit Button */}
          <div className="flex mt-6 w-full justify-between">
            <div className="w-1/2">
              <button
                className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-md text-lg transition duration-300 w-full"
                type="submit"
              >
                Save Changes
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

export default EditEventForm;
