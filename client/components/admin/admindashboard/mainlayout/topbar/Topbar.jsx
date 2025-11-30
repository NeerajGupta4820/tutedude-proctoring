import React from 'react';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import ProfileDropdown from './ProfileDropdown';

const Topbar = ({ activeTab, setActiveTab, candidates }) => {
  const getBreadcrumb = () => {
    const breadcrumbs = {
      dashboard: [
        { label: 'Home', route: 'dashboard' },
        { label: 'Dashboard', route: 'dashboard' },
      ],
      create: [
        { label: 'Home', route: 'dashboard' },
        { label: 'Meetings', route: 'all' },
        { label: 'Create Meeting', route: 'create' },
      ],
      upcoming: [
        { label: 'Home', route: 'dashboard' },
        { label: 'Meetings', route: 'all' },
        { label: 'Upcoming', route: 'upcoming' },
      ],
      all: [
        { label: 'Home', route: 'dashboard' },
        { label: 'Meetings', route: 'all' },
        { label: 'All Meetings', route: 'all' },
      ],
      questions: [
        { label: 'Home', route: 'dashboard' },
        { label: 'Questions', route: 'questions' },
        { label: 'All Questions', route: 'questions' },
      ],
      'create-question': [
        { label: 'Home', route: 'dashboard' },
        { label: 'Questions', route: 'questions' },
        { label: 'Create Question', route: 'create-question' },
      ],
      users: [
        { label: 'Home', route: 'dashboard' },
        { label: 'User Management', route: 'users' },
      ],
      candidates: [
        { label: 'Home', route: 'dashboard' },
        { label: 'Candidates', route: 'candidates' },
        { label: 'All Candidates', route: 'candidates' },
      ],
      'create-candidate': [
        { label: 'Home', route: 'dashboard' },
        { label: 'Candidates', route: 'candidates' },
        { label: 'Create Candidate', route: 'create-candidate' },
      ],
      interviewers: [
        { label: 'Home', route: 'dashboard' },
        { label: 'Interviewers', route: 'interviewers' },
      ],
    };
    return breadcrumbs[activeTab] || [{ label: 'Home', route: 'dashboard' }];
  };

  const handleBreadcrumbClick = (route) => {
    setActiveTab(route);
  };

  const breadcrumbItems = getBreadcrumb();

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-2 z-40">
      <div className="flex justify-between items-center">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm">
          <FaHome
            className="text-gray-400 mr-2 cursor-pointer hover:text-gray-600 transition-colors text-xs"
            onClick={() => handleBreadcrumbClick('dashboard')}
            title="Go to Home"
          />
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <FaChevronRight className="text-gray-400 mx-1.5 text-xs" />
                )}
                <button
                  onClick={() => !isLast && handleBreadcrumbClick(item.route)}
                  disabled={isLast}
                  className={`${
                    isLast
                      ? 'text-gray-900 font-medium cursor-default'
                      : 'text-gray-500 hover:text-gray-700 cursor-pointer hover:underline transition-all'
                  } outline-none focus:outline-none text-xs`}
                  title={!isLast ? `Go to ${item.label}` : ''}
                >
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Profile Section */}
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default Topbar;
