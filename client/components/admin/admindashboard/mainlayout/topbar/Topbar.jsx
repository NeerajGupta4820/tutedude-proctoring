import React from 'react';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import ProfileDropdown from './ProfileDropdown';

const Topbar = ({ activeTab, setActiveTab }) => {
  const getBreadcrumb = () => {
    const breadcrumbs = {
      dashboard: [{ label: 'Dashboard', route: 'dashboard' }],
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
        { label: 'All Meetings', route: 'all' },
      ],
      questions: [
        { label: 'Questions', route: 'questions' },
        { label: 'All Questions', route: 'questions' },
      ],
      'create-question': [
        { label: 'Questions', route: 'questions' },
        { label: 'Create Question', route: 'create-question' },
      ],
      candidates: [
        { label: 'Candidates', route: 'candidates' },
        { label: 'All Candidates', route: 'candidates' },
      ],
      'create-candidate': [
        { label: 'Candidates', route: 'candidates' },
        { label: 'Create Candidate', route: 'create-candidate' },
      ],
    };
    return (
      breadcrumbs[activeTab] || [{ label: 'Dashboard', route: 'dashboard' }]
    );
  };

  const handleBreadcrumbClick = (route) => {
    setActiveTab(route);
  };

  const breadcrumbItems = getBreadcrumb();

  return (
    <div className="h-14 sticky top-0 bg-white border-b border-gray-200 px-4 z-40 flex items-center">
      <div className="flex justify-between items-center w-full">
        {/* Left Section - Breadcrumb */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBreadcrumbClick('dashboard')}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Go to Dashboard"
          >
            <FaHome size={14} />
          </button>

          <div className="flex items-center">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              return (
                <React.Fragment key={index}>
                  <FaChevronRight className="text-gray-300 mx-2" size={10} />
                  <button
                    onClick={() => !isLast && handleBreadcrumbClick(item.route)}
                    disabled={isLast}
                    className={`
                      text-sm transition-colors
                      ${
                        isLast
                          ? 'text-gray-900 font-medium cursor-default'
                          : 'text-gray-500 hover:text-blue-600 cursor-pointer'
                      }
                    `}
                  >
                    {item.label}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Section - Profile */}
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default Topbar;
