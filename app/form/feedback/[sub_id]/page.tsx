"use client";

import Image from "next/image";
import { Fragment, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Modal from "@/components/Modal";

// Import icons from react-icons
import { BiCalendar } from "react-icons/bi";
import { useParams, useRouter } from "next/navigation";


type FeedbackFormData = {
	fbSubEventID: string; // Add the missing property
	feedbackStaffID: string; 
	fbCourseName: string;
	fbCommencementDate: Date;
	fbCompletionDate: Date;
	fbDuration: string;
	fbTrainersName: string;
	fbTrainingProvider: string;
	fbSectionESuggestions: string;
	fbSectionEChanges: string;
	fbSectionEAdditional: string;
	fbFullName: string;
	fbEmailAddress: string;
};
const initialFormData: FeedbackFormData = {
	fbSubEventID: "", // Add the missing property
	feedbackStaffID: "",
	fbCourseName: "",
	fbCommencementDate: new Date(), // Initialize with the current date or any default date you prefer
	fbCompletionDate: new Date(),
	fbDuration: "",
	fbTrainersName: "",
	fbTrainingProvider: "",
	fbSectionESuggestions: "",
	fbSectionEChanges: "",
	fbSectionEAdditional: "",
	fbFullName: "",
	fbEmailAddress: ""
	// ... initialize other properties ...
  };
  
export default function FeedbackForm() {
	const supabase = createClientComponentClient();
	const [eventData, setEventData] = useState<any>(null);
	const [formData, setFormData] = useState<FeedbackFormData>(initialFormData);
	const [showModalSuccess, setShowModalSuccess] = useState(false);


	// const [attendance_id, setAttendanceID] = useState("");

	// Get the Event ID from the link,
	const { sub_id } = useParams();
	const router = useRouter();

	useEffect(() => {
		const fetchEventData = async () => {
			// Fetch the event_id associated with the given attendance_list ID
			const { data: attendanceListData, error: attendanceListError } = await supabase
				.from('sub_events')
				.select('sub_eventsID, sub_eventsMainID, sub_eventsName, sub_eventsVenue, sub_eventsStartDate, sub_eventsEndDate, sub_eventsStartTime, sub_eventsEndTime')
				.eq('sub_eventsID', sub_id);

			if (attendanceListError) {
				console.error('Error fetching attendance list data:', attendanceListError);
				router.push('/error-404');
				return;
			}

			setEventData(attendanceListData);

			const event_id = attendanceListData[0]?.sub_eventsMainID;

			if (event_id) {
				// Fetch the event details based on the event_id,
				const { data: eventDetails, error: eventError } = await supabase
					.from('internal_events')
					.select('intFEventName')
					.eq('intFID', event_id);

				if (eventError) {
					console.error('Error fetching event details:', eventError);
				} else {
					const combinedData = {
						...attendanceListData[0],
						intFEventName: eventDetails[0]?.intFEventName
					};

					setEventData(combinedData);
				}
			}
		};

		fetchEventData();
	}, [sub_id, supabase, router]);

	// Handle data submission
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	  
		const {
			fbCourseName,
			fbCommencementDate,
			fbCompletionDate,
			fbDuration,
			fbTrainersName,
			fbTrainingProvider,
			fbSectionESuggestions,
			fbSectionEChanges,
			fbSectionEAdditional,
			fbFullName,
			fbEmailAddress,
			// ...other new form fields
		} = formData;
	  
		// Validate form fields
		if (!fbCourseName || !fbCommencementDate || !fbCompletionDate || !fbDuration || !fbTrainersName || !fbTrainingProvider) {
		  return;
		}
	  
		// Insert/upsert data into the database using Supabase API
		const { data, error } = await supabase.from("feedback_forms").upsert([
		  {
			fbSubEventID: sub_id,
			fbCourseName,
			fbCommencementDate,
			fbCompletionDate,
			fbDuration,
			fbTrainersName,
			fbTrainingProvider,
			fbSectionESuggestions,
			fbSectionEChanges,
			fbSectionEAdditional,
			fbFullName,
			fbEmailAddress,
			// ...other new form fields
		  },
		]);
	  
		if (error) {
		  console.error("Error inserting data:", error);
		} else {
		  console.log("Data inserted successfully:", data);
		  setFormData({ ...initialFormData }); // Reset the form fields after submission
		  setShowModalSuccess(true);
		}
	  };


	const handleOK = () => {
		setShowModalSuccess(false);
		window.location.reload();
	};

	return (
		<div className="flex flex-col items-center min-h-screen bg-slate-100">
			<form
				onSubmit={handleSubmit}
				className="px-4 w-full max-w-screen-xl lg:max-w-3xl mt-[50px]">
				<div
					className="mb-4 bg-white rounded-md relative"
					style={{ height: "200px" }}>
					<img
						src="https://source.unsplash.com/600x300?party"
						alt="Random"
						className="w-full h-full object-cover rounded-lg"
						style={{ objectPosition: "center top" }}
					/>
				</div>

				<div className="mb-4 p-2 py-10 pl-5 bg-white rounded-lg border-slate-600 border-t-[9px]">
					<div className="ml-1">
						<p className="block text-black font-medium text-xl lg:text-2xl mb-3 -mt-3">
							Training Feedback Form
						</p>
						<div className="border-t border-gray-300 pt-3 text-xs lg:text-sm">
							{eventData && (
								<div>
									<p>Event Name: <span className="font-bold">{eventData.intFEventName}</span></p>
									<p>Date: <span className="font-bold">{eventData.sub_eventsStartDate} - {eventData.sub_eventsEndDate}</span></p>
									<p>Time: <span className="font-bold">{eventData.sub_eventsStartTime} - {eventData.sub_eventsEndTime}</span></p>
									<p>Venue: <span className="font-bold">{eventData.sub_eventsVenue}</span></p>
								</div>
							)}
							<p>Contact us at <span className="font-bold">(123) 456-7890</span> or <span className="font-bold">no_reply@example.com</span></p>
							<p className="mt-3">
							Help us improve!<br/><br />
						Your valuable feedback will help us to improve our training.<br /><br />
						Rest assured, all responses will be kept <strong>STRICTLY CONFIDENTIAL</strong> and will not be divulged to any person or party outside Swinburne University of Technology Sarawak and the Human Resource Development Corporation (HRDCorp – previously known as HRDF).
    						</p>

							<p className="pt-3 text-red-500 font-medium">* Required</p>
						</div>
					</div>
				</div>

				<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
          <div className="ml-1">
            <label
              htmlFor="courseName"
              className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
              Course Name
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              name="courseName"
              id="courseName"
              className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
              required
              placeholder="Your answer"
              style={{ paddingLeft: "5px" }}
              value={formData.fbCourseName}
              onChange={(event) =>
                setFormData({ ...formData, fbCourseName: event.target.value })
              }
            />
          </div>
        </div>
        <div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
          <div className="ml-1">
            <label
              htmlFor="commencementDate"
              className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
              Commencement Date
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="date"
              name="commencementDate"
              id="commencementDate"
              className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
              required
              placeholder="Your answer"
              value={formData.fbCommencementDate.toISOString().split('T')[0]} // Format date as YYYY-MM-DD
              onChange={(event) =>
                setFormData({ ...formData, fbCommencementDate: new Date(event.target.value) })
              }
            />
          </div>
        </div>
		<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
          <div className="ml-1">
            <label
              htmlFor="completionDate"
              className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
              Completion Date
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="date"
              name="completionDate"
              id="completionDate"
              className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
              required
              placeholder="Your answer"
              value={formData.fbCompletionDate.toISOString().split('T')[0]} // Format date as YYYY-MM-DD
              onChange={(event) =>
                setFormData({ ...formData, fbCompletionDate: new Date(event.target.value) })
              }
            />
          </div>
        </div>
		<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
  <div className="ml-1">
    <label
      htmlFor="duration"
      className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
      Duration of Course (No. of Days)
      <span className="text-red-500"> *</span>
    </label>
    <input
      type="text"
      name="duration"
      id="duration"
      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
      required
      placeholder="Your answer"
      value={formData.fbDuration}
      onChange={(event) =>
        setFormData({ ...formData, fbDuration: event.target.value })
      }
    />
  </div>
</div>

<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
  <div className="ml-1">
    <label
      htmlFor="trainerName"
      className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
      Trainer&apos;s Name
      <span className="text-red-500"> *</span>
    </label>
    <input
      type="text"
      name="trainerName"
      id="trainerName"
      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
      required
      placeholder="Your answer"
      value={formData.fbTrainersName}
      onChange={(event) =>
        setFormData({ ...formData, fbTrainersName: event.target.value })
      }
    />
  </div>
</div>

<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
  <div className="ml-1">
    <label
      htmlFor="trainingProvider"
      className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
      Training Provider
      <span className="text-red-500"> *</span>
    </label>
    <input
      type="text"
      name="trainingProvider"
      id="trainingProvider"
      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
      required
      placeholder="Your answer"
      value={formData.fbTrainingProvider}
      onChange={(event) =>
        setFormData({ ...formData, fbTrainingProvider: event.target.value })
      }
    />
  </div>
</div>

        {/* Suggestions/Comments Card */}
        <div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg w-full">
          <div className="ml-1">
            <p className="block text-black font-medium text-xl lg:text-2xl mb-3 -mt-3">
              E. Suggestions/Comments
            </p>

            {/* Question 1 Card */}
            <div className="mb-4 p-2 py-8 pl-5 bg-white rounded-lg">
              <div className="ml-1">
                <label
                  htmlFor="suggestion1"
                  className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
                  1. What did you like most about the course?
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  id="suggestion1"
                  className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-basepleas"
                  required
                  placeholder="Your answer"
                  value={formData.fbSectionESuggestions}
                  onChange={(event) =>
                    setFormData({ ...formData, fbSectionESuggestions: event.target.value })
                  }
                />
              </div>
            </div>

            {/* Question 2 Card */}
            <div className="mb-4 p-2 py-8 pl-5 bg-white rounded-lg">
              <div className="ml-1">
                <label
                  htmlFor="suggestion2"
                  className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
                  2. If you could change one thing about this course, what would it be?
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  id="suggestion2"
                  className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
                  required
                  placeholder="Your answer"
                  value={formData.fbSectionEChanges}
                  onChange={(event) =>
                    setFormData({ ...formData, fbSectionEChanges: event.target.value })
                  }
                />
              </div>
            </div>

            {/* Question 3 Card */}
            <div className="mb-4 p-2 py-8 pl-5 bg-white rounded-lg">
              <div className="ml-1">
                <label
                  htmlFor="suggestion3"
                  className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
                  3. Please share any additional comments or suggestions.
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  id="suggestion3"
                  className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none mt-3 text-sm lg:text-base"
                  required
                  placeholder="Your answer"
                  value={formData.fbSectionEAdditional}
                  onChange={(event) =>
                    setFormData({ ...formData, fbSectionEAdditional: event.target.value })
                  }
                />
              </div>
            </div>

          </div>
		  </div>

		  <div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
  <div className="ml-1">
    {/* Verification Card */}
    <div className="mb-4">
      <p className="block text-black font-medium text-xl lg:text-2xl mb-3 -mt-3">Verification</p>
      <p className="font-semibold mt-6">
        I hereby declare that the information I have provided in the Training Feedback Form provided is true, correct & complete.
      </p>
    </div>
  </div>
</div>

<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
  <div className="ml-1">
    {/* Full Name Card */}
    <div className="mb-4">
      <label htmlFor="fullName" className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
        Full Name
        <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center border-b border-gray-300 py-2">
        <input
          type="text"
          id="fullName"
          name="fullName"
		  placeholder="Your answer"
          className="w-full px-4 focus:outline-none text-sm lg:text-base"
          required
          value={formData.fbFullName}
          onChange={(event) => setFormData({ ...formData, fbFullName: event.target.value })}
        />
      </div>
    </div>
  </div>
</div>

<div className="mb-4 p-2 pr-[100px] py-8 pl-5 bg-white rounded-lg">
  <div className="ml-1">
    {/* Email Address Card */}
    <div className="mb-4">
      <label htmlFor="email" className="block text-gray-700 text-sm lg:text-base font-medium mb-2 -mt-3 ml-[5px]">
        Email Address
        <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center border-b border-gray-300 py-2">
        <input
          type="email"
          id="email"
          name="email"
		  placeholder="Your answer"
          className="w-full px-4 focus:outline-none text-sm lg:text-base"
          required
          value={formData.fbEmailAddress}
          onChange={(event) => setFormData({ ...formData, fbEmailAddress: event.target.value })}
        />
      </div>
    </div>
  </div>
</div>


<Fragment>
  <button
    type="submit"
    className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-[11px] lg:py-3 px-8 rounded mb-10 mt-3 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-sm lg:text-base"
    onClick={() => {
      if (
        formData.fbCourseName &&
        formData.fbCommencementDate &&
        formData.fbCompletionDate &&
        formData.fbDuration &&
        formData.fbTrainersName &&
        formData.fbTrainingProvider
      ) {
        setShowModalSuccess(true);
      }
    }}
    disabled={
      !formData.fbCourseName ||
      !formData.fbCommencementDate ||
      !formData.fbCompletionDate ||
      !formData.fbDuration ||
      !formData.fbTrainersName ||
      !formData.fbTrainingProvider
    }
  >
    Submit
  </button>
</Fragment>


				<Modal
					isVisible={showModalSuccess}
					onClose={() => setShowModalSuccess(false)}>
					<div className="p-4">
						<Image
							src="/images/tick_mark.png"
							alt="cross_mark"
							width={200}
							height={250}
							className="mx-auto -mt-[39px] lg:-mt-[45px]"
						/>
						<h3 className="text-2xl lg:text-3xl font-medium text-gray-600 mb-5 text-center -mt-8">
							Success!
						</h3>
						<p className="text-base text-[14px] lg:text-[16px] lg:text-mb-7 mb-5 lg:mb-5 font-normal text-gray-400 text-center">
							Your Feedback has been successfully recorded!
						</p>
						<div className="text-center ml-4">
							<button
								className="mt-1 text-white bg-slate-800 hover:bg-slate-900 focus:outline-none font-medium text-sm rounded-lg px-16 py-2.5 text-center mr-5"
								onClick={handleOK}>
								OK
							</button>
						</div>
					</div>
				</Modal>
			</form>
		</div>
	);
}
