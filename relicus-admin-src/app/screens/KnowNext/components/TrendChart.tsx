import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { TrendPoint } from "../types/knowNext.types";

interface TrendChartProps {
  data: TrendPoint[];
  title: string;
  subtitle?: string;
  color?: string;
  type?: "line" | "bar";
  unit?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  subtitle,
  color = "#1C4966",
  type = "line",
  unit = "",
}) => {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-xs">
      <p className="text-xs font-bold text-foreground mb-0.5">{title}</p>
      {subtitle && <p className="text-[9px] text-neutral-400 mb-3">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={120}>
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F7FA" />
            <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => [`${v}${unit}`, title]} contentStyle={{ borderRadius: 12, border: "1px solid #F5F7FA", fontSize: 11 }} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F7FA" />
            <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => [`${v}${unit}`, title]} contentStyle={{ borderRadius: 12, border: "1px solid #F5F7FA", fontSize: 11 }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ fill: color, r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
