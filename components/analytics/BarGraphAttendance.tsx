"use client";

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface BarChartProps {
    startDate: string | null;
    endDate: string | null;
}

const BarChart: React.FC<BarChartProps> = ({ startDate, endDate }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);
    const supabase = createClientComponentClient();

    const [facultyData, setFacultyData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    function generateRandomColors(count: number) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7)`;
            colors.push(color);
        }
        return colors;
    }

    async function fetchData() {
        if (!startDate || !endDate) {
            startDate = format(startOfMonth(new Date()), "yyyy-MM-dd")
            endDate = format(endOfMonth(new Date()), "yyyy-MM-dd")
        }

        const formattedStartDate = startDate ? format(new Date(startDate), "yyyy-MM-dd HH:mm:ss") : null;
        const formattedEndDate = endDate ? format(new Date(endDate), "yyyy-MM-dd HH:mm:ss") : null;

        const { data, error } = await supabase
            .from("attendance_forms")
            .select("*")
            .gte("attDateSubmitted", formattedStartDate)
            .lte("attDateSubmitted", formattedEndDate);

        if (error) {
            console.error("Error fetching data:", error);
            return;
        }

        const facultyCounts: { [key: string]: number } = {};
        data.forEach((item) => {
            const facultyUnit = item.attFormsFacultyUnit;
            facultyCounts[facultyUnit] = (facultyCounts[facultyUnit] || 0) + 1;
        });

        setFacultyData(facultyCounts);

        if (chartInstance.current) {
            chartInstance.current.clear();
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current?.getContext("2d");

        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            const facultyColors = generateRandomColors(Object.keys(facultyCounts).length);

            chartInstance.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: Object.keys(facultyCounts),
                    datasets: [
                        {
                            label: "Number of People",
                            data: Object.values(facultyCounts),
                            backgroundColor: facultyColors,
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
                                text: "Faculty",
                            },
                            grid: { display: false }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Number of Attendees",
                            },
                            beginAtZero: true,
                            grid: { display: false },
                            ticks: {
                                stepSize: 1
                            },
                        },
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            })
        }
    }

    return (
        <div>
            <canvas ref={chartRef} width="400" height="400"></canvas>
        </div>
    );
};

export default BarChart;
