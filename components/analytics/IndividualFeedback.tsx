import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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

const sectionNamesMap: { [key: string]: string[] } = {
    fbSectionA1: ['The contents were clear', 'and easy to understand.'],
    fbSectionA2: ['The course objectives', ' were successfully achieved.'],
    fbSectionA3: ['The course materials', ' were enough and helpful.'],
    fbSectionA4: ['The class environment', 'enabled me to learn.'],
    fbSectionA5: ['The program was well coordinated', '(e.g. registration, pre-program', 'information, etc.)'],
    fbSectionB1: ['My learning was enhanced by', 'the knowledge and experience', 'shared by the trainer.'],
    fbSectionB2: ['I was well engaged during', 'the session by the trainer.'],
    fbSectionB3: ['The course exposed me', 'to new knowledge and', 'practices.'],
    fbSectionB4: ['I understand how to', 'apply what I learned.'],
    fbSectionC1: ['The duration of the course was just right.'],
    fbSectionD1: ['I would recommend this course to my colleagues.']
};

interface IndividualFeedbackProps {
    columnStart: string;
    feedbackData: FeedbackDataType[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

const sectionTitlesMap: { [key: string]: string } = {
    'fbSectionA': 'Section A: Course Quality',
    'fbSectionB': 'Section B: Training Experience',
    'fbSectionC': 'Section C: Duration',
    'fbSectionD': 'Section D: Recommendation',
};

type ExtendedChartOptions = {
    plugins?: {
        // Your plugins configuration here
    };
};

interface ExtendedChart extends Chart {
    options: ExtendedChartOptions;
}

const IndividualFeedback: React.FC<IndividualFeedbackProps> = ({ columnStart, feedbackData, canvasRef }) => {
    
    Chart.register(ChartDataLabels);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chart = useRef<Chart | null>(null);

    const prepareChartData = () => {
        const validSectionKeys = Object.keys(feedbackData[0]).filter((key) => key.startsWith(columnStart));

        const xLabels: string[][] = validSectionKeys.map((sectionKey) => sectionNamesMap[sectionKey]);

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
                barPercentage: 1,
                barThickness: 30,
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
        if (canvasRef.current) {
            if (chart.current) {
                chart.current.destroy();
            }

            const ctx = canvasRef.current.getContext('2d');

            var backgroundColor = 'white';
            Chart.register({
                id: 'backgroundPlugin',
                beforeDraw: function (c: any) {
                    var ctx = c.ctx;
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, c.width, c.height);
                }
            });

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
                                    display: true,
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
                                position: 'left', // (top, bottom, left, right)
                                labels: {
                                    color: 'black',
                                },
                            },
                            datalabels: {
                                display: true,
                                anchor: 'end',
                                align: 'end',
                                labels: {
                                    value: {
                                        color: 'black'
                                    },
                                },
                                formatter: function (value, context) {
                                    const percentage = (value / feedbackData.length) * 100;
                                    return percentage.toFixed(0) + '%';
                                },
                            },
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

    const downloadChart = () => {
        if (canvasRef.current) {
            const originalCanvas = canvasRef.current;
            const originalCtx = originalCanvas.getContext('2d');

            // Create a new canvas with a margin
            const newCanvas = document.createElement('canvas');
            const newCtx = newCanvas.getContext('2d');

            if (originalCtx && newCtx) {
                const margin = 50; // Set a margin so the graph looks better,

                newCanvas.width = originalCanvas.width + 2 * margin;
                newCanvas.height = originalCanvas.height + 2 * margin;

                newCtx.fillStyle = 'white';
                newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);

                newCtx.drawImage(originalCanvas, margin, margin);

                const dataUrl = newCanvas.toDataURL('image/png', 1.0);

                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'Feedback_Chart.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-left font-bold text-[24px]">{sectionTitlesMap[columnStart]} ({feedbackData.length} Responses)</h2>
            <div className="border-t border-gray-400 my-2 mr-10"></div>
            <div className="mt-10">
                <div className="w-full h-[580px] bg-white">
                    <canvas width={400} height={200} ref={canvasRef} />
                </div>
                <button
                    type="button"
                    className=" bg-slate-200 rounded-lg py-2 px-4 font-medium hover:bg-slate-300 shadow-sm md:inline-flex dark:bg-[#242729] mt-5"
                    onClick={downloadChart}>
                    Download Chart
                </button>
            </div>
        </div>
    );
};

export default IndividualFeedback;
