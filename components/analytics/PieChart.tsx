"use client"

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = () => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart<"pie", number[], string> | null>(null);

    useEffect(() => {
        const ctx = chartRef.current?.getContext("2d");

        if (ctx) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            chartInstance.current = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: ["Food", "Rent", "Transportation", "Utilities", "Entertainment"],
                    datasets: [
                        {
                            data: [500, 800, 200, 300, 150],
                            backgroundColor: [
                                "rgba(75, 192, 192, 0.7)",
                                "rgba(255, 99, 132, 0.7)",
                                "rgba(54, 162, 235, 0.7)",
                                "rgba(255, 206, 86, 0.7)",
                                "rgba(153, 102, 255, 0.7)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        }
                    },
                },
            });
        }
    }, []);

    return (
        <canvas ref={chartRef} width="400" height="200"></canvas>
    );
};

export default PieChart;