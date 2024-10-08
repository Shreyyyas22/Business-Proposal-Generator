import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownViewer = ({ markdownText }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-800 text-gray-200 dark:border-gray-600">
      <ReactMarkdown
        className="prose prose-invert dark:prose-invert text-justify"
      >
        {markdownText}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
