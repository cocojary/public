"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface DevRadarChartProps {
  data: {
    name: string;
    score: number;
    fullMark: number;
  }[];
}

export const DevRadarChart: React.FC<DevRadarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[400px] bg-slate-900/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#94a3b8" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tick={{ fill: "#94a3b8", fontSize: 10 }}
          />
          <Radar
            name="Năng lực"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
