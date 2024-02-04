"use client";

import VerifyAccess from "@/components/view_ntf/verify_access";
import RequestNTF from "@/components/view_ntf/request_ntf";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Home() {
    const supabase = createClientComponentClient();
    const searchParams = useSearchParams()
    const tokenID = searchParams.get('tokenid')
    const pToken = searchParams.get('ptoken')
    const [isValidToken, setIsValidToken] = useState(false);

    const isValidUUID = (uuid: string | null) => {
        if (!uuid) return false;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    const checkTokenValidity = async () => {
        try {
            if (tokenID) {
                const { data, error } = await supabase
                    .from('access_tokens')
                    .select('atID')
                    .eq('atID', tokenID);

                if (error) {
                    // console.error('Error checking token validity:', error);
                    setIsValidToken(false);
                } else {
                    setIsValidToken(data && data.length > 0);
                }
            } else {
                setIsValidToken(false);
            }
        } catch (e) {
            // console.error('Error in checkTokenValidity:', e);
            return false;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (isValidUUID(tokenID)) {
                await checkTokenValidity();
                if (!isValidToken) {
                    // console.log('Token is not valid.');
                }
            } else {
                // console.log('Invalid UUID format.');
            }
        };

        fetchData();
    }, [tokenID]);

    return (
        <div className="">
            <div className="flex-1">
                <div className="flex-1 bg-slate-100 dark:bg-dark_mode_bg h-screen">
                    {!isValidToken ? (
                        <RequestNTF />
                    ) : (
                        <VerifyAccess token={tokenID || ''} ptoken={pToken || ''} />
                    )}
                </div>
            </div>
        </div>
    )
}