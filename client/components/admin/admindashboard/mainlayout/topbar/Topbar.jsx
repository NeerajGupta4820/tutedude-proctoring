import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  FaHome, 
  FaChevronRight, 
  FaBell, 
  FaSearch, 
  FaCalendarAlt,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaPlus,
  FaQuestionCircle,
  FaUsers,
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../AuthContext.jsx';

const Topbar = ({ activeTab, setActiveTab, meetings = [], upcomingMeetings = [], questions = [], candidates = [] }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const profileRef = useRef(null);
  const quickActionsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setIsQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    const breadcrumbs = {
      dashboard: [{ label: 'Dashboard', route: 'dashboard', icon: FaHome }],
      create: [
        { label: 'Meetings', route: 'all' },
        { label: 'Create Meeting', route: 'create' },
      ],
      upcoming: [
        { label: 'Meetings', route: 'all' },
        { label: 'Upcoming', route: 'upcoming' },
      ],
      all: [
        { label: 'Meetings', route: 'all' },
      ],
      questions: [
        { label: 'Questions', route: 'questions' },
      ],
      'create-question': [
        { label: 'Questions', route: 'questions' },
        { label: 'Create Question', route: 'create-question' },
      ],
      candidates: [
        { label: 'Candidates', route: 'candidates' },
      ],
      'create-candidate': [
        { label: 'Candidates', route: 'candidates' },
        { label: 'Add Candidate', route: 'create-candidate' },
      ],
      settings: [{ label: 'Settings', route: 'settings' }],
    };
    return breadcrumbs[activeTab] || [{ label: 'Dashboard', route: 'dashboard' }];
  };

  const handleBreadcrumbClick = (route) => {
    setActiveTab(route);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  const quickActions = [
    { id: 'create', label: 'New Meeting', icon: FaCalendarAlt, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'create-question', label: 'New Question', icon: FaQuestionCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'create-candidate', label: 'Add Candidate', icon: FaUsers, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  const breadcrumbItems = getBreadcrumb();

  // Get current time
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="h-16 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 z-40 flex items-center shadow-sm">
      <div className="flex justify-between items-center w-full">
        {/* Left Section - Breadcrumb & Greeting */}
        <div className="flex items-center gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl px-3 py-1.5">
            <button
              onClick={() => handleBreadcrumbClick('dashboard')}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Go to Dashboard"
            >
              <FaHome size={12} />
            </button>

            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              return (
                <React.Fragment key={index}>
                  <FaChevronRight className="text-slate-300" size={8} />
                  <button
                    onClick={() => !isLast && handleBreadcrumbClick(item.route)}
                    disabled={isLast}
                    className={`
                      text-sm transition-all px-2 py-1 rounded-lg
                      ${
                        isLast
                          ? 'text-slate-800 font-semibold cursor-default'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer'
                      }
                    `}
                  >
                    {item.label}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Greeting (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-2 text-slate-600">
            <HiSparkles className="text-amber-400" size={16} />
            <span className="text-sm">
              {greeting}, <span className="font-semibold text-slate-800">{user?.name?.split(' ')[0] || 'Admin'}</span>
            </span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className={`relative transition-all duration-300 ${showSearch ? 'w-64' : 'w-10'}`}>
            {showSearch ? (
              <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200">
                <FaSearch className="text-slate-400 ml-3" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
                  autoFocus
                  onBlur={() => !searchQuery && setShowSearch(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <FaSearch size={14} />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="relative" ref={quickActionsRef}>
            <button
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all"
            >
              <FaPlus size={14} />
            </button>

            {isQuickActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Quick Actions</p>
                </div>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        setActiveTab(action.id);
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className={`w-9 h-9 ${action.bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={action.color} size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <FaBell size={16} />
            {upcomingMeetings.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                {upcomingMeetings.length > 9 ? '9+' : upcomingMeetings.length}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200 mx-1" />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {user?.role || 'Administrator'}
                </p>
              </div>
              <FaChevronDown
                size={10}
                className={`text-slate-400 transition-transform hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fadeIn">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {user?.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user?.email || 'admin@tutedude.com'}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Online
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FaUser className="text-slate-500" size={12} />
                    </div>
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FaCog className="text-slate-500" size={12} />
                    </div>
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 pt-2 px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaSignOutAlt className="text-red-500" size={12} />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Topbar;
