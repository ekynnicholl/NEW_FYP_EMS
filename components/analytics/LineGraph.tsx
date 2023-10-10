"use client"

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const LineGraph = () => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        const ctx = chartRef.current?.getContext("2d");

        if (ctx) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            chartInstance.current = new Chart(ctx, {
                type: "line",
                data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                    datasets: [
                        {
                            label: "Budget Expenditure",
                            data: [1000, 2000, 2000, 7000, 2500],
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 2,
                            fill: true,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Month",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Cost (RM)",
                            },
                        },
                    },
                },
            });
        }
    }, []);

    return (
        <canvas ref={chartRef} width="400" height="400"></canvas>
    );
};

export default LineGraph;