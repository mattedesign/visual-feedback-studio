
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive }) => {
  const location = useLocation();
  const active = isActive ?? location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};
