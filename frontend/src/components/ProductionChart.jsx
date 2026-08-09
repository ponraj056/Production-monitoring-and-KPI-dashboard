import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '12px 16px',
      fontSize: '13px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      minWidth: '200px',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '4px' }}>
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.name.includes('%') || entry.name.includes('OEE') || entry.name.includes('Defect') || entry.name.includes('Avail') ? '%' : ' units'}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Chart 1: Production + Defects (bars + line) ─────────────────────────────
export function ProductionDefectChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-faint)' }}>
        No production data available. Log a shift to see the chart.
      </div>
    );
  }

  // Calculate defect rate for each point
  const enriched = data.map(d => ({
    ...d,
    defectRate: d.produced > 0 ? parseFloat(((d.defects / d.produced) * 100).toFixed(1)) : 0,
  }));

  return (
    <div style={{ width: '100%', height: 'clamp(240px, 38vh, 360px)' }}>
      <ResponsiveContainer>
        <ComposedChart data={enriched} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
          <defs>
            <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="defGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef5350" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef5350" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="shift"
            stroke="var(--text-faint)"
            fontSize={10}
            angle={-40}
            textAnchor="end"
            height={70}
            tick={{ fill: 'var(--text-muted)' }}
          />
          <YAxis
            yAxisId="units"
            stroke="var(--text-faint)"
            fontSize={11}
            tick={{ fill: 'var(--text-muted)' }}
            label={{ value: 'Units', angle: -90, position: 'insideLeft', fill: 'var(--text-faint)', fontSize: 11 }}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            stroke="var(--text-faint)"
            fontSize={11}
            tick={{ fill: 'var(--text-muted)' }}
            domain={[0, 100]}
            label={{ value: 'Defect %', angle: 90, position: 'insideRight', fill: 'var(--text-faint)', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }} />
          <ReferenceLine yAxisId="rate" y={10} stroke="#ffb74d" strokeDasharray="4 4" label={{ value: '10% threshold', fill: '#ffb74d', fontSize: 10 }} />
          <Bar yAxisId="units" dataKey="produced" name="Produced (units)" fill="url(#prodGrad)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar yAxisId="units" dataKey="defects" name="Defects (units)" fill="url(#defGrad)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Line yAxisId="rate" type="monotone" dataKey="defectRate" name="Defect Rate %" stroke="#ff9800" strokeWidth={2.5} dot={{ fill: '#ff9800', r: 3 }} strokeDasharray="0" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Chart 2: OEE Trend line chart ───────────────────────────────────────────
export function OEETrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-faint)' }}>
        No data available.
      </div>
    );
  }

  const enriched = data.map(d => ({
    ...d,
    defectRate: d.produced > 0 ? parseFloat(((d.defects / d.produced) * 100).toFixed(1)) : 0,
    quality: d.produced > 0 ? parseFloat((((d.produced - d.defects) / d.produced) * 100).toFixed(1)) : 100,
  }));

  return (
    <div style={{ width: '100%', height: 'clamp(200px, 30vh, 300px)' }}>
      <ResponsiveContainer>
        <AreaChart data={enriched} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
          <defs>
            <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="defRateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef5350" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef5350" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="shift" stroke="var(--text-faint)" fontSize={10} angle={-40} textAnchor="end" height={70} tick={{ fill: 'var(--text-muted)' }} />
          <YAxis domain={[0, 100]} stroke="var(--text-faint)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
          <ReferenceLine y={85} stroke="#4CAF50" strokeDasharray="4 4" label={{ value: '85% World Class', fill: '#4CAF50', fontSize: 10 }} />
          <Area type="monotone" dataKey="quality" name="Quality %" stroke="#4CAF50" fill="url(#qualGrad)" strokeWidth={2.5} dot={{ r: 3 }} />
          <Area type="monotone" dataKey="defectRate" name="Defect Rate %" stroke="#ef5350" fill="url(#defRateGrad)" strokeWidth={2.5} dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Default export (backward compatible) ────────────────────────────────────
function ProductionChart({ data }) {
  return <ProductionDefectChart data={data} />;
}

export default ProductionChart;