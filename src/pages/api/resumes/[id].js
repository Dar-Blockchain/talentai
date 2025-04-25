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
      console.log('No authorization token found in request - 401 will likely occur');
      return res.status(401).json({ 
        error: 'You must be logged in to save resumes to the server',
        details: 'The backend requires authentication for resume operations'
      });
    }
    
    console.log(`Sending ${req.method} request to: ${endpoint}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    // Make the request to the backend
    try {
      const response = await fetch(endpoint, {
        method: req.method,
        headers: {
          ...(req.method !== 'GET' && { 'Content-Type': 'application/json' }),
          // Forward authorization if available
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
        ...(req.method !== 'GET' && { body: JSON.stringify(req.body) }),
      });

      // Get response as text first
      const responseText = await response.text();
      console.log(`Backend response status: ${response.status}`);
      console.log(`Backend response text: ${responseText}`);
      
      // Try to parse the response as JSON, but don't fail if it's not valid JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse backend response as JSON:', responseText);
        return res.status(response.status).send(responseText);
      }
      
      if (!response.ok) {
        console.error(`Backend error: ${response.status}`, data);
      }
      
      return res.status(response.status).json(data);
    } catch (fetchError) {
      console.error('Error contacting backend server:', fetchError);
      return res.status(500).json({ 
        error: 'Error connecting to backend service',
        details: fetchError.message
      });
    }
  } catch (error) {
    console.error(`Error in API route handler:`, error);
    return res.status(500).json({ 
      error: `Failed to handle ${req.method.toLowerCase()} request`,
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