import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TimeSeriesPlot = ({ finished, fillerScores, timeSeries }) => {
  const chartData = [];
  const [waitFinish, setWaitFinish] = useState(false);

  let sum = 0;
  timeSeries.forEach(([start, end], index, array) => {
    for (let i = start; i < end; i++) {
      const yValue = fillerScores[index];
      const xValue = i;
      sum += yValue !== undefined ? parseFloat(yValue) : 0;
      const avg = sum / (xValue + 1);
      chartData.push({
        x: xValue,
        y: yValue !== undefined ? parseFloat(yValue) : 0,
        avg,
      });

      if (index === array.length - 1 && i === end - 1) {
        sum += yValue !== undefined ? parseFloat(yValue) : 0;
        const avg = sum / (end + 1);
        chartData.push({
          x: xValue + 1,
          y: yValue !== undefined ? parseFloat(yValue) : 0,
          avg,
        });
      }
    }
  });

  const tooltipFormatter = (value, name) => {
    return name === "Score" ? value.toFixed(3) : value.toFixed(3);
  };

  return (
    <>
      <label>
        Plot after recording (not during):
        <input
          type="checkbox"
          checked={waitFinish}
          onChange={() => setWaitFinish(!waitFinish)}
        />
      </label>
      {(!waitFinish || (waitFinish && !finished)) && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#8884d8"
              name="Score at Time"
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#82ca9d"
              name="Score over Time"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default TimeSeriesPlot;
