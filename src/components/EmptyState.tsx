import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateAction {
  label: string;
  to: string;
  primary?: boolean;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actions?: EmptyStateAction[];
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = '🌱', actions = [], className = '' }) => {
  return (
    <section className={`empty-state ${className}`.trim()}>
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions.length > 0 && (
        <div className="empty-state-actions">
          {actions.map(action => (
            <Link key={action.to + action.label} to={action.to} className={action.primary ? 'primary-action' : 'secondary-action'}>
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default EmptyState;
