import React from 'react';
import { FaHistory } from 'react-icons/fa';
import { getStatusColor } from '../../../utlis/questionpannel/starterCode';

const SubmissionsTab = ({ submission, t }) => {
  if (!submission) {
    return (
      <div className={`flex items-center justify-center h-48 ${t.textMuted}`}>
        <div className="text-center">
          <FaHistory className="text-4xl mx-auto mb-3 opacity-50" />
          <p className="font-medium">No submissions yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SubmissionCard submission={submission} t={t} />
    </div>
  );
};

// Submission Card Component
const SubmissionCard = ({ submission, t }) => {
  const statusColor = getStatusColor(submission.status, t);

  return (
    <div className={`${t.bgSecondary} rounded-xl p-4 border ${t.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold ${t.text}`}>Latest Submission</h3>
        <span className={`text-sm ${statusColor}`}>
          {submission.statusDisplay || submission.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <SubmissionDetail
          label="Test Cases"
          value={`${submission.testResults?.passed}/${submission.testResults?.total}`}
          t={t}
        />
        <SubmissionDetail
          label="Score"
          value={`${submission.score?.percentage}%`}
          t={t}
        />
        <SubmissionDetail
          label="Runtime"
          value={submission.performance?.runtime}
          t={t}
        />
        <SubmissionDetail
          label="Memory"
          value={submission.performance?.memory}
          t={t}
        />
        <SubmissionDetail
          label="Language"
          value={submission.language}
          capitalize
          t={t}
        />
        <SubmissionDetail
          label="Attempt"
          value={`#${submission.attemptNumber}`}
          t={t}
        />
      </div>
    </div>
  );
};

// Submission Detail Row
const SubmissionDetail = ({ label, value, capitalize, t }) => (
  <div>
    <span className={t.textMuted}>{label}:</span>
    <span className={`ml-2 ${t.text} ${capitalize ? 'capitalize' : ''}`}>
      {value}
    </span>
  </div>
);

export default SubmissionsTab;
