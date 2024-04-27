"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FaArrowCircleLeft } from "react-icons/fa";
import { FaArrowCircleRight } from "react-icons/fa";
import { useSpring, animated, config, useTransition } from '@react-spring/web';

const UpcomingEventsLanding = () => {
    const supabase = createClientComponentClient();
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [startIndex, setStartIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    const FetchEvents = async () => {
        const { data, error } = await supabase
            .from("internal_events")
            .select("*")
            .gte("intFEventEndDate", new Date().toISOString())
            .order("intFEventEndDate", { ascending: true })
            .eq("intFIsHidden", 0);

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

    const fadeIn_Text1 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 500,
    });

    const fadeIn_Card = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 750,
    });

    const fadeIn_Arrows = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1000,
    });

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            const isScrolled = currentScrollPos > 1000 || currentScrollPos < prevScrollPos;

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

    const cardWidths = ['w-1/4', 'w-4/12', 'w-1/4'];
    const cardHeights = ['h-[425px]', 'h-[525px]', 'h-[425px]'];

    const cardStyles = (index: number) => `card bg-white rounded-lg shadow-lg border-1 border-black-500 m-4 ${cardWidths[index]} ${cardHeights[index]} transition-all ease-in-out space-y-4`;

    const transitions = useTransition(upcomingEvents[startIndex], {
        from: { opacity: 0, transform: 'translateX(-100%)' },
        enter: { opacity: 1, transform: 'translateX(0%)' },
        leave: { opacity: 0, transform: 'translateX(100%)' },
        config: { duration: 300 },
    });

    return (
        <div className="flex flex-col items-center justify-center">
            <animated.div style={fadeIn_Text1}>
                <p className="text-center font-bold text-[26px]">Upcoming Event(s)</p>
                <p className="text-[18px]">Are you looking for event&apos;s to partake in? We got you covered!</p>
            </animated.div>
            <animated.div style={fadeIn_Card} className="cards-container overflow-hidden mt-4 relative w-full lg:w-3/4">
                <div className="slider flex items-center justify-center">
                    {upcomingEvents.slice(startIndex, startIndex + 3).map((event, index) => {
                        const truncatedDescription = event.intFEventDescription.length > 100
                            ? `${event.intFEventDescription.substring(0, 100)}...`
                            : event.intFEventDescription;

                        return (
                            <div key={index} className={`${cardStyles(index)}`}>
                                <div className="image-container w-full">
                                    <Image
                                        src="/swinburne_logo.png"
                                        alt="Event Manager"
                                        className="object-cover w-full rounded-t"
                                        width={150}
                                        height={50}
                                    />
                                </div>
                                <div className="content-container pl-6 pr-6">
                                    <h2 className="text-lg font-bold text-justify">{event.intFEventName}</h2>
                                    <p className="text-gray-600 text-justify">{truncatedDescription}</p>
                                    <div className="flex mt-4">
                                        <HiMiniCalendarDays className="text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
                                        <p className="text-sm font-bold mt-1">{event.intFEventStartDate}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </animated.div>
            <animated.div style={fadeIn_Arrows}>
                {upcomingEvents.length > 3 && (
                    <div className="slider-controls flex space-x-4 cursor-pointer mt-5">
                        <FaArrowCircleLeft onClick={prevSlide} size={32} />
                        <FaArrowCircleRight onClick={nextSlide} size={32} />
                    </div>
                )}
            </animated.div>
        </div>
    )
}

export default UpcomingEventsLanding;