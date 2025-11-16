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

      const apiKey = process.env.ASSEMBLYAI_API_KEY!;
      console.log('🔑 V3 Token Request via SDK:');
      console.log('  - API Key:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'MISSING!');

      const client = new AssemblyAI({
        apiKey: apiKey,
      });

      try {
        const token = await client.streaming.createTemporaryToken({
          expires_in_seconds: 600, // 10 minutes
          max_session_duration_seconds: 10800, // 3 hours
        });

        console.log('✅ V3 Token Generated Successfully via SDK:');
        console.log('  - Token present?:', !!token);
        console.log('  - Token length:', token?.length || 0);

        return res.status(200).json({ token });
      } catch (tokenError) {
        console.error('❌ V3 Token Generation FAILED:', tokenError);
        throw new Error(`Failed to generate V3 token: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}`);
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
