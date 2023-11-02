"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import officeGIF from "@/public/office_cartoon.gif";

const PageNotFound = () => {
    const searchParams = useSearchParams()
    const search = searchParams.get('status')

    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center py-20 dark:bg-slate-900 p-5 -mt-12 lg:-mt-5">
            <img src={officeGIF.src} alt="" className="w-[300px] lg:w-[420px]" />
            <div className="max-w-[546px] mx-auto w-full mt-6">
                {search == 're-submission-1f0e4020-ca9a-42d8-825a-3f8af95c1e39' ? (
                    <div>
                        <p className="text-slate-800 text-xl lg:text-3xl font-bold">THANK YOU!</p>
                        <div className="text-sm lg:text-base font-normal mb-6 lg:mb-8 text-slate-700">
                            You have successfully re-submitted your form! <br />You should receive a confirmation email.
                            <br /><br />Please contact/ email us at <span className="font-bold">827-823</span> OR <span className="font-bold">emat@gmail.com</span> if you have not received anything within the next 12 hours.
                        </div>
                        <div className="text-sm lg:text-base font-normal mb-6 lg:mb-8 text-slate-700">
                            Thank you for choosing to use our system! <br /> - EMAT Developer Team
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-slate-800 text-xl lg:text-3xl font-bold">THANK YOU!</p>
                        <div className="text-sm lg:text-base font-normal mb-6 lg:mb-8 text-slate-700">
                            You have successfully updated the form! You may now close this tab/ page. <br /><br /> Thank you for choosing to use our system! <br /> - EMAT Developer Team
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageNotFound;
