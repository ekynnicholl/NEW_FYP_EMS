"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import chatbot_bg from "@/public/images/chatbot_bg3.png";
import robot_profile from "@/public/images/robot_icon1.png";
import user_profile from "@/public/images/user_icon1.png";
import { BsSend } from "react-icons/bs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { useChat, Message } from "ai/react";
import Chatbot from "@/components/chatbot/chatbot_page";

export default function Home() {
	return (
		<div className="min-h-screen">
			<Chatbot />
		</div>
	);
}
