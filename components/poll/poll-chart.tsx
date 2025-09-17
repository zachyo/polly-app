
"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Poll } from '@/lib/types';

interface PollChartProps {
  poll: Poll;
}

const PollChart = ({ poll }: PollChartProps) => {
  const chartData = useMemo(() => {
    return poll.options.map(option => ({
      name: option.text,
      votes: option.votes,
    }));
  }, [poll]);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="votes" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PollChart;
