"use client";

import VerifyAccess from "@/components/view_ntf/verify_access";
import RequestNTF from "@/components/view_ntf/request_ntf";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Home() {
    const supabase = createClientComponentClient();
    const searchParams = useSearchParams()
    const search = searchParams.get('tokenid')
    const [isValidToken, setIsValidToken] = useState(false);

    const isValidUUID = (uuid: string | null) => {
        if (!uuid) return false;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    const checkTokenValidity = async () => {
        try {
            if (search) {
                const { data, error } = await supabase
                    .from('access_tokens')
                    .select('atID')
                    .eq('atID', search);

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
            if (isValidUUID(search)) {
                await checkTokenValidity();
                if (!isValidToken) {
                    // console.log('Token is not valid.');
                }
            } else {
                // console.log('Invalid UUID format.');
            }
        };

        fetchData();
    }, [search]);

    return (
        <div className="">
            <div className="flex-1">
                <div className="flex-1 px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg h-screen">
                    {!isValidToken ? (
                        <RequestNTF />
                    ) : (
                        <VerifyAccess token={search || ''} />
                    )}
                </div>
            </div>
        </div>
    )
}