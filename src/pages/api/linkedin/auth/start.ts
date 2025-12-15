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
    
    // Request both posting and profile reading permissions
    // openid + profile: Modern OpenID Connect scopes for user profile access
    // w_member_social: Required for posting on behalf of user
    // r_liteprofile: Legacy scope for backward compatibility
    // LinkedIn will grant whatever scopes the app has access to
    const scope = 'openid profile w_member_social r_liteprofile';

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2);

    console.log('Redirecting to LinkedIn OAuth with scopes:', scope);

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
