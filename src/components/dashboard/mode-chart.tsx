'use client';

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Trip } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { transportationIcons } from "../icons";

interface ModeChartProps {
    trips: Trip[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export function ModeChart({ trips }: ModeChartProps) {
    const data = useMemo(() => {
        const modeCounts = trips.reduce((acc, trip) => {
            acc[trip.mode] = (acc[trip.mode] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(modeCounts).map(([name, value]) => ({ name, value }));
    }, [trips]);

    if (data.length === 0) {
        return (
            <Card className="md:col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Transportation Modes</CardTitle>
                    <CardDescription>No trips recorded yet.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Add trips to see your travel habits.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="md:col-span-1 lg:col-span-1">
            <CardHeader>
                <CardTitle>Transportation Modes</CardTitle>
                <CardDescription>A breakdown of your travel methods.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(props) => {
                                const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} trips`} />
                        <Legend
                            formatter={(value, entry) => {
                                const Icon = transportationIcons[value as keyof typeof transportationIcons];
                                return (
                                    <span className="flex items-center gap-2 capitalize">
                                        {Icon && <Icon className="h-4 w-4" />}
                                        {value}
                                    </span>
                                )
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
