import React, { useEffect } from 'react';
import { FaBriefcase } from 'react-icons/fa';

const LoadingScreen = ({ onLoadingComplete, duration = 3000 }) => {
  useEffect(() => {
    // Simulating a loading delay
    const timer = setTimeout(() => {
      if (onLoadingComplete && typeof onLoadingComplete === 'function') {
        onLoadingComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [onLoadingComplete, duration]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="relative w-64 h-16 mb-4 mx-auto">
          <div className="absolute inset-0 bg-green-200 dark:bg-green-900 rounded-full"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="h-0.5 w-full bg-green-500 dark:bg-green-300"></div>
          </div>
          <FaBriefcase className="text-3xl text-blue-500 absolute top-1/2 left-0 transform -translate-y-1/2 animate-travel" />
        </div>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Crafting Your Proposal
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Shaping your business opportunities...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
