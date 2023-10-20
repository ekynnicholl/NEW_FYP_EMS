"use client";

import Image from "next/image";

import Modal from "@/components/QR_Codes_Modal";

import filterBar from "@/public/images/filter_bar_black.png";
import exportCSV from "@/public/images/export_csv.png";
import arrowLeft from "@/public/images/arrow_left.png";
import arrowRight from "@/public/images/arrow_right.png";
import skipLeft from "@/public/images/skip_left.png";
import skipRight from "@/public/images/skip_right.png";
import { useParams, useRouter } from "next/navigation";
// npm install react-router-dom@latest

import qr_codes from "@/public/images/qr_codes.png";

// Import icons from react-icons
import { FaSortAlphaDown, FaSortAlphaUp, FaCalendarAlt, FaCheck } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import { SiGoogleforms } from "react-icons/si";
import { BsBoxArrowUpRight } from "react-icons/bs";

import { Fragment, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SideBarDesktop from "@/components/layouts/SideBarDesktop";
import SideBarMobile from "@/components/layouts/SideBarMobile";
import TopBar from "@/components/layouts/TopBar";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

type Info = {
    attFormsStaffName: string;
    attFormsStaffID: string;
    attFormsFacultyUnit: string;
};

type subEvent = {
    sub_eventsID: string;
    sub_eventsName: string;
}

export default function Home() {
    const supabase = createClientComponentClient();
    const [infos, setInfos] = useState<Info[]>([] as Info[]);
    const [attendance_id, setAttendanceID] = useState<string[]>([]);
    const [selectedSubEventID, setSelectedSubEventID] = useState<string>("");

    // Get the Event ID from the link,
    const { event_id } = useParams();
    const router = useRouter();
    console.log("Event ID captured in URL:" + event_id);

    const [showQRCodesAttendance, setShowQRCodesAttendance] = useState(false);
    const [showQRCodesFeedback, setShowQRCodesFeedback] = useState(false);
    const [subEventsData, setSubEventsData] = useState<subEvent[]>([]);

    // Fetch data from database
    useEffect(() => {
        const fetchInfos = async () => {
            const { data: subEventsData, error: subEventsError } = await supabase
                .from("sub_events")
                .select("sub_eventsID")
                .eq("sub_eventsMainID", event_id);

            if (subEventsError) {
                console.error("Error fetching sub_events data:", subEventsError);
                router.push('/error-404');
                return;
            }

            const subEventIDs = subEventsData.map(item => item.sub_eventsID);
            setAttendanceID(subEventIDs);

            const { data: attendanceFormsData, error: attendanceFormError } = await supabase
                .from("attendance_forms")
                .select("*")
                .in("attFSubEventID", subEventIDs);

            if (attendanceFormError) {
                console.error("Error fetching attendance forms data:", attendanceFormError);
                return;
            }

            setInfos(attendanceFormsData);
        };
        fetchInfos();
    }, [event_id, router, supabase]);

    useEffect(() => {
        // Fetch sub_events with the same event_id
        async function fetchSubEvents() {
            try {
                const { data, error } = await supabase
                    .from('sub_events')
                    .select('*')
                    .eq('sub_eventsMainID', event_id);

                if (error) {
                    console.error('Error fetching sub_events:', error);
                    return;
                }

                setSubEventsData(data);
            } catch (error) {
                console.error('Error fetching sub_events:', error);
            }
        }

        fetchSubEvents();
    }, [event_id, supabase]);

    // Refresh data from database
    const refreshData = async () => {
        const { data: subEventsData, error: subEventsError } = await supabase
            .from("sub_events")
            .select("sub_eventsID")
            .eq("sub_eventsMainID", event_id);

        if (subEventsError) {
            console.error("Error fetching sub_events data:", subEventsError);
            return;
        }

        const subEventIDs = subEventsData.map(item => item.sub_eventsID);
        setAttendanceID(subEventIDs);

        const { data: attendanceFormsData, error: attendanceFormError } = await supabase
            .from("attendance_forms")
            .select("*")
            .in("attFSubEventID", subEventIDs);

        if (attendanceFormError) {
            console.error("Error fetching attendance forms data:", attendanceFormError);
            return;
        }

        setInfos(attendanceFormsData);
        console.log("Data refreshed successfully.");

        if (attendanceFormError) {
            console.log("Error fetching data: ", attendanceFormError);
        }
    };

    // Copy text to clipboard,
    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                alert("Link copied to clipboard!");
            })
            .catch(error => {
                console.error("Copy failed:", error);
            });
    };

    return (
        <div className="flex-1 mx-auto px-5 py-5 bg-slate-100">
            <div className="bg-white rounded p-8">
                <div>
                    <h3 className="font-bold">Attendance Forms</h3>
                    <div className="border-t border-gray-300 my-2"></div>
                </div>
                <div className="flex flex-wrap">
                    {subEventsData.map((subEvent) => (
                        <Fragment key={subEvent.sub_eventsID}>
                            <div className="w-1/3 mb-8">
                                <h3 className="text-left mb-3"> {subEvent.sub_eventsName}</h3>
                                <Link
                                    href={`https://new-fyp-ems.vercel.app/form/${subEvent.sub_eventsID}`}
                                    passHref
                                    legacyBehavior={true}
                                >
                                    <a className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex">
                                        <SiGoogleforms className="text-xl text-slate-800" />
                                        <span className="ml-2 mt-[1.3px] text-slate-800">Forms</span>
                                    </a>
                                </Link>

                                <button
                                    type="button"
                                    className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex ml-5"
                                    onClick={() => {
                                        setSelectedSubEventID(subEvent.sub_eventsID);
                                        setShowQRCodesAttendance(true);
                                    }}
                                >
                                    <BsBoxArrowUpRight className="text-xl text-slate-800" />
                                    <span className="ml-2 mt-[1.3px] text-slate-800">QR Codes</span>
                                </button>
                            </div>
                        </Fragment>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded p-8 mt-5">
                <div>
                    <h3 className="font-bold">Feedback Forms</h3>
                    <div className="border-t border-gray-300 my-2"></div>
                </div>
                <div className="flex flex-wrap">
                    {subEventsData.map((subEvent) => (
                        <Fragment key={subEvent.sub_eventsID}>
                            <div className="w-1/3 mb-8">
                                <h4 className="text-left mb-3">{subEvent.sub_eventsName}</h4>
                                <Link
                                    href={`https://new-fyp-ems.vercel.app/form/feedback/${subEvent.sub_eventsID}`}
                                    passHref
                                    legacyBehavior={true}
                                >
                                    <a className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex">
                                        <SiGoogleforms className="text-xl text-slate-800" />
                                        <span className="ml-2 mt-[1.3px] text-slate-800">Forms</span>
                                    </a>
                                </Link>

                                <button
                                    type="button"
                                    className="flex items-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex ml-5"
                                    onClick={() => {
                                        setSelectedSubEventID(subEvent.sub_eventsID);
                                        setShowQRCodesFeedback(true);
                                    }}
                                >
                                    <BsBoxArrowUpRight className="text-xl text-slate-800" />
                                    <span className="ml-2 mt-[1.3px] text-slate-800">QR Codes</span>
                                </button>
                            </div>
                        </Fragment>
                    ))}

                    <Modal isVisible={showQRCodesAttendance} onClose={() => setShowQRCodesAttendance(false)}>
                        <div className="ml-2 p-5">
                            <h3 className="lg:text-2xl font-medium text-gray-600 mb-2 text-center">
                                QR Code
                            </h3>
                            <QRCodeSVG
                                value={`https://new-fyp-ems.vercel.app/form/${selectedSubEventID}`}
                            />
                            <button
                                onClick={() =>
                                    copyToClipboard(
                                        `https://new-fyp-ems.vercel.app/form/${selectedSubEventID}`
                                    )
                                }
                                className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg p-2 px-[26px]"
                            >
                                Copy Link
                            </button>
                        </div>
                    </Modal>

                    <Modal isVisible={showQRCodesFeedback} onClose={() => setShowQRCodesFeedback(false)}>
                        <div className="ml-2 p-5">
                            <h3 className="lg:text-2xl font-medium text-gray-600 mb-2 text-center">
                                QR Code
                            </h3>
                            <QRCodeSVG
                                value={`https://new-fyp-ems.vercel.app/form/feedback/${selectedSubEventID}`}
                            />
                            <button
                                onClick={() =>
                                    copyToClipboard(
                                        `https://new-fyp-ems.vercel.app/form/feedback/${selectedSubEventID}`
                                    )
                                }
                                className="mt-4 hover:bg-slate-300 focus:outline-none focus:ring-slate-300 bg-slate-200 shadow-sm focus:ring-2 focus:ring-offset-2 rounded-lg p-2 px-[26px]"
                            >
                                Copy Link
                            </button>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    )
}
