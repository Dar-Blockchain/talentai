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
      const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
        method: 'POST',
        headers: {
          'Authorization': process.env.ASSEMBLYAI_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expires_in: 1800 // 30 minutes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate temporary token');
      }

      const { token } = await response.json();
      return res.status(200).json({ token });
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
