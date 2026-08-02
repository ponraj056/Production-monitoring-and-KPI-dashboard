import { useEffect, useState } from 'react';
import { Gauge, TimerOff, AlertTriangle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(target * progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

function KPICard({ icon, label, value, suffix, trend, trendDirection, color }) {
  const animatedValue = useCountUp(value);
  const displayValue = Number.isInteger(value)
    ? Math.round(animatedValue)
    : animatedValue.toFixed(1);

  return (
    <div className="kpi-card" style={{ '--accent': color }}>
      <div className="kpi-card-top">
        <div className="kpi-icon">{icon}</div>
        {trend !== undefined && (
          <span className={`kpi-trend ${trendDirection}`}>
            {trendDirection === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend}%
          </span>
        )}
      </div>
      <h3>{label}</h3>
      <p>{displayValue}{suffix}</p>
    </div>
  );
}

function KPICards({ kpis }) {
  return (
    <div className="kpi-cards">
      <KPICard
        icon={<Gauge size={20} />}
        label="OEE"
        value={kpis.oee}
        suffix="%"
        trend={4.2}
        trendDirection="up"
       color="#723480"
      />
      <KPICard
        icon={<TimerOff size={20} />}
        label="Downtime"
        value={kpis.downtime}
        suffix="%"
        trend={1.8}
        trendDirection="down"
        color="#c77fd6"   
      />
      <KPICard
        icon={<AlertTriangle size={20} />}
        label="Defect Rate"
        value={kpis.defectRate}
        suffix="%"
        trend={0.6}
        trendDirection="down"
        color="#a9a94a"   
      />
      <KPICard
        icon={<TrendingUp size={20} />}
        label="Throughput"
        value={kpis.throughput}
        suffix="/hr"
        trend={6.1}
        trendDirection="up"
        color="#DBD4FF"
      />
    </div>
  );
}

export default KPICards;