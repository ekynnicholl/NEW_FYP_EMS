import React, { useEffect, useRef, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import stringSimilarity from "string-similarity";
import compromise from "compromise";
import OpenAI from "openai";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const Chatbot = () => {
    const [openChat, setOpenChat] = useState<boolean>(false);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isInitialMessage, setIsInitialMessage] = useState<boolean>(true);
    const supabase = createClientComponentClient();
    const [isAskingEvents, setIsAskingEvents] = useState<boolean>(false);

    useEffect(() => {
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        const sendInitialMessage = async () => {
            if (openChat && isInitialMessage) {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 2000));

                setLoading(false);
                setMessages((prevMessages) => [...prevMessages, `bee: Hi there! How can I help?`]);
                setIsInitialMessage(false);
            }
        };

        sendInitialMessage();
    }, [openChat, isInitialMessage]);

    const openai = new OpenAI({
        apiKey: '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',
        dangerouslyAllowBrowser: true
    });

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        }
    };

    useEffect(() => {
        if (openChat) {
            scrollToBottom();
        }
    }, [messages, openChat]);

    const handleSendMessage = async (message: string) => {
        if (inputValue.trim() === "") return;

        setLoading(true);
        setMessages((prevMessages) => [...prevMessages, `user: ${inputValue.trim()}`]);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await getChatbotResponse(message);

        setLoading(false);
        setMessages((prevMessages) => [...prevMessages, `bee: ${response}`]);
    };

    const formatDateToDDMMYYYY = (dateString: string): string => {
        // Split the date string into day, month, and year parts
        const [dayStr, monthStr, yearStr] = dateString.split(' ');

        // Extract numerical day and year
        const day = parseInt(dayStr, 10);
        const year = parseInt(yearStr, 10);

        // Extract numerical month from month name
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames.findIndex(name => name.toLowerCase() === monthStr.toLowerCase()) + 1;

        // Construct the formatted date string in DD/MM/YYYY format
        const formattedDate = `${month}/${day}/${year}`;

        console.log('lalalala', formattedDate);

        return formattedDate;
    };

    const getEventsForTimeRange = async (timeRange: string) => {
        const today = new Date();
        let startDate;
        let endDate;

        const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

        if (timeRange === "today") {
            const currentUTCDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            startDate = currentUTCDate;
            endDate = new Date(currentUTCDate.getTime() + (24 * 60 * 60 * 1000)); // Add 1 day in milliseconds
        } else if (timeRange === "yesterday") {
            const yesterdayUTCDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1));
            startDate = yesterdayUTCDate;
            endDate = new Date(yesterdayUTCDate.getTime() + (24 * 60 * 60 * 1000)); // Add 1 day in milliseconds
        } else if (timeRange === "tomorrow") {
            const tomorrowUTCDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));
            startDate = tomorrowUTCDate;
            endDate = new Date(tomorrowUTCDate.getTime() + (24 * 60 * 60 * 1000)); // Add 1 day in milliseconds
        } else if (timeRange === "week") {
            const currentDayOfWeek = today.getUTCDay();
            startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - currentDayOfWeek));
            endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - currentDayOfWeek + 7));
        } else if (timeRange === "next week") {
            startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 7));
            endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 14));
        } else if (timeRange === "last week") {
            startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 7));
            endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        } else if (timeRange === "month") {
            startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
            endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
        } else if (timeRange === "next month") {
            startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
            endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 2, 0));
        } else if (timeRange === "last month") {
            startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
            endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));
        } else if (timeRange === "year") {
            startDate = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
            endDate = new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 0));
        } else if (timeRange === "next year") {
            startDate = new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1));
            endDate = new Date(Date.UTC(today.getUTCFullYear() + 2, 0, 0));
        } else if (timeRange === "last year") {
            startDate = new Date(Date.UTC(today.getUTCFullYear() - 1, 0, 1));
            endDate = new Date(Date.UTC(today.getUTCFullYear(), 0, 0));
        } else if (dateRegex.test(timeRange)) {
            const [monthStr, dayStr, yearStr] = timeRange.split('/').map(Number);
            const month = monthStr - 1;
            const day = dayStr;
            const year = yearStr;

            startDate = new Date(Date.UTC(year, month, day));
            endDate = new Date(Date.UTC(year, month, day + 1));
        } else {
            const response = await getOpenAIResponse(`events ${timeRange}`);
            return response;
        }

        console.log(startDate, endDate);

        const { data, error } = await supabase
            .from("internal_events")
            .select("*")
            .gte("intFEventStartDate", startDate.toISOString())
            .lt("intFEventStartDate", endDate.toISOString())
            .eq("intFIsHidden", 0)
            .order("intFEventStartDate");

        if (error) {
            console.error("Error fetching events:", error);
            return "Sorry, there was an error fetching event information.";
        }

        const currentDate = new Date();
        const passedEvents = data.filter((event) => new Date(event.intFEventStartDate) < currentDate);
        const upcomingEvents = data.filter((event) => new Date(event.intFEventStartDate) >= currentDate);

        const eventCount = data.length || 0;

        let timeRangeText = "";
        if (timeRange === "today") {
            const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(startDate);
            timeRangeText = `today, ${formattedDate}`;
        } else if (timeRange === "yesterday") {
            const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(startDate);
            timeRangeText = `yesterday, ${formattedDate}`;
        } else if (timeRange === "tomorrow") {
            const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(startDate);
            timeRangeText = `tomorrow, ${formattedDate}`;
        } else if (timeRange === "week") {
            const formattedStartDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(startDate);
            const formattedEndDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(endDate);
            timeRangeText = `this week, from ${formattedStartDate} to ${formattedEndDate}`;
        } else if (timeRange === "next week") {
            const formattedStartDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(startDate);
            const formattedEndDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(endDate);
            timeRangeText = `next week, from ${formattedStartDate} to ${formattedEndDate}`;
        } else if (timeRange === "last week") {
            const formattedStartDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(startDate);
            const formattedEndDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(endDate);
            timeRangeText = `last week, from ${formattedStartDate} to ${formattedEndDate}`;
        } else if (timeRange === "month") {
            const formattedStartMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startDate);
            timeRangeText = `the month of ${formattedStartMonth}`;
        } else if (timeRange === "next month") {
            const formattedStartMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startDate);
            timeRangeText = `next month, ${formattedStartMonth}`;
        } else if (timeRange === "last month") {
            const formattedStartMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startDate);
            timeRangeText = `last month, ${formattedStartMonth}`;
        } else if (timeRange === "year") {
            const formattedStartYear = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(startDate);
            timeRangeText = `the year ${formattedStartYear}`;
        } else if (timeRange === "next year") {
            const formattedStartYear = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(startDate);
            timeRangeText = `next year, ${formattedStartYear}`;
        } else if (timeRange === "last year") {
            const formattedStartYear = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(startDate);
            timeRangeText = `last year, ${formattedStartYear}`;
        } else if (dateRegex.test(timeRange)) {
            const parsedDate = new Date(timeRange);
            const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(parsedDate);
            timeRangeText = `on ${formattedDate}`;
        }

        if (eventCount === 0) {
            return `There are no event(s) ${timeRangeText}.`;
        }

        // This is to show the upcoming events only,
        if (passedEvents.length === 0) {
            const passedEventsMessage = `There are a total of ${upcomingEvents.length} upcoming event(s) for ${timeRangeText}.

                Upcoming Event(s): ${upcomingEvents.map((event, index) => `\n${index + 1}. ${event.intFEventName} (${new Date(event.intFEventStartDate).toLocaleDateString()})`).join("")}
            `;

            return passedEventsMessage;
        }

        // This is to show the past events only,
        if (upcomingEvents.length === 0) {
            const upcomingEventsMessage = `There are a total of ${passedEvents.length} past event(s) for ${timeRangeText}.

                Past Event(s): ${passedEvents.map((event, index) => `\n${index + 1}. ${event.intFEventName} (${new Date(event.intFEventStartDate).toLocaleDateString()})`).join("")}
            `;

            return upcomingEventsMessage;
        }

        const formattedString = `There are a total of ${eventCount} event(s) with ${passedEvents.length} completed and ${upcomingEvents.length} upcoming event(s) for ${timeRangeText}.

        Past Event(s): ${passedEvents.map((event, index) => `\n${index + 1}. ${event.intFEventName} (${new Date(event.intFEventStartDate).toLocaleDateString()})`).join("")}

        Upcoming Event(s): ${upcomingEvents.map((event, index) => `\n${index + 1}. ${event.intFEventName} (${new Date(event.intFEventStartDate).toLocaleDateString()})`).join("")}
        `;

        return formattedString;
    };

    const findMostSimilarKeywords = (userWords: string[], targetKeywords: string[], threshold: number) => {
        return userWords.map((word: string) => {
            const matches = stringSimilarity.findBestMatch(word, targetKeywords);
            console.log(matches.bestMatch.rating);
            return matches.bestMatch.rating >= threshold ? matches.bestMatch.target : null;
        });
    };

    const getTimeRangeKeyword = (mostSimilarKeywords: string[]) => {
        const timeRangeKeywords = ["today", "week", "year", "month", "tomorrow", "yesterday", "next week", "next month", "last week", "last month", "last year", "next year"];
        const threshold = 0.15;

        const timeRange = findMostSimilarKeywords(mostSimilarKeywords, timeRangeKeywords, threshold)
            .filter(keyword => keyword !== null)[0];

        return timeRange || "this month";
    };

    const extractDatesFromQuestion = (question: string): string[] => {
        const terms = compromise(question.toLowerCase()).terms();

        const dateRegex = /(\d{1,2}(?:st|nd|rd|th)?\s(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s\d{4})/gi;

        const dateMatches = question.match(dateRegex) || [];

        return dateMatches.map(dateMatch => dateMatch.trim());
    };

    const getChatbotResponse = async (question: string) => {
        const keywords = ["events", "products", "offer"];
        const userWords = compromise(question.toLowerCase()).out("array");

        const mostSimilarKeywords = findMostSimilarKeywords(userWords, keywords, 0.15);

        const hasEventsKeyword = mostSimilarKeywords.includes("events");
        const hasProductsKeyword = mostSimilarKeywords.includes("products") || mostSimilarKeywords.includes("offer");

        if (hasEventsKeyword || isAskingEvents) {
            setIsAskingEvents(true);
            const extractedDates = extractDatesFromQuestion(question);
            console.log(extractedDates);

            if (extractedDates.length > 0) {
                const eventsPromises = extractedDates.map(date => getEventsForTimeRange(formatDateToDDMMYYYY(date)));
                const eventsResults = await Promise.all(eventsPromises);
                return eventsResults.join("\n\n");
            } else {
                const timeRange = getTimeRangeKeyword(userWords);
                return await getEventsForTimeRange(timeRange);
            }
        } else if (hasProductsKeyword) {
            return "We offer a wide range of products including electronics, clothing, and accessories.";
        }

        const response = await getOpenAIResponse(question);
        return response;
    };

    const getOpenAIResponse = async (input: string) => {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: input }],
            model: "gpt-3.5-turbo",
        });
        console.log(completion);
        return completion.choices[0].message.content;
    };

    return (
        <div className="fixed bottom-0 right-5 z-[999] border-t-2 border-l-2 border-r-2 border-black rounded-t-md">
            {!openChat ? (
                <div className="px-4 cursor-pointer flex flex-row items-center justify-center p-2 bg-red-500 rounded-t-md w-[300px]" onClick={() => setOpenChat(true)}>
                    <IoChatbubbleEllipsesOutline className="text-white mt-[5px] mr-2" />
                    <p className="text-white text-[18px]">EMAT Bot</p>
                </div>
            ) : (
                <div className="w-[300px] h-[400px]">
                    <div className="flex flex-col h-full">
                        <div className="bg-red-500 h-[40px] rounded-t-md p-2 flex flex-row cursor-pointer items-center justify-center" onClick={() => setOpenChat(false)}>
                            <IoChatbubbleEllipsesOutline className="text-white mt-[5px] mr-2" />
                            <p className="text-white text-[18px]">EMAT Bot</p>
                        </div>

                        <div className="bg-slate-100 flex-1 overflow-y-auto p-2 pb-5">
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

                        <div className="bg-white h-[30px] flex items-center justify-center cursor-pointer ">
                            <input
                                type="text"
                                placeholder="Say something..."
                                className={`w-full focus:outline-none ml-2 mr-2 text-sm ${loading ? 'cursor-not-allowed' : 'cursor-text'}`}
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
                                className="mr-2"
                                onClick={async () => {
                                    setInputValue("");
                                    await handleSendMessage(inputValue.trim());
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chatbot;