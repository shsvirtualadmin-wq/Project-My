import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { sanitizeStudyBuddyText } from '../lib/studyBuddySanitizer';

interface StudyBuddyFormattedMessageProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export const StudyBuddyFormattedMessage: React.FC<StudyBuddyFormattedMessageProps> = React.memo(({
  content,
  className = '',
  isUser = false,
}) => {
  const sanitized = sanitizeStudyBuddyText(content);

  if (!sanitized) return null;

  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 80px' }}
      className={`study-buddy-message font-sans space-y-2 text-xs sm:text-sm leading-relaxed overflow-x-auto ${
        isUser ? 'text-slate-950 font-medium' : 'text-slate-100'
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          h1: ({ children }) => (
            <h1
              className={`font-bold text-base sm:text-lg mt-3 mb-1.5 border-b pb-1 ${
                isUser ? 'text-slate-950 border-slate-950/20' : 'text-amber-300 border-amber-500/20'
              }`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`font-bold text-sm sm:text-base mt-2.5 mb-1 ${
                isUser ? 'text-slate-950' : 'text-amber-300'
              }`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`font-semibold text-xs sm:text-sm mt-2 mb-1 ${
                isUser ? 'text-slate-900' : 'text-amber-200'
              }`}
            >
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className={`font-bold ${isUser ? 'text-slate-950 font-black' : 'text-amber-300'}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`italic ${isUser ? 'text-slate-900' : 'text-slate-200'}`}>{children}</em>
          ),
          ul: ({ children }) => (
            <ul
              className={`list-disc list-outside ml-4 my-2 space-y-1 ${
                isUser ? 'text-slate-950' : 'text-slate-100'
              }`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`list-decimal list-outside ml-4 my-2 space-y-1 ${
                isUser ? 'text-slate-950' : 'text-slate-100'
              }`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5 leading-relaxed">{children}</li>,
          code: ({ inline, children, className, ...props }: any) => {
            return inline ? (
              <code
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  isUser
                    ? 'bg-slate-900/10 text-slate-950 border border-slate-950/20'
                    : 'bg-slate-900/80 text-amber-300 border border-amber-500/20'
                }`}
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={`block p-2.5 rounded-lg text-xs font-mono overflow-x-auto my-2 ${
                  isUser
                    ? 'bg-slate-900/10 text-slate-950 border border-slate-950/20'
                    : 'bg-slate-950 text-slate-200 border border-amber-500/20'
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-2 pl-3 my-2 italic py-1 rounded-r ${
                isUser
                  ? 'border-slate-900/60 text-slate-900 bg-slate-900/5'
                  : 'border-amber-400/60 text-slate-300 bg-amber-400/5'
              }`}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
  );
});

export default StudyBuddyFormattedMessage;
