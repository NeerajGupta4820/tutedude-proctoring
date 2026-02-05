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
  FaChevronRight,
  FaChevronDown,
  FaChartLine,
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { AuthContext } from '../../AuthContext';

const Sidebar = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  meetings = [],
  upcomingMeetings = [],
  questions = [],
  candidates = [],
}) => {
  const { user, logout } = useContext(AuthContext);
  const [expandedMenus, setExpandedMenus] = useState(['meetings', 'questions', 'candidates']);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaHome,
      type: 'single',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: FaCalendarAlt,
      type: 'parent',
      badge: upcomingMeetings.length,
      badgeColor: 'bg-emerald-500',
      children: [
        { id: 'create', label: 'New Meeting', icon: FaCalendarPlus, highlight: true },
        { id: 'all', label: 'All Meetings', icon: FaList, count: meetings.length },
        { id: 'upcoming', label: 'Upcoming', icon: FaCalendarCheck, count: upcomingMeetings.length },
      ],
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: FaQuestionCircle,
      type: 'parent',
      badge: questions.length,
      badgeColor: 'bg-amber-500',
      children: [
        { id: 'questions', label: 'All Questions', icon: FaList, count: questions.length },
        { id: 'create-question', label: 'New Question', icon: FaPlus, highlight: true },
      ],
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: FaUsers,
      type: 'parent',
      badge: candidates.length,
      badgeColor: 'bg-violet-500',
      children: [
        { id: 'candidates', label: 'All Candidates', icon: FaList, count: candidates.length },
        { id: 'create-candidate', label: 'Add Candidate', icon: FaUserPlus, highlight: true },
        { id: 'results', label: 'Results', icon: FaChartLine },
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

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // Tooltip Component
  const Tooltip = ({ text, show }) => {
    if (!show || sidebarOpen) return null;
    return (
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
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
          w-10 h-10 mx-auto mb-1 flex items-center justify-center rounded-xl
          transition-all duration-200
          ${
            isActive
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
          }
        `}
      >
        <item.icon size={16} />
      </button>
      <Tooltip text={item.label} show={hoveredItem === item.id} />
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-72' : 'w-20'} 
          bg-white h-screen sticky top-0 
          transition-all duration-300 ease-in-out
          flex flex-col
          ${sidebarOpen ? 'fixed lg:sticky shadow-2xl lg:shadow-xl' : 'shadow-lg'} 
          z-50
        `}
      >
        {/* Header */}
        <div className={`${sidebarOpen ? 'px-5' : 'px-3'} py-4 border-b border-slate-100`}>
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <HiSparkles className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-slate-800 font-bold text-base">TuteDude</h1>
                  <p className="text-slate-400 text-[10px] font-medium tracking-wide">ADMIN PANEL</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <FaTimes size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <FaBars size={18} />
            </button>
          )}
        </div>

        {/* Quick Stats (when expanded) */}
        {sidebarOpen && (
          <div className="px-5 py-3 border-b border-slate-100">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2 text-center">
                <p className="text-lg font-bold text-blue-600">{meetings.length}</p>
                <p className="text-[9px] text-slate-500 font-medium">Meetings</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-2 text-center">
                <p className="text-lg font-bold text-amber-600">{questions.length}</p>
                <p className="text-[9px] text-slate-500 font-medium">Questions</p>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-2 text-center">
                <p className="text-lg font-bold text-violet-600">{candidates.length}</p>
                <p className="text-[9px] text-slate-500 font-medium">Candidates</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarOpen ? (
            <div className="px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isExpanded = expandedMenus.includes(item.id);

                if (item.type === 'parent') {
                  const hasActiveChild = item.children.some(child => activeTab === child.id);
                  
                  return (
                    <div key={item.id} className="mb-1">
                      {/* Parent Button */}
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm
                          transition-all duration-200
                          ${hasActiveChild 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-slate-600 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            hasActiveChild 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Icon size={14} />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge > 0 && (
                            <span className={`${item.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                              {item.badge}
                            </span>
                          )}
                          <FaChevronDown 
                            size={10} 
                            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>

                      {/* Children */}
                      {isExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = activeTab === child.id;

                            return (
                              <button
                                key={child.id}
                                onClick={() => handleNavClick(child.id)}
                                className={`
                                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                                  transition-all duration-200
                                  ${isChildActive
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                                    : child.highlight
                                    ? 'text-blue-600 hover:bg-blue-50 font-medium'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  <ChildIcon size={12} />
                                  <span>{child.label}</span>
                                </div>
                                {child.count !== undefined && !isChildActive && (
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                                    {child.count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Single Item
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <HiLightningBolt className="ml-auto text-amber-300" size={14} />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 space-y-1">
              {menuItems.map((item) => {
                if (item.type === 'parent') {
                  return (
                    <div key={item.id} className="mb-2">
                      <div className="flex justify-center my-2">
                        <div className="w-8 h-0.5 bg-slate-200 rounded-full" />
                      </div>
                      {item.children.slice(0, 2).map((child) => (
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
        <div className={`border-t border-slate-100 ${sidebarOpen ? 'p-4' : 'p-3'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 text-sm font-semibold truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  {user?.email || 'admin@tutedude.com'}
                </p>
              </div>
              <button
                onClick={logout}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Logout"
              >
                <FaSignOutAlt size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={logout}
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-full h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <FaSignOutAlt size={16} />
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
