import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests for testing
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment (server-side only)
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      success: false, 
      error: 'TOGETHER_API_KEY not found in environment variables',
      hint: 'Make sure TOGETHER_API_KEY is set in your .env file'
    });
  }

  try {
    // Test the API with a simple request
    const response = await axios.post('https://api.together.xyz/v1/chat/completions', {
      model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
      messages: [
        {
          role: "user",
          content: "Hello, please respond with 'API connection successful'"
        }
      ],
      max_tokens: 20,
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const botResponse = response.data.choices[0].message.content;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Together AI connection successful',
      response: botResponse,
      model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free'
    });

  } catch (error: any) {
    console.error('Together AI Test Error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to connect to Together AI';
    let statusCode = 500;
    
    if (error.response?.status === 401) {
      errorMessage = 'Invalid API key - check your TOGETHER_API_KEY in .env';
      statusCode = 401;
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded';
      statusCode = 429;
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid request to Together AI';
      statusCode = 400;
    }
    
    return res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.response?.data || error.message : undefined
    });
  }
} 