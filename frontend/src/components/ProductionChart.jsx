import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function ProductionChart({ data }) {
  return (
    <div style={{ width: '100%', height: 380 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis dataKey="shift" stroke="#8b949e" fontSize={12} />
          <YAxis stroke="#8b949e" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px' }}
            labelStyle={{ color: '#e6edf3' }}
          />
          <Legend />
          <Line type="monotone" dataKey="produced" stroke="#00d9ff" strokeWidth={2} name="Produced" dot={{ fill: '#00d9ff' }} />
          <Line type="monotone" dataKey="defects" stroke="#ff5555" strokeWidth={2} name="Defects" dot={{ fill: '#ff5555' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProductionChart;