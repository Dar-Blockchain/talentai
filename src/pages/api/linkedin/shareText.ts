import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure we're handling errors at the top level
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Get LinkedIn token from cookies using cookies-next package
      const linkedInToken = getCookie('linkedin_token', { req, res }) as string | undefined;
      
      console.log('LinkedIn token found?', !!linkedInToken);
      
      if (!linkedInToken) {
        return res.status(401).json({ error: 'Not authenticated with LinkedIn' });
      }
      
      // Get message from the request body
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Missing message text' });
      }

      console.log('Starting LinkedIn text sharing process...');
      
      // Use the simple person URN for current user
      const personURN = 'urn:li:person:~';
      
      // Create a text-only post
      const postBody = {
        author: personURN,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: message },
            shareMediaCategory: 'NONE' // No media, just text
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
      };
      
      console.log('Sending text post to LinkedIn...');
      
      const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${linkedInToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postBody)
      });
      
      console.log('LinkedIn API response status:', postRes.status);
      
      if (!postRes.ok) {
        let postError;
        try {
          postError = await postRes.json();
        } catch (e) {
          try {
            postError = await postRes.text();
          } catch (textError) {
            postError = `HTTP status ${postRes.status}`;
          }
        }
        
        console.error('LinkedIn post creation failed:', postError);
        
        if (postRes.status === 403) {
          return res.status(403).json({ 
            error: 'LinkedIn permission error. The w_member_social permission is required.',
            details: postError
          });
        }
        
        return res.status(postRes.status || 400).json({ 
          error: 'LinkedIn post creation failed', 
          details: postError 
        });
      }
      
      // Parse post response
      let postData;
      try {
        postData = await postRes.json();
      } catch (parseError) {
        console.log('LinkedIn returned success but could not parse response');
        // Even if we can't parse the response, if status is OK, we consider it successful
      }
      
      // Success!
      console.log('LinkedIn text post created successfully!');
      return res.status(200).json({ 
        success: true, 
        message: 'Text shared successfully to LinkedIn!',
        postData
      });
      
    } catch (err) {
      // Catch errors in the sharing process
      console.error('Error in LinkedIn sharing process:', err);
      return res.status(500).json({ 
        error: 'Error sharing to LinkedIn', 
        message: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  } catch (outerError) {
    // Catch any unexpected errors at the top level
    console.error('Unexpected error in shareText endpoint:', outerError);
    return res.status(500).json({ 
      error: 'Unexpected server error', 
      message: outerError instanceof Error ? outerError.message : 'Unknown error'
    });
  }
} 