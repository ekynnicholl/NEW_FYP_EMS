import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

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

const sectionNamesMap: { [key: string]: string } = {
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
    fbSectionD1: 'I would recommend this course to my colleagues.'
};

interface IndividualFeedbackProps {
    sectionName: string;
    feedbackData: FeedbackDataType[];
}

const IndividualFeedback: React.FC<IndividualFeedbackProps> = ({ sectionName, feedbackData }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chart = useRef<Chart | null>(null);

    const prepareChartData = () => {
        const labels: string[] = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
        const data: number[] = [];

        for (let i = 1; i <= 5; i++) {
            const columnName = `${sectionName}` as keyof FeedbackDataType;
            const ratingCounts = calculateRatingCounts(columnName);
            const ratingData = Object.keys(ratingCounts).map((rating) => ratingCounts[rating]);
            data.push(...ratingData);
            console.log(columnName);
        }

        console.log(data);

        return {
            labels,
            data,
        };
    };

    const calculateRatingCounts = (columnName: keyof FeedbackDataType) => {
        const ratingCounts: { [rating: string]: number } = {};

        for (let i = 1; i <= 5; i++) {
            ratingCounts[i.toString()] = 0;
        }

        feedbackData.forEach((feedback) => {
            const rating = parseInt(feedback[columnName], 10);
            if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                ratingCounts[rating.toString()] += 1;
            }
        });

        return ratingCounts;
    };

    const barColors = ['red', 'green', 'blue', 'orange', 'purple'];

    useEffect(() => {
        if (chartRef.current) {
            if (chart.current) {
                chart.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');

            if (ctx) {
                const chartData = prepareChartData();
                const newChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartData.labels,
                        datasets: [
                            {
                                label: `Section A(1)`,
                                data: chartData.data,
                                backgroundColor: barColors,
                            },
                            {
                                label: `Section A(2)`,
                                data: chartData.data,
                                backgroundColor: barColors,
                            },
                        ],
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                suggestedMax: feedbackData.length,
                                grid: {
                                    display: false,
                                },
                            },
                            x: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                });

                chart.current = newChart;
            }
        }
    }, [feedbackData, sectionName]);

    useEffect(() => {
        return () => {
            if (chart.current) {
                chart.current.destroy();
            }
        };
    }, []);

    return (
        <div className="w-full">
            <h2 className="text-left font-bold text-[24px]">{sectionNamesMap[sectionName]}</h2>
            <div className="border-t border-gray-400 my-2 mr-10"></div>
            <div className="flex items-center justify-center mt-10">
                <div className="w-[500px] h-[500px]">
                    <canvas width={200} height={200} ref={chartRef} />
                </div>
            </div>
        </div>
    );
};

export default IndividualFeedback;
