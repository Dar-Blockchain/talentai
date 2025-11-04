// API route handler for getting resumes
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log basic request information for debugging
    console.log('getResumes API called');
    
    // Check if auth token is present
    if (!req.headers.authorization) {
      console.log('No authorization token in request');
      return res.status(401).json({ message: "Accès non autorisé - Token manquant" });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    console.log(`Forwarding request to ${backendUrl}/resume/getResumes`);
    
    const response = await fetch(`${backendUrl}/resume/getResumes${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`, {
      headers: {
        // Forward authorization if available
        'Authorization': req.headers.authorization
      },
    });

    console.log('Backend response status:', response.status);
    
    if (response.status === 401 || response.status === 403) {
      console.log('Authentication failed with backend');
      return res.status(response.status).json({ message: "Token invalide ou expiré" });
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding resume retrieval request:', error);
    return res.status(500).json({ error: 'Failed to retrieve resumes' });
  }
} 