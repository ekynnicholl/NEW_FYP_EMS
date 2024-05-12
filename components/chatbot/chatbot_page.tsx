import React, { useEffect, useRef, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import stringSimilarity from "string-similarity";
import compromise from "compromise";
import OpenAI from "openai";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { downloadXLSX } from '@/components/attendance/export_attendance';

const Chatbot = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isInitialMessage, setIsInitialMessage] = useState<boolean>(true);
    const supabase = createClientComponentClient();
    const [eventNames, setAllEventNames] = useState<any[]>([]);

    useEffect(() => {
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    const sendInitialMessage = async () => {
        if (isInitialMessage) {
            setMessages((prevMessages) => [...prevMessages, `bee: Hi there! How can I help?`]);
            setIsInitialMessage(false);
            console.log(isInitialMessage)
        }
    };

    useEffect(() => {
        sendInitialMessage();
    }, []);

    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
        // apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (message: string) => {
        if (inputValue.trim() === "") return;

        setLoading(true);
        setMessages((prevMessages) => [...prevMessages, `user: ${inputValue.trim()}`]);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await getChatbotResponse(message);

        setLoading(false);
        setMessages((prevMessages) => [...prevMessages, `bee: ${response}`]);
    };

    useEffect(() => {
        fetchAllEvents();
    }, []);

    const fetchAllEvents = async () => {
        const { data, error } = await supabase
            .from("internal_events")
            .select("intFID, intFEventName")
            .eq("intFIsHidden", 0);

        if (error) {
            return;
        }
        setAllEventNames(data || []);
    }

    const fetchEvents = async (startDate: Date, endDate: Date) => {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from("internal_events")
            .select("intFEventName, intFEventStartDate, intFEventEndDate, intFTrainerName")
            .eq("intFIsHidden", 0)
            .eq("intFEventStartDate", formattedStartDate)
            .order("intFEventStartDate");

        if (error) {
            console.error("Error fetching events:", error);
            return "Sorry, there was an error fetching event information.";
        }

        if (formattedStartDate !== formattedEndDate) {
            const { data: rangeData, error: rangeError } = await supabase
                .from("internal_events")
                .select("intFEventName, intFEventStartDate, intFEventEndDate, intFTrainerName")
                .eq("intFIsHidden", 0)
                .gte("intFEventStartDate", formattedStartDate)
                .lte("intFEventEndDate", formattedEndDate)
                .order("intFEventStartDate");

            if (rangeError) {
                console.error("Error fetching events within range:", rangeError);
                return "Sorry, there was an error fetching event information within the specified range.";
            }
            return rangeData;
        } else {
            return data;
        }
    };

    const findMostSimilarKeywords = (userWords: string[], targetKeywords: string[], threshold: number) => {
        return userWords.map((word: string) => {
            const matches = stringSimilarity.findBestMatch(word, targetKeywords);
            // console.log(matches);
            return matches.bestMatch.rating >= threshold ? matches.bestMatch.target : null;
        });
    };

    const deleteChatMessages = () => {
        toast.success("You have cleared your chat history messages!")
        localStorage.removeItem('chatMessages');
        setMessages([]);
        setIsInitialMessage(true);
    };

    const findMostSimilarEvent = (userInput: string, eventNames: string[], threshold: number) => {
        const matches = stringSimilarity.findBestMatch(userInput, eventNames);
        // console.log(matches);
        return matches.bestMatch.rating >= threshold ? matches.bestMatch.target : null;
    };

    const fetchAttendanceList = async (eventID: string) => {
        const { data: subEvents, error } = await supabase
            .from('sub_events')
            .select('sub_eventsID, sub_eventsName')
            .eq('sub_eventsMainID', eventID);

        if (error) {
            console.error('Error fetching attendance list:', error.message);
            return null;
        }

        if (!subEvents || subEvents.length === 0) {
            // console.log('No sub-events found for the given eventID.');
            return [];
        }

        // Extract sub_eventsID and sub_eventsName from fetched subEvents
        const subEventsData = subEvents.map(subEvent => ({
            sub_eventsID: subEvent.sub_eventsID,
            sub_eventsName: subEvent.sub_eventsName
        }));

        // Fetch attendance forms for the extracted subEventsIDs
        const { data: attendanceForms, error: attendanceFormsError } = await supabase
            .from('attendance_forms')
            .select('*')
            .in('attFSubEventID', subEventsData.map(subEvent => subEvent.sub_eventsID));

        if (attendanceFormsError) {
            console.error('Error fetching attendance forms:', attendanceFormsError.message);
            return null;
        }

        // Append sub_eventsName to each attendance form based on attFSubEventID
        const attendanceFormsWithSubEventName = attendanceForms.map(attendanceForm => {
            const matchedSubEvent = subEventsData.find(subEvent => subEvent.sub_eventsID === attendanceForm.attFSubEventID);
            if (matchedSubEvent) {
                attendanceForm.sub_eventName = matchedSubEvent.sub_eventsName;
            }
            return attendanceForm;
        });

        return attendanceFormsWithSubEventName;
    }

    const [isAskingDownload, setIsAskingDownload] = useState(false);

    const getChatbotResponse = async (question: string) => {
        const keywords = ["events", "attendance", "attendees", "download"];
        const userWords = question.toLowerCase().split(/\s+/);
        // console.log(userWords);

        const mostSimilarKeywords = findMostSimilarKeywords(userWords, keywords, 0.5);

        // console.log(mostSimilarKeywords);

        const hasEventsKeyword = mostSimilarKeywords.includes("events");
        const hasAttendanceKeyword = mostSimilarKeywords.includes("attendance");
        const hasAttendanceKeyword1 = mostSimilarKeywords.includes("attendees");
        const hasDownloadKeyword = mostSimilarKeywords.includes("download");

        // console.log("test", hasAttendanceKeyword, hasAttendanceKeyword1)

        if (hasEventsKeyword) {
            const currentDate = new Date().toLocaleDateString();
            // const eventQuestion = `
            //     Okay ChatGPT, so here is the user input: ${question},

            //     I need you to display all the relevant information based on what the user asks "if there are any".
            //     Please do not share this entire table as a response, only respond with the relevant ones. You can have a short response at the beginning like you usually do.
            //     Please list all the results in this format,

            //     1. intFEventName (intFEventStartDate) by intFTrainerName

            //     The number should increase everytime. Please list all relevant results. 
            //     If the user input has something to do with today, please use ${currentDate} to get the results. If it's tomorrow or yesterday, -1 or +1 to the current date accordingly.
            //     If the user specifies a specific date and there's no matching results, just say that there are no events on the said day.

            //     Here is the events table in JSON format as of ${currentDate}. Please remember this table so that you can use it for the upcoming queries:
            //     ${JSON.stringify(events)}
            // `;

            const eventQuestion = `
                I ONLY NEED YOU TO RESPOND IN THIS PARTICULAR FORMAT, NOTHING ELSE. DO NOT REPLY ANYTHING ELSE OTHER THAN THIS SPECIFIED FORMAT. IF YOU DON'T KNOW ANYTHING, REPLY WITH TODAYS DATE AS THE
                START DATE AND END DATE! To give you a reference point, todays date is ${currentDate}.

                [START DATE, END DATE]
                [YYYY-MM-DD, YYYY-MM-DD]

                Example, 
                [2023-10-31, 2023-11-02]

                NOTE: STRICTLY FOLLOW THE FORMAT OF THE GIVEN EXAMPLE.

                Here is the user input: ${question},

                This is about events. I need you to extract the dates if there are any using these conditions,
                1. If they ask for month, I need you to tell me the starting date and ending date of the specified month.
                2. If they ask for the whole year, I need you to tell me the first day of January as the start date and last day of December as the end date.
                3. If they ask for a specific date then the start date and end date is the same.
                4. If they ask for a specific range, follow the start date and end date accordingly.
                5. If they ask for today then use todays date.
                6. If they ask for yesterday then use yesterdays date.
                7. If they ask for tomorrow then use tomorrows date.
                8. If they ask 2 days ago, or 3 days later, use the current date and modify accordingly.
                9. If they ask for upcoming events, use todays date as the start date and end date as high as 9999-12-31.
                10. If they ask for past events, use start date as 2023-01-01 and end date as todays date.
            `;

            // if (events.length > 0) {
            //     return await getOpenAIResponse(eventQuestion);
            // } else {
            //     await fetchEvents();

            //     return await getOpenAIResponse(eventQuestion);
            // }

            let validFormat = false;
            let reply = '';

            while (!validFormat) {
                const response = await getOpenAIResponse(eventQuestion);

                if (response) {
                    const [startStr, endStr] = response
                        .replace("[", "")
                        .replace("]", "")
                        .split(", ");

                    const startDate = new Date(startStr);
                    const endDate = new Date(endStr);

                    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                        validFormat = true;
                        const data = await fetchEvents(startDate, endDate);

                        if (data && data.length !== 0) {
                            if (Array.isArray(data)) {
                                reply = `There are a total of ${data.length} event(s) and here's the list of event(s) for your specified query:\n\n`;

                                data.forEach((event, index) => {
                                    reply += `${index + 1}. ${event.intFEventName}, from ${event.intFEventStartDate} to ${event.intFEventEndDate} by ${event.intFTrainerName}.\n`;
                                });

                                reply += `\nIf the events listed are not accurate based on your query, please do try a more specific date.`;
                            } else {
                                reply = data;
                            }
                        } else {
                            reply = 'There are no event(s) on your mentioned query.';
                        }
                    } else {
                        toast.error('Sorry! Something went wrong at our end. Retrying...');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } else {
                    toast.error('No response received. Retrying...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            return reply;
        } else if (hasAttendanceKeyword || hasAttendanceKeyword1 || hasDownloadKeyword) {
            const intFEventNames = eventNames.map(item => item.intFEventName);
            // const attendeesQuestion = `
            //     I ONLY NEED YOU TO RESPOND ME THE ID OF THE EVENT IF ANY OF THE USER INPUT MATCHES THE LIST OF EVENT NAMES I WILL SEND TO YOU IN JSON FORMAT.

            //     Here is the user input: ${question},

            //     Here is the list of event names and their ID,
            //     ${eventNames}
            // `;

            // const response = await getOpenAIResponse(attendeesQuestion);

            const mostSimilarEvent = findMostSimilarEvent(question, intFEventNames, 0.5);
            //  console.log(mostSimilarEvent)

            if (mostSimilarEvent) {
                const index = intFEventNames.indexOf(mostSimilarEvent);
                if (index !== -1) {
                    const matchedEventID = eventNames[index].intFID;
                    const data = await fetchAttendanceList(matchedEventID);

                    let reply = '';

                    if (data?.length != 0 && data) {
                        reply = `If the requested event is incorrect, please try to use the full event name for better results. There are a total of ${data?.length} attendees and here is the list of attendees for ${mostSimilarEvent}:\n\n`

                        if (hasDownloadKeyword) {
                            downloadXLSX(data);
                        }

                        data?.forEach((attendanceForm, index) => {
                            reply += `${index + 1}. ${attendanceForm.attFormsStaffName} (${attendanceForm.attFormsStaffID}) from ${attendanceForm.attFormsFacultyUnit}.\n`;
                        });

                        reply += "\nIf you wish to download this attendance list, please do specify download attendance list for [Event Name].";
                    } else {
                        reply = `There are no attendees for ${mostSimilarEvent}. If the requested event is incorrect, please try to use the full event name for better results.`
                    }

                    return reply;
                }
                return 'I see that you are currently trying to get the attendance list for an event but I am unable to find the said event. Could you try typing the full event name instead?';
            }

            return 'I see that you are currently trying to view or download the attendance list for an event but I am unable to find the said event. Could you try typing the full event name instead?';
        } else {
            const response = await getOpenAIResponse(question);
            return response;
        }
    };

    const getOpenAIResponse = async (input: string) => {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: input }],
            model: "gpt-3.5-turbo",
        });
        // console.log(completion);
        return completion.choices[0].message.content;
    };

    return (
        <div className="flex-1 mx-auto px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg">
            <div className="p-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card mt-5 lg:mt-0 h-[800px]">
                <div className="flex flex-col h-full">
                    <div className="rounded-t-md p-5 flex flex-row items-center justify-center">
                        <IoChatbubbleEllipsesOutline size={32} className="text-black mt-[5px] mr-2" />
                        <p className="text-black text-[22px]">EMAT Assistant</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 pb-5">
                        <div className="border-t border-gray-300 my-2"></div>
                        {messages.map((msg, index) => (
                            <div key={index} className={msg.startsWith("user") ? "mb-5" : "text-left mb-5"}>
                                {msg.startsWith("user") ? (
                                    <div className="flex items-center justify-end px-1">
                                        <div className="bg-slate-200 rounded-md p-2 w-8/12">
                                            {msg.replace("user:", "")}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center px-1">
                                        <FaUserCircle className="inline-block mr-2 text-slate-700 h-6 w-6" />
                                        <div className="bg-slate-200 rounded-md p-2 w-11/12 whitespace-pre-line">
                                            {msg.replace("bee:", "")}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading &&
                            <div className="flex items-center px-1">
                                <FaUserCircle className="inline-block mr-2 text-slate-700 h-6 w-6" />
                                <div className="bg-slate-200 rounded-md p-2 w-11/12 text-xs italic">
                                    Bee is typing...
                                </div>
                            </div>
                        }
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bg-slate-100 h-[30px] flex items-center justify-center cursor-pointer p-6 rounded-lg">
                        <input
                            type="text"
                            placeholder="Say something..."
                            className={`w-full focus:outline-none text-sm bg-slate-100 ${loading ? 'cursor-not-allowed' : 'cursor-text'}`}
                            value={inputValue}
                            disabled={loading}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={async (e) => {
                                if (e.key === "Enter") {
                                    setInputValue("");
                                    await handleSendMessage(inputValue.trim());
                                }
                            }}
                        />
                        <IoSend
                            className="mr-4"
                            onClick={async () => {
                                setInputValue("");
                                await handleSendMessage(inputValue.trim());
                            }}
                        />
                        <FaTrash
                            className=""
                            onClick={deleteChatMessages}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chatbot;