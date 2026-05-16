import React from 'react';

interface StatMeterProps {
  label: string;
  value: number;
  tone?: 'growth' | 'feed';
}

const StatMeter: React.FC<StatMeterProps> = ({ label, value, tone = 'growth' }) => {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className={`stat-meter stat-meter-${tone}`}>
      <div className="stat-meter-head">
        <span>{label}</span>
        <strong>{safeValue}</strong>
      </div>
      <div className="meter-track" aria-hidden="true">
        <i style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
};

export default StatMeter;
