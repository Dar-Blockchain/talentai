import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract token from request
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing token parameter' });
    }
    
    console.log('Getting LinkedIn user info with token');
    
    try {
      // Get user profile info
      const profileRes = await fetch('https://api.linkedin.com/v2/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check if we could access the user profile
      const profileSuccess = profileRes.ok;
      const profileStatus = profileRes.status;
      
      let profileData = null;
      if (profileSuccess) {
        profileData = await profileRes.json();
      }
      
      // Get info about the token
      const tokenInfo = {
        token_prefix: token.toString().substring(0, 5) + '...',
        token_length: token.toString().length,
      };
      
      // Check if we can get organization info instead
      const canUseOrganizationOption = profileStatus === 403;
      
      const result = {
        tokenInfo,
        profileAccessible: profileSuccess,
        profileStatus,
        profileData,
        canUseOrganizationOption,
        userMessage: profileSuccess 
          ? 'User profile was accessible' 
          : `Could not access user profile (status: ${profileStatus})`,
        recommendation: profileStatus === 403 
          ? 'Profile access is not permitted, but posting may still work using organization URN.' 
          : (profileStatus === 401 
              ? 'Your token appears to be expired or invalid. Please re-authenticate.'
              : 'Check that your LinkedIn app has the required permissions enabled and is authorized for the requested scopes.')
      };
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error getting LinkedIn user info:', error);
      return res.status(500).json({
        error: 'Failed to get LinkedIn user info',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Unexpected error in LinkedIn user info endpoint:', error);
    return res.status(500).json({
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 