// src/components/GiftList.js
import React from 'react';
import PropTypes from 'prop-types';
import Recommendation from './Recommendation';

function GiftList({ recommendations }) {
  console.log('Recommendations prop in GiftList:', recommendations);

  GiftList.propTypes = {
    recommendations: PropTypes.array.isRequired,
  };

  return (
    <div id="recommendations-container">
      <h2>Recommendations:</h2>
      {recommendations.length > 0 ? (
        recommendations.map((recommendation, index) => (
          <Recommendation key={index} recommendation={recommendation} />
        ))
      ) : (
        <p>No recommendations yet.</p>
      )}
    </div>
  );
}

export default GiftList;