'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Gauge,
  Calendar, 
  FileText, 
  Settings,
  User,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  defaultCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem = 'dashboard', 
  onItemClick,
  defaultCollapsed = false 
}) => {
  const [active, setActive] = useState(activeItem);
  const [isClient, setIsClient] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const router = useRouter();
  
  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    const storedActiveItem = localStorage.getItem('activeItem');
    const storedCollapsed = localStorage.getItem('sidebarCollapsed');
    
    if (storedActiveItem) {
      setActive(storedActiveItem);
    }
    if (storedCollapsed) {
      setIsCollapsed(JSON.parse(storedCollapsed));
    }
  }, []);
  
  const handleRedirect = (item: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeItem', item.slice(1));
    }
    router.push(item);
  };
  
  const handleItemClick = (item: string) => {
    setActive(item);
    onItemClick?.(item);
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsedState));
    }
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
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-semibold text-blue-600 transition-opacity duration-300">
            E-Ticket
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronsLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Safe localStorage access - only on client side
            const storedActiveItem = isClient ? localStorage.getItem('activeItem') : null;
            const isActive = storedActiveItem === item.id || (!storedActiveItem && active === item.id);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    handleItemClick(item.id);
                    handleRedirect(item.link);
                  }}
                  className={`w-full flex items-center text-sm font-medium rounded-lg transition-all duration-300 relative group ${
                    isCollapsed 
                      ? 'px-2 py-3 justify-center' 
                      : 'px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"></div>
                  )}
                  
                  <Icon 
                    className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`} 
                  />
                  
                  {!isCollapsed && (
                    <span className="transition-all duration-300 opacity-100">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-16 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 transition-opacity duration-300">
              <p className="text-sm font-medium text-gray-900 truncate">
                John Doe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;