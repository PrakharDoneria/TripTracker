
'use client';

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Trip } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { transportationIcons } from "../icons";
import Image from "next/image";

interface ModeChartProps {
    trips: Trip[];
}

const COLORS = ['#0ea5e9', '#0d9488', '#f59e0b', '#f97316', '#8b5cf6'];

export function ModeChart({ trips }: ModeChartProps) {
    const data = useMemo(() => {
        const modeCounts = trips.reduce((acc, trip) => {
            acc[trip.mode] = (acc[trip.mode] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(modeCounts).map(([name, value]) => ({ name, value }));
    }, [trips]);

    return (
        <Card className="lg:col-span-1 flex flex-col bg-slate-900/50 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Transportation Modes</CardTitle>
                <CardDescription className="text-slate-400">A breakdown of your travel methods.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-6 relative min-h-[250px]">
                 {data.length === 0 ? (
                    <p className="text-slate-400">Add trips to see your travel habits.</p>
                ) : (
                    <div className="w-full h-full absolute top-0 left-0 p-6">
                        <Image src="https://picsum.photos/seed/transport/400/300" data-ai-hint="transportation collage" alt="Transportation modes" fill className="object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/60 rounded-lg p-4 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={250}>
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
                                        stroke="hsl(var(--background))"
                                        label={(props) => {
                                            const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                            return (
                                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-xs">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                            );
                                        }}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `${value} trips`}
                                        contentStyle={{
                                            background: 'hsl(var(--background) / 0.8)',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: 'var(--radius)'
                                        }}
                                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend formatter={(value) => <span className="capitalize text-white/80">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
