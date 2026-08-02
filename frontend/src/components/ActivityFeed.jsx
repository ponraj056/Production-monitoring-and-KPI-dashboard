import { CheckCircle2, AlertCircle, Wrench, PlusCircle } from 'lucide-react';

const iconMap = {
  success: <CheckCircle2 size={16} color="#3fb950" />,
  warning: <AlertCircle size={16} color="#eac54f" />,
  error: <AlertCircle size={16} color="#ff5555" />,
  maintenance: <Wrench size={16} color="#00d9ff" />,
  added: <PlusCircle size={16} color="#7c3aed" />,
};

function ActivityFeed({ activities }) {
  return (
    <div className="chart-panel">
      <div className="activity-list">
        {activities.map((item) => (
          <div className="activity-item" key={item.id}>
            <div className="activity-icon">{iconMap[item.type]}</div>
            <div className="activity-body">
              <p className="activity-text">{item.text}</p>
              <span className="activity-time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityFeed;