"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Element } from 'react-scroll';
import { useSpring, animated, config } from '@react-spring/web';
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const LandingIntro = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [firstLoad, setFirstLoad] = useState(true);
    const supabase = createClientComponentClient();
    const [eventsCount, setEventsCount] = useState(0);
    const [attendanceCount, setAttendanceCount] = useState(0);

    const fadeIn_Text1 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 500,
    });

    const fadeIn_Text2 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 750,
    });

    const fadeIn_Text3 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1000,
    });

    const fadeIn_Text4 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1250,
    });

    const fadeIn_ImageRight = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1500,
    });

    useEffect(() => {
        if (firstLoad) {
            setIsVisible(true);
            setFirstLoad(false);
        }

        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            const isScrolled = currentScrollPos > 0 || currentScrollPos < prevScrollPos;

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

    const FetchEventsCount = async () => {
        const { data, error } = await supabase
            .from("internal_events")
            .select("count", { count: "exact" })
            .eq("intFIsHidden", 0);

        if (error) {
            // 
            return;
        }

        setEventsCount(data[0]?.count || 0);
    };

    const FetchAttendanceCount = async () => {
        const { data, error } = await supabase
            .from("attendance_forms")
            .select("count", { count: "exact" });

        if (error) {
            // 
            return;
        }

        console.log(data[0]?.count);
        setAttendanceCount(data[0]?.count || 0);
    };

    useEffect(() => {
        FetchEventsCount();
        FetchAttendanceCount();
    }, []);

    useEffect(() => {
        const attendanceSubscription = supabase
            .channel('attendance_forms')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_forms' }, FetchAttendanceCount)
            .subscribe()

        return () => {
            attendanceSubscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const eventsSubscription = supabase
            .channel('internal_events')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'internal_events' }, FetchEventsCount)
            .subscribe()

        return () => {
            eventsSubscription?.unsubscribe();
        };
    }, []);

    return (
        <div className="flex flex-col sm:flex-row justify-center items-center px-4 py-2 mt-2">
            <animated.div style={fadeIn_ImageRight} className="flex justify-center items-center w-full lg:hidden">
                <Image
                    src="/images/man-planning-on-calendar-vector.png"
                    alt="Event Manager"
                    width={550}
                    height={100}
                />
            </animated.div>

            <div className="flex justify-center items-center w-full sm:w-1/2 lg:-ml-10 mb-8 sm:mb-0">
                <div>
                    <animated.div style={fadeIn_Text1}>
                        <h1 className="text-[50px] lg:text-[72px] text-black font-bold"><span className="italic">{eventsCount}</span> Events</h1>
                    </animated.div>
                    <animated.div style={fadeIn_Text2}>
                        <h1 className="text-[50px] lg:text-[72px] text-black font-bold -mt-5 lg:mt-0">Created</h1>
                    </animated.div>
                    <animated.div style={fadeIn_Text3}>
                        <p className="text-[20px] lg:text-[30px] mb-4">With <span className="font-bold italic">{attendanceCount} submissions</span> recorded in our database!</p>
                    </animated.div>
                    <animated.div style={fadeIn_Text4}>
                        <Link href="#upcomingEvents">
                            <Button>
                                View Upcoming Events
                            </Button>
                        </Link>
                    </animated.div>
                </div>
            </div>
            <animated.div style={fadeIn_ImageRight} className="flex justify-center items-center w-full sm:w-1/2 hidden lg:block">
                <Image
                    src="/images/man-planning-on-calendar-vector.png"
                    alt="Event Manager"
                    width={850}
                    height={50}
                    className="mx-auto"
                />
            </animated.div>
        </div>
    )
}

export default LandingIntro;