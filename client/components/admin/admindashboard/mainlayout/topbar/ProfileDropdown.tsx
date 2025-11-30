import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  FaUser,
  FaCog,
  FaChevronDown,
  FaUserCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../AuthContext.jsx';

const ProfileDropdown = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewProfile = () => {
    // Navigate to profile page or show profile modal
    console.log('View profile for:', user);
    // You can replace this with actual navigation or modal
    alert(
      `Admin Profile:\n\nName: ${user?.name}\nEmail: ${user?.email}\nRole: ${user?.role}`
    );
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: FaUser,
      label: 'View Profile',
      onClick: handleViewProfile,
    },
    {
      icon: FaCog,
      label: 'Settings',
      onClick: () => {
        console.log('Settings clicked');
        setIsOpen(false);
      },
    },
    {
      icon: FaSignOutAlt,
      label: 'Logout',
      onClick: handleLogout,
      dividerTop: true,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-cyan-700 rounded-full flex items-center justify-center text-white font-medium">
          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>

        {/* Name & Role */}
        <div className="text-left hidden md:block">
          <div className="text-sm font-medium text-gray-900">
            {user?.name || 'Admin'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {user?.role || 'Administrator'}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <FaChevronDown
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <FaUserCircle className="text-gray-400 text-2xl" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || 'Admin User'}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || 'admin@example.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={index}>
                  {item.dividerTop && (
                    <div className="border-t border-gray-100 my-1" />
                  )}
                  <button
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="text-gray-400" />
                    <span>{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
