import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

// Define the LinkedIn profile response type
interface LinkedInProfileResponse {
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get token directly from request body
    const { token, message } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing LinkedIn token' });
    }
    
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    console.log('Starting LinkedIn simple sharing process...');
    console.log('Token length:', token.length);
    console.log('Token prefix:', token.substring(0, 10) + '...');
    
    try {
      // Create post body with person URN format
      const postBody = {
        author: "urn:li:person:me",  // Use 'me' instead of an ID or tilde
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: message
            },
            shareMediaCategory: "NONE"
          }
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
      };
      
      console.log('Posting to LinkedIn with person:me URN...');
      
      const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postBody)
      });
      
      console.log('LinkedIn API response status:', postRes.status);
      
      // Parse response
      let responseText: string;
      let responseData: any;
      
      try {
        responseText = await postRes.text();
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }
      } catch {
        responseData = `HTTP ${postRes.status}`;
        responseText = responseData.toString();
      }
      
      // If successful, return success
      if (postRes.ok) {
        console.log('Successfully posted to LinkedIn!');
        return res.status(200).json({ 
          success: true, 
          message: 'Text shared successfully to LinkedIn!',
          response: responseData
        });
      }
      
      // If we get errors with person URN, try with member URN
      if ((postRes.status === 422 || postRes.status === 403) && 
          (responseText.includes('does not match') || responseText.includes('ACCESS_DENIED'))) {
        console.log('Trying alternate URN format with member prefix...');
        
        // Try with member URN
        const memberPostBody = {
          ...postBody,
          author: "urn:li:member:me"  // Use 'me' instead of an ID or tilde
        };
        
        const retryRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify(memberPostBody)
        });
        
        let retryText: string = "";
        let retryData: any;
        
        try {
          retryText = await retryRes.text();
          try {
            retryData = JSON.parse(retryText);
          } catch {
            retryData = retryText;
          }
        } catch {
          retryData = `HTTP ${retryRes.status}`;
        }
        
        if (retryRes.ok) {
          console.log('Successfully posted with member URN format!');
          return res.status(200).json({ 
            success: true, 
            message: 'Text shared successfully to LinkedIn!',
            response: retryData
          });
        }
        
        // If still not working, try with organization URN if it looks like a company token
        if ((retryRes.status === 422 || retryRes.status === 403) && 
            (retryText.includes('does not match') || retryText.includes('ACCESS_DENIED'))) {
          console.log('Trying organization URN format...');
          
          // Try with organization URN
          const orgPostBody = {
            ...postBody,
            author: "urn:li:organization:me" // Try with organization
          };
          
          const orgRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(orgPostBody)
          });
          
          let orgData: any;
          
          try {
            const orgText = await orgRes.text();
            try {
              orgData = JSON.parse(orgText);
            } catch {
              orgData = orgText;
            }
          } catch {
            orgData = `HTTP ${orgRes.status}`;
          }
          
          if (orgRes.ok) {
            console.log('Successfully posted with organization URN format!');
            return res.status(200).json({ 
              success: true, 
              message: 'Text shared successfully to LinkedIn!',
              response: orgData
            });
          }
          
          // If all URN types failed, return both error responses
          return res.status(422).json({
            error: 'LinkedIn post creation failed with all URN formats',
            personError: responseData,
            memberError: retryData,
            organizationError: orgData
          });
        }
        
        // Return member URN error if that also failed
        return res.status(retryRes.status || 500).json({
          error: 'LinkedIn post creation failed with both person and member URNs',
          personError: responseData,
          memberError: retryData
        });
      }
      
      // Handle specific errors
      if (postRes.status === 403) {
        return res.status(403).json({ 
          error: 'LinkedIn permission error. Make sure you have w_member_social scope.',
          details: responseData
        });
      }
      
      if (postRes.status === 401) {
        return res.status(401).json({
          error: 'LinkedIn token is invalid or expired',
          details: responseData
        });
      }
      
      return res.status(postRes.status || 500).json({ 
        error: 'LinkedIn post creation failed', 
        details: responseData
      });
    } catch (error) {
      console.error('Error in LinkedIn share process:', error);
      return res.status(500).json({ 
        error: 'Error sharing to LinkedIn', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error in direct LinkedIn sharing:', error);
    return res.status(500).json({ 
      error: 'Error sharing to LinkedIn', 
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 