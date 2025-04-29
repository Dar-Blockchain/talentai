/**
 * API Utility functions for making backend calls
 */

/**
 * Regenerates text using the AI
 * @param text The text to regenerate
 * @param token The authentication token (optional, will try to get from localStorage)
 * @param block The block to regenerate (bio, experience, skills, education, projects)
 * @returns The regenerated text or null if failed
 */
export const regenerateText = async (text: string, token?: string, block: string = 'bio'): Promise<string | null> => {
  try {
    // Try to get token from localStorage first, then use provided token as fallback
    const authToken = localStorage.getItem('api_token') || token;
    
    if (!authToken) {
      console.error('No authentication token found');
      return null;
    }
    
    // Call the backend API
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const apiUrl = `${baseUrl}/resume/regenerate`.replace(/([^:]\/)\/+/g, "$1");
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ 
        block: block, 
        content: text 
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.content || null;
    
  } catch (error) {
    console.error('Error calling regenerate API:', error);
    return null;
  }
}; 