import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract token from request body or query
    const token = req.body?.token || req.query?.token;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing token parameter' });
    }
    
    // Token format analysis
    const tokenStr = token.toString();
    const tokenLength = tokenStr.length;
    const tokenPrefix = tokenStr.substring(0, 10) + '...';
    
    // Check for common token format issues
    const isValidFormat = /^[A-Za-z0-9\-_]+$/.test(tokenStr);
    const hasSpaces = /\s/.test(tokenStr);
    const hasQuotes = /'|"/.test(tokenStr);
    
    // Format info for response
    const tokenInfo = {
      length: tokenLength,
      prefix: tokenPrefix,
      hasValidFormat: isValidFormat,
      hasSpaces,
      hasQuotes,
      sampleChars: tokenStr.split('').slice(0, 20).map((c: string) => c.charCodeAt(0))
    };
    
    console.log('Testing LinkedIn token with info:', tokenInfo);

    // Now test with LinkedIn's API
    try {
      console.log('Making a test request to LinkedIn API...');
      
      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      
      const testResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      const status = testResponse.status;
      let responseBody;
      
      try {
        responseBody = await testResponse.json();
      } catch {
        try {
          responseBody = await testResponse.text();
        } catch {
          responseBody = `Could not parse response (status: ${status})`;
        }
      }
      
      return res.status(200).json({
        tokenInfo,
        apiTest: {
          status,
          success: testResponse.ok,
          response: responseBody,
          tokenWorks: status === 200,
          errorType: status === 401 ? 'Invalid or expired token' : 
                    status === 403 ? 'Permission issue' : 
                    status >= 500 ? 'LinkedIn server error' : 
                    'Unknown issue'
        }
      });
    } catch (error: any) {
      console.error('Error testing LinkedIn token:', error);
      
      if (error.name === 'AbortError') {
        return res.status(200).json({
          tokenInfo,
          apiTest: {
            status: 'timeout',
            success: false,
            error: 'Request to LinkedIn API timed out',
            recommendation: 'Check your network connection or try again later'
          }
        });
      }
      
      return res.status(200).json({
        tokenInfo,
        apiTest: {
          status: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          recommendation: 'Check your network connection'
        }
      });
    }
  } catch (error) {
    console.error('Unexpected error in token debug endpoint:', error);
    return res.status(500).json({
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 