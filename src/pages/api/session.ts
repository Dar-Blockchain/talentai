import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import type { Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 1) Handle session initialization (GET)
    if (req.method === 'GET') {
      // Return any session info you need here
      return res.status(200).json({
        status: 'ready',
        message: 'Session ready to accept audio data',
      });
    }

    // 2) Handle audio processing (POST)
    if (req.method === 'POST') {
      const form = new IncomingForm();

      const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
        form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
          if (err) return reject(err);
          resolve([fields, files]);
        });
      });

      const audio = files.audio;
      // Some versions of formidable return arrays, some a single file
      const audioFile = Array.isArray(audio) ? audio[0] : audio;

      if (!audioFile) {
        return res.status(400).json({ error: 'No audio file received' });
      }

      try {
        // Read raw data
        const fileBuffer = fs.readFileSync(audioFile.filepath);
        if (fileBuffer.length < 100) {
          return res.status(400).json({ error: 'Audio file too small' });
        }

        // Ensure temp directory exists
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }

        const tempFilePath = path.join(tempDir, `audio_${Date.now()}.webm`);
        fs.writeFileSync(tempFilePath, fileBuffer);

        // Send file to OpenAI Whisper
        const formData = new FormData();
        formData.append(
          'file',
          new Blob([fileBuffer], { type: 'audio/webm' }),
          'recording.webm'
        );
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');
        formData.append('language', 'en');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY || ''}`,
          },
          body: formData,
        });

        // Clean up temp files
        if (fs.existsSync(audioFile.filepath)) {
          fs.unlinkSync(audioFile.filepath);
        }
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        if (!response.ok) {
          const error = await response.json();
          console.error('OpenAI API error:', error);
          return res.status(response.status).json(error);
        }

        const data = await response.json();
        return res.status(200).json({ text: data.text });
      } catch (error) {
        console.error('Processing error:', error);
        return res.status(500).json({
          error: 'Processing failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // If any other method is used:
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
