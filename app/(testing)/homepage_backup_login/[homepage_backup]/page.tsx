"use client"

import SideBarDesktop from "@/components/layouts/SideBarDesktop";
import SideBarMobile from "@/components/layouts/SideBarMobile";
import TopBar from "@/components/layouts/TopBar";
import ViewEvent_Modal from "@/components/ViewEvent_Modal_backup";
import CreateEvent_Modal from "@/components/CreateEvent_Modal";
import Success_Modal from "@/components/Modal";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useParams, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUsers, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { IoIosAddCircleOutline } from "react-icons/io";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FiClock } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6"
import { AiOutlineFieldTime } from "react-icons/ai";
import { BsTicketPerforated } from "react-icons/bs"
import { MdPeople } from "react-icons/md"
import { MdAirlineSeatReclineNormal } from "react-icons/md"
import { GrStatusWarning } from "react-icons/gr"
import { useRouter } from 'next/navigation'

import tick_mark_img from '@/public/img/tick_mark.png'

// import {Calendar} from "@/components/layouts/calendar";


const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatTime = (timeString) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', options);

    // Convert to lowercase and remove the space
    return formattedTime.replace(' ', '').toLowerCase();
};

type Info = {
    intFID: string;
    intFEventName: string;
    intFDescription: string;
    intFVenue: string;
    intFMaximumSeats: number;
    intFStartDate: string;
    intFStartTime: string;
    intFEndTime: string;
    intFOrganizer: string;
    intFFaculty: string;
};

type Login = {
    id: string
    firebase_uid: string;
};

