// Middleware pour bloquer les requêtes venant de Postman
function blockPostmanRequests(req, res, next) {
    const userAgent = req.get('User-Agent');
  
    // Vérifie si le User-Agent contient "Postman"
    if (userAgent && userAgent.toLowerCase().includes('postman')) {
      return res.status(403).json({ error: 'Requête bloquée, Postman détecté' });
    }
  
    // Si ce n'est pas une requête venant de Postman, on continue
    next();
  }
  
  module.exports = blockPostmanRequests;
  