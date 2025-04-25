// API route handler for resume creation
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Backend requires authentication but no auth token present
    if (!req.headers.authorization) {
      console.log('No authorization token found in request - 401 will likely occur');
      return res.status(401).json({ 
        error: 'You must be logged in to save resumes to the server',
        details: 'The backend requires authentication for resume operations'
      });
    }
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const endpoint = `${backendUrl}/resume/createResume`;
    console.log(`Sending create request to: ${endpoint}`);
    console.log('Request body size:', JSON.stringify(req.body).length, 'bytes');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if available
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
      },
      body: JSON.stringify(req.body),
    });

    // Get response as text first for better error handling
    const responseText = await response.text();
    let data;
    
    try {
      // Try to parse as JSON
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse backend response as JSON:', responseText);
      return res.status(500).json({ 
        error: 'Invalid response from backend', 
        details: responseText.substring(0, 500) // Limit long responses
      });
    }
    
    if (!response.ok) {
      console.error(`Backend response error (${response.status}):`, data);
    }
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding resume creation request:', error);
    return res.status(500).json({ 
      error: 'Failed to save resume',
      details: error.message
    });
  }
}

// Configure API route to handle large requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}; 