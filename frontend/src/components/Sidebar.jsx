import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function Sidebar({ onLogout, themeMode, toggleTheme }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handlePlantSwitch = async (e) => {
    const newPlantId = e.target.value;
    try {
      const { token, user: newUser } = await api.switchPlant(newPlantId);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      window.location.reload(); // Reload to fetch fresh data for the new plant context
    } catch (err) {
      console.error('Failed to switch plant:', err);
    }
  };

  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">⚙ ProdMonitor</div>

      {user && (
        <div className="user-role-badge" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="user-name">{user.username}</span>
            <span
              className={`role-tag role-${user.role}`}
              style={user.role === 'operator' ? { backgroundColor: 'var(--accent-primary)' } : {}}
            >
              {user.role === 'operator' ? 'operator (read-only)' : user.role}
            </span>
          </div>
          
          {user.role === 'super_admin' && (
            <select 
              value={user.plant_id || 1} 
              onChange={handlePlantSwitch}
              style={{ width: '100%', padding: '4px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
            >
              <option value={1}>Plant Alpha</option>
              <option value={2}>Plant Beta</option>
            </select>
          )}
        </div>
      )}

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}>📊 Dashboard</NavLink>
        <NavLink to="/machines" className={linkClass}>🏭 Machines</NavLink>
        <NavLink to="/downtime" className={linkClass}>⏱ Downtime Logs</NavLink>
        <NavLink to="/maintenance" className={linkClass}>🔧 Maintenance</NavLink>
        <NavLink to="/reports" className={linkClass}>📄 Reports</NavLink>
        {user?.role === 'admin' && (
          <>
            <NavLink to="/alerts" className={linkClass}>⚙️ Alerts Config</NavLink>
            <NavLink to="/audit-logs" className={linkClass}>📜 Audit Logs</NavLink>
          </>
        )}
      </nav>

      <button className="theme-toggle" onClick={toggleTheme}>
        {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>

      <button className="sidebar-logout" onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;