"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PiTriangleBold } from "react-icons/pi";
import BestExperience from "@/components/homepage/best_experience";
import UpcomingEventsLanding from "@/components/homepage/upcoming_events";
import LandingIntro from "@/components/homepage/landing_intro";
import PastAttended from "@/components/homepage/past_attended";
import { useEffect } from "react";

export default function LandingPage() {
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

    return (
        <div className="scroll-smooth">
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
                    <Link legacyBehavior href="#upcomingEvents">
                        <a className="hover:text-slate-500">Upcoming Event(s)</a>
                    </Link>
                    <Link legacyBehavior href="#pastAttended">
                        <a className="hover:text-slate-500">Past Attended Event(s)</a>
                    </Link>
                    <Link legacyBehavior href="/form/external">
                        <a className="hover:text-slate-500" target="_blank" >Nominations/ Travelling Form</a>
                    </Link>
                    <Link legacyBehavior href="/login">
                        <Button className="bg-white text-black border-2 border-black-500 font-bold hover:bg-slate-200 transition-all ease-in-out">
                            Login as Admin
                        </Button>
                    </Link>
                </div>
            </nav>

            <LandingIntro />

            <div className="mt-32 mb-32">
                <div className="inset-0 transform skew-y-3 h-20 bg-[#ededed]"></div>
            </div>

            <BestExperience />

            <div id="upcomingEvents">
                <UpcomingEventsLanding />
            </div>

            <div className="mt-32 mb-32">
                <div className="inset-0 transform skew-y-3 h-20 bg-[#ededed]"></div>
            </div>

            <div id="pastAttended">
                <PastAttended />
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

