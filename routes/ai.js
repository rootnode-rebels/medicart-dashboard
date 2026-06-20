const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the AI with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    // Use the Gemini 1.5 Flash model (fast and cost-effective)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Generate the response
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    res.json({ success: true, answer: responseText });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ success: false, error: "Failed to generate AI response" });
  }
});

module.exports = router;
