import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Handle temporary token generation for streaming
    if (req.method === 'POST' && req.body.action === 'generate_token') {
      console.log('🔑 Generating AssemblyAI streaming token...');

      // Get API key from environment
      const apiKey = process.env.ASSEMBLYAI_API_KEY;

      if (!apiKey) {
        console.error('❌ ASSEMBLYAI_API_KEY not found in environment variables');
        return res.status(500).json({
          error: 'Server configuration error',
          details: 'AssemblyAI API key is not configured. Please set ASSEMBLYAI_API_KEY in .env.local',
        });
      }

      // Validate API key format
      console.log('📋 API Key Info:');
      console.log('  - Length:', apiKey.length);
      console.log('  - Preview:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
      console.log('  - Starts with 5?', apiKey.startsWith('5'));

      if (!apiKey.startsWith('5')) {
        console.error('❌ Invalid API key format - AssemblyAI keys must start with "5"');
        return res.status(500).json({
          error: 'Invalid API key format',
          details: 'AssemblyAI API keys must start with the character "5"',
        });
      }

      if (apiKey.length < 30) {
        console.error('❌ Invalid API key length - too short');
        return res.status(500).json({
          error: 'Invalid API key format',
          details: 'AssemblyAI API key appears to be too short',
        });
      }

      try {
        // Import AssemblyAI SDK
        const { AssemblyAI } = await import('assemblyai');
        console.log('✅ AssemblyAI SDK loaded successfully');

        // Create client
        const client = new AssemblyAI({
          apiKey: apiKey,
        });

        console.log('🔐 Requesting temporary token from AssemblyAI...');

        // Generate temporary token for streaming
        const token = await client.realtime.createTemporaryToken({
          expires_in: 3600, // 1 hour
        });

        if (!token) {
          throw new Error('No token returned from AssemblyAI');
        }

        console.log('✅ Token generated successfully!');
        console.log('  - Token length:', token.length);
        console.log('  - Token preview:', `${token.substring(0, 20)}...${token.substring(token.length - 10)}`);

        return res.status(200).json({
          token,
          success: true
        });

      } catch (sdkError: any) {
        console.error('❌ AssemblyAI SDK Error:', {
          name: sdkError?.name,
          message: sdkError?.message,
          status: sdkError?.status,
          code: sdkError?.code,
        });

        // Check for specific error types
        if (sdkError?.status === 401 || sdkError?.message?.includes('401')) {
          return res.status(401).json({
            error: 'Authentication failed',
            details: 'Invalid AssemblyAI API key. Please check your API key at https://www.assemblyai.com/app',
          });
        }

        if (sdkError?.status === 403 || sdkError?.message?.includes('403')) {
          return res.status(403).json({
            error: 'Access denied',
            details: 'Your AssemblyAI account may not have access to streaming. Please check your account status.',
          });
        }

        if (sdkError?.status === 429 || sdkError?.message?.includes('429')) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            details: 'Too many requests. Please wait a moment and try again.',
          });
        }

        return res.status(500).json({
          error: 'Failed to generate streaming token',
          details: sdkError?.message || 'Unknown error occurred',
        });
      }
    }

    // Handle session status check (GET)
    if (req.method === 'GET') {
      return res.status(200).json({
        status: 'ready',
        message: 'Session API ready for streaming transcription',
      });
    }

    return res.status(405).json({
      error: 'Method not allowed',
      allowed: ['GET', 'POST']
    });

  } catch (error: any) {
    console.error('❌ Unexpected error in session API:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error?.message || 'Unknown error',
    });
  }
}
