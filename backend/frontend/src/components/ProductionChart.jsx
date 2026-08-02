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
    <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="shift" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="produced" stroke="#4CAF50" name="Produced" />
          <Line type="monotone" dataKey="defects" stroke="#F44336" name="Defects" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProductionChart;