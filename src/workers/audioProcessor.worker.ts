import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

self.onmessage = async (e) => {
  if (e.data.type === 'process') {
    try {
      const audioBlob = new Blob([e.data.audio], { type: 'audio/webm' });
      const file = new File([audioBlob], 'recording.webm');
      
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        response_format: 'json',
      });

      self.postMessage({
        type: 'transcription',
        text: transcription.text,
      });
    } catch (error) {
      console.error('Worker processing error:', error);
    }
  }
};

export default {} as typeof Worker & { new (): Worker };
