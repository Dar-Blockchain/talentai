const { OAuth2Client } = require("google-auth-library"); 

// Initialisation du client OAuth2 avec ton Client ID Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


module.exports.GetGmailByToken = async (id_token) => {

    // Verify token with Google API
    const ticket = await client.verifyIdToken({
      idToken: id_token, // Verify received token
      audience: process.env.GOOGLE_CLIENT_ID, // Ton Client ID Google
    });
  
    // Extract user information from the validated token
    const payload = ticket.getPayload();
    const email = payload.email;
  
    return email;
  };
  