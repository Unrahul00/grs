// src/components/GiftForm.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';

function GiftForm({ onRecommendations }) {
  const [interests, setInterests] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [relationship, setRelationship] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  GiftForm.propTypes = {
    onRecommendations: PropTypes.func.isRequired,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!interests || !occasion || !budget || !relationship || !ageGroup || !gender) {
      setError('Please fill in all fields.');
      return;
    }

    if (isNaN(budget) || budget <= 0) {
      setError('Please enter a valid budget.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const promptValue = `Search online for 5 quality gifts for a ${gender} ${ageGroup} ${relationship} who enjoys ${interests}, for their ${occasion}, within a budget of ${budget}. For each gift, provide the gift name, a brief description, and suggest relevant search keywords a user would type into Amazon to find this product, labeled as 'AmazonSearchKeywords:' followed by the keywords (separated by spaces if multiple).`;

      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Data received from API:', data);
      onRecommendations(data);
    } catch (apiError) {
      console.error('Error calling backend:', apiError);
      setError(apiError.message || 'Failed to get recommendations. Please try again.');
      onRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="p-error">{error}</p>}
      <label>Interests:</label>
      <input
        type="text"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        placeholder="e.g., hiking, cooking, reading"
      />
      <label>Occasion:</label>
      <input
        type="text"
        value={occasion}
        onChange={(e) => setOccasion(e.target.value)}
        placeholder="e.g., Birthday, Anniversary, Holiday"
      />
      <label>Budget:</label>
      <input
        type="text"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder="e.g., 50, 100, 200"
      />
      <label>Relationship:</label>
      <select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
        <option value="">Select Relationship</option>
        <option value="parent">Parent</option>
        <option value="partner">Partner</option>
        <option value="friend">Friend</option>
        <option value="sibling">Sibling</option>
        <option value="colleague">Colleague</option>
        <option value="others">Others</option>
      </select>
      <label>Age Group:</label>
      <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
        <option value="">Select Age Group</option>
        <option value="child">Child (0-12)</option>
        <option value="teenager">Teenager (13-19)</option>
        <option value="young adult">Young Adult (20-35)</option>
        <option value="adult">Adult (36-60)</option>
        <option value="senior">Senior (60+)</option>
      </select>
      <label>Gender:</label>
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="non-binary">Non-Binary</option>
        <option value="any">Any</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? <ClipLoader color="#00ffff" size={20} /> : 'Get Recommendations'}
      </button>
    </form>
  );
}

export default GiftForm;