"use client";

import PencilNoteIcon from "@/components/icons/PencilNoteIcon";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import FeedbackTable from "@/components/tables/feedbackTable";

type SubEventsDataType = {
    sub_eventsMainID: string;
    sub_eventsID: string;
    sub_eventsName: string;
    sub_eventsVenue: string;
    sub_eventsStartDate: string;
    sub_eventsEndDate: string;
    sub_eventsStartTime: string;
    sub_eventsEndTime: string;
    sub_eventsOrganizer: string;
    sub_eventsFaculty: string;
    sub_eventsMaxSeats: string;
}

interface Props {
    event_id: string;
    mainEvent: MainEventDataType;
}

type FeedbackDataType = {
    fbID: string;
    fbSubEventID: string;
    fbCourseName: string;
    fbCommencementDate: string;
    fbCompletionDate: string;
    fbDuration: string;
    fbTrainersName: string;
    fbTrainingProvider: string;
    fbSectionA1: string;
    fbSectionA2: string;
    fbSectionA3: string;
    fbSectionA4: string;
    fbSectionA5: string;
    fbSectionB1: string;
    fbSectionB2: string;
    fbSectionB3: string;
    fbSectionB4: string;
    fbSectionC1: string;
    fbSectionD1: string;
    fbSectionESuggestions: string;
    fbSectionEChanges: string;
    fbSectionEAdditional: string;
    fbFullName: string;
    fbEmailAddress: string;
}

type MainEventDataType = {
    intFID: string;
    intFEventName: string;
    intFEventDescription: string;
    intFEventStartDate: string;
    intFEventEndDate: string;
    intFDurationCourse: string;
    intFTrainerName: string;
    intFTrainingProvider: string;
};

const FeedbackList: React.FC<Props> = ({ event_id, mainEvent }) => {
    const [isAllButtonActive, setIsAllButtonActive] = useState(true);
    const supabase = createClientComponentClient();

    // This is for feedback modal,
    const [feedbackData, setFeedbackData] = useState<FeedbackDataType[]>([]);
    const [feedbackMainEventID, setFeedbackMainEventID] = useState("");
    const [subEventsForFeedback, setSubEventsForFeedback] = useState<SubEventsDataType[]>([]);
    const [selectedSubEvent, setSelectedSubEvent] = useState<string>("");

    const [mainEventForFeedback, setMainEventForFeedback] = useState<MainEventDataType>({
        intFID: '',
        intFEventName: '',
        intFEventDescription: '',
        intFEventStartDate: '',
        intFEventEndDate: '',
        intFDurationCourse: '',
        intFTrainerName: '',
        intFTrainingProvider: ''
    });

    useEffect(() => {
        openFeedbackModal(event_id);
        setMainEventForFeedback(mainEvent);
    }, [event_id, mainEvent])

    const openFeedbackModal = async (event_id: string) => {
        try {
            // Fetch sub-events for the given event
            const { data: subEvents, error: subEventsError } = await supabase
                .from("sub_events")
                .select()
                .eq("sub_eventsMainID", event_id);

            if (subEventsError) {
                console.error("Error fetching sub_events:", subEventsError);
                return;
            }
            // Set the main ID for the 
            setFeedbackMainEventID(event_id);
            fetchFeedbackList(event_id)
            setSubEventsForFeedback(subEvents);

            // Extract the subEventID values from the fetched sub_events
            const subEventIDs = subEvents.map((subEvent) => subEvent.sub_eventsID);

            // Fetch all attendance_forms related to those sub_events
            const { data: feedbackForms, error: formsError } = await supabase
                .from("feedback_forms")
                .select()
                .in("fbSubEventID", subEventIDs);

            if (formsError) {
                console.error("Error fetching attendance forms:", formsError);
                return;
            }

            // Set the attendance data for the main event
            setFeedbackData(feedbackForms);
            fetchFeedbackList(event_id)
        } catch (error) {
            const typedError = error as Error;
            console.error("Error:", typedError.message);
        }
    };

    const handleSubEventClick = async (subEvent: SubEventsDataType, type: number) => {
        if (type == 2) {
            try {
                // Fetch attendance data for the selected sub-event
                setSelectedSubEvent(subEvent.sub_eventsID);
                const { data: feedbackForms, error: formsError } = await supabase
                    .from("feedback_forms")
                    .select()
                    .eq("fbSubEventID", subEvent.sub_eventsID);

                if (formsError) {
                    console.error("Error fetching feedback forms:", formsError);
                    return;
                }

                // Set the attendance data for the selected sub-event
                setFeedbackData(feedbackForms);

            } catch (error) {
                const typedError = error as Error;
                console.error("Error:", typedError.message);
            }
        }
    };

    const fetchFeedbackList = async (event_id: string) => {
        const { data: subEvents, error: subEventsError } = await supabase
            .from("sub_events")
            .select()
            .eq("sub_eventsMainID", event_id);

        if (subEventsError) {
            console.error("Error fetching sub_events:", subEventsError);
            return;
        }

        // Extract the subEventID values from the fetched sub_events
        const subEventIDs = subEvents.map(subEvent => subEvent.sub_eventsID);

        // Now, fetch the attendance_forms related to those sub_events
        const { data: feedbackForms, error: formsError } = await supabase
            .from("feedback_forms")
            .select()
            .in("fbSubEventID", subEventIDs);

        if (formsError) {
            console.error("Error fetching attendance forms:", formsError);
            return;
        } else {
            setFeedbackData(feedbackForms);
            setSelectedSubEvent("");
        }
    };

    return (
        <div className="flex">
            <div className="h-[600px] lg:h-[825px] w-full mr-3">
                <div className="flex items-left justify-start">
                    <div className="flex items-center justify-center text-text text-[16px] lg:text-[20px] text-center">
                        <PencilNoteIcon />{" "}
                        <span className="ml-2.5">Feedback Summary</span>
                    </div>
                </div>
                <div className="text-left text-black text-[12px] lg:text-[13px] pl-[34px] pb-5">
                    Total Feedback Received: {feedbackData.length}
                </div>
                <div className="flex flex-wrap ml-9">
                    <button
                        className={`font-bold flex items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-3 ${isAllButtonActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                            }`}
                        onClick={() => {
                            setIsAllButtonActive(true);
                            fetchFeedbackList(feedbackMainEventID);
                        }}
                    >
                        All
                    </button>
                    {subEventsForFeedback.map((subEvent) => (
                        <div
                            key={subEvent.sub_eventsID}
                            className={`font-bold flex items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 shadow-sm mb-3.5 p-2 mr-3 ${selectedSubEvent === subEvent.sub_eventsID ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'
                                }`}
                        >
                            <button
                                onClick={() => {
                                    setIsAllButtonActive(false);
                                    handleSubEventClick(subEvent, 2);
                                }}
                            >
                                {subEvent.sub_eventsName}
                            </button>
                        </div>
                    ))}
                </div>
                {/* This is to loop through the attendance data. */}
                {feedbackData && feedbackData.length > 0 ? (
                    <div className="ml-9">
                        <div className={`lg:h-[675px] h-[400px] overflow-y-auto`}>
                            <FeedbackTable feedbackData={feedbackData} mainEvent={mainEventForFeedback} />
                        </div>
                    </div>
                ) : (
                    <div className="text-left text-[12px] lg:text-[14px] text-red-600 ml-[34px]">
                        No feedback received yet.
                    </div>

                )}
            </div>
        </div>
    )
};

export default FeedbackList;