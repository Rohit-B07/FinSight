'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function RiskGauge({ score = 0, severity = 'low' }) {
  const data = [
    { name: 'score', value: score },
    { name: 'remainder', value: 100 - score }
  ];

  const getColor = (sev) => {
    switch(sev?.toLowerCase()) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#ea580c';     // orange-600
      case 'medium': return '#eab308';   // yellow-500
      case 'low': 
      default: return '#059669';         // emerald-600
    }
  };

  const color = getColor(severity);

  return (
    <div className="flex flex-col items-center justify-center relative py-4">
      <div style={{ width: '200px', height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell key="cell-0" fill={color} />
              <Cell key="cell-1" fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute top-1/2 mt-4 text-center">
        <div className="text-4xl font-bold text-slate-800">{score.toFixed(1)}</div>
        <div className="text-sm font-medium uppercase tracking-wider mt-1" style={{ color }}>
          {severity} RISK
        </div>
      </div>
    </div>
  );
}
