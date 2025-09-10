import React from 'react';
import Loading from './Loading';

export const LynkerCardSkeleton: React.FC = () => {
  return (
    <div className="card animate-pulse">
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
          <div className="w-1/4 h-6 bg-gray-200 rounded"></div>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded-full mr-1"></div>
          <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
        </div>
        
        <div className="space-y-2">
          <div className="w-full h-3 bg-gray-200 rounded"></div>
          <div className="w-5/6 h-3 bg-gray-200 rounded"></div>
          <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-16 h-6 bg-gray-200 rounded-full"></div>
          ))}
        </div>
        
        <div className="flex justify-between pt-4">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const LynkerListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <LynkerCardSkeleton key={i} />
      ))}
    </div>
  );
};