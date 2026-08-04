import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ShiftChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No shift data available.</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="shift" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }} />
          <Legend />
          <Bar dataKey="totalUnits" name="Units Produced" fill="#00d9ff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="totalDefects" name="Defects" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ShiftChart;
