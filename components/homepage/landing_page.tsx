"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PiTriangleBold } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FaArrowCircleLeft } from "react-icons/fa";
import { FaArrowCircleRight } from "react-icons/fa";
import { HiMiniCalendarDays } from "react-icons/hi2";

export default function LandingPage() {
    const supabase = createClientComponentClient();
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [startIndex, setStartIndex] = useState(0);

    const FetchEvents = async () => {
        const { data, error } = await supabase
            .from("internal_events")
            .select("*")
            .gte("intFEventEndDate", new Date().toISOString())
            .order("intFEventEndDate", { ascending: true });

        if (error) {
            console.error("Error fetching events:", error.message);
            return null;
        }

        setUpcomingEvents(data);
    }

    useEffect(() => {
        FetchEvents();
    }, []);

    const nextSlide = () => {
        setStartIndex((prevIndex) => {
            if (prevIndex + 3 >= upcomingEvents.length) {
                return 0;
            }
            return prevIndex + 1;
        });
    };

    const prevSlide = () => {
        setStartIndex((prevIndex) => {
            if (prevIndex === 0) {
                return upcomingEvents.length - 3;
            }
            return prevIndex - 1;
        });
    };

    return (
        <div>
            <nav className="text-black font-bold flex justify-between items-center px-4 py-2 mt-2">
                <div className="flex items-center ml-28">
                    <Image
                        src="/swinburne_logo.png"
                        alt="Swinburne Logo"
                        width={200}
                        height={50}
                    />
                </div>
                <div className="flex items-center space-x-6 mr-10">
                    <Link legacyBehavior href="/">
                        <a className="hover:text-slate-500">Upcoming Event(s)</a>
                    </Link>
                    <Link legacyBehavior href="/about">
                        <a className="hover:text-slate-500">Past Attended Event(s)</a>
                    </Link>
                    <Link legacyBehavior href="/services">
                        <a className="hover:text-slate-500">Nominations/ Travelling Form</a>
                    </Link>
                    <Link legacyBehavior href="/login">
                        <Button className="bg-white text-black border-2 border-black-500 font-bold hover:bg-slate-200">
                            Login as Admin
                        </Button>
                    </Link>
                </div>
            </nav>

            <div className="flex justify-center items-center px-4 py-2 mt-2">
                <div className="flex justify-center items-center w-1/2 ml-20">
                    <div>
                        <h1 className="text-[72px] text-black font-bold">Great Events Start Here</h1>
                        <p className="text-[20px] mb-4">Here&apos;s all you need to know!</p>
                        <Button>
                            View Upcoming Event(s)
                        </Button>
                    </div>
                </div>
                <div className="flex justify-center items-center w-1/2">
                    <Image
                        src="/images/man-planning-on-calendar-vector.png"
                        alt="Event Manager"
                        width={850}
                        height={50}
                    />
                </div>
            </div>

            <div className="mt-32 mb-32">
                <div className="inset-0 transform skew-y-3 h-20 bg-[#ededed]"></div>
            </div>

            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-4">
                    <PiTriangleBold className="transform -rotate-90" size={36} />
                    <PiTriangleBold className="transform rotate-90" size={36} />
                </div>
                <p className="text-center font-bold text-[26px]">We are setting the best experience in Swinburne University.</p>
                <div className="cards-container flex items-center justify-start overflow-hidden mt-4 relative w-3/4">
                    <div className="slider flex items-center">
                        <div className={`h-[310px] card bg-white rounded-lg shadow-lg border-1 border-black-500 m-4 w-1/3 transition-all ease-in-out space-y-4 pl-4 pt-4 pr-4`}>
                            <Image
                                src="/swinburne_logo.png"
                                alt="Event Manager"
                                className="object-cover"
                                width={150}
                                height={50}
                            />
                            <h2 className="text-lg font-bold text-justify"></h2>
                            <p className="text-gray-600 text-justify"></p>
                            <div className="flex mt-4">
                                <HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
                                <p className="text-sm font-bold mt-1"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center">
                <p className="text-center font-bold text-[26px]">Upcoming Event(s)</p>
                <div className="cards-container flex items-center justify-start overflow-hidden mt-4 relative w-3/4">
                    <div className="slider flex items-center">
                        {upcomingEvents.slice(startIndex, startIndex + 3).map((event, index) => (
                            <div
                                key={event.id}
                                className={`h-[310px] card bg-white rounded-lg shadow-lg border-1 border-black-500 m-4 w-1/3 transition-all ease-in-out space-y-4 pl-4 pt-4 pr-4`}
                            >
                                <Image
                                    src="/swinburne_logo.png"
                                    alt="Event Manager"
                                    className="object-cover"
                                    width={150}
                                    height={50}
                                />
                                <h2 className="text-lg font-bold text-justify">{event.intFEventName}</h2>
                                <p className="text-gray-600 text-justify">{event.intFEventDescription}</p>
                                <div className="flex mt-4">
                                    <HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
                                    <p className="text-sm font-bold mt-1">{event.intFEventStartDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    {upcomingEvents.length > 3 && (
                        <div className="slider-controls flex space-x-4 cursor-pointer mt-5">
                            <FaArrowCircleLeft onClick={prevSlide} size={32} />
                            <FaArrowCircleRight onClick={nextSlide} size={32} />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-32 mb-32">
                <div className="inset-0 transform skew-y-3 h-20 bg-[#ededed]"></div>
            </div>

            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-4">
                    <PiTriangleBold className="transform -rotate-90" size={36} />
                    <PiTriangleBold className="transform rotate-90" size={36} />
                </div>
                <p className="text-center font-bold text-[26px]">Attended Event(s)</p>
                <div className="flex justify-center items-center px-4 py-2 mt-2">
                    <div className="flex justify-center items-center">
                        <Image
                            src="/images/appointment-booking-with-smartphone-man_23-2148576384.png"
                            alt="Event Manager"
                            width={850}
                            height={50}
                        />
                    </div>
                    <div className="flex justify-center items-center ml-20">
                        <div>
                            <p className="text-[32px] font-bold mb-2 italic">- Just One Click Away -</p>
                            <p className="text-[22px] font-bold mb-2">View Past Attended Event(s)</p>
                            <p className="pr-5">Are you looking to view your past attended event(s) to see how many hour(s) are claim-able for this year?</p>
                            <Button className="mt-5">
                                View
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-32 bottom-0">
                <div className="relative">
                    <div className="inset-0 transform skew-y-3 h-20 bg-[#2c3033]"></div>
                    <div className="absolute mt-14 inset-0 transform skew-y-3 h-20 bg-[#2c3033]"></div>
                    <div className="bg-[#2c3033] pl-32 pt-7">
                        <div className="flex items-start justify-start">
                            <Image src="/swinburne_logo.png" alt="Swinburne Logo" width={250} height={50} />
                        </div>
                        <div className="pb-4 text-white pt-4 w-1/4 text-justify">
                            <p>
                                The Event Management and Attendance (EMAT) System is developed by a group of students for their Final Year Project (FYP) since August/ September 2023.
                            </p>
                        </div>
                        <div className="text-center bottom-0 text-white pt-4 text-xs">
                            <p>© 2024 Swinburne University of Technology, Sarawak. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>


        </div >
    )
};

