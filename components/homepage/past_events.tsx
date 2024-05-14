"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { HiMiniCalendarDays } from "react-icons/hi2";
import { FaArrowCircleLeft } from "react-icons/fa";
import { FaArrowCircleRight } from "react-icons/fa";
import { PiTriangleBold } from "react-icons/pi";
import { useSpring, animated, config, useTransition } from '@react-spring/web';

type mainEvent = {
    intFID: string;
    intFEventHidden: boolean;
};

const PastEventsLanding = () => {
    const supabase = createClientComponentClient();
    const [pastEvents, setPastEvents] = useState<any[]>([]);
    const [startIndex, setStartIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [numCardsToShow, setNumCardsToShow] = useState(3);

    const [mainEvent, setMainEvent] = useState<mainEvent[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from('internal_events')
                    .select('*');

                if (error) {
                    throw error;
                }

                if (data) {
                    setMainEvent(data);
                }
            } catch (error) {
                // console.error('Error fetching data:', error.message);
            }
        };

        fetchData();
    }, []);

    const FetchEvents = async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date

        const { data, error } = await supabase
            .from("internal_events")
            .select("*")
            .lte("intFEventEndDate", yesterday.toISOString())
            .order("intFEventEndDate", { ascending: false })
            .eq("intFIsHidden", 0)
            .eq("intFEventHidden", false)
            .limit(20);

        if (error) {
            console.error("Error fetching events:", error.message);
            return null;
        }

        setPastEvents(data);
    }

    useEffect(() => {
        FetchEvents();
    }, []);

    const nextSlide = () => {
        setStartIndex((prevIndex) => {
            if (prevIndex + 3 >= pastEvents.length) {
                return 0;
            }
            return prevIndex + 1;
        });
    };

    const prevSlide = () => {
        setStartIndex((prevIndex) => {
            if (prevIndex === 0) {
                return pastEvents.length - 3;
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
            const isScrolled = currentScrollPos > 1700 || currentScrollPos < prevScrollPos;

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

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setNumCardsToShow(1);
            } else {
                setNumCardsToShow(3);
            }
        };

        handleResize(); // Call initially

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const cardWidthsDesktop = ['w-1/4', 'w-4/12', 'w-1/4'];

    const cardHeightsDesktop = ['h-[425px]', 'h-[525px]', 'h-[425px]'];
    const cardWidthsMobile = ['w-full'];
    const cardHeightsMobile = 'h-[450px]';

    const cardStyles = (index: number) => {
        if (numCardsToShow === 1) {
            return `lg:hover:scale-105 card bg-white rounded-lg shadow-lg border-1 border-black-500 ${cardWidthsMobile[0]} ${cardHeightsMobile} transition-all ease-in-out space-y-4 p-4`;
        } else {
            return `lg:hover:scale-105 card bg-white rounded-lg shadow-lg border-1 border-black-500 sm:w-1/3 sm:m-4 ${cardWidthsDesktop[index]} ${cardHeightsDesktop[index]} duration-300 transition-all ease-in-out space-y-4`;
        }
    };

    const transitions = useTransition(pastEvents[startIndex], {
        from: { opacity: 0, transform: 'translateX(-100%)' },
        enter: { opacity: 1, transform: 'translateX(0%)' },
        leave: { opacity: 0, transform: 'translateX(100%)' },
        config: { duration: 300 },
    });

    return (
        <div className="flex flex-col items-center justify-center">
            {/* <div className="flex items-center justify-center mb-4">
                <PiTriangleBold className="transform -rotate-90 text-[23px] lg:text-[38px]" />
                <PiTriangleBold className="transform rotate-90 text-[23px] lg:text-[38px]" />
            </div> */}
            <animated.div style={fadeIn_Text1}>
                <p className="text-center font-bold text-[22px] lg:text-[26px]">Past Events</p>
            </animated.div>
            <animated.div style={fadeIn_Card} className="cards-container overflow-visible mt-4 relative w-full sm:w-3/4 px-4 sm:px-0">
                <div className="slider flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0">
                    {pastEvents.slice(startIndex, startIndex + numCardsToShow).map((event, index) => {
                        // const truncatedDescription = event.intFEventDescription.length > 100
                        //     ? `${event.intFEventDescription.substring(0, 100)}...`
                        //     : event.intFEventDescription;

                        const truncatedDescription = `${event.intFEventDescription.substring(0, 100)}...`

                        return (
                            <>
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
                                    <div className={`content-container lg:pl-6 lg:pr-6 ${numCardsToShow === 1 ? 'flex-grow overflow-hidden' : ''}`}>
                                        <h2 className="text-base lg:text-lg font-bold text-justify">{event.intFEventName}</h2>
                                        <p className={`mt-3 lg:mt-0 text-sm lg:text-base text-gray-600 text-justify ${numCardsToShow === 1 ? 'overflow-ellipsis overflow-hidden' : ''}`}>{truncatedDescription}</p>
                                        <div className="flex mt-4">
                                            <HiMiniCalendarDays className="text-[22px] lg:text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
                                            <p className="text-xs lg:text-sm font-bold mt-[3px] lg:mt-1">{event.intFEventStartDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* {mainEvent
                                    .filter(event => !event.intFEventHidden) // Filter out events where intFEventHidden is true
                                    .map((event, index) => (
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
                                            <div className={`content-container lg:pl-6 lg:pr-6 ${numCardsToShow === 1 ? 'flex-grow overflow-hidden' : ''}`}>
                                                <h2 className="text-base lg:text-lg font-bold text-justify">{event.intFEventName}</h2>
                                                <p className={`mt-3 lg:mt-0 text-sm lg:text-base text-gray-600 text-justify ${numCardsToShow === 1 ? 'overflow-ellipsis overflow-hidden' : ''}`}>{truncatedDescription}</p>
                                                <div className="flex mt-4">
                                                    <HiMiniCalendarDays className="text-[22px] lg:text-[29px] mr-2 text-slate-800 dark:text-dark_text" />
                                                    <p className="text-xs lg:text-sm font-bold mt-[3px] lg:mt-1">{event.intFEventStartDate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))} */}
                            </>
                        );
                    })}
                </div>
            </animated.div>
            <animated.div style={fadeIn_Arrows}>
                {pastEvents.length > 3 && (
                    <div className="slider-controls flex space-x-4 cursor-pointer mt-5">
                        <FaArrowCircleLeft onClick={prevSlide} className="text-3xl lg:text-3xl" />
                        <FaArrowCircleRight onClick={nextSlide} className="text-3xl lg:text-3xl" />
                    </div>
                )}
            </animated.div>
        </div>
    )
}

export default PastEventsLanding;