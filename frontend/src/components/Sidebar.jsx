import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">⚙ ProdMonitor</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/machines" className={linkClass}>
          🏭 Machines
        </NavLink>
        <NavLink to="/downtime" className={linkClass}>
          ⏱ Downtime Logs
        </NavLink>
        <NavLink to="/reports" className={linkClass}>
          📄 Reports
        </NavLink>
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;