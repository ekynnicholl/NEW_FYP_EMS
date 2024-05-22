import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
const Groq = require("groq-sdk");

export const runtime = 'edge';

// const config = new Configuration({
//     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
// })
// const openai = new OpenAIApi(config);

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY
});

export async function POST(request: { json: () => PromiseLike<{ messages: any; }> | { messages: any; }; }) {
    try {
        const { messages } = await request.json();

        const chatCompletion = await getGroqChatCompletion(messages);

        return NextResponse.json(chatCompletion);
    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}

async function getGroqChatCompletion(messages: any) {
    const response = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "University events" },
            ...messages
        ],
        model: "llama3-8b-8192"
    });
    return response;
}