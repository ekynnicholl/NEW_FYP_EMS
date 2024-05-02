"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PiTriangleBold } from "react-icons/pi";
import BestExperience from "@/components/homepage/best_experience";
import UpcomingEventsLanding from "@/components/homepage/upcoming_events";
import LandingIntro from "@/components/homepage/landing_intro";
import PastAttended from "@/components/homepage/past_attended";
import { useEffect, useState, useRef } from "react";
import { FaCircleArrowUp } from "react-icons/fa6";

export default function LandingPage() {
    const [showScrollButton, setShowScrollButton] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href')?.substring(1);
                const targetElement = document.getElementById(targetId ?? '');
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleScroll = () => {
            if (window.scrollY > 500) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);


    return (
        <div>
            <div className="scroll-smooth p-2 lg:p-0">

                <nav className="text-black font-bold flex flex-col lg:flex-row justify-between items-center px-4 py-2 mt-2">
                    <div className="flex items-center lg:ml-28 mb-4 lg:mb-0 hidden lg:block">
                        <Image
                            src="/swinburne_logo.png"
                            alt="Swinburne Logo"
                            width={200}
                            height={50}
                        />
                    </div>
                    <div className="hidden lg:flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6 lg:mr-10 text-center lg:text-left">
                        <Link legacyBehavior href="#upcomingEvents">
                            <a className="hover:text-slate-500">Upcoming Event(s)</a>
                        </Link>
                        <Link legacyBehavior href="#pastAttended">
                            <a className="hover:text-slate-500">Past Attended Event(s)</a>
                        </Link>
                        <Link legacyBehavior href="/form/external">
                            <a className="hover:text-slate-500" target="_blank">
                                Nominations/ Travelling Form
                            </a>
                        </Link>
                        <Link legacyBehavior href="/login">
                            <Button className="bg-white text-black border-2 border-black-500 font-bold hover:bg-slate-200 transition-all ease-in-out whitespace-nowrap">
                                Login as Admin
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Mobile Responsiveness */}
                <div id="navbar" className="fixed top-0 left-0 w-full flex items-center justify-between px-8 py-[16px] bg-white z-50 transition-all duration-300 lg:hidden">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 font-Nudito -ml-3">
                            <span className="text-slate-900"><span className="text-[#014167]">&lt;</span><span className="text-slate-900">SWINBURNE</span><span className="text-[#014167]">/&gt;</span></span>
                        </h1>
                    </div>

                    <div>
                        <div className="relative">
                            <button
                                type="button"
                                className="text-slate-900 hover:text-gray-800 focus:outline-none focus:text-gray-800 -mt-[4px] float-right -mr-3"
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Toggle menu"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 flex justify-center items-center">
                                    <div
                                        ref={menuRef}
                                        tabIndex={-1}
                                        className="absolute right-0 top-0 h-full w-64 bg-white border border-gray-200"
                                    >
                                        <button
                                            type="button"
                                            className="text-gray-600 hover:text-gray-800 absolute top-2 right-2"
                                            onClick={() => setMenuOpen(false)}
                                            aria-label="Close menu"
                                        >
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        <div className="p-4 text-right mt-6">
                                            <Link legacyBehavior href="#home">
                                                <a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-1" onClick={() => setMenuOpen(false)}>HOME</a>
                                            </Link>
                                            <Link legacyBehavior href="#upcomingEvents">
                                                <a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-1" onClick={() => setMenuOpen(false)}>UPCOMING EVENTS</a>
                                            </Link>
                                            <Link legacyBehavior href="#pastAttended">
                                                <a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mt-1" onClick={() => setMenuOpen(false)}>PAST ATTENDED EVENTS</a>
                                            </Link>
                                            <Link legacyBehavior href="/form/external">
                                                <a className="text-[15px] hover:bg-slate-100 block py-2 border-b border-gray-200 mb-4 mt-1" target="_blank" onClick={() => setMenuOpen(false)}>
                                                    NOMINATIONS TRAVELLING FORM
                                                </a>
                                            </Link>
                                            <Link legacyBehavior href="/login">
                                                <Button className="bg-white text-black border-2 border-black-500 font-bold hover:bg-slate-200 transition-all ease-in-out whitespace-nowrap px-2 py-1 text-[12px]" onClick={() => setMenuOpen(false)}>
                                                    Login as Admin
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                </div>


                {showScrollButton && (
                    <div onClick={scrollToTop} className="fixed bottom-4 right-4 cursor-pointer z-[999]">
                        <FaCircleArrowUp className="text-4xl lg:text-6xl" />
                    </div>
                )}


                <LandingIntro />

                <div className="my-8 sm:my-32">
                    <div className="inset-0 transform skew-y-3 h-8 lg:h-20 bg-[#ededed]"></div>
                </div>

                <BestExperience />

                <div className="my-8 sm:my-32 lg:hidden">
                    <div className="inset-0 transform skew-y-3 h-8 lg:h-20 bg-[#ededed]"></div>
                </div>

                <div id="upcomingEvents">
                    <UpcomingEventsLanding />
                </div>

                <div className="my-8 sm:my-32">
                    <div className="inset-0 transform skew-y-3 h-8 lg:h-20 bg-[#ededed]"></div>
                </div>

                <div id="pastAttended">
                    <PastAttended />
                </div>


            </div >

            {/* <footer className="mt-10 sm:mt-32 bg-[#2c3033] mb-10">
                <div className="relative">
                    <div className="sm:inset-0 sm:transform sm:skew-y-3 h-20"></div>
                    <div className="sm:absolute sm:mt-14 sm:inset-0 sm:transform sm:skew-y-3 h-20"></div>
                    <div className="px-4 sm:pl-32 pt-7">
                        <div className="flex items-center justify-center sm:items-start sm:justify-start -mt-[150px] lg:mt-0">
                            <Image src="/swinburne_logo.png" alt="Swinburne Logo" width={250} height={50} />
                        </div>
                        <div className="text-sm lg:text-base pb-4 text-white pt-4 text-justify sm:text-left sm:w-1/4">
                            <p>
                                The Event Management and Attendance Tracking (EMAT) System is developed by a group of students for their Final Year Project (FYP) since August/ September 2023.
                            </p>
                        </div>
                        <div className="text-center text-white pt-4 text-xs">
                            <p>© 2024 Swinburne University of Technology, Sarawak. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer> */}

            <div className="flex flex-col lg:flex-row py-24 bg-[#18202A] mt-[40px] lg:mt-19 px-8">

                <div className="lg:w-1/2">
                    <div className="-mt-10">
                        <Image src="/swinburne_logo.png" alt="Swinburne Logo" width={250} height={50} />
                    </div>
                    <h1 className="text-[20px] lg:text-[25px] mt-5 font-extrabold text-[#f5f5f5] font-JetBrains"><span className="text-[#6366F1]">&lt;</span>Swinburne University of Technology Sarawak <span className="text-[#6366F1]">/&gt;</span></h1>
                    <p className="text-[#bfc2c8] font-light text-sm lg:text-base mt-3"> The Event Management and Attendance Tracking (EMAT) System is developed by a group of students for their Final Year Project (FYP) since August/ September 2023.</p>
                </div>

                <div className="lg:w-1/2 flex flex-col justify-start lg:ml-[150px] mt-10 lg:mt-0">
                    <div className="mb-4">
                        <h2 className="text-[#5EEAD4] text-[15px] lg:text-[19px] font-semibold tracking-wide mt-0 lg:-mt-12">NAVIGATION</h2>
                        <ul className="mt-[10px] text-[#f5f5f5] tracking-wide text-lg">
                            <li className="text-sm lg:text-base"><a href="#">Home</a></li>
                            <li className="text-sm lg:text-base mt-2 lg:mt-1"><a href="#upcomingEvents">Upcoming Event</a></li>
                            <li className="text-sm lg:text-base mt-2 lg:mt-1"><a href="#pastAttended">Past Attended Events</a></li>
                            <li className="text-sm lg:text-base mt-2 lg:mt-1"><a href="/form/external">Notification Travelling Form</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-b border-[#f5f5f5]"></div>
            <div className="text-center bg-[#18202A] text-[#f5f5f5] text-xs -mt-[50px] lg:-mt-[40px]">
                <p className="">© 2024 Swinburne University of Technology, Sarawak. All rights reserved.</p>
            </div>
        </div>
    )
};

