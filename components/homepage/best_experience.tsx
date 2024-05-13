"use client";

import Image from "next/image";
import { Element } from 'react-scroll';
import { useSpring, animated, config } from '@react-spring/web';
import { useEffect, useState } from "react";
import { PiTriangleBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

const BestExperience = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    const fadeIn_Top1 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 500,
    });

    const fadeIn_Top2 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 750,
    });

    const fadeIn_Card1 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1000,
    });

    const fadeIn_Card2 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1250,
    });

    const fadeIn_Card3 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1500,
    });

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            const isScrolled = currentScrollPos > 650 || currentScrollPos < prevScrollPos;

            if (isScrolled !== isVisible) {
                setIsVisible(isScrolled);
            }

            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isVisible, prevScrollPos]);

    const [origin, setOrigin] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    return (
        <Element name="section2">
            <div className="flex flex-col items-center justify-center mb-10">
                {/* <animated.div style={fadeIn_Top1} className="flex items-center justify-center mb-4">
                    <PiTriangleBold className="transform -rotate-90 text-[23px] lg:text-[38px]" />
                    <PiTriangleBold className="transform rotate-90 text-[23px] lg:text-[38px]" />
                </animated.div> */}
                <animated.div style={fadeIn_Top2}>
                    <p className="text-center font-bold text-[22px] lg:text-[26px]">We are setting the best experience in Swinburne University.</p>
                </animated.div>
                <div className="cards-container flex items-center justify-center overflow-hidden mt-4 relative w-full sm:w-7/12">
                    <div className="slider flex flex-col sm:flex-row items-center justify-center">
                        <animated.div style={fadeIn_Card1} className={`h-[520px] card bg-white lg:rounded-lg lg:shadow-lg border-1 border-black-500 w-full sm:w-1/3 sm:m-4 space-y-4 pl-4 pt-4 pr-4`}>
                            <div className="flex items-center justify-center">
                                <Image
                                    src="/images/appointment-booking-with-calendar_23-2148553115.png"
                                    alt="Event Manager"
                                    className="object-cover"
                                    width={150}
                                    height={50}
                                />
                            </div>
                            <h2 className="text-base lg:text-lg font-bold text-center">Past Attended Event(s)</h2>
                            <p className="text-gray-600 text-center text-sm lg:text-base -mt-2 lg:mt-0">Track your past attended events with our unified platform! </p>
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <Link legacyBehavior href={`${origin}/attended_events`}>
                                    <Button>
                                        Go
                                    </Button>
                                </Link>
                                <p>or,</p>
                                <div className="flex justify-center">
                                    <QRCodeCanvas value={`${origin}/attended_events`} size={128} className="mx-auto" />
                                </div>
                            </div>
                        </animated.div>
                        <animated.div style={fadeIn_Card2} className={`mt-1 lg:mt-0 h-[520px] pb-5 card bg-white rounded-lg lg:shadow-lg border-1 border-black-500 w-full sm:w-1/3 sm:m-4 space-y-4 pl-4 pt-4 pr-4 my-auto`}>
                            <div className="flex items-center justify-center my-auto -mb-6 lg:mb-0">
                                <Image
                                    src="/images/work-chat-concept-illustration_114360-1229.png"
                                    alt="Event Manager"
                                    className=""
                                    width={150}
                                    height={50}
                                />
                            </div>
                            <h2 className="text-base lg:text-lg font-bold text-center ">Upcoming Event(s)</h2>
                            <p className="text-gray-600 text-center text-sm lg:text-base">Keep updated with the upcoming events in the university!</p>
                            <div className="flex mt-4">
                                <p className="text-sm font-bold mt-1"></p>
                            </div>
                        </animated.div>
                        <animated.div style={fadeIn_Card3} className={`-mt-[260px] lg:mt-0 lg:h-[520px] card bg-white rounded-lg shadow-lg border-1 border-black-500 w-full sm:w-1/3 sm:m-4 space-y-4 pl-4 pt-4 pr-4`}>
                            <div className="flex items-center justify-center">
                                <Image
                                    src="/images/happy-boy-with-casual-clothes-smartphone_24640-46929.png"
                                    alt="Event Manager"
                                    className="object-cover"
                                    width={150}
                                    height={50}
                                />
                            </div>
                            <h2 className="text-base lg:text-lg font-bold text-center">Nominations/ Travelling Form(s)</h2>
                            <p className="text-gray-600 text-center text-sm lg:text-base">Submit your forms online to easily keep track on the updates!</p>
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <Link legacyBehavior href={`${origin}/form/external`}>
                                    <Button>
                                        Go
                                    </Button>
                                </Link>
                                <p>or,</p>
                                <div className="flex justify-center">
                                    <QRCodeCanvas value={`${origin}/form/external`} size={128} className="mx-auto" />
                                </div>
                            </div>
                        </animated.div>
                    </div>
                </div>
            </div>
        </Element >
    )
}

export default BestExperience;