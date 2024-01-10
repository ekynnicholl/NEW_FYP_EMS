import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const Suggestion = () => {
    const supabase = createClientComponentClient();

    return (
        <div className="p-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-center">
            <h1 className="font-bold p-5 text-[20px] dark:text-dark_text">Submit your suggestions!</h1>
            <p>Placeholder</p>
        </div>
    );
};

export default Suggestion;