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
  FaChevronDown,
  FaChevronRight,
  FaPlus,
  FaList,
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
  users,
  candidates,
}) => {
  const { user, logout } = useContext(AuthContext);
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleExpand = (itemId) => {
    setExpandedItems(
      (prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [itemId] // Close all others and open only this one
    );
  };

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
      badge: meetings.length,
      children: [
        {
          id: 'create',
          label: 'Create Meeting',
          icon: FaCalendarPlus,
        },
        {
          id: 'all',
          label: 'All Meetings',
          icon: FaList,
          badge: meetings.length,
        },
        {
          id: 'upcoming',
          label: 'Upcoming Meetings',
          icon: FaCalendarCheck,
          badge: upcomingMeetings.length,
        },
      ],
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: FaQuestionCircle,
      type: 'parent',
      badge: questions.length,
      children: [
        {
          id: 'questions',
          label: 'All Questions',
          icon: FaList,
          badge: questions.length,
        },
        {
          id: 'create-question',
          label: 'Create Question',
          icon: FaPlus,
        },
      ],
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: FaUsers,
      type: 'parent',
      badge: candidates.length,
      children: [
        {
          id: 'candidates',
          label: 'All Candidates',
          icon: FaList,
          badge: candidates.length,
        },
        {
          id: 'create-candidate',
          label: 'Create Candidate',
          icon: FaPlus,
        },
      ],
    },
    // {
    //   id: 'interviewers',
    //   label: 'Interviewers',
    //   icon: FaUsers,
    //   type: 'single',
    // },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        bg-white h-screen sticky top-0 transition-all duration-300 flex flex-col shadow-lg border-r border-gray-200
        ${sidebarOpen ? 'fixed lg:sticky' : ''} 
        z-50
      `}
      >
        {/* Logo/Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <div>
                  <h2 className="text-gray-800 font-bold text-lg lg:text-xl">
                    Admin Panel
                  </h2>
                  <p className="text-gray-500 text-xs mt-1 hidden sm:block">
                    Management Dashboard
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
                >
                  <FaTimes />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition mx-auto"
              >
                <FaBars />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.id);

            if (item.type === 'parent') {
              return (
                <div key={item.id}>
                  {/* Parent Item */}
                  <button
                    onClick={() => sidebarOpen && toggleExpand(item.id)}
                    className="w-full flex items-center gap-3 px-4 lg:px-6 py-3 text-gray-600 hover:bg-gray-50 transition-all"
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon className="text-lg flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm lg:text-base font-medium">
                          {item.label}
                        </span>
                        {item.badge > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mr-2">
                            {item.badge}
                          </span>
                        )}
                        {isExpanded ? (
                          <FaChevronDown className="text-xs" />
                        ) : (
                          <FaChevronRight className="text-xs" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Children Items with Tree Lines */}
                  {sidebarOpen && isExpanded && (
                    <div className="relative ml-6 lg:ml-9">
                      {/* Vertical line for parent */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"
                        style={{ left: '-12px' }}
                      ></div>

                      {item.children.map((child, index) => {
                        const ChildIcon = child.icon;
                        const isActive = activeTab === child.id;
                        const isLast = index === item.children.length - 1;

                        return (
                          <div key={child.id} className="relative">
                            {/* Horizontal line */}
                            <div
                              className="absolute top-1/2 w-3 h-px bg-gray-300"
                              style={{
                                left: '-12px',
                                transform: 'translateY(-50%)',
                              }}
                            ></div>

                            {/* Hide vertical line for last item */}
                            {isLast && (
                              <div
                                className="absolute left-0 top-1/2 bottom-0 w-px bg-white"
                                style={{ left: '-12px', zIndex: 1 }}
                              ></div>
                            )}

                            <button
                              onClick={() => {
                                setActiveTab(child.id);
                                if (window.innerWidth < 1024) {
                                  setSidebarOpen(false);
                                }
                              }}
                              className={`w-full flex items-center gap-3 pl-3 pr-4 lg:pr-6 py-2.5 transition-all relative ${
                                isActive
                                  ? 'bg-gray-50 text-cyan-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              {/* Active Indicator */}
                              {isActive && (
                                <div className="absolute -left-6 lg:-left-9 top-0 h-full w-1 bg-cyan-600"></div>
                              )}

                              <ChildIcon
                                className={`text-sm flex-shrink-0 ${isActive ? 'text-cyan-600' : ''}`}
                              />
                              <span className="flex-1 text-left text-sm">
                                {child.label}
                              </span>
                              {child.badge > 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isActive
                                      ? 'bg-cyan-100 text-cyan-600'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {child.badge}
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              // Single menu item
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 lg:px-6 py-3 transition-all relative ${
                    isActive
                      ? 'bg-gray-50 text-cyan-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-cyan-600"></div>
                  )}

                  <Icon
                    className={`text-lg flex-shrink-0 ${isActive ? 'text-cyan-600' : ''}`}
                  />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm lg:text-base">
                        {item.label}
                      </span>
                      {item.badge > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-cyan-100 text-cyan-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            }
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-3 lg:p-4">
          {sidebarOpen && (
            <div className="mb-3 px-2">
              <div className="text-gray-800 font-medium text-sm truncate">
                {user?.name}
              </div>
              <div className="text-gray-500 text-xs truncate">
                {user?.email}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3 px-3 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition font-medium`}
          >
            <FaSignOutAlt className="text-sm flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
