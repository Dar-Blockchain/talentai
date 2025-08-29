import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get LinkedIn environment variables
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    
    // Check which variables are set without exposing sensitive values
    const envStatus = {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
      // Show masked versions of the values for debugging
      clientIdPrefix: clientId ? `${clientId.substring(0, 4)}...` : null,
      redirectUri: redirectUri || null,
      nodeEnv: process.env.NODE_ENV || 'not set'
    };
    
    // Return status of environment variables
    return res.status(200).json({ 
      message: 'LinkedIn environment variable status',
      status: envStatus
    });
  } catch (error) {
    console.error('Error checking environment variables:', error);
    return res.status(500).json({ error: 'Failed to check environment variables' });
  }
} 