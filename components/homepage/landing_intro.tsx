"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Element } from 'react-scroll';
import { useSpring, animated, config } from '@react-spring/web';
import { useEffect, useState } from "react";
import Link from "next/link";

const LandingIntro = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [firstLoad, setFirstLoad] = useState(true);

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
            const isScrolled = currentScrollPos > 50 || currentScrollPos < prevScrollPos;

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

    return (
        <div className="flex flex-col sm:flex-row justify-center items-center px-4 py-2 mt-2">
            <div className="flex justify-center items-center w-full sm:w-1/2 sm:ml-20 mb-8 sm:mb-0">
                <div>
                    <animated.div style={fadeIn_Text1}>
                        <h1 className="text-[72px] text-black font-bold">Great Events</h1>
                    </animated.div>
                    <animated.div style={fadeIn_Text2}>
                        <h1 className="text-[72px] text-black font-bold">Start Here</h1>
                    </animated.div>
                    <animated.div style={fadeIn_Text3}>
                        <p className="text-[20px] mb-4">Here&apos;s all you need to know!</p>
                    </animated.div>
                    <animated.div style={fadeIn_Text4}>
                        <Link href="#upcomingEvents">
                            <Button>
                                View Upcoming Event(s)
                            </Button>
                        </Link>
                    </animated.div>
                </div>
            </div>
            <animated.div style={fadeIn_ImageRight} className="flex justify-center items-center w-full sm:w-1/2">
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