export default function Homepage() {
    const { homepage_backup } = useParams();

    console.log(homepage_backup);
    const router = useRouter()

    const supabase = createClientComponentClient();
    const [info, setInfo] = useState<Info>({} as Info);
    const [infos, setInfos] = useState<Info[]>([] as Info[]);
    // const [latestEvent, setLatestEvent] = useState<Info | null>(null);
    const [latestEvent, setLatestEvent] = useState<Info[]>([]);
    const [selectedEvent, setSelectedEvent] = useState({ intFID: '', intFDescription: '', intFStartDate: '', intFStartTime: '', intFEndTime: '', intFVenue: '', intFMaximumSeats: '' });
    const malaysiaTimezone = "Asia/Kuala_Lumpur";

    const [showModalCreateEvent, setShowModalCreateEvent] = useState(false);
    const [showModalViewEvent, setShowModalViewEvent] = useState(false);
    const [selectedEventImage, setSelectedEventImage] = useState('');

    const [showModalSuccess, setShowModalSuccess] = useState(false);

    const [login, setLogin] = useState<Login>({} as Login);
    const [logins, setLogins] = useState<Login[]>([] as Login[]);

    // Fetch data from database
    useEffect(() => {
        const fetchLogins = async () => {
            const { data } = await supabase.from("login").select("id, firebase_uid");
            setLogins(data || []); // Ensure data is not null
            if (data && data.length > 0) {
                setLogin(data[0]);
            }
        };
        fetchLogins();
    }, []);

    const concatenatedID = login.id + login.firebase_uid
    const homepage = login.id + login.firebase_uid

    const testing = (login: Login) => {
        const concatenatedID = login.id + login.firebase_uid
        const homepage = login.id + login.firebase_uid
        if (concatenatedID == homepage) {
            console.log("HAIIIIII")
        }
    }

    // Function to fetch the 6 latest events
    useEffect(() => {
        const fetchLatestEvent = async () => {
            const { data, error } = await supabase
                .from('internal_events')
                .select('intFID, intFEventName, intFDescription, intFVenue, intFMaximumSeats, intFStartDate, intFStartTime, intFEndTime')
                .gte('intFStartDate', new Date().toLocaleString("en-US", { timeZone: malaysiaTimezone }))
                .order('intFStartDate', { ascending: true })
                .order('intFStartTime', { ascending: true })
                .range(0, 5);

            if (error) {
                console.error('Error fetching latest event:', error);
            } else {
                setLatestEvent(data);
            }
        };

        fetchLatestEvent();
    }, [supabase]);

    const openModal = (imageSrc, event_id, event_description, event_start_date, event_start_time, event_end_time, event_venue, event_maximum_seats) => {
        setSelectedEventImage(imageSrc);
        setSelectedEvent({
            intFID: event_id,
            intFDescription: event_description,
            intFStartDate: event_start_date,
            intFStartTime: event_start_time,
            intFEndTime: event_end_time,
            intFVenue: event_venue,
            intFMaximumSeats: event_maximum_seats
        });
        setShowModalViewEvent(true);
    };

    // Handle data submission
    const handleSubmitCreateEvent = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase.from("internal_events").insert({
            intFEventName: info.intFEventName,
            intFDescription: info.intFDescription,
            intFVenue: info.intFVenue,
            intFMaximumSeats: info.intFMaximumSeats,
            intFStartDate: info.intFStartDate,
            intFStartTime: info.intFStartTime,
            intFEndTime: info.intFEndTime,
            intFOrganizer: info.intFOrganizer,
            intFFaculty: info.intFFaculty,
        });

        if (error) {
            console.error(error);
            return;
        }

        console.log(data);

        setInfos([
            ...infos,
            {
                intFID: info.intFID,
                intFEventName: info.intFEventName,
                intFDescription: info.intFDescription,
                intFVenue: info.intFVenue,
                intFMaximumSeats: info.intFMaximumSeats,
                intFStartDate: info.intFStartDate,
                intFStartTime: info.intFStartTime,
                intFEndTime: info.intFEndTime,
                intFOrganizer: info.intFOrganizer,
                intFFaculty: info.intFFaculty,
            },
        ]);

        setInfo({} as Info);
    };

    const handleOK = () => {
        setShowModalSuccess(false);
        window.location.reload();
    };

    const cancelButton = (e) => {
        setShowModalViewEvent(false);
    }

    if (homepage_backup === concatenatedID) {
        return (
            <div className="h-screen flex flex-row justify-start bg-slate-100">
                <button onClick={() => testing(login)}>
                    testing
                </button>
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
                    <div className="mr-6">
                        <div className="mx-auto px-4 py-5 w-full bg-slate-100">
                            <div className="w-full flex ml-1">
                                <div className="lg:flex justify-center bg-white border border-slate-200 w-3/4 rounded-lg mb-4 hidden">
                                    <div className="w-1/3 p-4 text-left">
                                        <div className="bg-[#E5F9FF] p-5 text-slate-700 rounded-lg flex">
                                            <div className="mr-4">
                                                <FontAwesomeIcon icon={faCalendar} className="w-8 mt-[6.5px] text-slate-700" size="2x" />
                                            </div>
                                            <div className="ml-1">
                                                <p className="text-[15px]">Current date</p>
                                                <p className="font-medium">{formattedDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-1/3 p-4 text-left transition transform hover:scale-105">
                                        <a href="/upcomingEvents" className="bg-[#FFEDE5] p-5 text-slate-700 rounded-lg flex hover:bg-[#ffdcce]">
                                            <div className="mr-4">
                                                <FontAwesomeIcon icon={faUsers} className="w-8 mt-[6px] text-slate-700" size="2x" />
                                            </div>
                                            <div className="ml-1">
                                                <p className="text-[15px]">Upcoming events</p>
                                                <p className="font-medium">2</p>
                                            </div>
                                        </a>
                                    </button>

                                    <button className="w-1/3 p-4 text-left transition transform hover:scale-105">
                                        <a href="/pastEvents" className="bg-[#EAE5FF] p-5 text-slate-700 rounded-lg flex hover:bg-[#e0d8ff]">
                                            <div className="mr-4">
                                                <FontAwesomeIcon icon={faCheckCircle} className="w-[34px] mt-[6px] text-slate-700" size="2x" />
                                            </div>
                                            <div className="ml-1">
                                                <p className="text-[15px]">Past events</p>
                                                <p className="font-medium">2</p>
                                            </div>
                                        </a>
                                    </button>
                                </div>

                                <div className="w-1/4 mt-4 flex justify-end items-start mr-1">
                                    <button className="flex items-center bg-slate-800 rounded-lg py-3 px-[30px] font-medium hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm mt-4 
                                    -mr-[15px] hover:text-slate-50 justify-end text-right hover:transition duration-300 transform hover:scale-105 cursor-pointer" onClick={() => setShowModalCreateEvent(true)}>
                                        <IoIosAddCircleOutline className="text-3xl text-slate-100 -ml-1 mr-1" />
                                        <span className="text-slate-100 ml-1">Add Events</span>
                                    </button>
                                </div>

                                <CreateEvent_Modal isVisible={showModalCreateEvent} onClose={() => setShowModalCreateEvent(false)}>
                                    <form onSubmit={handleSubmitCreateEvent}>

                                        <div className="py-[90px] relative">

                                            <div className="ml-[7px] lg:ml-4">

                                                <h3 className="text-[16px] lg:text-lg font-semibold text-slate-700 mb-2 -mt-[80px]">Create Event</h3>
                                                <hr className="border-t-2 border-slate-200 my-4 w-[505px]" />

                                                <p className="text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 ml-[1px]">
                                                    Name
                                                    <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                </p>
                                                <input
                                                    className="px-[290px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
                                                    type="text"
                                                    placeholder="Event name"
                                                    id="event_name"
                                                    name="event_name"
                                                    required
                                                    onChange={e =>
                                                        setInfo({ ...info, intFEventName: e.target.value })
                                                    }
                                                />

                                                <p className="text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
                                                    Description
                                                    <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                </p>
                                                <input
                                                    className="px-[290px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
                                                    type="text"
                                                    placeholder="Description"
                                                    name="event_description"
                                                    required
                                                    onChange={e =>
                                                        setInfo({ ...info, intFDescription: e.target.value })
                                                    }
                                                />

                                                <p className="text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
                                                    Venue
                                                    <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                </p>
                                                <input
                                                    className="px-[290px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
                                                    type="text"
                                                    placeholder="Venue"
                                                    name="event_venue"
                                                    required
                                                    onChange={e =>
                                                        setInfo({ ...info, intFVenue: e.target.value })
                                                    }
                                                />

                                                <p className="text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
                                                    Maximum Seats
                                                    <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                </p>
                                                <input
                                                    className="px-[290px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
                                                    type="number"
                                                    placeholder="Maximum seats"
                                                    name="event_maximum_seats"
                                                    required
                                                    onChange={e =>
                                                        setInfo({ ...info, intFMaximumSeats: e.target.value })
                                                    }
                                                />


                                                <div className="flex flex-col mt-[10px]">
                                                    <div className="flex">
                                                        <p className="text-[14px] text-mb-7 font-normal text-slate-500 mr-[140.5px] ml-[2px] mb-[2px]">
                                                            Date
                                                            <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                        </p>
                                                        <p className="text-[14px] text-mb-7 font-normal text-slate-500 mr-2 ml-[121px] mb-[2px]">
                                                            Start Time
                                                            <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                        </p>
                                                        <p className="text-[14px] text-mb-7 font-normal text-slate-500 mr-2 ml-[26px] mb-[2px]">
                                                            End Time
                                                            <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex">
                                                        <input
                                                            className="px-[8px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mr-[139px] mb-[3px]"
                                                            type="date"
                                                            name="event_date"
                                                            required
                                                            onChange={e =>
                                                                setInfo({ ...info, intFStartDate: e.target.value })
                                                            }
                                                        />
                                                        <input
                                                            className="px-[8px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white ml-2 mr-[14px] mb-[3px]"
                                                            type="time"
                                                            name="event_start_time"
                                                            required
                                                            onChange={e =>
                                                                setInfo({ ...info, intFStartTime: e.target.value })
                                                            }
                                                        />
                                                        <input
                                                            className="px-[8px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
                                                            type="time"
                                                            name="event_end_time"
                                                            required
                                                            onChange={e =>
                                                                setInfo({ ...info, intFEndTime: e.target.value })
                                                            }
                                                        />
                                                    </div>


                                                </div>
                                                <p className="text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
                                                    Organizer
                                                    <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                </p>
                                                <input
                                                    className="px-[290px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-[3px]"
                                                    type="text"
                                                    placeholder="Organizer"
                                                    name="event_organizer"
                                                    required
                                                    onChange={e =>
                                                        setInfo({ ...info, intFOrganizer: e.target.value })
                                                    }
                                                />


                                                <p className="text-[14px] text-mb-7 mb-[2px] font-normal text-slate-500 mt-2 ml-[1px]">
                                                    Faculty
                                                    <span className="text-[14px] text-red-500 ml-[2px]">*</span>
                                                </p>
                                                <input
                                                    className="px-[290px] py-2 pl-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white -mb-[30px]"
                                                    type="text"
                                                    placeholder="Faculty"
                                                    name="event_faculty"
                                                    required
                                                    onChange={e =>
                                                        setInfo({ ...info, intFFaculty: e.target.value })
                                                    }
                                                />

                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex justify-center"
                                                    onClick={() => {
                                                        if (info.intFEventName && info.intFDescription && info.intFVenue && info.intFMaximumSeats && info.intFStartDate && info.intFStartTime && info.intFEndTime && info.intFOrganizer && info.intFFaculty) {
                                                            setShowModalSuccess(true);
                                                        }
                                                    }}>
                                                    <button className="rounded-lg py-[9px] px-[37px] bg-slate-800 text-slate-100 text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900" disabled={!info.intFEventName || !info.intFDescription || !info.intFVenue || !info.intFMaximumSeats || !info.intFStartDate || !info.intFStartTime || !info.intFEndTime || !info.intFOrganizer || !info.intFFaculty}>Submit</button>
                                                </div>

                                            </div>
                                        </div>
                                    </form>

                                </CreateEvent_Modal>

                                <ViewEvent_Modal isVisible={showModalViewEvent} onClose={() => setShowModalViewEvent(false)}>

                                    <div className="py-[30px] lg:py-[100px] relative">
                                        <img
                                            src={selectedEventImage}
                                            alt="Random"
                                            className="absolute h-[220px] lg:h-[258px] object-cover -mt-[38px] lg:-mt-[98px] rounded-t-lg -ml-[0.5px] lg:ml-2 transform hover:scale-110 hover:rotate-1 scale-[1.06] lg:scale-[1.066] transition duration-300 shadow-sm"
                                        />

                                        <div className="ml-[7px] lg:ml-[10px]">

                                            <h3 className="text-[16px] lg:text-[19px] font-semibold text-slate-800 mb-1 mt-[190px] lg:mt-[183px]">About this event</h3>
                                            <p className="text-[12px] lg:text-[14px] text-mb-7 -mb-1 lg:mb-5 font-normal text-slate-500 mt-[10px]">
                                                {selectedEvent.intFDescription}
                                            </p>

                                            <div className="flex items-center mt-4">
                                                <HiMiniCalendarDays className="text-[32px] lg:text-2xl mr-2 text-slate-800 -mt-[2px]" />
                                                <p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px] mt-[0.5px]">{formatDate(selectedEvent.intFStartDate)}</p>
                                                <span className="mx-2 text-slate-800 ml-[15px] lg:ml-[38px] mr-6">|</span>
                                                <FiClock className="text-[30px] lg:text-[21px] mr-2 text-slate-800 -mt-[1px]" />
                                                <p className="text-slate-600 text-[12px] lg:text-[13px]">{formatTime(selectedEvent.intFStartTime)}</p>
                                                <span className="mx-2 text-slate-800 -mt-[2px]">-</span>
                                                <p className="text-slate-600 text-[12px] lg:text-[13px]">{formatTime(selectedEvent.intFEndTime)}</p>
                                            </div>
                                            <div className="flex items-center mt-[10px] lg:mt-[14px]">
                                                <FaLocationDot className="text-xl lg:text-2xl -ml-[0.5px] lg:ml-0 mr-2 text-slate-800" />
                                                <p className="text-slate-600 text-[12px] lg:text-[13px] ml-[1px]">{selectedEvent.intFVenue}</p>
                                            </div>
                                            <div className="flex items-center mt-[11px] lg:mt-[14px]">
                                                <MdPeople className="text-2xl mr-2 text-slate-800 -ml-[1px] lg:ml-[1px]" />
                                                <p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] -ml-[2px] lg:ml-0">5 attendees</p>
                                            </div>
                                            <div className="flex items-center mt-[15px] lg:mb-0 mb-[3px]">
                                                <MdAirlineSeatReclineNormal className="text-2xl mr-2 text-slate-800 lg:ml-[2px]" />
                                                <p className="text-slate-600 text-[12px] lg:text-[13px] mt-[1px] lg:-ml-[1px]">{selectedEvent.intFMaximumSeats} seats</p>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
                                                <div className="flex justify-center">
                                                    <button className="rounded-lg py-[7px] px-[27px] border border-slate-800 hover:bg-slate-100 mr-4 text-[15px] focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900" onClick={cancelButton}>Cancel</button>

                                                    {/* <Link to={`/attendance/table/${selectedEvent.intFID}`}>
                                                    <button
                                                        className="rounded-lg py-[9px] px-[15px] bg-slate-800 text-slate-100 text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                                                    >
                                                        Attendance
                                                    </button>
                                                </Link> */}

                                                    <button className="rounded-lg py-[9px] px-[15px] bg-slate-800 text-slate-100 text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                                                        onClick={() => {
                                                            const eventId = 123; // Replace with your event ID
                                                            window.location.href = `/attendance/table/${selectedEvent.intFID}`;
                                                        }}
                                                    >Attendance</button>

                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </ViewEvent_Modal>

                                <Success_Modal
                                    isVisible={showModalSuccess}
                                    onClose={() => setShowModalSuccess(false)}>
                                    <div className="p-4">
                                        <Image
                                            src="/images/tick_mark.png"
                                            alt="cross_mark"
                                            width={200}
                                            height={250}
                                            className="mx-auto -mt-[39px] lg:-mt-[45px]"
                                        />
                                        <h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
                                            Success!
                                        </h3>
                                        <p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
                                            Event has been successfully created!
                                        </p>
                                        <div className="text-center ml-4">
                                            <button
                                                className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5 focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                                                onClick={handleOK}>
                                                OK
                                            </button>
                                        </div>
                                    </div>
                                </Success_Modal>

                            </div>
                        </div>

                        <div className="w-full bg-slate-100 flex pb-28">
                            <div className="w-3/4 pr-1">
                                <div className="w-full flex">

                                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] ml-5 w-1/3 relative flex flex-col transition transform hover:scale-105" onClick={() => openModal('https://source.unsplash.com/600x300?party', latestEvent[0].intFID, latestEvent[0]?.intFDescription, latestEvent[0]?.intFStartDate, latestEvent[0]?.intFStartTime, latestEvent[0]?.intFEndTime, latestEvent[0]?.intFVenue, latestEvent[0]?.intFMaximumSeats)}>

                                        {latestEvent[0] && (
                                            <div className="mt">
                                                {/* <h2 className="text-2xl font-semibold mb-2 text-slate-800">Event Title</h2> */}
                                                <h2 className="text-2xl font-semibold mb-2 text-slate-800">{latestEvent[0].intFEventName}</h2>
                                                <p className="text-gray-500 mb-4">{latestEvent[0].intFDescription}</p>
                                                <div className="flex items-center mt-4">
                                                    <HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{formatDate(latestEvent[0].intFStartDate)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FiClock className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{formatTime(latestEvent[0].intFStartTime)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FaLocationDot className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{latestEvent[0].intFVenue}</p>
                                                </div>

                                                <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
                                                    <div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-2 flex justify-between">
                                                    <span className="ml-[2px]">Current Attendees: 23</span>
                                                    <span className="mr-[2px]">Max Attendees: 120</span>
                                                </div>

                                                <div className="flex justify-between items-end mt-5">
                                                    <a href="#" className="cursor-pointer text-slate-500 hover:font-medium">Read more...</a>
                                                    <span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
                                                        <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                                        <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                        <span className="relative mt-[1px] leading-3 tracking-wider">Upcoming</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] ml-5 w-1/3 relative flex flex-col transition transform hover:scale-105" onClick={() => openModal('https://source.unsplash.com/600x300?birthday', latestEvent[1].intFID, latestEvent[1]?.intFDescription, latestEvent[1]?.intFStartDate, latestEvent[1]?.intFStartTime, latestEvent[1]?.intFEndTime, latestEvent[1]?.intFVenue, latestEvent[1]?.intFMaximumSeats)}>

                                        {latestEvent[1] && (
                                            <div>
                                                <h2 className="text-2xl font-semibold mb-2 text-slate-800">{latestEvent[1].intFEventName}</h2>
                                                <p className="text-gray-500">{latestEvent[1].intFEventName}</p>
                                                <div className="flex items-center mt-4">
                                                    <HiMiniCalendarDays className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{formatDate(latestEvent[1].intFStartDate)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FiClock className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{formatTime(latestEvent[1].intFStartTime)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FaLocationDot className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{latestEvent[1].intFVenue}</p>
                                                </div>
                                                <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
                                                    <div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-2 flex justify-between">
                                                    <span className="ml-[2px]">Current Attendees: 23</span>
                                                    <span className="mr-[2px]">Max Attendees: 120</span>
                                                </div>

                                                <div className="flex justify-between items-end mt-5">
                                                    <a href="#" className="cursor-pointer text-slate-500 hover:font-medium">Read more...</a>
                                                    <span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
                                                        <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                                        <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                        <span className="relative mt-[1px] leading-3 tracking-wider">Upcoming</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] ml-5 w-1/3 relative flex flex-col transition transform hover:scale-105" onClick={() => openModal('https://source.unsplash.com/600x300?new+year', latestEvent[2].intFID, latestEvent[2]?.intFDescription, latestEvent[2]?.intFStartDate, latestEvent[2]?.intFStartTime, latestEvent[2]?.intFEndTime, latestEvent[2]?.intFVenue, latestEvent[2]?.intFMaximumSeats)}>

                                        {latestEvent[2] && (
                                            <div>
                                                <h2 className="text-2xl font-semibold mb-2 text-slate-800">{latestEvent[2].intFEventName}</h2>
                                                <p className="text-gray-500">{latestEvent[2].intFDescription}</p>
                                                <div className="flex items-center mt-4">
                                                    <HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 -mt-[2px]" />
                                                    <p className="text-slate-600 text-sm">{formatDate(latestEvent[2].intFStartDate)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FiClock className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{formatTime(latestEvent[2].intFStartTime)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FaLocationDot className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{latestEvent[2].intFVenue}</p>
                                                </div>
                                                <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
                                                    <div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-2 flex justify-between">
                                                    <span className="ml-[2px]">Current Attendees: 23</span>
                                                    <span className="mr-[2px]">Max Attendees: 120</span>
                                                </div>

                                                <div className="flex justify-between items-end mt-5">
                                                    <a href="#" className="cursor-pointer text-slate-500 hover:font-medium">Read more...</a>
                                                    <span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
                                                        <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                                        <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                        <span className="relative mt-[1px] leading-3 tracking-wider">Upcoming</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                <div className="w-full flex mt-5">

                                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] ml-5 w-1/3 relative flex flex-col transition transform hover:scale-105" onClick={() => openModal('https://source.unsplash.com/600x300?events', latestEvent[3].intFID, latestEvent[3]?.intFDescription, latestEvent[3]?.intFStartDate, latestEvent[3]?.intFStartTime, latestEvent[3]?.intFEndTime, latestEvent[3]?.intFVenue, latestEvent[3]?.intFMaximumSeats)}>

                                        {latestEvent[3] && (
                                            <div>
                                                <h2 className="text-2xl font-semibold mb-2 text-slate-800">{latestEvent[3].intFEventName}</h2>
                                                <p className="text-gray-500">{latestEvent[3].intFDescription}</p>
                                                <div className="flex items-center mt-4">
                                                    <HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 -mt-[2px]" />
                                                    <p className="text-slate-600 text-sm">{formatDate(latestEvent[3].intFStartDate)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FiClock className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{formatTime(latestEvent[3].intFStartTime)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FaLocationDot className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">A312</p>
                                                </div>
                                                <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
                                                    <div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-2 flex justify-between">
                                                    <span className="ml-[2px]">Current Attendees: 23</span>
                                                    <span className="mr-[2px]">Max Attendees: 120</span>
                                                </div>

                                                <div className="flex justify-between items-end mt-5">
                                                    <a href="#" className="cursor-pointer text-slate-500 hover:font-medium">Read more...</a>
                                                    <span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
                                                        <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                                        <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                        <span className="relative mt-[1px] leading-3 tracking-wider">Upcoming</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] ml-5 w-1/3 relative flex flex-col transition transform hover:scale-105" onClick={() => openModal('https://source.unsplash.com/600x300?balloon', latestEvent[4].intFID, latestEvent[4]?.intFDescription, latestEvent[4]?.intFStartDate, latestEvent[4]?.intFStartTime, latestEvent[4]?.intFEndTime, latestEvent[4]?.intFVenue, latestEvent[4]?.intFMaximumSeats)}>

                                        {latestEvent[4] && (
                                            <div>
                                                <h2 className="text-2xl font-semibold mb-2 text-slate-800">{latestEvent[4].intFEventName}</h2>
                                                <p className="text-gray-500">{latestEvent[4].intFDescription}</p>
                                                <div className="flex items-center mt-4">
                                                    <HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 -mt-[2px]" />
                                                    <p className="text-slate-600 text-sm">{formatDate(latestEvent[4].intFStartDate)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FiClock className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{formatTime(latestEvent[4].intFStartTime)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FaLocationDot className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{latestEvent[4].intFVenue}</p>
                                                </div>
                                                <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
                                                    <div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-2 flex justify-between">
                                                    <span className="ml-[2px]">Current Attendees: 23</span>
                                                    <span className="mr-[2px]">Max Attendees: 120</span>
                                                </div>

                                                <div className="flex justify-between items-end mt-5">
                                                    <a href="events/viewEvent" className="cursor-pointer text-slate-500 hover:font-medium">Read more...</a>
                                                    <span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
                                                        <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                                        <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                        <span className="relative mt-[1px] leading-3 tracking-wider">Upcoming</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden p-6 h-[340px] ml-5 w-1/3 relative flex flex-col transition transform hover:scale-105" onClick={() => openModal('https://source.unsplash.com/600x300?celebration', latestEvent[5].intFID, latestEvent?.intFDescription, latestEvent[5]?.intFStartDate, latestEvent[5]?.intFStartTime, latestEvent[5]?.intFEndTime, latestEvent[5]?.intFVenue, latestEvent[5]?.intFMaximumSeats)}>

                                        {latestEvent[5] && (
                                            <div>
                                                <h2 className="text-2xl font-semibold mb-2 text-slate-800">{latestEvent[5].intFEventName}</h2>
                                                <p className="text-gray-500">{latestEvent[5].intFEventName}</p>
                                                <div className="flex items-center mt-4">
                                                    <HiMiniCalendarDays className="text-2xl mr-2 text-slate-800 -mt-[2px]" />
                                                    <p className="text-slate-600 text-sm">{formatDate(latestEvent[5].intFStartDate)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FiClock className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{formatTime(latestEvent[5].intFStartTime)}</p>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <FaLocationDot className="text-2xl mr-2 text-slate-800" />
                                                    <p className="text-slate-600 text-sm">{latestEvent[5].intFVenue}</p>
                                                </div>
                                                <div className="mt-4 w-full h-[10px] bg-gray-200 rounded-full relative">
                                                    <div className="h-full bg-orange-300 rounded-full" style={{ width: `${(20 / 60) * 100}%` }}></div>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-2 flex justify-between">
                                                    <span className="ml-[2px]">Current Attendees: 23</span>
                                                    <span className="mr-[2px]">Max Attendees: 120</span>
                                                </div>

                                                <div className="flex justify-between items-end mt-5">
                                                    <a href="#" className="cursor-pointer text-slate-500 hover:font-medium">Read more...</a>
                                                    <span className="relative px-3 py-[5px] font-semibold text-orange-900 text-xs flex items-center">
                                                        <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                                        <AiOutlineFieldTime className="mr-1 text-2xl font-bold relative" />
                                                        <span className="relative mt-[1px] leading-3 tracking-wider">Upcoming</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <div className="w-1/4 pl-5">
                                <div className="bg-white border border-slate-200 rounded-lg p-6 h-[470px] transition transform hover:scale-105">
                                    <h2 className="text-2xl font-semibold mb-2">Calendar</h2>
                                    {/* <Calendar /> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
        // } else {
        //     router.push('/404');
        // }

    }
}
