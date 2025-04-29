// API route handler for resume operations by ID
export default async function handler(req, res) {
  const { id } = req.query;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    let endpoint;
    
    switch (req.method) {
      case 'GET':
        endpoint = `${backendUrl}/resume/getResume/${id}`;
        break;
      case 'PUT':
        endpoint = `${backendUrl}/resume/updateResume/${id}`;
        console.log('⚠️ PUT DEBUG - Full endpoint:', endpoint);
        console.log('⚠️ PUT DEBUG - Request body size:', JSON.stringify(req.body).length, 'bytes');
        break;
      case 'DELETE':
        endpoint = `${backendUrl}/resume/deleteResume/${id}`;
        break;
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Backend requires authentication but no auth token present
    if (!req.headers.authorization) {
      console.log('No authorization token found in request');
      return res.status(401).json({ message: "Accès non autorisé - Token manquant" });
    }
    
    // Check if token is in correct format
    if (!req.headers.authorization.startsWith('Bearer ')) {
      console.log('Invalid token format');
      return res.status(401).json({ message: "Format de token invalide" });
    }

    console.log(`Sending ${req.method} request to: ${endpoint}`);
    
    // Make the backend request
    const options = {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json',
      },
    };
    
    // Add body for appropriate methods
    if (req.method === 'PUT' || req.method === 'POST') {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(endpoint, options);
    console.log('Backend response status:', response.status);
    
    // Get response as text for better error handling
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
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error(`Error in ${req.method} resume API:`, error);
    return res.status(500).json({ 
      error: `Failed to ${req.method === 'GET' ? 'get' : req.method === 'PUT' ? 'update' : 'delete'} resume`,
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