'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiClock, FiHelpCircle, FiChevronLeft, FiCheckSquare, FiList } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  const pathname = usePathname();
  const { userRole } = useAuth();

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: <FiHome className="w-6 h-6" />, label: 'Dashboard' },
    { path: '/admin/penyetujuan', icon: <FiCheckSquare className="w-6 h-6" />, label: 'Penyetujuan' },
    { path: '/admin/riwayat', icon: <FiList className="w-6 h-6" />, label: 'Riwayat' },
  ];

  const userMenuItems = [
    { path: '/dashboard', icon: <FiHome className="w-6 h-6" />, label: 'Dashboard' },
    { path: '/pengajuan', icon: <FiFileText className="w-6 h-6" />, label: 'Pengajuan' },
    { path: '/status', icon: <FiClock className="w-6 h-6" />, label: 'Status' },
    { path: '/bantuan', icon: <FiHelpCircle className="w-6 h-6" />, label: 'Bantuan' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapse?.(newCollapsedState);
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo and Title Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Image
            src="/Polri.png"
            alt="Logo Polri"
            width={40}
            height={40}
            className="transition-all duration-300"
          />
          <h1 className={`font-bold text-xl transition-opacity duration-300 
            ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            SKCK Online
          </h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-all duration-200
              ${pathname === item.path 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <div className="min-w-[24px]">{item.icon}</div>
            <span className={`transition-opacity duration-300
              ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className={`absolute -right-3 top-20 bg-white dark:bg-gray-800 p-1.5 rounded-full border border-gray-200 dark:border-gray-700 
          shadow-lg cursor-pointer transition-transform duration-300 hover:bg-gray-100 dark:hover:bg-gray-700
          ${isCollapsed ? 'transform rotate-180' : ''}`}
        aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <FiChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}