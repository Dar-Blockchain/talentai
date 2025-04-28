/**
 * API Utility functions for making backend calls
 */

/**
 * Regenerates text using the AI
 * @param text The text to regenerate
 * @param token The authentication token
 * @param block The block to regenerate (bio, experience, skills, education, projects)
 * @returns The regenerated text or null if failed
 */
export const regenerateText = async (text: string, token?: string, block: string = 'bio'): Promise<string | null> => {
  try {
    // Use provided token or try to get it from storage
    const authToken = token || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
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