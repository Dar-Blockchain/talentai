const { OAuth2Client } = require("google-auth-library"); 

// Initialisation du client OAuth2 avec ton Client ID Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


module.exports.GetGmailByToken = async (id_token) => {

    // Vérifier le token avec l'API Google
    const ticket = await client.verifyIdToken({
      idToken: id_token, // Vérifier le token reçu
      audience: process.env.GOOGLE_CLIENT_ID, // Ton Client ID Google
    });
  
    // Extraire les informations de l'utilisateur depuis le token validé
    const payload = ticket.getPayload();
    const email = payload.email;
  
    return email;
  };
  