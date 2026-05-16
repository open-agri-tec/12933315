import React from 'react';

interface StatusMeterProps {
  label: string;
  value: number;
  help?: string;
  tone?: 'growth' | 'feed';
}

const StatusMeter: React.FC<StatusMeterProps> = ({ label, value, help, tone = 'feed' }) => {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <section className={`status-meter soft-card status-meter-${tone}`}>
      <div className="section-heading compact-heading">
        <h2>{label}</h2>
        <span>{safeValue}%</span>
      </div>
      <div className="meter-track large-track" aria-hidden="true">
        <i style={{ width: `${safeValue}%` }} />
      </div>
      {help && <p className="muted-text no-pad">{help}</p>}
    </section>
  );
};

export default StatusMeter;
