"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import image_404 from "@/public/images/404.png";

const PageNotFound = () => {
  const searchParams = useSearchParams()
  const search = searchParams.get('from')
  const time = searchParams.get("time");
  const event_id = searchParams.get("event_id");
  const event_name = searchParams.get("event_name");

  const [countdown, setCountdown] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    if (search === "start_att" && time) {
      const endTime = new Date(time); // This assumes that 'time' is in UTC
      const currentTime = new Date(); // This will be in the client's time zone

      // Explicitly set the time zone to UTC for currentTime
      currentTime.setUTCHours(currentTime.getUTCHours(), currentTime.getUTCMinutes(), currentTime.getUTCSeconds());

      let timeRemainingInSeconds = Math.max(0, (endTime.getTime() - currentTime.getTime()) / 1000);

      // Calculate days, hours, minutes, and seconds
      const days = Math.floor(timeRemainingInSeconds / (24 * 3600));
      const hours = Math.floor((timeRemainingInSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((timeRemainingInSeconds % 3600) / 60);
      const seconds = Math.floor(timeRemainingInSeconds % 60);

      const formattedCountdown = { days, hours, minutes, seconds };
      setCountdown(formattedCountdown);

      // Update the countdown every second
      const timer = setInterval(() => {
        if (timeRemainingInSeconds > 0) {
          timeRemainingInSeconds--;
          const days = Math.floor(timeRemainingInSeconds / (24 * 3600));
          const hours = Math.floor((timeRemainingInSeconds % (24 * 3600)) / 3600);
          const minutes = Math.floor((timeRemainingInSeconds % 3600) / 60);
          const seconds = Math.floor(timeRemainingInSeconds % 60);

          const formattedCountdown = { days, hours, minutes, seconds };
          setCountdown(formattedCountdown);
        } else {
          clearInterval(timer);
        }
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [search, time]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center py-20 dark:bg-slate-900 p-5 -mt-12 lg:-mt-5">
      <img src={image_404.src} alt="" className="w-[300px] lg:w-[420px]" />
      <div className="max-w-[546px] mx-auto w-full mt-6">
        {search == 'end_att' ? (
          <div>
            <p className="text-slate-800 mb-2 lg:mb-4 text-xl lg:text-3xl font-bold">OOPSIES!</p>
            <div className="text-sm lg:text-base font-normal mb-6 lg:mb-8 text-slate-700">
              The forms you&rsquo;re currently accessing is <span className="font-bold">no longer accepting new responses.</span> <br /> Contact the event organizer(s) if you think this was a mistake.
            </div>
            <div className="text-slate-700 font-bold">
              Event Accessed: {event_name}
            </div>
          </div>
        ) : search == 'start_att' ? (
          <div>
            <p className="text-slate-800 mb-2 lg:mb-4 text-xl lg:text-3xl font-bold">OOPSIES!</p>
            <div className="text-sm lg:text-base font-normal mb-4 text-slate-700 lg:whitespace-nowrap">
              Hey! The forms you&rsquo;re currently accessing <span className="font-bold">has not yet opened for submission</span>! <br /> Contact the event organizer(s) if you think this was a mistake.
            </div>
            <div>*Are you sure you have attended the correct event?</div>
            <div className="text-slate-700 font-bold">
              Event Accessed: {event_name}
            </div>
            <br />
            <div className="text-slate-700 font-bold">
              Time Remaining: <br className="lg:hidden" />{countdown?.days} days, {countdown?.hours} hours, {countdown?.minutes} minutes, {countdown?.seconds} seconds
            </div>
            {countdown?.days === 0 && countdown?.hours === 0 && countdown?.minutes === 0 && countdown?.seconds === 0 && (
              <Link href={`/form/${event_id}`}>
                <div className="w-1/6 items-center flex justify-center mx-auto mt-5">
                  <div className="rounded-lg px-[16px] py-[10px] lg:px-[18px] lg:py-[11px] bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                    Return
                  </div>
                </div>
              </Link>
            )}
          </div>
        ) : search == 'ext_forms' ? (
          <div>
            <p className="text-slate-800 mb-2 lg:mb-4 text-xl lg:text-3xl font-bold">OOPSIES!</p>
            <div className="text-sm lg:text-base font-normal mb-6 lg:mb-8 text-slate-700">
              Hey! The Nominations/ Travelling Form you&rsquo;re trying to access <span className="font-bold">does not exist</span>. <br /> Contact the office if you think this was a mistake.
            </div>
          </div>
        ) : (
          <div>
            <p className="text-slate-800 mb-2 lg:mb-4 text-xl lg:text-3xl font-bold">PAGE NOT FOUND!</p>
            <div className="text-sm lg:text-base font-normal mb-6 lg:mb-8 text-slate-700">
              The page you are looking for is currently unavailable...
            </div>
            <div className="w-1/6 items-center flex justify-center mx-auto">
              <div className="rounded-lg px-[16px] py-[10px] lg:px-[18px] lg:py-[11px] bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                <Link
                  href="/login">
                  Return
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageNotFound;
