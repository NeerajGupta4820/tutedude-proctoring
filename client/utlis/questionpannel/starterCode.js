import { defaultStarterCodes } from '../../constants/questionpannel/languages.js';

export const getStarterCode = (question, lang) => {
  if (question?.starterCode?.[lang]?.code) {
    return question.starterCode[lang].code;
  }
  return defaultStarterCodes[lang] || '// Write your code here';
};

export const getDifficultyStyles = (difficulty, t) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return `${t.successBg} ${t.successText}`;
    case 'medium':
      return `${t.warningBg} ${t.warningText}`;
    case 'hard':
      return `${t.dangerBg} ${t.dangerText}`;
    default:
      return `${t.bgTertiary} ${t.textSecondary}`;
  }
};

export const getCopyProtectionStyles = (isInterviewer) => {
  if (isInterviewer) return {};
  return {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };
};

export const getStatusColor = (status, t) => {
  switch (status) {
    case 'accepted':
      return 'text-green-500';
    case 'wrong_answer':
      return 'text-red-500';
    case 'time_limit_exceeded':
      return 'text-yellow-500';
    default:
      return t.textSecondary;
  }
};
