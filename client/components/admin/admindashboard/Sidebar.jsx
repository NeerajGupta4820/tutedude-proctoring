import React, { useContext, useState } from 'react';
import {
  FaHome,
  FaCalendarPlus,
  FaCalendarAlt,
  FaCalendarCheck,
  FaQuestionCircle,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPlus,
  FaList,
  FaUserPlus,
  FaCog,
} from 'react-icons/fa';
import { AuthContext } from '../../AuthContext';

const Sidebar = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  meetings,
  upcomingMeetings,
  questions,
  candidates,
}) => {
  const { user, logout } = useContext(AuthContext);
  const [hoveredItem] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaHome,
      type: 'single',
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: FaCalendarAlt,
      type: 'parent',
      children: [
        { id: 'create', label: 'Create Meeting', icon: FaCalendarPlus },
        { id: 'all', label: 'All Meetings', icon: FaList },
        { id: 'upcoming', label: 'Upcoming', icon: FaCalendarCheck },
      ],
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: FaQuestionCircle,
      type: 'parent',
      children: [
        { id: 'questions', label: 'All Questions', icon: FaList },
        { id: 'create-question', label: 'Create Question', icon: FaPlus },
      ],
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: FaUsers,
      type: 'parent',
      children: [
        { id: 'candidates', label: 'All Candidates', icon: FaList },
        { id: 'create-candidate', label: 'Add Candidate', icon: FaUserPlus },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FaCog,
      type: 'single',
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Tooltip Component
  const Tooltip = ({ text, show }) => {
    if (!show) return null;
    return (
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {text}
        </div>
      </div>
    );
  };

  // Collapsed Icon Button
  const CollapsedIconButton = ({ item, isActive }) => (
    <div className="relative">
      <button
        onClick={() => handleNavClick(item.id)}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
        className={`
          w-10 h-10 mx-auto mb-1 flex items-center justify-center rounded-lg
          transition-all duration-200
          ${
            isActive
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
          }
        `}
      >
        <item.icon size={14} />
      </button>
      <Tooltip text={item.label} show={hoveredItem === item.id} />
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-16'} 
          bg-white h-screen sticky top-0 
          transition-all duration-300
          flex flex-col border-r border-gray-200
          ${sidebarOpen ? 'fixed lg:sticky shadow-xl lg:shadow-none' : ''} 
          z-50
        `}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-gray-900 font-semibold text-sm">
                    Admin Panel
                  </h1>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes size={12} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 mx-auto flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaBars size={14} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {sidebarOpen ? (
            <div className="px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (item.type === 'parent') {
                  return (
                    <div key={item.id} className="mb-4">
                      {/* Parent Label */}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Icon size={12} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {item.label}
                        </span>
                      </div>

                      {/* Children with Tree Structure */}
                      <div className="ml-3 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[11px] top-0 bottom-2 w-px bg-gray-200" />

                        {item.children.map((child, index) => {
                          const ChildIcon = child.icon;
                          const isChildActive = activeTab === child.id;

                          return (
                            <div key={child.id} className="relative">
                              {/* Horizontal Line */}
                              <div className="absolute left-[11px] top-1/2 w-3 h-px bg-gray-200" />

                              {/* Dot */}
                              <div
                                className={`absolute left-[7px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 
                                  ${
                                    isChildActive
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'bg-white border-gray-300'
                                  }`}
                              />

                              <button
                                onClick={() => handleNavClick(child.id)}
                                className={`
                                  w-full flex items-center gap-3 pl-8 pr-3 py-2.5 rounded-lg text-sm
                                  transition-all duration-200
                                  ${
                                    isChildActive
                                      ? 'bg-blue-50 text-blue-600 font-medium'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }
                                `}
                              >
                                <ChildIcon
                                  size={13}
                                  className={
                                    isChildActive
                                      ? 'text-blue-600'
                                      : 'text-gray-400'
                                  }
                                />
                                <span>{child.label}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Single Item (Dashboard)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-2
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon size={14} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-2">
              {menuItems.map((item) => {
                if (item.type === 'parent') {
                  return (
                    <div key={item.id} className="mb-3">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-px bg-gray-200" />
                      </div>
                      {item.children.map((child) => (
                        <CollapsedIconButton
                          key={child.id}
                          item={child}
                          isActive={activeTab === child.id}
                        />
                      ))}
                    </div>
                  );
                }
                return (
                  <CollapsedIconButton
                    key={item.id}
                    item={item}
                    isActive={activeTab === item.id}
                  />
                );
              })}
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm font-medium truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <button
                onClick={logout}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <FaSignOutAlt size={13} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={logout}
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-10 h-10 mx-auto flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt size={14} />
              </button>
              <Tooltip text="Logout" show={hoveredItem === 'logout'} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
