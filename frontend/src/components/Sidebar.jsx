import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Sidebar({ onLogout, themeMode, toggleTheme }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">⚙ ProdMonitor</div>

      {user && (
        <div className="user-role-badge">
          <span className="user-name">{user.username}</span>
          <span
            className={`role-tag role-${user.role}`}
            style={user.role === 'operator' ? { backgroundColor: 'var(--accent-primary)' } : {}}
          >
            {user.role === 'operator' ? 'operator (read-only)' : user.role}
          </span>
        </div>
      )}

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}>📊 Dashboard</NavLink>
        <NavLink to="/machines" className={linkClass}>🏭 Machines</NavLink>
        <NavLink to="/downtime" className={linkClass}>⏱ Downtime Logs</NavLink>
        <NavLink to="/maintenance" className={linkClass}>🔧 Maintenance</NavLink>
        <NavLink to="/reports" className={linkClass}>📄 Reports</NavLink>
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