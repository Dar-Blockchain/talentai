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
    // Handle temporary token generation for streaming (V3)
    if (req.method === 'POST' && req.body.action === 'generate_token') {
      const { AssemblyAI } = await import('assemblyai');

      // Validate API key presence
      const apiKey = process.env.ASSEMBLYAI_API_KEY;
      if (!apiKey) {
        console.error('❌ ASSEMBLYAI_API_KEY environment variable is not set');
        return res.status(500).json({
          error: 'Server configuration error',
          details: 'AssemblyAI API key is not configured',
        });
      }

      console.log('🔑 V3 Token Request via SDK:');
      console.log('  - API Key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
      console.log('  - SDK Version: 4.19.0');

      const client = new AssemblyAI({
        apiKey: apiKey,
      });

      try {
        // Only use required parameter to maximize compatibility
        const token = await client.streaming.createTemporaryToken({
          expires_in_seconds: 600, // 10 minutes
        });

        console.log('✅ V3 Token Generated Successfully via SDK:');
        console.log('  - Token present?:', !!token);
        console.log('  - Token length:', token?.length || 0);

        return res.status(200).json({ token });
      } catch (tokenError) {
        console.error('❌ V3 Token Generation FAILED:', tokenError);
        console.error('  - Error type:', tokenError instanceof Error ? tokenError.constructor.name : typeof tokenError);
        console.error('  - Error message:', tokenError instanceof Error ? tokenError.message : String(tokenError));
        console.error('  - Error stack:', tokenError instanceof Error ? tokenError.stack : 'N/A');

        return res.status(500).json({
          error: 'Failed to generate streaming token',
          details: tokenError instanceof Error ? tokenError.message : 'Unknown error',
        });
      }
    }

    // Handle session status check (GET)
    if (req.method === 'GET') {
      return res.status(200).json({
        status: 'ready',
        message: 'Session ready for streaming transcription',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
