'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import NotificationPopup from './NotificationPopup';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Initialize with localStorage value if available
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Sync state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      setIsSidebarCollapsed(saved ? JSON.parse(saved) : false);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div>
      <Navbar isSidebarCollapsed={isSidebarCollapsed} />
      <Sidebar onCollapse={handleSidebarCollapse} />
      <NotificationPopup />
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'pl-20' : 'pl-64'
      } pt-16`}>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 