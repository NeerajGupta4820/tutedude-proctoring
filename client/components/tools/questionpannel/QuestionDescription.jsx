import React from 'react';

const QuestionDescription = ({ question, t }) => {
  return (
    <div className={`space-y-6 ${t.textSecondary}`}>
      {/* Description */}
      {question.description && (
        <p className={`leading-relaxed text-base ${t.text}`}>
          {question.description}
        </p>
      )}

      {/* Problem Statement */}
      {question.problemStatement && (
        <div className={`${t.bgSecondary} p-5 rounded-xl border ${t.border}`}>
          <p className={`whitespace-pre-wrap ${t.text} leading-relaxed`}>
            {question.problemStatement}
          </p>
        </div>
      )}

      {/* Examples */}
      {question.examples?.length > 0 && (
        <ExamplesSection examples={question.examples} t={t} />
      )}

      {/* Constraints */}
      {question.constraints?.length > 0 && (
        <ConstraintsSection constraints={question.constraints} t={t} />
      )}

      {/* Tags */}
      {(question.category || question.tags?.length > 0) && (
        <TagsSection category={question.category} tags={question.tags} t={t} />
      )}
    </div>
  );
};

// Examples Section
const ExamplesSection = ({ examples, t }) => (
  <div className="space-y-4">
    <h3 className={`font-semibold ${t.text} text-sm uppercase tracking-wide`}>
      Examples
    </h3>
    {examples.map((example, idx) => (
      <div
        key={idx}
        className={`${t.bgSecondary} rounded-xl overflow-hidden border ${t.border}`}
      >
        <div
          className={`px-4 py-2.5 ${t.bgTertiary} text-sm font-semibold ${t.text} border-b ${t.border}`}
        >
          Example {idx + 1}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className={`${t.textMuted} text-sm font-medium min-w-[60px]`}>
              Input:
            </span>
            <code
              className={`text-sm ${t.bg} px-3 py-1.5 rounded-lg ${t.text} font-mono border ${t.border}`}
            >
              {example.input}
            </code>
          </div>
          <div className="flex items-start gap-3">
            <span className={`${t.textMuted} text-sm font-medium min-w-[60px]`}>
              Output:
            </span>
            <code
              className={`text-sm ${t.bg} px-3 py-1.5 rounded-lg ${t.text} font-mono border ${t.border}`}
            >
              {example.output}
            </code>
          </div>
          {example.explanation && (
            <div className={`pt-3 border-t ${t.border} mt-3`}>
              <span className={`${t.textMuted} text-sm font-medium`}>
                Explanation:{' '}
              </span>
              <span className={`text-sm ${t.textSecondary}`}>
                {example.explanation}
              </span>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Constraints Section
const ConstraintsSection = ({ constraints, t }) => (
  <div>
    <h3
      className={`font-semibold ${t.text} mb-3 text-sm uppercase tracking-wide`}
    >
      Constraints
    </h3>
    <ul className="space-y-2">
      {constraints.map((c, idx) => (
        <li key={idx} className="flex items-center gap-3">
          <span
            className={`w-1.5 h-1.5 rounded-full ${t.accentText} bg-current`}
          />
          <code
            className={`text-sm ${t.bgSecondary} px-3 py-1.5 rounded-lg ${t.text} font-mono border ${t.border}`}
          >
            {c}
          </code>
        </li>
      ))}
    </ul>
  </div>
);

// Tags Section
const TagsSection = ({ category, tags, t }) => (
  <div className={`flex flex-wrap gap-2 pt-5 border-t ${t.border}`}>
    {category && (
      <span
        className={`px-3 py-1.5 ${t.accentBg} ${t.accentText} rounded-full text-xs font-medium`}
      >
        {category}
      </span>
    )}
    {tags?.map((tag, idx) => (
      <span
        key={idx}
        className={`px-3 py-1.5 ${t.bgTertiary} ${t.textSecondary} rounded-full text-xs font-medium`}
      >
        {tag}
      </span>
    ))}
  </div>
);

export default QuestionDescription;
