"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import officeGIF from "@/public/office_cartoon.gif";
import { getAuth } from "firebase/auth";
import Image from "next/image";

const PageNotFound = () => {
    const searchParams = useSearchParams()
    const search = searchParams.get('status')
    const aao = searchParams.get('mail')
    const auth = getAuth()

    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center py-20 dark:bg-slate-900 p-5 -mt-12 lg:-mt-5">
            <Image width={420} height={300} src={officeGIF.src} alt="" className="w-[300px] lg:w-[420px]" />
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
                            You have successfully updated the form! You may now close this tab/ page.<br />
                            If you mistakenly did your action, please contact/ email us at: <br /> <span className="font-bold">{aao !== 'null' ? aao : "fypemsmaster369@gmail.com"}</span> <br /><br /> Thank you for choosing to use our system! <br /> - EMAT Developer Team
                        </div>
                        {auth.currentUser && (
                            <div>
                                <Link href="/form/external" legacyBehavior={true}>
                                    <a>
                                        <div className="w-1/6 items-center flex justify-center mx-auto mt-5">
                                            <div className="rounded-lg px-[16px] py-[10px] lg:px-[18px] lg:py-[11px] bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover-bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                                                Return
                                            </div>
                                        </div>
                                    </a>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageNotFound;
