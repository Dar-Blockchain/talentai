import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    
    console.log('Starting LinkedIn OAuth flow...');
    
    // Check if environment variables are available
    if (!clientId || !redirectUri) {
      console.error('Missing LinkedIn credentials:', { 
        hasClientId: !!clientId, 
        hasRedirectUri: !!redirectUri 
      });
      return res.status(500).json({ error: 'Server configuration error: LinkedIn credentials not found' });
    }
    
    // Request OpenID Connect scopes for profile info along with w_member_social for posting
    // This is the new LinkedIn authentication method using OpenID Connect
    const scope = 'w_member_social openid profile';
    
    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2);
    
    console.log('Redirecting to LinkedIn OAuth with scope:', scope);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
    });

    res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
  } catch (error) {
    console.error('Error starting LinkedIn OAuth flow:', error);
    res.status(500).json({ error: 'Failed to start LinkedIn authorization' });
  }
}
