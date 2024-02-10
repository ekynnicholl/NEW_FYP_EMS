import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

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
    columnStart: string;
    feedbackData: FeedbackDataType[];
}

const sectionTitlesMap: { [key: string]: string } = {
    'fbSectionA': 'Section A',
    'fbSectionB': 'Section B',
    'fbSectionC': 'Section C',
    'fbSectionD': 'Section D',
};

const IndividualFeedback: React.FC<IndividualFeedbackProps> = ({ columnStart, feedbackData }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chart = useRef<Chart | null>(null);

    const prepareChartData = () => {
        const validSectionKeys = Object.keys(feedbackData[0]).filter((key) => key.startsWith(columnStart));

        const xLabels: string[] = validSectionKeys.map((sectionKey) => sectionNamesMap[sectionKey]);

        const originalDatasets = validSectionKeys.map((sectionKey, index) => {
            const ratingCounts = calculateRatingCounts(sectionKey);
            const data = Object.values(ratingCounts);

            return {
                label: `Label ${sectionKey.slice(-2)}`,
                data,
                backgroundColor: barColors[index],
            };
        });

        // Transpose the datasets
        const transposedDatasets = transposeData(originalDatasets);

        console.log('test' + JSON.stringify(transposedDatasets));

        return { labels: xLabels, datasets: transposedDatasets };
    };

    const transposeData = (inputData: any[]) => {
        const yLabels = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        const transposedData = Array.from({ length: inputData[0].data.length }, (_, index) => {
            const transposedValues = inputData.map((item) => item.data[index]);
            return {
                label: yLabels[index],
                data: transposedValues,
                backgroundColor: barColors[index % barColors.length],
            };
        });
        return transposedData;
    };

    const calculateRatingCounts = (sectionKey: string) => {
        const ratingCounts: { [rating: string]: number } = {
            "Strongly Disagree": 0,
            "Disagree": 0,
            "Neutral": 0,
            "Agree": 0,
            "Strongly Agree": 0,
        };

        feedbackData.forEach((feedback) => {
            const rating = parseInt((feedback as any)[sectionKey], 10);
            if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                switch (rating) {
                    case 1:
                        ratingCounts["Strongly Disagree"] += 1;
                        break;
                    case 2:
                        ratingCounts["Disagree"] += 1;
                        break;
                    case 3:
                        ratingCounts["Neutral"] += 1;
                        break;
                    case 4:
                        ratingCounts["Agree"] += 1;
                        break;
                    case 5:
                        ratingCounts["Strongly Agree"] += 1;
                        break;
                    default:
                        break;
                }
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
                        datasets: chartData.datasets,
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
                                display: true,
                                position: 'left', // You can set the position (top, bottom, left, right)
                                labels: {
                                    color: 'black',
                                },
                            },
                            datalabels: {
                                anchor: 'end', // Position of the labels (start, end, center, etc.)
                                align: 'end', // Alignment of the labels (start, end, center, etc.)
                                color: 'blue', // Color of the labels
                                font: {
                                    weight: 'bold',
                                },
                                formatter: function (value, context) {
                                    return value; // Display the actual data value
                                }
                            }
                        },
                    },
                });

                chart.current = newChart;
            }
        }
    }, [feedbackData]);

    useEffect(() => {
        return () => {
            if (chart.current) {
                chart.current.destroy();
            }
        };
    }, []);

    return (
        <div className="w-full">
            <h2 className="text-left font-bold text-[24px]">{sectionTitlesMap[columnStart]}</h2>
            <div className="border-t border-gray-400 my-2 mr-10"></div>
            <div className="mt-10">
                <div className="w-full h-[700px]">
                    <canvas width={200} height={200} ref={chartRef} />
                </div>
            </div>
        </div>
    );
};

export default IndividualFeedback;
