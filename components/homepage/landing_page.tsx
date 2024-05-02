"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PiTriangleBold } from "react-icons/pi";
import BestExperience from "@/components/homepage/best_experience";
import UpcomingEventsLanding from "@/components/homepage/upcoming_events";
import LandingIntro from "@/components/homepage/landing_intro";
import PastAttended from "@/components/homepage/past_attended";
import { useEffect, useState } from "react";
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

    return (
        <div className="scroll-smooth">
            <nav className="text-black font-bold flex flex-col sm:flex-row justify-between items-center px-4 py-2 mt-2">
                <div className="flex items-center sm:ml-28 mb-4 sm:mb-0">
                    <Image
                        src="/swinburne_logo.png"
                        alt="Swinburne Logo"
                        width={200}
                        height={50}
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 sm:mr-10 text-center sm:text-left">
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

            {showScrollButton && (
                <div onClick={scrollToTop} className="fixed bottom-4 right-4 cursor-pointer z-[999]">
                    <FaCircleArrowUp size={48} />
                </div>
            )}

            <LandingIntro />

            <div className="my-12 sm:my-32">
                <div className="inset-0 transform skew-y-3 h-20 bg-[#ededed]"></div>
            </div>

            <BestExperience />

            <div id="upcomingEvents">
                <UpcomingEventsLanding />
            </div>

            <div className="my-12 sm:my-32">
                <div className="inset-0 transform skew-y-3 h-20 bg-[#ededed]"></div>
            </div>

            <div id="pastAttended">
                <PastAttended />
            </div>

            <footer className="mt-12 sm:mt-32 bottom-0">
                <div className="relative">
                    <div className="sm:inset-0 sm:transform sm:skew-y-3 h-20 bg-[#2c3033]"></div>
                    <div className="sm:absolute sm:mt-14 sm:inset-0 sm:transform sm:skew-y-3 h-20 bg-[#2c3033]"></div>
                    <div className="bg-[#2c3033] px-4 sm:pl-32 pt-7">
                        <div className="flex items-center justify-center sm:items-start sm:justify-start">
                            <Image src="/swinburne_logo.png" alt="Swinburne Logo" width={250} height={50} />
                        </div>
                        <div className="pb-4 text-white pt-4 text-justify text-center sm:text-left sm:w-1/4">
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

