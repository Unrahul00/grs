require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash";

if (!GEMINI_API_KEY) {
  console.error('Error: Gemini API Key is not set. Set GEMINI_API_KEY environment variable in your .env file.');
  process.exit(1);
}

let genAI;
let model;
try {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });
  console.log('Google AI Client Initialized Successfully.');
  console.log(`Using Model: ${MODEL_NAME}`);
} catch (error) {
  console.error('Failed to initialize Google AI Client:', error);
  process.exit(1);
}

app.post('/generate', async (req, res) => {
  console.log("Backend received request body:", req.body);

  const { prompt } = req.body;

  
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Invalid or missing \"prompt\" in request body. It must be a non-empty string.' });
  }

  console.log(`Received prompt: \"${prompt.substring(0, 100)}...\"`);

  try {
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);

    console.log('Received response from Gemini API.');
    const response = result.response;
    let text = await response.text();

    if (text !== undefined && text !== null && text.trim() !== '') {
      console.log('Extracted text:', text.substring(0, 100) + '...');

      const recommendations = parseGeminiResponse(text);
      res.json(recommendations);
    } else {
      console.warn('Could not extract valid text from Gemini response.');
      console.warn('Response candidates:', JSON.stringify(response.candidates, null, 2));
      console.warn('Prompt feedback:', JSON.stringify(response.promptFeedback, null, 2));
      res.status(500).json({
        error: 'Failed to extract valid text content from the API response. The request might have been blocked due to safety settings or returned an empty response.',
        details: {
          promptFeedback: response.promptFeedback,
          finishReason: response.candidates?.[0]?.finishReason,
        },
      });
    }
  } catch (error) {
    console.error('Error during Gemini API call or processing:', error);
    res.status(500).json({
      error: 'Failed to generate text due to an internal server error.',
      details: error.message || 'Unknown error'
    });
  }
});

function parseGeminiResponse(text) {
  const recommendations = [];
  const recommendationBlocks = text.split(/\n\n(?=\d+\.)/);
  const amazonSearchTemplate = "https://www.amazon.in/s?k=**SEARCH_TERM**&crid=1W8UZBOVTLAD6&sprefix=%2Caps%2C362&ref=nb_sb_ss_recent_1_0_recent";

  recommendationBlocks.slice(0, 5).forEach((block) => {
    const lines = block.split('\n');
    if (lines.length > 1) {
      const title = lines[0].replace(/^\d+\.\s*/, '').trim();
      const description = lines[1].trim();
      let productUrl = null;
      let searchTerm = null;
      let linkNotFound = false;

      // 1. Try to extract the Gift Name
      for (const line of lines) {
        if (line.startsWith("**Gift Name:**")) {
          searchTerm = line.replace("**Gift Name:**", "").trim();
          break;
        }
      }

      // 2. If Gift Name is NOT found, then try to extract labeled AmazonSearchKeywords
      if (!searchTerm) {
        for (const line of lines) {
          if (line.startsWith("AmazonSearchKeywords:")) {
            searchTerm = line.substring("AmazonSearchKeywords:".length).trim();
            break;
          }
        }
      }

      // 3. If NEITHER Gift Name nor labeled keywords are found, fall back to extracting from the description
      if (!searchTerm && description) {
        const commonWords = ["a", "an", "the", "is", "are", "for", "with", "and", "of", "in", "on"];
        const potentialKeywords = description.toLowerCase().split(/\s+/).filter(word => word.length > 2 && !commonWords.includes(word));
        if (potentialKeywords.length > 0) {
          searchTerm = potentialKeywords.join(" ");
        }
      }

      // Construct Amazon search URL using the determined search term
      if (searchTerm) {
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        productUrl = amazonSearchTemplate.replace("**SEARCH_TERM**", encodedSearchTerm);
      } else {
        productUrl = "https://www.amazon.in/";
        linkNotFound = true;
      }

      console.log("Extracted searchTerm:", searchTerm);
      console.log("Constructed productUrl:", productUrl);
      console.log("Link Not Found:", linkNotFound);

      recommendations.push({ title, description, productUrl, linkNotFound });
    }
  });
  return recommendations;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});