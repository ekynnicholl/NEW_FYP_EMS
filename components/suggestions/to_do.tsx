const ToDo = () => {
    return (
        <div className="pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left w-full">
            <h1 className="font-bold text-[20px] dark:text-dark_text text-base lg:text-lg">Future/ Upcoming Updates</h1>
            <div className="border-t border-gray-300 my-2"></div>
            <div className="dark:text-dark_text text-justify">
                <ul className="list-disc pl-5 text-sm lg:text-base">
                    <li> <span className="text-green-500">Combine graphs according to sections based on HR requirement for feedback forms (Requested by Ms. Bibiana).</span></li>
                    <li> <span className="text-green-500">Added visitor option for attendance forms.</span></li>
                    <li> <span className="text-green-500">Notifications module for Nominations/ Travelling Form (UI).</span></li>
                    <ul className="list-disc pl-10">
                        <li><span className="text-green-500">All the statuses of the forms will create a new notification i.e., reviewing, approved, rejected.</span></li>
                        <li><span className="text-green-500">Users can choose to delete or mark notifications as read. View more here: <a className="text-blue-600" href="https://new-fyp-ems.vercel.app/notifications">https://new-fyp-ems.vercel.app/notifications</a></span></li>
                    </ul>
                    <li> <span className="text-green-500">View past <span className="line-through">Nominations/ Travelling Forms</span> attended events for staff.</span></li>
                    <ul className="list-disc pl-10">
                        <li><span className="text-green-500">Users can now view all their submitted Nominations/ Travelling Forms using either their Staff ID or email. Access it via here: </span><a className="text-blue-600" href="https://new-fyp-ems.vercel.app/attended_events">https://new-fyp-ems.vercel.app/attended_events</a></li>
                        <li><span className="text-red-500">Ability to view detailed form details still in progress.</span></li>
                        <li><span className="text-green-500">23/2/2024 - Requested by Ms. Bibiana (LTU) and Ms. Audrey, staff can now view their past attended events in the same page (including NTFs for staff).</span></li>
                    </ul>
                    <li> <span className="text-green-500">Google reCaptcha has been added to certain forms to prevent spams.</span></li>
                    <li> <span className="text-green-500">Loading has been updated so unauthorized access will not see any slight view of the layout before being redirected to the unauthorized access page.</span></li>
                    <li> <span className="text-green-500">Dark/ light mode is now working.</span></li>
                    <li> <span className="text-green-500">Attendance forms courses/ units dropdown can now be dynamically fetched from database.</span></li>
                    <ul className="list-disc pl-10">
                        <li><span className="text-green-500">Ability to change the courses/ units has been completed. View more here: <a className="text-blue-600" href="https://new-fyp-ems.vercel.app/settings">https://new-fyp-ems.vercel.app/settings</a></span></li>
                    </ul>
                    <li> <span className="text-red-500">Auto send a Certificate of Participation upon submission of attendance forms - puppeteer library (auto conversion from HTML to PDF) is working locally, not in vercel app. Alternatives needed.</span></li>
                    <li>Nominations/ Travelling Form daily reminder to review.</li>
                </ul>
            </div>
            <br />
            <div className="dark:text-dark_text">
                <h2 className="lg:text-sm text-base font-bold">Indicators: </h2>
                <div className="flex text-sm lg:text-base">
                    <div className="w-4 h-4 bg-red-500 mr-2 mt-1"></div>
                    <span>
                        Item is currently being tested/ checked whether it is feasible.
                    </span>
                </div>
                <div className="flex text-sm lg:text-base">
                    <div className="w-4 h-4 bg-black-500 mr-2 mt-1"></div>
                    <span>
                        To be confirmed.
                    </span>
                </div>
                <div className="flex text-sm lg:text-base">
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