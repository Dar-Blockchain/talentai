import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get token from query params or cookies
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing token parameter' });
    }
    
    // Redirect to the test-permission endpoint with token
    res.redirect(`/api/linkedin/test-permission?token=${encodeURIComponent(token.toString())}`);
  } catch (error) {
    console.error('Error in diagnose endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 