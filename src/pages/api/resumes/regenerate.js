import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session to validate authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get prompt from request body
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Forward request to backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/regenerate`;
    
    // Get the token either from session or from the request headers
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({ prompt }),
    });

    // Get response data
    const data = await response.json();
    
    // Return response
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Error in regenerate API route:', error);
    return res.status(500).json({ error: 'Server error' });
  }
} 