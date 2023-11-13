import React, { useEffect, useRef, useState } from 'react';
import LeftArrow from '@/components/icons/LeftArrow';
import RightArrow from '@/components/icons/RightArrow';
import exportCSV from "@/public/images/export_csv.png";
import Chart from 'chart.js/auto';
import IndividualFeedback from '@/components/analytics/IndividualFeedback';

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

type mainEvent = {
    intFID: string;
    intFEventName: string;
    intFEventDescription: string;
    intFEventStartDate: string;
    intFEventEndDate: string;
    intFDurationCourse: string;
    intFTrainerName: string;
    intFTrainingProvider: string;
};

interface Props {
    feedbackData: FeedbackDataType[];
    mainEvent: mainEvent;
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


const convertToCSV = (data: FeedbackDataType[], columnMapping: ColumnMapping) => {
    const header = Object.keys(columnMapping).map((key) => columnMapping[key]).join(',');
    const body = data.map((row) => {
        const newRow = { ...row };

        Object.keys(columnMapping).forEach((key) => {
            if (key === 'fbDateSubmitted') {
                const formattedDate = convertDateToLocale(newRow[key as keyof FeedbackDataType]);
                newRow[key as keyof FeedbackDataType] = formattedDate.includes(',')
                    ? `"${formattedDate}"`
                    : formattedDate;
            } else if (typeof newRow[key as keyof FeedbackDataType] === 'string' && newRow[key as keyof FeedbackDataType].includes(',')) {
                newRow[key as keyof FeedbackDataType] = `"${newRow[key as keyof FeedbackDataType]}"`;
            }
        });

        return Object.keys(columnMapping).map((key) => newRow[key as keyof FeedbackDataType]).join(',');
    }).join('\n');
    return `${header}\n${body}`;
};

type ColumnMapping = {
    [key: string]: string;
};

const convertDateToLocale = (utcDate: string) => {
    const utcDateTime = new Date(utcDate);
    const localDateTime = utcDateTime.toLocaleString(undefined, {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    return localDateTime;
};

const columnMapping: ColumnMapping = {
    fbCourseName: 'Course Name',
    fbCommencementDate: 'Commencement Date',
    fbCompletionDate: 'Completion Date',
    fbDuration: 'Duration (In Days)',
    fbTrainersName: 'Trainers Name',
    fbTrainingProvider: 'Training Provider',
    fbSectionA1: 'A1',
    fbSectionA2: 'A2',
    fbSectionA3: 'A3',
    fbSectionA4: 'A5',
    fbSectionA5: 'A5',
    fbSectionB1: 'B1',
    fbSectionB2: 'B2',
    fbSectionB3: 'B3',
    fbSectionB4: 'B4',
    fbSectionC1: 'C1',
    fbSectionD1: 'D1',
    fbSectionESuggestions: 'E1',
    fbSectionEChanges: 'E2',
    fbSectionEAdditional: 'E3',
    fbFullName: 'Full Name',
    fbEmailAddress: 'Email Address',
};

const downloadCSV = (data: FeedbackDataType[]) => {
    // const firstRow = data[0];
    // const subEventName = firstRow ? firstRow.sub_eventName : '';

    const csv = convertToCSV(data, columnMapping);

    // Create a data URI for the CSV content
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // a.download = `attendance_data_${subEventName}.csv`;
    a.download = `feedback_forms.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
};

const ratingDescriptions: { [key: string]: string } = {
    1: "Strongly Disagree",
    2: "Disagree",
    3: "Neutral",
    4: "Agree",
    5: "Strongly Agree",
};

const sectionsToDisplay = ['fbSectionA1', 'fbSectionA2', 'fbSectionA3', 'fbSectionA4', 'fbSectionA5', 'fbSectionB1', 'fbSectionB2', 'fbSectionB3', 'fbSectionB4', 'fbSectionC1', 'fbSectionD1'];

const FeedbackList: React.FC<Props> = ({ feedbackData, mainEvent }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'individual' | 'graph'>('summary');
    const [currentIndex, setCurrentIndex] = useState(0);

    const [chartData, setChartData] = useState<{ labels: string[], datasets: { label: string, data: number[], backgroundColor: string }[] } | null>(null);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const [chart, setChart] = useState<Chart | null>(null);

    const prepareChartData = (columnStart: number, columnEnd: number) => {
        const labels: string[] = [];
        const data: number[][] = [];

        for (let i = columnStart; i <= columnEnd; i++) {
            const columnName = `fbSection${String.fromCharCode(65 + columnStart - 1)}${i}` as keyof FeedbackDataType;
            labels.push(columnDisplayNames[columnName]);
            const ratingCounts = calculateRatingCounts(columnName);
            const ratingData = Object.keys(ratingCounts).map((rating) => ratingCounts[rating]);
            data.push(ratingData);
        }

        return {
            labels,
            datasets: data.map((values, index) => ({
                label: `Rating ${index + 1}`,
                data: values,
                backgroundColor: `rgba(0, 0, 255, 0.3)`,
            })),
        };
    };

    useEffect(() => {
        if (activeTab === 'graph') {
            setChartData(prepareChartData(1, 5));
        }
    }, [feedbackData, activeTab]);

    useEffect(() => {
        // Create or update the chart
        if (chartData && chartRef.current) {
            if (chart) {
                chart.destroy();
            }

            const ctx = chartRef.current.getContext('2d');

            if (ctx) {
                const newChart = new Chart(ctx, {
                    type: 'bar',
                    data: chartData,
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                suggestedMax: feedbackData.length,
                            },
                        },
                    },
                });

                // Set the new Chart instance
                setChart(newChart);
            }
        }
    }, [chartData, feedbackData]);

    useEffect(() => {
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    }, []);

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

    const toggleTab = (tab: 'summary' | 'individual' | 'graph') => {
        setActiveTab(tab);
    };

    const calculateRatingCounts = (columnName: keyof FeedbackDataType) => {
        const ratingCounts: { [rating: string]: number } = {};

        for (let i = 1; i <= 5; i++) {
            ratingCounts[i.toString()] = 0;
        }

        // Calculate counts for the specified column
        feedbackData.forEach((feedback) => {
            const rating = parseInt(feedback[columnName], 10);
            if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                ratingCounts[rating.toString()] += 1;
            }
        });

        return ratingCounts;
    };

    console.log(mainEvent);

    return (
        <div>
            <div className="mb-5">
                <button
                    className={`flex rounded-md items-center py-1 px-2 mr-3 font-medium hover:bg-slate-300 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ${activeTab === 'summary' ? 'bg-slate-300' : 'bg-slate-200'
                        }`}
                    onClick={() => toggleTab('summary')}
                >
                    Summary
                </button>
                <button
                    className={`flex rounded-md items-center py-1 px-2 mr-3 font-medium hover:bg-slate-300 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ${activeTab === 'individual' ? 'bg-slate-300' : 'bg-slate-200'
                        }`}
                    onClick={() => toggleTab('individual')}
                >
                    Individual
                </button>
                <button
                    className={`flex rounded-md items-center py-1 px-2 font-medium hover:bg-slate-300 focus:ring-offset-2 focus:ring-slate-300 shadow-sm md:inline-flex mt-3 ${activeTab === 'graph' ? 'bg-slate-300' : 'bg-slate-200'
                        }`}
                    onClick={() => toggleTab('graph')}
                >
                    Graph
                </button>
            </div>
            {activeTab !== 'graph' && (
                <button
                    type="button"
                    className="items-center justify-center bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 shadow-sm md:inline-flex hidden dark:bg-[#242729] mb-5"
                    onClick={() => downloadCSV(feedbackData)}>
                    <img
                        src={exportCSV.src}
                        alt=""
                        width={20}
                        className="text-slate-800"
                    />
                    <span className="ml-2 text-slate-800 dark:text-dark_text">Export to CSV</span>
                </button>
            )}

            {activeTab === 'summary' && (
                <div>
                    {columns.map((column, columnIndex) => {
                        // Keep track of which variable has already been displayed,
                        let courseNameDisplayed = false;
                        let courseDurationDisplay = false;
                        let trainerNameDisplayed = false;
                        let trainingProviderDisplayed = false;

                        return (
                            <div key={columnIndex} className="mb-5">
                                {column === 'fbSectionA1' ? (
                                    <div>
                                        <p className="font-bold text-[18px]">
                                            <span className="underline">A. Course Quality</span> (Strongly Disagree 1 - 5 Strongly Agree)
                                        </p>
                                    </div>
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
                                <div className="max-h-[200px] overflow-y-auto mr-14">
                                    <span className="">
                                        {['fbCourseName'].includes(column) ? (
                                            feedbackData.map((feedback, feedbackIndex) => {
                                                if (!courseNameDisplayed) {
                                                    courseNameDisplayed = true;
                                                    return (
                                                        <p className="rounded-md bg-slate-100 p-2 mr-10 mt-2" key={feedbackIndex}>
                                                            {mainEvent.intFEventName}
                                                        </p>
                                                    );
                                                }
                                                return null;
                                            })
                                        ) : ['fbDuration'].includes(column) ? (
                                            feedbackData.map((feedback, feedbackIndex) => {
                                                if (!courseDurationDisplay) {
                                                    courseDurationDisplay = true;
                                                    return (
                                                        <p className="rounded-md bg-slate-100 p-2 mr-10 mt-2" key={feedbackIndex}>
                                                            {mainEvent.intFDurationCourse}
                                                        </p>
                                                    );
                                                }
                                                return null;
                                            })
                                        ) : ['fbTrainersName'].includes(column) ? (
                                            feedbackData.map((feedback, feedbackIndex) => {
                                                if (!trainerNameDisplayed) {
                                                    trainerNameDisplayed = true;
                                                    return (
                                                        <p className="rounded-md bg-slate-100 p-2 mr-10 mt-2" key={feedbackIndex}>
                                                            {mainEvent.intFTrainerName}
                                                        </p>
                                                    );
                                                }
                                                return null;
                                            })
                                        ) : ['fbTrainingProvider'].includes(column) ? (
                                            feedbackData.map((feedback, feedbackIndex) => {
                                                if (!trainingProviderDisplayed) {
                                                    trainingProviderDisplayed = true;
                                                    return (
                                                        <p className="rounded-md bg-slate-100 p-2 mr-10 mt-2" key={feedbackIndex}>
                                                            {mainEvent.intFTrainingProvider}
                                                        </p>
                                                    );
                                                }
                                                return null;
                                            })
                                        ) : /^fbSection[ABCD][1-5]$/.test(column) ? (
                                            // Custom rendering for other columns matching the pattern
                                            Object.keys(calculateRatingCounts(column)).map((rating, ratingIndex) => (
                                                <div key={ratingIndex}>
                                                    <p className="rounded-md bg-slate-100 p-2 mr-10 mt-2">
                                                        {`Rating ${rating} (${ratingDescriptions[rating]}) - Count: ${calculateRatingCounts(column)[rating]}`}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            // Default rendering for other columns
                                            feedbackData.map((feedback, feedbackIndex) => (
                                                <p className="rounded-md bg-slate-100 p-2 mr-10 mt-2" key={feedbackIndex}>
                                                    {feedback[column]}
                                                </p>
                                            ))
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
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
                                    <p className="rounded-md bg-slate-100 p-2 mr-6 mt-2">{currentIndex < feedbackData.length ? feedbackData[currentIndex][column] : 0}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'graph' && (
                <div className="w-full mb-5">
                    {sectionsToDisplay.map((sectionName) => (
                        <IndividualFeedback
                            key={sectionName}
                            sectionName={sectionName}
                            feedbackData={feedbackData}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FeedbackList;