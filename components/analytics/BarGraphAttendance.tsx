"use client";

import React, { useEffect, useRef, useState } from "react";
import Chart, { ChartData } from "chart.js/auto";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, startOfMonth, endOfMonth, setHours, setMinutes, setSeconds } from "date-fns";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AttendanceList from '@/components/analytics/attendance_table';
import AttendanceView from '@/components/analytics/view_attendance';

interface BarChartProps {
    startDate: string | null;
    endDate: string | null;
    category: string;
}

const BarChart: React.FC<BarChartProps> = ({ startDate, endDate, category }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);
    const supabase = createClientComponentClient();
    Chart.register(ChartDataLabels);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedStaffDetails, setSelectedStaffDetails] = useState<Array<{ staffName: string; staffID: string; dateSubmitted: string }>>([])

    const [facultyData, setFacultyData] = useState({});

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, category]);

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

        const startOfDay = setHours(setMinutes(setSeconds(new Date(startDate), 0), 0), 0);
        const endOfDayTime = setHours(setMinutes(setSeconds(new Date(endDate), 59), 59), 23);

        let formattedStartDate = format(startOfDay, "yyyy-MM-dd HH:mm:ss");
        let formattedEndDate = format(endOfDayTime, "yyyy-MM-dd HH:mm:ss");

        if (formattedStartDate === formattedEndDate) {
            formattedEndDate = format(new Date(endDate), "yyyy-MM-dd 23:59:59");
        }

        let query = supabase
            .from("attendance_forms")
            .select("*")
            .gte("attDateSubmitted", formattedStartDate)
            .lte("attDateSubmitted", formattedEndDate);

        if (category === "student") {
            query = query.not("attFormsStaffID", "like", "SS%").not("attFormsStaffID", "eq", "0");;
        } else if (category === "staff") {
            query = query.like("attFormsStaffID", "SS%");
        }

        const { data, error } = await query;

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
            const maxDataValue = Math.max(...data) + 1;

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
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Unit",
                            },
                            grid: { display: false },
                            suggestedMax: maxDataValue,
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Number of Attendees",
                            },
                            beginAtZero: true,
                            grid: { display: false },
                        },
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        datalabels: {
                            color: '#000000',
                            align: 'end',
                            anchor: 'end',
                            formatter: (value: number) => {
                                return value.toString();
                            },
                        },
                    },
                    onClick: function (event: any, elements: any[]) {
                        if (elements.length > 0) {
                            const clickedIndex = elements[0].index;
                            const clickedLabel = (this as { data?: ChartData }).data?.labels?.[clickedIndex];

                            const staffDetails = data
                                .filter((item) => item.attFormsFacultyUnit === clickedLabel)
                                .map((item) => ({
                                    staffName: item.attFormsStaffName,
                                    staffID: item.attFormsStaffID,
                                    dateSubmitted: item.attDateSubmitted,
                                }));

                            setSelectedStaffDetails(staffDetails);
                            setShowAttendanceModal(true);
                        }
                    },
                },
            })
        }
    }

    return (
        <div>
            <canvas ref={chartRef} width="400" height="1000"></canvas>

            {showAttendanceModal && (
                <AttendanceView
                    isVisible={showAttendanceModal}
                    onClose={() => setShowAttendanceModal(false)}
                >
                    <AttendanceList staffDetails={selectedStaffDetails} />
                </AttendanceView>
            )}
        </div>
    );
};

export default BarChart;
