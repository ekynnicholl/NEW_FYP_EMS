"use client";

import { PiTriangleBold } from "react-icons/pi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSpring, animated, config } from '@react-spring/web';
import { useEffect, useState } from "react";

const PastAttended = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    const fadeIn_textTop = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 500,
    });

    const fadeIn_textTop1 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 750,
    });

    const fadeIn_imageLeft = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1000,
    });

    const fadeIn_text1 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1250,
    });

    const fadeIn_text2 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1500,
    });

    const fadeIn_text3 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 1750,
    });

    const fadeIn_text4 = useSpring({
        opacity: isVisible ? 1 : 0,
        from: { opacity: 0 },
        config: config.default,
        delay: 2000,
    });

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            const isScrolled = currentScrollPos > 1500 || currentScrollPos < prevScrollPos;

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
        <div className="flex flex-col items-center justify-center">
            <animated.div style={fadeIn_textTop} className="flex items-center justify-center mb-4">
                <PiTriangleBold className="transform -rotate-90" size={36} />
                <PiTriangleBold className="transform rotate-90" size={36} />
            </animated.div>
            <animated.div style={fadeIn_textTop1}>
                <p className="text-center font-bold text-[26px]">Attended Event(s)</p>
            </animated.div>
            <div className="flex justify-center items-center px-4 py-2 mt-2">
                <animated.div style={fadeIn_imageLeft} className="flex justify-center items-center">
                    <Image
                        src="/images/appointment-booking-with-smartphone-man_23-2148576384.png"
                        alt="Event Manager"
                        width={850}
                        height={50}
                    />
                </animated.div>
                <div className="flex justify-center items-center ml-20">
                    <div>
                        <animated.div style={fadeIn_text1}>
                            <p className="text-[32px] font-bold mb-2 italic">- Just One Click Away -</p>
                        </animated.div>
                        <animated.div style={fadeIn_text2}>
                            <p className="text-[22px] font-bold mb-2">View Past Attended Event(s)</p>
                        </animated.div>
                        <animated.div style={fadeIn_text3}>
                            <p className="pr-5">Are you looking to view your past attended event(s) to see how many hour(s) are claim-able for this year?</p>
                        </animated.div>
                        <animated.div style={fadeIn_text4}>
                            <a href="attended_events" target="_blank">
                                <Button className="mt-5">
                                    View
                                </Button>
                            </a>
                        </animated.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PastAttended;