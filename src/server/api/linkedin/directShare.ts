import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface LinkedInProfile {
  id?: string;
  sub?: string; // OpenID Connect identifier for the user
  localizedFirstName?: string;
  given_name?: string; // OpenID Connect field
  localizedLastName?: string;
  family_name?: string; // OpenID Connect field
  // Add other profile fields as needed
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get token directly from request body instead of cookies
    const { token, message, userId } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing LinkedIn token' });
    }
    
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    console.log('Starting LinkedIn direct sharing process...');
    console.log('Token length:', token.length);
    console.log('Token prefix:', token.substring(0, 10) + '...');
    
    // If user already provided their LinkedIn ID, use it directly
    if (userId) {
      console.log('Using provided LinkedIn user ID:', userId);
      
      try {
        // Create the post with provided user ID
        const authorUrn = `urn:li:person:${userId}`;
        
        console.log('Using author URN with provided ID:', authorUrn);
        
        // Create exact format from LinkedIn docs
        const postBody = {
          author: authorUrn,
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
        
        console.log('Posting to LinkedIn...');
        
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
        let responseData;
        try {
          responseData = await postRes.json();
        } catch {
          try {
            responseData = await postRes.text();
          } catch {
            responseData = `HTTP ${postRes.status}`;
          }
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
        
        // If it failed, go through the normal flow
        console.log('Post with provided ID failed, trying to get user info...');
      } catch (error) {
        console.error('Error using provided user ID:', error);
        // Continue to try other methods
      }
    }
    
    // First try to get the user's ID using the OpenID Connect endpoint
    try {
      console.log('Fetching user profile from OpenID Connect userinfo endpoint...');
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        console.log('LinkedIn API request timed out after 15 seconds');
      }, 15000);
      
      console.log('Making fetch request to LinkedIn OpenID userinfo API...');
      
      try {
        const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal
        });
        
        clearTimeout(timeout); // Clear the timeout if request completes
        
        console.log('LinkedIn userinfo API response received with status:', profileRes.status);
        
        if (!profileRes.ok) {
          console.log('Failed to get LinkedIn profile from userinfo endpoint:', profileRes.status);
          let errorText;
          try {
            errorText = await profileRes.text();
            console.log('Error response body:', errorText);
          } catch (e) {
            errorText = `HTTP status ${profileRes.status}`;
            console.log('Could not read error response body');
          }
          
          // If we couldn't get user info from the OpenID endpoint, fall back to the /me endpoint
          console.log('Trying legacy API endpoint instead...');
          
          const legacyProfileRes = await fetch('https://api.linkedin.com/v2/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Restli-Protocol-Version': '2.0.0'
            }
          });
          
          if (!legacyProfileRes.ok) {
            console.log('Failed to get LinkedIn profile from legacy endpoint:', legacyProfileRes.status);
            
            // If both APIs fail, try the simple method as a last resort
            return res.status(403).json({
              error: 'Failed to get LinkedIn profile. Try using the simple share method.',
              suggestSimpleMethod: true,
              details: `Both userinfo and /me endpoints failed: ${profileRes.status}, ${legacyProfileRes.status}`
            });
          }
          
          // Parse legacy profile response if it succeeded
          const legacyProfileData = await legacyProfileRes.json() as LinkedInProfile;
          const userId = legacyProfileData.id;
          
          if (!userId) {
            console.log('No user ID found in legacy profile data');
            return res.status(400).json({
              error: 'No user ID found in LinkedIn profile',
              details: 'User ID is required for posting'
            });
          }
          
          console.log('Got LinkedIn profile from legacy endpoint - ID:', userId);
          const authorUrn = `urn:li:person:${userId}`;
          console.log('Using author URN with legacy ID:', authorUrn);
          
          // Create post with the legacy ID
          const postBody = {
            author: authorUrn,
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
          
          console.log('Posting to LinkedIn with legacy ID...');
          
          const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(postBody)
          });
          
          let responseData;
          try {
            responseData = await postRes.json();
          } catch {
            try {
              responseData = await postRes.text();
            } catch {
              responseData = `HTTP ${postRes.status}`;
            }
          }
          
          if (postRes.ok) {
            console.log('Successfully posted to LinkedIn with legacy ID!');
            return res.status(200).json({ 
              success: true, 
              message: 'Text shared successfully to LinkedIn!',
              response: responseData
            });
          }
          
          return res.status(postRes.status).json({ 
            error: 'LinkedIn post creation failed', 
            details: responseData
          });
        }
        
        console.log('Profile response from userinfo OK, parsing JSON...');
        const profileData = await profileRes.json() as LinkedInProfile;
        
        // OpenID Connect uses 'sub' field as the identifier
        const userId = profileData.sub;
        
        if (!userId) {
          console.log('No user ID found in OpenID profile data');
          return res.status(400).json({
            error: 'No user ID found in LinkedIn OpenID profile',
            details: 'User ID is required for posting'
          });
        }
        
        console.log('Got LinkedIn profile from OpenID - ID:', userId);
        
        // Create the post exactly as shown in LinkedIn documentation
        const authorUrn = `urn:li:person:${userId}`;
        
        console.log('Using author URN:', authorUrn);
      
        // Create post with OpenID Connect ID
        const postBody = {
          author: authorUrn,
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
        
        console.log('Posting to LinkedIn...');
        
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
        let responseData;
        try {
          responseData = await postRes.json();
        } catch {
          try {
            responseData = await postRes.text();
          } catch {
            responseData = `HTTP ${postRes.status}`;
          }
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
        
        // Handle specific errors
        if (postRes.status === 403) {
          return res.status(403).json({ 
            error: 'LinkedIn permission error. The w_member_social permission is required.',
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
      } catch (fetchError: any) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          console.log('LinkedIn API request was aborted due to timeout');
          return res.status(504).json({
            error: 'LinkedIn API request timed out',
            message: 'Request to LinkedIn API took too long to complete'
          });
        }
        
        console.error('Fetch error during LinkedIn API call:', fetchError);
        return res.status(500).json({
          error: 'Network error when contacting LinkedIn API',
          message: fetchError instanceof Error ? fetchError.message : 'Unknown network error'
        });
      }
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