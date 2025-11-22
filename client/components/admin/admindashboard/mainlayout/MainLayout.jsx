import React from 'react';
import Topbar from './topbar/Topbar';
import ContentBox from '../mainlayout/contentbox/ContentBox';

const MainLayout = ({ 
  activeTab, 
  setActiveTab,
  users, 
  meetings, 
  upcomingMeetings, 
  questions, 
  onUpdate 
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <Topbar 
        activeTab={activeTab}
        meetings={meetings}
        upcomingMeetings={upcomingMeetings}
        users={users}
        questions={questions}
      />
      <ContentBox 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        meetings={meetings}
        upcomingMeetings={upcomingMeetings}
        questions={questions}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default MainLayout;