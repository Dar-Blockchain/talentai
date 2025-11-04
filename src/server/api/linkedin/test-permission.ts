import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface TestResults {
  token_info: {
    length: number;
    prefix: string;
  };
  tests: any[];
  scope_issue?: boolean;
  recommendation?: string;
  working_format?: string;
}

interface LinkedInProfile {
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  // Add other profile fields as needed
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get token from query params
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing token parameter' });
    }
    
    // This endpoint will check LinkedIn permissions and test different author URN formats
    const results: TestResults = {
      token_info: {
        length: token.toString().length,
        prefix: token.toString().substring(0, 10) + '...'
      },
      tests: []
    };
    
    // Test 1: Check profile access
    try {
      console.log('Testing profile access...');
      const profileRes = await fetch('https://api.linkedin.com/v2/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let profileData: LinkedInProfile | null | string = null;
      if (profileRes.ok) {
        try {
          profileData = await profileRes.json() as LinkedInProfile;
        } catch (e) {
          profileData = "Could not parse profile JSON";
        }
      } else {
        try {
          profileData = await profileRes.text();
        } catch (e) {
          profileData = `HTTP ${profileRes.status}`;
        }
      }
      
      results.tests.push({
        name: 'Profile Access',
        endpoint: '/v2/me',
        status: profileRes.status,
        success: profileRes.ok,
        response: profileData
      });
      
      // If profile request succeeded, get the actual user ID
      const userId = profileRes.ok && 
                    typeof profileData === 'object' && 
                    profileData !== null && 
                    'id' in profileData ? 
                    profileData.id : null;
      
      if (userId) {
        console.log('Got LinkedIn user ID:', userId);
      }
      
      // Test many more author formats
      const postFormats = [
        { name: 'person:{id}', author: userId ? `urn:li:person:${userId}` : 'skipped - no user id' },
        { name: 'person:(id:me)', author: 'urn:li:person:(id:me)' },
        { name: 'person:~', author: 'urn:li:person:~' },
        { name: 'person', author: 'urn:li:person' },
        { name: 'member:{id}', author: userId ? `urn:li:member:${userId}` : 'skipped - no user id' },
        { name: 'member:(id:me)', author: 'urn:li:member:(id:me)' }
      ];
      
      // Only test formats that have a valid value
      const formatsToTest = postFormats.filter(format => !format.author.startsWith('skipped'));
      
      for (const format of formatsToTest) {
        try {
          console.log(`Testing post with ${format.name} format...`);
          
          const testPost = {
            author: format.author,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: 'TEST POST - Permission check only (will be deleted)' },
                shareMediaCategory: 'NONE'
              }
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'CONNECTIONS' } // More restrictive for test
          };
          
          const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(testPost)
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
          
          results.tests.push({
            name: `Post Test (${format.name})`,
            endpoint: '/v2/ugcPosts',
            format: format.author,
            status: postRes.status,
            success: postRes.ok,
            response: responseData
          });
          
          // If this format worked, we can stop testing others
          if (postRes.ok) {
            console.log(`Format ${format.name} worked!`);
            break;
          }
        } catch (error) {
          results.tests.push({
            name: `Post Test (${format.name})`,
            endpoint: '/v2/ugcPosts',
            format: format.author,
            status: 'Network Error',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error) {
      results.tests.push({
        name: 'Profile Access',
        endpoint: '/v2/me',
        status: 'Network Error',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check scopes by examining error messages
    const scopeProblems = results.tests.filter(test => 
      test.status === 403 || 
      (typeof test.response === 'string' && test.response.includes('permission'))
    );
    
    // Find any successful format
    const workingTest = results.tests.find(test => test.success && test.name.startsWith('Post Test'));
    
    if (scopeProblems.length > 0 && !workingTest) {
      results.scope_issue = true;
      results.recommendation = "LinkedIn token doesn't have sufficient permissions. Please re-authorize with w_member_social scope.";
    } else if (workingTest) {
      results.working_format = workingTest.format;
      results.recommendation = "Found a working format! Use this author format for posting.";
    } else {
      results.recommendation = "No working format found. May need LinkedIn API review approval.";
    }
    
    // Return test results
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in test permission endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error during test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 