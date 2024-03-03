import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import Image from "next/image";

const Suggestion = () => {
    const supabase = createClientComponentClient();
    const [suggBy, setSuggBy] = useState('');
    const [suggDesc, setSuggDesc] = useState('');
    // 1 is the default state, 2 is failed, 3 is successful.
    const [submissionStatus, setSubmissionStatus] = useState<number | null>(1);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        // Insert suggestion into Supabase table
        const { data, error } = await supabase
            .from('suggestions')
            .upsert([
                {
                    suggBy: suggBy,
                    suggDesc: suggDesc
                }
            ]);

        if (error) {
            console.error('Error inserting suggestion:', error);
            setSubmissionStatus(2)
        } else {
            console.log('Suggestion submitted successfully:', data);
            setSubmissionStatus(3)
        }
    };

    return (
        <div className="pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left w-1/2">
            <h1 className="font-bold text-[20px] dark:text-dark_text">Submit your suggestions!</h1>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="dark:text-dark_text">
                <p>Your suggestions are invaluable in enhancing our system and making it even better.
                    We appreciate your input and look forward to hearing your ideas!</p>
                {submissionStatus === 1 && (
                    <div className="">
                        <form onSubmit={handleSubmit}>
                            <div className="mt-3">
                                <label htmlFor="suggBy" className="block text-gray-700 text-sm lg:text-base font-medium mb-2 dark:text-dark_text">Your Name:</label>
                                <input
                                    type="text"
                                    id="suggBy"
                                    name="suggBy"
                                    placeholder="Name"
                                    value={suggBy}
                                    onChange={(e) => setSuggBy(e.target.value)}
                                    className="w-full border-[1px] p-3 rounded-md focus:outline-none text-sm lg:text-base dark:text-slate-100 dark:border-[#736B5E] dark:bg-dark_mode_card"
                                    required
                                />
                            </div>
                            <div className="mt-5">
                                <label htmlFor="suggDesc" className="block text-gray-700 text-sm lg:text-base font-medium mb-2 dark:text-dark_text dark:bg-dark_mode_card">Your Suggestion:</label>
                                <textarea
                                    id="suggDesc"
                                    name="suggDesc"
                                    value={suggDesc}
                                    placeholder="I suggest for a feature that can..."
                                    onChange={(e) => setSuggDesc(e.target.value)}
                                    className="w-full border-[2px] p-3 rounded-md focus:outline-none text-sm lg:text-base dark:text-slate-100 dark:border-[#736B5E] dark:bg-dark_mode_card"
                                    required
                                />
                            </div>
                            <div className="mt-5 text-right">
                                <button
                                    type="submit"
                                    disabled={!suggBy && !suggDesc}
                                    className={`${(suggBy && suggDesc) ? 'bg-[#494F52]' : 'bg-[#494F52]'} text-white font-bold py-[11px] lg:py-3 px-8 rounded focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base`} >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {submissionStatus === 2 && (
                    <div>
                        <Image
                            src="/images/cross_mark.png"
                            alt="cross_mark"
                            width={200}
                            height={250}
                            className="mx-auto -mt-[39px] lg:-mt-[45px]"
                        />
                        <h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
                            Oopsies!
                        </h3>
                        <p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
                            Something went wrong with our side. Please try again or contact the webmaster.
                        </p>
                    </div>
                )}
                {submissionStatus === 3 && (
                    <div>
                        <Image
                            src="/images/tick_mark.png"
                            alt="cross_mark"
                            width={200}
                            height={250}
                            className="mx-auto -mt-[39px] lg:-mt-[45px]"
                        />
                        <h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
                            Thank you!
                        </h3>
                        <p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
                            Your suggestion has been recorded successfully.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Suggestion;