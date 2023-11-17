"use client"

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ExpenditureGraphProps {
    selectedMonth: number;
    selectedYear: number;
    onTotalGrandTotalChange: (total: number) => void;
}

const ExpenditureGraph: React.FC<ExpenditureGraphProps> = ({ selectedMonth, selectedYear, onTotalGrandTotalChange }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);
    const supabase = createClientComponentClient();

    const [monthlyData, setMonthlyData] = useState<{ faculty: string; total: number; }[]>([]);
    const [totalGrandTotal, setTotalGrandTotal] = useState<number>(0);

    // Create a start date as the 1st day of the selected month and year
    const startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0);

    // Create an end date as the last day of the selected month and year
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

    function generateRandomColors(count: number) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7)`;
            colors.push(color);
        }
        return colors;
    }

    useEffect(() => {
        // Calculate the total grand total
        const total = monthlyData.reduce((acc, entry) => acc + entry.total, 0);
        setTotalGrandTotal(total);
    }, [monthlyData]);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from("external_forms")
                .select("grand_total_fees, created_at, faculty")
                .gte('created_at', startDate.toISOString())  // Filter for dates greater than or equal to start date
                .lte('created_at', endDate.toISOString());

            console.log(data);

            if (error) {
                console.error("Error fetching data:", error);
                return;
            }

            const distinctFaculties = Array.from(new Set(data.map(item => item.faculty)));

            const facultyColors = generateRandomColors(Object.keys(distinctFaculties).length);

            const monthlyData = distinctFaculties.map(faculty => ({
                faculty: faculty,
                total: 0,
            }));

            data.forEach((item) => {
                const date = new Date(item.created_at);
                const month = date.getMonth();
                const facultyIndex = monthlyData.findIndex((entry) => {
                    // console.log("Item Faculty:", item.faculty.trim().toLowerCase());
                    // console.log("Entry Faculty:", entry.faculty.trim().toLowerCase());
                    return entry.faculty.trim().toLowerCase() === item.faculty.trim().toLowerCase();
                });
                console.log("test" + facultyIndex)

                if (facultyIndex !== -1 && !isNaN(month)) {
                    monthlyData[facultyIndex].total += item.grand_total_fees;
                }
            });

            setMonthlyData(monthlyData);

            const calculatedTotalGrandTotal = monthlyData.reduce((acc, entry) => acc + entry.total, 0);
            onTotalGrandTotalChange(calculatedTotalGrandTotal);

            const ctx = chartRef.current?.getContext("2d");

            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                chartInstance.current = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: monthlyData.map((entry) => entry.faculty),
                        datasets: [
                            {
                                label: "Monthly Grand Total",
                                data: monthlyData.map((entry) => entry.total),
                                backgroundColor: facultyColors,
                                borderWidth: 2,
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
                                    text: "Faculty/ School/ Unit",
                                },
                                grid: {
                                    display: false,
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: "Total Grand Total",
                                },
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
            }
        }

        fetchData();
    }, [selectedMonth, selectedYear]);

    return (
        <div>
            <canvas ref={chartRef} width="400" height="400"></canvas>
        </div>
    );
};

export default ExpenditureGraph;