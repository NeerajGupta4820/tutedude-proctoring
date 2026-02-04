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
  candidates,
  onUpdate,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        meetings={meetings}
        upcomingMeetings={upcomingMeetings}
        users={users}
        questions={questions}
        candidates={candidates}
      />
      <ContentBox
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        meetings={meetings}
        upcomingMeetings={upcomingMeetings}
        questions={questions}
        candidates={candidates}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default MainLayout;
