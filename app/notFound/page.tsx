"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import image_404 from "@/public/images/404.png";

const PageNotFound = () => {
  const searchParams = useSearchParams()
  const search = searchParams.get('from')

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center py-20 dark:bg-slate-900 p-5 -mt-12 lg:-mt-5">
      <img src={image_404.src} alt="" className="w-[300px] lg:w-[420px]" />
      <div className="max-w-[546px] mx-auto w-full mt-6">
        {search == 'att' ? (
          <div>
            <p className="text-slate-800 mb-2 lg:mb-4 text-xl lg:text-3xl font-bold">OOPSIES!</p>
            <div className="text-sm lg:text-base font-normal mb-6 lg:mb-8 text-slate-700">
              The forms you&rsquo;re currently accessing is <span className="font-bold">no longer accepting new responses.</span> <br /> Contact the event organizer(s) if you think this was a mistake.
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
