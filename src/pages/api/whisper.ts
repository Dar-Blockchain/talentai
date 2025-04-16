// pages/api/whisper.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Ensure your environment variables are set:
// OPENAI_API_KEY=your_openai_api_key

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const config = {
  api: {
    bodyParser: false
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const form = new IncomingForm();
  
  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ error: 'Error parsing the form data' });
      return;
    }

    // Expect the file uploaded with key 'file'
    const file = files.file?.[0];
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    
    // For newer versions of formidable, the file path might be in file.filepath, fallback to file.path
    const filePath = file.filepath || file.path;

    try {
      const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: fs.createReadStream(filePath),
        language: "en"
      });

      // Clean up the temporary file
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });

      res.status(200).json({ transcript: response.text });
    } catch (error) {
      console.error('Error generating transcription:', error);
      res.status(500).json({ 
        error: 'Error processing transcription', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });
} 