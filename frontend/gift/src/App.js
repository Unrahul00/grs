// src/App.js
import React, { useState } from 'react';
import GiftForm from './components/GiftForm';
import GiftList from './components/GiftList';

function App() {
  const [recommendations, setRecommendations] = useState([]);

  const handleRecommendations = (t) => {
    // Here we'll call the Gemini API and set the recommendations
    setRecommendations(data);
  };

  return (
    <div>
      <h1>Gift Recommender</h1>
      <GiftForm onRecommendations={handleRecommendations} />
      <GiftList recommendations={recommendations} />
    </div>
  );
}

export default App;