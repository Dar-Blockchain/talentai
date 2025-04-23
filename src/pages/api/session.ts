import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
// @ts-ignore: no type declarations for assemblyai
import { AssemblyAI } from 'assemblyai';

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
      const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
        form.parse(req, (err:any, fields:any, files:any) => {
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

        // Transcribe using AssemblyAI
        const client = new AssemblyAI({ apiKey: '5dfdc21162fa4f8a9f8ce856546218a4'});
        const transcript = await client.transcripts.transcribe({ audio: tempFilePath });

        // Clean up temp files
        if (fs.existsSync(audioFile.filepath)) fs.unlinkSync(audioFile.filepath);
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

        return res.status(200).json({ text: transcript.text });
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
