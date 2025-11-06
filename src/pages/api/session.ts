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
          expires_in: 1800, // 30 minutes
          // Enable all accuracy features for global accent recognition
          disable_partial_transcripts: false,
          enable_extra_session_information: true,
          
          // Enhanced accent recognition settings for all global accents
          language_detection: true,      // Auto-detect languages and code-switching
          accent_detection: true,         // Detect and adapt to various accents
          punctuate: true,                // Add punctuation for better context
          format_text: true,              // Format text with proper capitalization
          speaker_labels: false,          // Not needed for single-speaker interviews
          
          // Advanced settings for better non-native speaker understanding
          word_boost: true,               // Boost custom vocabulary and technical terms
          boost_param: 'high',            // High accuracy boost for non-native speakers
          filter_profanity: false,        // Don't filter any words (technical terms might be flagged)
          redact_pii: false,              // Don't redact personal info for better context understanding
          
          // Audio quality optimization
          audio_start_from: 0,            // Process from beginning
          audio_end_at: null,             // Process entire audio stream
          
          // Enhanced processing for accented speech
          disfluencies: true,             // Capture filler words (um, uh) - natural for non-native speakers
          multichannel: false,            // Single channel (mono) audio
          dual_channel: false             // Not using dual channel
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
