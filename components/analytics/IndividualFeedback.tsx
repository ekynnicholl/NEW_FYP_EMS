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

// const sectionNamesMap: Record<keyof FeedbackDataType, string> = {
//     fbSectionA1: 'Section A1 Name',
//     fbSectionA2: 'Section A2 Name',
//     fbSectionA3: 'Section A3 Name',
//     // Add more sections as needed
// };

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
                                label: `Ratings for Section ${sectionName}`,
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
        <div className="flex flex-col items-center justify-center">
            <h2>Section {sectionName}</h2>
            <canvas width={200} height={200} ref={chartRef} />
        </div>
    );
};

export default IndividualFeedback;
