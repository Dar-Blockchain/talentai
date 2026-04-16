// Middleware to block requests coming from Postman
function blockPostmanRequests(req, res, next) {
  const userAgent = req.get('User-Agent');

  // Check if User-Agent contains "Postman"
  if (userAgent && userAgent.toLowerCase().includes('postman')) {
    return res.status(403).json({ error: 'Request blocked: Postman detected' });
  }

  // If it's not a Postman request, continue
  next();
}

module.exports = blockPostmanRequests;
