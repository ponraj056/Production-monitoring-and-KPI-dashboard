import React from 'react';

const HealthGauge = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = 'var(--status-down)';
  if (score >= 70) color = 'var(--status-running)';
  else if (score >= 40) color = 'var(--status-idle)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="var(--surface-light, #333)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fill="var(--text)"
          fontSize="20"
          fontWeight="bold"
        >
          {score}%
        </text>
      </svg>
      <span style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Health Score
      </span>
    </div>
  );
};

export default HealthGauge;
