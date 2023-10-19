"use client"

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const LineGraph = () => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);
    const supabase = createClientComponentClient();

    const [monthlyData, setMonthlyData] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from("expenditure_testing")
                .select("expenditureAmount, dateEntered, facultyUnit");

            if (error) {
                console.error("Error fetching data:", error);
                return;
            }

            const monthlySums = Array(12).fill(0);

            data.forEach((item) => {
                const dateParts = item.dateEntered.split('-');
                if (dateParts.length === 3) {
                    const year = parseInt(dateParts[0], 10);
                    const month = parseInt(dateParts[1], 10);
                    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
                        console.log(`Year: ${year}, Month: ${month}`);
                        monthlySums[month - 1] += item.expenditureAmount;
                    }
                }
            });

            setMonthlyData(monthlySums);

            const ctx = chartRef.current?.getContext("2d");

            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                chartInstance.current = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: [
                            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                        ],
                        datasets: [
                            {
                                label: "Budget Expenditure",
                                data: monthlySums,
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
                                grid: {
                                    display: false,
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: "Cost (RM)",
                                },
                                grid: {
                                    display: false,
                                },
                            },
                        },
                    },
                });
            }
        }

        fetchData();
    }, []);

    // const handleYearChange = (e) => {
    //     setSelectedYear(parseInt(e.target.value, 10));
    // };

    return (
        <div>
            {/* <h1>Expenditures Spent per Month</h1>
            <select value={selectedYear} onChange={handleYearChange}>
                <option value={2022}>2022</option>
                <option value={2023}>2023</option>
            </select> */}

            <canvas ref={chartRef} width="400" height="400"></canvas>
        </div>
    );
};

export default LineGraph;