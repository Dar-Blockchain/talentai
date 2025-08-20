import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only return this in development mode for security
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  // Return sanitized environment variables
  res.status(200).json({
    hasClientId: !!process.env.LINKEDIN_CLIENT_ID,
    hasClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'Not set',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set',
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set',
    nodeEnv: process.env.NODE_ENV
  });
} 