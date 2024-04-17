import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

type SuggestionType = {
    suggBy: string;
    suggDesc: string;
    suggCreated: string;
}

const SuggestList = () => {
    const supabase = createClientComponentClient();
    const [suggestions, setSuggestions] = useState<SuggestionType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from('suggestions')
                    .select('suggBy, suggDesc, suggCreated');
                if (error) {
                    throw error;
                }
                setSuggestions(data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        };

        const suggestionsSubscription = supabase
            .channel('suggestions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'suggestions' }, handleInserts)
            .subscribe()

        fetchData();

        return () => {
            suggestionsSubscription?.unsubscribe();
        };
    }, []);

    const handleInserts = (payload: any) => {
        setSuggestions((prevSuggestions) => [...prevSuggestions, payload.new]);
    }

    const formatDate = (timestamp: string) => {
        const dateObj = new Date(timestamp);
        const date = dateObj.toDateString();
        const time = dateObj.toLocaleTimeString();
        return { date, time };
    };

    return (
        <div className="pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left lg:w-1/2">
            <h1 className="font-bold text-base lg:text-lg dark:text-dark_text">Latest Suggestions</h1>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="overflow-y-auto max-h-80">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4 dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                Name
                            </th>
                            <th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-3/4 dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
                                Suggestion
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {suggestions.map((suggestion, index) => (
                            <tr key={index}>
                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm lg:text-base text-center dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                    {suggestion.suggBy} {/* <br /> {formatDate(suggestion.suggCreated).date} */}
                                </td>
                                <td className="flex-1 px-6 lg:px-8 py-5 border-b border-gray-200 bg-white text-sm lg:text-base text-center dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
                                    {suggestion.suggDesc}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuggestList;