import React, { useEffect, useRef, useState } from 'react';
import LeftArrow from '@/components/icons/LeftArrow';
import RightArrow from '@/components/icons/RightArrow';

type FeedbackDataType = {
    fbID: string;
    fbSubEventID: string;
    fbCourseName: string;
    fbCommencementDate: string;
    fbCompletionDate: string;
    fbDuration: string;
    fbTrainersName: string;
    fbTrainingProvider: string;
    fbSectionA1: string;
    fbSectionA2: string;
    fbSectionA3: string;
    fbSectionA4: string;
    fbSectionA5: string;
    fbSectionB1: string;
    fbSectionB2: string;
    fbSectionB3: string;
    fbSectionB4: string;
    fbSectionC1: string;
    fbSectionD1: string;
    fbSectionESuggestions: string;
    fbSectionEChanges: string;
    fbSectionEAdditional: string;
    fbFullName: string;
    fbEmailAddress: string;
}

interface Props {
    feedbackData: FeedbackDataType[];
}

const columnDisplayNames: { [key in keyof FeedbackDataType]: string } = {
    fbID: 'ID',
    fbSubEventID: 'Sub Event ID',
    fbCourseName: 'Course Name',
    fbCommencementDate: 'Commencement Date',
    fbCompletionDate: 'Completion Date',
    fbDuration: 'Duration (In Days)',
    fbTrainersName: 'Trainers Name',
    fbTrainingProvider: 'Training Provider',
    fbSectionA1: 'The contents were clear and easy to understand.',
    fbSectionA2: 'The course objectives were successfully achieved.',
    fbSectionA3: 'The course materials were enough and helpful.',
    fbSectionA4: 'The class environment enabled me to learn.',
    fbSectionA5: 'The program was well coordinated (e.g. registration, pre-program information, etc.)',
    fbSectionB1: 'My learning was enhanced by the knowledge and experience shared by the trainer.',
    fbSectionB2: 'I was well engaged during the session by the trainer.',
    fbSectionB3: 'The course exposed me to new knowledge and practices.',
    fbSectionB4: 'I understand how to apply what I learned.',
    fbSectionC1: 'The duration of the course was just right.',
    fbSectionD1: 'I would recommend this course to my colleagues.',
    fbSectionESuggestions: 'What did you like the most about the course?',
    fbSectionEChanges: 'If you could change one thing about this course, what would it be?',
    fbSectionEAdditional: 'Please share any additional comments or suggestions.',
    fbFullName: 'Full Name',
    fbEmailAddress: 'Email Address',
};

const FeedbackList: React.FC<Props> = ({ feedbackData }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary');
    const [currentIndex, setCurrentIndex] = useState(0);

    const navigateNext = () => {
        if (currentIndex < feedbackData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const navigatePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    useEffect(() => {
        setCurrentIndex(0);
    }, [feedbackData]);

    const columns: (keyof FeedbackDataType)[] = Object.keys(feedbackData[0]).filter(
        (column) => column !== 'fbID' && column !== 'fbSubEventID' && column != 'fbDateSubmitted'
    ) as (keyof FeedbackDataType)[];

    const toggleTab = (tab: 'summary' | 'individual') => {
        setActiveTab(tab);
    };

    return (
        <div>
            <div className="mb-5">
                <button
                    className={`flex rounded-md items-center py-1 px-2 font-medium hover:bg-slate-300 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ${activeTab === 'summary' ? 'bg-slate-300' : 'bg-slate-200'
                        }`}
                    onClick={() => toggleTab('summary')}
                >
                    Summary
                </button>
                <button
                    className={`flex rounded-md items-center py-1 px-2 ml-3 font-medium hover:bg-slate-300 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ${activeTab === 'individual' ? 'bg-slate-300' : 'bg-slate-200'
                        }`}
                    onClick={() => toggleTab('individual')}
                >
                    Individual
                </button>
            </div>

            {activeTab === 'summary' && (
                <div>
                    {columns.map((column, columnIndex) => (
                        <div key={columnIndex} className="mb-5">
                            {column === 'fbSectionA1' ? (
                                <p className="font-bold text-[18px]">
                                    <span className="underline">A. Course Quality</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                </p>
                            ) : column === 'fbSectionB1' ? (
                                <p className="font-bold text-[18px]">
                                    <span className="underline">B. Training Experience</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                </p>
                            ) : column === 'fbSectionC1' ? (
                                <p className="font-bold text-[18px]">
                                    <span className="underline">C. Duration</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                </p>
                            ) : column === 'fbSectionD1' ? (
                                <p className="font-bold text-[18px]">
                                    <span className="underline">D. Recommendation</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                </p>
                            ) : column === 'fbSectionESuggestions' ? (
                                <p className="font-bold text-[18px]">
                                    <span className="underline">E. Suggestions/ Comments</span>
                                </p>
                            ) : column === 'fbFullName' ? (
                                <p className="font-bold text-[18px]">
                                    <span className="underline">Verification</span>
                                </p>
                            ) : column === 'fbCourseName' ? (
                                <p className="font-bold text-[18px]">
                                    <span className="underline">Staff Development Program Details</span>
                                </p>
                            ) : null}
                            <h2 className="">{columnDisplayNames[column]}</h2>
                            <div className="border-t border-gray-300 my-2 mr-14"></div>
                            <div className="max-h-[200px] overflow-y-auto mr-14 shadow-md">
                                <span className="">
                                    {feedbackData.map((feedback, feedbackIndex) => (
                                        <p className="rounded-md bg-slate-100 p-2 mr-10 mt-2" key={feedbackIndex}>{feedback[column]}</p>
                                    ))}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'individual' && (
                <div>
                    <div>
                        <div className="flex justify-start mb-3">
                            <button onClick={navigatePrevious}><LeftArrow /></button>
                            <input
                                type="number"
                                value={currentIndex + 1}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (!isNaN(value) && value >= 1 && value <= feedbackData.length) {
                                        setCurrentIndex(value - 1);
                                    }
                                }}
                                className="text-[18px] rounded-md font-bold mr-2 ml-2 w-10 text-center border bg-white border-gray-400 text-gray-700 focus:outline-none leading-tight focus:bg-white focus:border-gray-500 text-sm lg:text-base"

                            />
                            <span className="text-[18px] font-bold mr-2">/ {feedbackData.length}</span>
                            <button onClick={navigateNext}><RightArrow /></button>
                        </div>
                        <div>
                            {columns.map((column) => (
                                <div key={column} className="mb-5">
                                    {column === 'fbSectionA1' ? (
                                        <p className="font-bold text-[18px]">
                                            <span className="underline">A. Course Quality</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                        </p>
                                    ) : column === 'fbSectionB1' ? (
                                        <p className="font-bold text-[18px]">
                                            <span className="underline">B. Training Experience</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                        </p>
                                    ) : column === 'fbSectionC1' ? (
                                        <p className="font-bold text-[18px]">
                                            <span className="underline">C. Duration</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                        </p>
                                    ) : column === 'fbSectionD1' ? (
                                        <p className="font-bold text-[18px]">
                                            <span className="underline">D. Recommendation</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                        </p>
                                    ) : column === 'fbSectionESuggestions' ? (
                                        <p className="font-bold text-[18px]">
                                            <span className="underline">E. Suggestions/ Comments</span>
                                        </p>
                                    ) : column === 'fbFullName' ? (
                                        <p className="font-bold text-[18px]">
                                            <span className="underline">Verification</span>
                                        </p>
                                    ) : column === 'fbCourseName' ? (
                                        <p className="font-bold text-[18px]">
                                            <span className="underline">Staff Development Program Details</span>
                                        </p>
                                    ) : null}
                                    <p className="font-bold">{columnDisplayNames[column]}</p>
                                    <div className="border-t border-gray-300 my-2 mr-6"></div>
                                    <p className="rounded-md bg-slate-100 p-2 mr-6 mt-2">{feedbackData[currentIndex][column]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeedbackList;