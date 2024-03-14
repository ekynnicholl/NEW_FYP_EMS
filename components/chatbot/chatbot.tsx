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
    const [events, setEvents] = useState<any[]>([]);

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
                await new Promise(resolve => setTimeout(resolve, 1000));

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

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from("internal_events")
            .select("intFEventName, intFEventStartDate, intFEventEndDate, intFTrainerName")
            .eq("intFIsHidden", 0)
            .order("intFEventStartDate");

        if (error) {
            console.error("Error fetching events:", error);
            return "Sorry, there was an error fetching event information.";
        }

        setEvents(data || []);
    };

    const findMostSimilarKeywords = (userWords: string[], targetKeywords: string[], threshold: number) => {
        return userWords.map((word: string) => {
            const matches = stringSimilarity.findBestMatch(word, targetKeywords);
            console.log(matches.bestMatch.rating);
            return matches.bestMatch.rating >= threshold ? matches.bestMatch.target : null;
        });
    };

    const getChatbotResponse = async (question: string) => {
        const keywords = ["events", "clear messages history"];
        const userWords = compromise(question.toLowerCase()).out("array");

        const mostSimilarKeywords = findMostSimilarKeywords(userWords, keywords, 0.15);

        const hasEventsKeyword = mostSimilarKeywords.includes("events");
        const hasClearMessage = mostSimilarKeywords.includes("clear") || mostSimilarKeywords.includes("messages") || mostSimilarKeywords.includes("history");

        if (hasEventsKeyword) {
            const currentDate = new Date().toLocaleDateString();
            const eventQuestion = `
                Okay ChatGPT, so here is the user input: ${question},

                I need you to display all the relevant information based on what the user asks "if there are any".
                Please do not share this entire table as a response, only respond with the relevant ones. You can have a short response at the beginning like you usually do.
                Please list all the results in this format,

                1. intFEventName (intFEventStartDate) by intFTrainerName

                The number should increase everytime. Please list all relevant results. 
                If the user input has something to do with today, please use ${currentDate} to get the results. If it's tomorrow or yesterday, -1 or +1 to the current date accordingly.
                If the user specifies a specific date and there's no matching results, just say that there are no events on the said day.

                Here is the events table in JSON format as of ${currentDate}. Please remember this table so that you can use it for the upcoming queries:
                ${JSON.stringify(events)}
            `;

            if (events.length > 0) {

                return await getOpenAIResponse(eventQuestion);
            } else {
                await fetchEvents();

                return await getOpenAIResponse(eventQuestion);
            }
        } else if (!hasClearMessage) {
            // localStorage.removeItem('chatMessages');
            // setMessages([]);
            // setIsInitialMessage(true);

            // console.log("clear message");

            // return null;
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
        <div className="z-[999]">
            {!openChat ? (
                <div className="fixed bottom-5 right-5 w-[60px] h-[60px] cursor-pointer flex items-center justify-center bg-red-500 rounded-full" onClick={() => setOpenChat(true)}>
                    <IoChatbubbleEllipsesOutline className="text-white text-3xl" />
                </div>
            ) : (
                <div className="fixed w-[300px] h-[400px] bottom-0 right-5">
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