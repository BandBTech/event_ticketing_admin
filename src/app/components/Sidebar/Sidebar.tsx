'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Gauge,
  Calendar, 
  FileText, 
  Settings,
  User
} from 'lucide-react';
import { link } from 'fs';
import { redirect } from 'next/navigation';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem = 'dashboard', 
  onItemClick 
}) => {
  const [active, setActive] = useState("");
  
  const handleRedirect = (item: string) => {
    localStorage.setItem('activeItem', item.slice(1));
    redirect(item);
  };
  const handleItemClick = (item: string) => {
    setActive(item);
    onItemClick?.(item);
  };


  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Gauge,
      link: '/dashboard'
    },
    {
      id: 'organisers',
      label: 'Organisers',
      icon: LayoutDashboard,
      link: '/organisers'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      link: '/events'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      link: '/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      link: '/settings'
    },
  ];

  return (
    <div className="w-64 h-screen fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-blue-600">
          E-Ticket
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = localStorage.getItem('activeItem') === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    handleItemClick(item.id)
                    handleRedirect(item.link)
                  }
                  }
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon 
                    className={`h-5 w-5 mr-3 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`} 
                  />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              John Doe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;