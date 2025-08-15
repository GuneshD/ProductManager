import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, User } from '../types';
import { toast } from 'react-hot-toast';

interface TenantContextType {
  currentTenant: Tenant | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  setCurrentTenant: (tenant: Tenant | null) => void;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  getTenantId: () => string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load tenant and user data from localStorage on app start
    const storedTenant = localStorage.getItem('currentTenant');
    const storedUser = localStorage.getItem('currentUser');
    const authToken = localStorage.getItem('authToken');

    if (storedTenant && storedUser && authToken) {
      try {
        setCurrentTenant(JSON.parse(storedTenant));
        setCurrentUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
  }, []);

  const handleSetCurrentTenant = (tenant: Tenant | null) => {
    setCurrentTenant(tenant);
    if (tenant) {
      localStorage.setItem('currentTenant', JSON.stringify(tenant));
    } else {
      localStorage.removeItem('currentTenant');
    }
  };

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    setIsAuthenticated(!!user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Also set the tenant if it's included in user data
      if (user.tenant_id && !currentTenant) {
        // In a real app, you would fetch tenant details here
        const mockTenant: Tenant = {
          id: user.tenant_id,
          name: 'Default Tenant',
          status: 'active',
          created_on: new Date()
        };
        handleSetCurrentTenant(mockTenant);
      }
    } else {
      localStorage.removeItem('currentUser');
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentTenant(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentTenant');
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
  };

  const getTenantId = (): string | null => {
    return currentTenant?.id || currentUser?.tenant_id || null;
  };

  // Mock authentication for development
  useEffect(() => {
    if (!isAuthenticated) {
      // Auto-login with mock data for development
      const mockUser: User = {
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
        tenant_id: 'tenant-1',
        roles: ['admin']
      };
      
      const mockTenant: Tenant = {
        id: 'tenant-1',
        name: 'Demo Tenant',
        status: 'active',
        created_on: new Date()
      };

      handleSetCurrentUser(mockUser);
      handleSetCurrentTenant(mockTenant);
      localStorage.setItem('authToken', 'mock-jwt-token');
    }
  }, []);

  const value: TenantContextType = {
    currentTenant,
    currentUser,
    isAuthenticated,
    setCurrentTenant: handleSetCurrentTenant,
    setCurrentUser: handleSetCurrentUser,
    logout,
    getTenantId
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};