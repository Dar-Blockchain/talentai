import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput, currentSections } = req.body;

  // Validate input
  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).json({ error: 'Invalid user input' });
  }

  // Get API key from environment (server-side only)
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    console.error('TOGETHER_API_KEY not found in environment variables');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  try {
    const systemPrompt = `You are a professional resume writer AI assistant. Your task is to help users create professional resume sections based on their input.

Analyze the user's input and determine what type of resume section they want to create. Then generate appropriate content in a structured format.

Respond with a JSON object containing:
{
  "sectionType": "experience|education|skills|summary|projects|custom",
  "title": "Section Title",
  "content": "Formatted content for the section",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "metadata": {
    "company": "if applicable",
    "position": "if applicable",
    "institution": "if applicable",
    "degree": "if applicable",
    "dates": "if applicable",
    "location": "if applicable",
    "technologies": "if applicable (array of strings)",
    "link": "if applicable"
  }
}

Guidelines:
- For experience sections, format as professional bullet points highlighting achievements
- For education sections, include institution, degree, graduation date, and relevant details
- For skills sections, categorize skills appropriately (technical, soft skills, languages, etc.)
- For summaries, write 2-3 professional sentences that highlight key qualifications
- For projects, include description, technologies used, and impact
- Make all content professional, concise, and ATS-friendly
- Use action verbs and quantify achievements where possible
- Ensure content is relevant to modern job market expectations

Current sections in resume: ${currentSections?.join(', ') || 'none'}`;

    const response = await axios.post('https://api.together.xyz/v1/chat/completions', {
      model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userInput
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const botResponse = response.data.choices[0].message.content;
    
    try {
      // Try to parse as JSON first
      const jsonMatch = botResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sectionData = JSON.parse(jsonMatch[0]);
        return res.status(200).json({ success: true, data: sectionData });
      }
    } catch (parseError) {
      console.log('Failed to parse JSON response, returning structured fallback');
    }
    
    // Fallback to structured response
    const fallbackData = {
      sectionType: "custom",
      title: "Generated Section",
      content: botResponse,
      suggestions: ["Edit this section", "Add more details", "Create another section"],
      metadata: {}
    };

    return res.status(200).json({ success: true, data: fallbackData });

  } catch (error: any) {
    console.error('Together AI API Error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to generate resume section';
    
    if (error.response?.status === 401) {
      errorMessage = 'Invalid API key configuration';
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later';
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid request parameters';
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 