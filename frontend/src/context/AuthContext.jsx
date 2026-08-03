import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function decodeJWT(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload; // { id, username, role, exp, iat }
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = decodeJWT(token);
    if (decoded) {
      setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}