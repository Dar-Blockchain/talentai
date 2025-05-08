// API route handler for resume operations by ID
export default async function handler(req, res) {
  const { id } = req.query;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  // Validate authorization header
  if (!req.headers.authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization token' });
  }

  try {
    const endpoint = `${backendUrl}/resume/${req.method === 'PUT' ? 'updateResume' : req.method === 'GET' ? 'getResume' : 'deleteResume'}/${id}`;
    
    const response = await fetch(endpoint, {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      },
      body: req.method === 'PUT' ? JSON.stringify(req.body) : undefined
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ 
        error: error.includes('<!DOCTYPE') ? 'Backend error' : error 
      });
    }

    return res.status(200).json(await response.json());
  } catch (error) {
    console.error(`API Error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
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