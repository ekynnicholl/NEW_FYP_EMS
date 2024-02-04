"use client";

import { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ReCAPTCHA from "react-google-recaptcha";
import NTFList from "@/components/view_ntf/ntf_list";

interface VerifyAccessProps {
    token: string;
    ptoken: string;
}

const VerifyAccess: React.FC<VerifyAccessProps> = ({ token, ptoken }) => {
    const supabase = createClientComponentClient();
    const [accessToken, setAccessToken] = useState<string>(ptoken || '');
    const [verifyStatus, setVerifyStatus] = useState(false);
    const [captcha, setCaptcha] = useState<string | null>();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [atIdentifier, setAtIdentifier] = useState<string | null>(null);
    const [atCreatedAt, setAtCreatedAt] = useState<string | null>(null);
    const [atExpiredAt, setAtExpiredAt] = useState<string | null>(null);
    const [expiredClicked, setExpiredClicked] = useState<boolean>(false);

    const isValidUUID = (uuid: string | null) => {
        if (!uuid) return false;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!accessToken) {
            toast.error('Your access token cannot be empty...');
            return;
        }

        if (!captcha) {
            toast.error('Please verify you are not a robot... Are you... a... robot?!');
            return;
        }

        if (!isValidUUID(accessToken)) {
            toast.error("The access token you've entered is an invalid format. Please check again.");
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            return;
        }

        try {
            const { data, error } = await supabase
                .from('access_tokens')
                .select('*')
                .eq('atID', token)
                .eq('atAccessToken', accessToken);

            if (error) {
                // console.error('Error querying external_forms:', error);
                return;
            }

            setCaptcha(null);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }

            if (data && data.length > 0) {
                const atExpiredAt = new Date(data[0].atExpiredAt);
                const isExpired = atExpiredAt < new Date();

                if (isExpired) {
                    toast.error("The access token you have entered is either expired or doesn't exist. Please ensure you've entered it correctly or request for a new access token.");
                } else {
                    setVerifyStatus(true);

                    setAtIdentifier(data[0].atIdentifier);
                    setAtCreatedAt(data[0].atCreatedAt);
                    setAtExpiredAt(data[0].atExpiredAt);

                    toast.success('Identity confirmed!');
                }
            } else {
                toast.error("The access token you have entered is either expired or doesn't exist. Please ensure you've entered it correctly or request for a new access token.");
            }
        } catch (e) {
            console.error('Error in handleSubmit:', e);
        }
    };

    const updateExpiration = async () => {
        try {
            await supabase
                .from('access_tokens')
                .update({ atExpiredAt: new Date().toISOString() })
                .eq('atID', token);

            setAtExpiredAt(new Date().toISOString());
            setExpiredClicked(true);
            toast.success("Access token has been disabled. You won't be able to use this access token anymore.");
        } catch (error) {
            // console.error('Error updating expiration:', error);
            toast.error('Access token failed to be disabled. Please contact the webmaster.');
        }
    };

    const isExpired = atExpiredAt && new Date() > new Date(atExpiredAt);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card">
                {!verifyStatus ? (
                    <div>
                        <div className="text-justify pr-5 max-w-md">
                            <p className="text-[20px] font-bold">Attention!</p>
                            <p>Please enter the access token that was sent to your email.</p>
                            <p className="text-sm italic mt-1">Take note that your access tokens have a life span of 4 hours. After 4 hours, you will need to request for a new access token to be able to access this list.</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mt-3">
                                <label htmlFor="accessToken" className="block text-gray-700 text-sm lg:text-base font-medium mb-2 dark:text-dark_text">Access Token:</label>
                                <input
                                    type="text"
                                    id="accessToken"
                                    name="accessToken"
                                    placeholder="550e8400-e29b-41d4-a716-446655440000"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    className="w-full border-[1px] p-3 rounded-md focus:outline-none text-sm lg:text-base dark:text-black-500"
                                    required
                                />
                            </div>
                            <div className="mt-3">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                    onChange={setCaptcha}
                                />
                            </div>
                            <div className="mt-3 text-right">
                                <button
                                    type="submit"
                                    disabled={!accessToken}
                                    className={`${accessToken ? 'bg-slate-900' : 'bg-gray-400'} text-white font-bold py-[11px] lg:py-3 px-8 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`} >
                                    Verify
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <NTFList atIdentifier={atIdentifier} atCreatedAt={atCreatedAt} atExpiredAt={atExpiredAt} />
                        <div className="mt-3 text-right">
                            {!isExpired && (
                                <button
                                    onClick={updateExpiration}
                                    disabled={expiredClicked}
                                    className={`${expiredClicked ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500'
                                        } text-white font-bold py-[11px] lg:py-3 px-8 rounded focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm lg:text-base`}
                                >
                                    Disable Access Token
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default VerifyAccess;