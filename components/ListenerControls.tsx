// Implemented the ListenerControls component for non-host participants.
import React from 'react';

const ListenerControls: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-3 rounded-full transition" title="Raise Hand">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      </button>
      {/* Other listener controls can be added here */}
    </div>
  );
};

export default ListenerControls;
