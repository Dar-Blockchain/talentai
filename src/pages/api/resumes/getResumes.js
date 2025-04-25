// API route handler for getting resumes
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/resume/getResumes${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`, {
      headers: {
        // Forward authorization if available
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding resume retrieval request:', error);
    return res.status(500).json({ error: 'Failed to retrieve resumes' });
  }
} 