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
            const isScrolled = currentScrollPos > 1950 || currentScrollPos < prevScrollPos;

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
            {/* <animated.div style={fadeIn_textTop} className="flex items-center justify-center mb-4">
                <PiTriangleBold className="transform -rotate-90 text-[23px] lg:text-[38px]" />
                <PiTriangleBold className="transform rotate-90 text-[23px] lg:text-[38px]" />
            </animated.div> */}
            <animated.div style={fadeIn_textTop1}>
                <p className="text-center font-bold text-[22px] lg:text-[26px]">Attended Event(s)</p>
            </animated.div>
            <div className="flex flex-col sm:flex-row justify-center items-center px-4 py-2 mt-2">
                <animated.div style={fadeIn_imageLeft} className="flex justify-center items-center w-full sm:w-1/2 mb-8 sm:mb-0">
                    <Image
                        src="/images/appointment-booking-with-smartphone-man_23-2148576384.png"
                        alt="Event Manager"
                        width={850}
                        height={50}
                        className="mx-auto"
                    />
                </animated.div>
                <div className="flex justify-center items-center sm:ml-20 w-1/2">
                    <div>
                        <animated.div style={fadeIn_text1}>
                            <p className="text-[24px] lg:text-[32px] font-bold mb-2 italic -mt-8 lg:mt-0">Staff? Student? Visitor? We got you covered!</p>
                        </animated.div>
                        <animated.div style={fadeIn_text2}>
                            <p className="text-base lg:text-[22px] font-bold mb-2">View Past Attended Event(s)</p>
                        </animated.div>
                        <animated.div style={fadeIn_text3}>
                            <p className="text-sm lg:text-base pr-5 text-slate-700">View your past attended events at Swinburne and eveven track your claim-able hour(s) as staff!</p>
                        </animated.div>
                        <animated.div style={fadeIn_text4}>
                            <a href="attended_events" target="_blank">
                                <Button className="mt-3 lg:mt-3">
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