import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function ProductionChart({ data }) {
  return (
    <div style={{ width: '100%', height: 'clamp(250px, 40vh, 400px)' }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="producedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="defectsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff5555" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ff5555" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis dataKey="shift" stroke="#8b949e" fontSize={12} />
          <YAxis stroke="#8b949e" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px' }}
            labelStyle={{ color: '#e6edf3' }}
          />
          <Legend />
          <Area type="monotone" dataKey="produced" stroke="#00d9ff" strokeWidth={2} fill="url(#producedGradient)" name="Produced" />
          <Area type="monotone" dataKey="defects" stroke="#ff5555" strokeWidth={2} fill="url(#defectsGradient)" name="Defects" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProductionChart;