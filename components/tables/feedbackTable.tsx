import React, { useEffect, useRef } from 'react';

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
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const columns: (keyof FeedbackDataType)[] = Object.keys(feedbackData[0]).filter(
        (column) => column !== 'fbID' && column !== 'fbSubEventID' && column != 'fbDateSubmitted'
    ) as (keyof FeedbackDataType)[];

    return (
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
                    <div className="border-t border-gray-300 my-2 mr-6"></div>
                    <span>
                        {feedbackData.map((feedback, feedbackIndex) => (
                            <p className="rounded-md bg-slate-100 p-2 mr-6 mt-2" key={feedbackIndex}>{feedback[column]}</p>
                        ))}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default FeedbackList;