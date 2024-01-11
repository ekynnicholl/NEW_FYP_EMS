const ToDo = () => {
    return (
        <div className="pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left w-1/2">
            <h1 className="font-bold text-[20px] dark:text-dark_text">Future/ Upcoming Updates</h1>
            <div className="border-t border-gray-300 my-2"></div>
            <div>
                <ul className="list-disc pl-5">
                    <li> <span className="text-red-500">Combine graphs according to sections based on HR requirement for feedback forms </span> (Requested by Ms. Bibiana).</li>
                    <li>Notifications module for Nominations/ Travelling Form (UI).</li>
                    <li>Geolocation Attendance Tracking.</li>
                    <li>Nominations/ Travelling Form daily reminder to review.</li>
                </ul>
            </div>
            <br />
            <div>
                <h2>Indicators: </h2>
                <div className="flex">
                    <div className="w-4 h-4 bg-red-500 mr-2 mt-1"></div>
                    <span>
                        Item is currently being tested/ checked whether it is feasible.
                    </span>
                </div>
                <div className="flex">
                    <div className="w-4 h-4 bg-black-500 mr-2 mt-1"></div>
                    <span>
                        To be confirmed.
                    </span>
                </div>
                <div className="flex">
                    <div className="w-4 h-4 bg-green-500 mr-2 mt-1"></div>
                    <span>
                        Item has already been implemented.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ToDo;