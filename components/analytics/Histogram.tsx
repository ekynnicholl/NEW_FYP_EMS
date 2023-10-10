"use client"

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const Histogram = () => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const ctx = chartRef.current?.getContext("2d");

        if (ctx) {
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["0-10", "11-20", "21-30", "31-40", "41-50"],
                    datasets: [
                        {
                            label: "Frequency",
                            data: [5, 10, 15, 7, 12],
                            backgroundColor: "rgba(75, 192, 192, 0.7)",
                            borderWidth: 1,
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
                                text: "Range",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Frequency",
                            },
                        },
                    },
                },
            });
        }
    }, []);

    return (
        <canvas ref={chartRef} width="400" height="200"></canvas>
    );
};

export default Histogram;