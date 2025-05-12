import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code, error, error_description } = req.query;
    
    console.log('LinkedIn callback received:', { 
      hasCode: !!code, 
      error, 
      error_description 
    });
    
    // Enhanced error reporting for scope errors
    if (error) {
      console.error('LinkedIn OAuth error:', { error, error_description });
      
      // Check if it's a scope-related error and redirect with appropriate error flag
      if (error === 'unauthorized_scope_error') {
        return res.redirect('/resume-builder?linkedin=scope_error&error=' + encodeURIComponent(error_description as string));
      }
      
      return res.status(400).json({ 
        error: `LinkedIn OAuth error: ${error}`,
        description: error_description || ''
      });
    }
    
    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    // Ensure environment variables are set
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('LinkedIn OAuth requires LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI env variables');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing environment variables' 
      });
    }

    console.log('Exchanging code for token...');
    // Create params for token exchange
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    // Exchange authorization code for access token using node-fetch
    try {
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      console.log('Token response status:', tokenResponse.status);
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('LinkedIn token exchange failed:', errorText);
        return res.status(400).json({ 
          error: 'Token exchange failed',
          details: errorText
        });
      }

      const tokenData = await tokenResponse.json() as TokenResponse;
      console.log('Token received, has access_token:', !!tokenData.access_token);
      
      // Check if we got a token
      if (!tokenData.access_token) {
        console.error('No access token in LinkedIn response:', tokenData);
        return res.status(400).json({ 
          error: 'No access token received from LinkedIn' 
        });
      }
      
      // Properly encode the token for URL inclusion
      const token = encodeURIComponent(tokenData.access_token);
      console.log('Redirecting with token in URL (length: ' + tokenData.access_token.length + ')...');
      
      // Redirect to auth-success page with token in URL
      return res.redirect(`/auth-success?token=${token}`);
    } catch (fetchError) {
      console.error('Error fetching LinkedIn token:', fetchError);
      return res.status(500).json({
        error: 'Network error getting LinkedIn token',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown network error'
      });
    }
  } catch (error) {
    console.error('Error in LinkedIn callback:', error);
    
    return res.status(500).json({
      error: 'Internal server error during authentication',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
