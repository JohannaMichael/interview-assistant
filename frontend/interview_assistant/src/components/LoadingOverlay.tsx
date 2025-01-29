import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div id="loadingOverlay" className="loading-overlay">
      <div className="loader"></div>
    </div>
  );
};