// src/components/Recommendation.js (without Shadcn UI)
import React from 'react';

const Recommendation = ({ recommendation }) => {
  return (
    <div className="recommendation-card">
      <div className="recommendation-header">
        <h2 className="recommendation-title">{recommendation.title}</h2>
      </div>
      <div className="recommendation-content">
        <p className="recommendation-description">
          {recommendation.description}
        </p>
        {recommendation.productUrl ? (
          <button
            onClick={() => window.open(recommendation.productUrl, '_blank')}
            className="recommendation-link-button"
          >
            View on Amazon
          </button>
        ) : (
          <p className="recommendation-no-link">Amazon link not available.</p>
        )}
        {recommendation.linkNotFound && (
          <p className="recommendation-link-not-found-message">
            We couldn't find a direct link for this specific product. You will be redirected to the general Amazon India search page for "{recommendation.title}".
          </p>
        )}
      </div>
    </div>
  );
};

export default Recommendation;