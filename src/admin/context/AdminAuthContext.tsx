import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'reporter' | 'contributor';
  fullName: string;
  avatar?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => Promise<void>;
  hasPermission: (allowedRoles: ('admin' | 'editor' | 'reporter' | 'contributor')[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dw_admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('dw_admin_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem('dw_admin_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Failed to verify newsroom auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (newToken: string, newUser: AdminUser) => {
    localStorage.setItem('dw_admin_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('dw_admin_token');
    setToken(null);
    setUser(null);
    window.location.href = '/admin/login';
  };

  const hasPermission = (allowedRoles: ('admin' | 'editor' | 'reporter' | 'contributor')[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, isLoading, login, logout, hasPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
