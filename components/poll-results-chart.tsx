"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  TooltipProps,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PollWithResults } from "@/lib/types";

interface PollResultsChartProps {
  poll: PollWithResults;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C',
  '#8DD1E1', '#D084D0'
];

// Define a type for our chart data
type ChartData = {
  name: string;
  fullName: string;
  votes: number;
  percentage: number;
};

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-medium">{data.fullName}</p>
        <p className="text-blue-600">
          Votes: {data.votes} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export function PollResultsChart({ poll }: PollResultsChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const chartData = useMemo<ChartData[]>(() => {
    return poll.options.map((option, index) => {
      const votes = poll.vote_counts[index.toString()] || 0;
      const percentage = poll.total_votes > 0 
        ? Math.round((votes / poll.total_votes) * 100) 
        : 0;
      
      return {
        name: option.length > 20 ? `${option.substring(0, 20)}...` : option,
        fullName: option,
        votes,
        percentage,
      };
    });
  }, [poll.options, poll.vote_counts, poll.total_votes]);

  const mostPopularOption = useMemo(() => {
    if (chartData.length === 0) return 'N/A';
    return chartData.reduce((max, item) => item.votes > max.votes ? item : max, chartData[0]).name;
  }, [chartData]);

  const sortedChartData = useMemo(() => {
    return [...chartData].sort((a, b) => b.votes - a.votes);
  }, [chartData]);

  if (poll.total_votes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Poll Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No votes yet. Share your poll to start collecting responses!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Poll Results ({poll.total_votes} votes)</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar Chart
            </Button>
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
            >
              Pie Chart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="votes" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(data: any) => {
                    const chartData = data as ChartData;
                    return `${chartData.name}: ${chartData.percentage}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="votes"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{poll.total_votes}</div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{poll.options.length}</div>
            <div className="text-sm text-gray-600">Options</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {mostPopularOption}
            </div>
            <div className="text-sm text-gray-600">Most Popular</div>
          </div>
        </div>

        {/* Detailed Results Table */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Detailed Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Option</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Votes</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Percentage</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Visual</th>
                </tr>
              </thead>
              <tbody>
                {sortedChartData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {item.fullName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {item.votes}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {item.percentage}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}