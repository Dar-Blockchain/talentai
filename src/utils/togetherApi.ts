import axios from 'axios';

export interface TogetherAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class TogetherAI {
  private apiKey: string;
  private baseUrl: string = 'https://api.together.xyz/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || this.getApiKey();
    if (!this.apiKey) {
      throw new Error('Together AI API key not found. Please set NEXT_PUBLIC_TOGETHER_API_KEY or store it in localStorage as "together_api_key"');
    }
  }

  private getApiKey(): string {
    // Try environment variable first
    if (process.env.NEXT_PUBLIC_TOGETHER_API_KEY) {
      return process.env.NEXT_PUBLIC_TOGETHER_API_KEY;
    }
    
    // Fallback to localStorage (browser only)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('together_api_key') || '';
    }
    
    return '';
  }

  async chatCompletion(
    messages: ChatMessage[],
    model: string = 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
    options: {
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      stream?: boolean;
    } = {}
  ): Promise<TogetherAIResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model,
        messages,
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        stream: options.stream || false,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Together AI API Error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Together AI credentials.');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your input parameters.');
      }
      
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async generateResumeSection(userInput: string, currentSections: string[] = []): Promise<any> {
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

Current sections in resume: ${currentSections.join(', ')}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userInput
      }
    ];

    const response = await this.chatCompletion(messages, 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free', {
      max_tokens: 1000,
      temperature: 0.7
    });

    const botResponse = response.choices[0].message.content;
    
    try {
      // Try to parse as JSON first
      const jsonMatch = botResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sectionData = JSON.parse(jsonMatch[0]);
        return sectionData;
      }
    } catch (e) {
      console.log('Failed to parse JSON response, returning structured fallback');
    }
    
    // Fallback to structured response
    return {
      sectionType: "custom",
      title: "Generated Section",
      content: botResponse,
      suggestions: ["Edit this section", "Add more details", "Create another section"],
      metadata: {}
    };
  }

  // Test the API connection
  async testConnection(): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Hello, please respond with "API connection successful"'
        }
      ];

      const response = await this.chatCompletion(testMessages, 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free', {
        max_tokens: 50,
        temperature: 0.1
      });

      return response.choices.length > 0;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const togetherAI = new TogetherAI();

// Export utility functions
export const testTogetherAI = () => togetherAI.testConnection();
export const generateResumeSection = (userInput: string, currentSections: string[] = []) => 
  togetherAI.generateResumeSection(userInput, currentSections); 