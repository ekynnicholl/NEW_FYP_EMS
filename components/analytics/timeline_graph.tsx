
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const TimelineGraph = () => {
    const chartContainer = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartContainer.current) {
            const ctx = chartContainer.current.getContext('2d');
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                chartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Reverted to Staff', 'Submitted (under AAO review)', 'Reviewed (under verification)', 'Verified (under approval)', 'Rejected/Approved'],
                        datasets: [{
                            label: 'Timeline',
                            data: [1, 2, 3, 4, 5], // Dummy data for stages
                            borderColor: 'rgb(75, 192, 192)',
                            borderWidth: 2,
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Stages'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Timeline'
                                },
                                suggestedMin: 0,
                                suggestedMax: 6 // Adjust max based on your data
                            }
                        }
                    }
                });
            }
        }
    }, []);

    return (
        <div>
            <canvas ref={chartContainer}></canvas>
        </div>
    )
}

export default TimelineGraph;