import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure we're handling errors at the top level
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Get LinkedIn token from request body instead of cookies
      const { token, pdf, message } = req.body;
      
      console.log('LinkedIn token found?', !!token);
      
      if (!token) {
        return res.status(401).json({ error: 'Not authenticated with LinkedIn' });
      }
      
      if (!pdf) {
        return res.status(400).json({ error: 'Missing PDF data' });
      }

      // Validate PDF data (must be a valid base64 string)
      if (typeof pdf !== 'string') {
        return res.status(400).json({ error: 'PDF data must be a string' });
      }

      try {
        // Test if we can create a buffer from the PDF data
        Buffer.from(pdf, 'base64');
      } catch (e) {
        return res.status(400).json({ error: 'Invalid PDF data format' });
      }
      
      console.log('Starting LinkedIn sharing process...');
      
      // We'll try multiple author URN formats that have worked for different versions of LinkedIn's API
      const authorFormats = [
        "urn:li:person:(id:me)",  // Modern format that works with w_member_social only
        "urn:li:person:~",        // Classic format that works sometimes
        "urn:li:member:(id:me)"   // Another variant that sometimes works
      ];
      
      // Try each author format sequentially
      for (const personURN of authorFormats) {
        try {
          console.log(`Attempting with author format: ${personURN}`);
          
          // 2. Register upload
          console.log('Registering upload with LinkedIn...');
          
          const registerBody = {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-document'],
              owner: personURN,
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }]
            }
          };
          
          const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(registerBody)
          });
          
          if (!registerRes.ok) {
            let registerError;
            try {
              // Try to parse JSON response
              registerError = await registerRes.json();
            } catch (e) {
              // Fallback to text if not valid JSON
              try {
                registerError = await registerRes.text();
              } catch (textError) {
                registerError = `HTTP status ${registerRes.status}`;
              }
            }
            
            console.log(`Register failed with ${personURN} format:`, registerError);
            
            // If this is the last format, throw the error to be caught by the outer try/catch
            if (personURN === authorFormats[authorFormats.length - 1]) {
              console.error('LinkedIn registration failed with all formats:', registerError);
              
              return res.status(registerRes.status || 400).json({ 
                error: 'LinkedIn upload registration failed', 
                details: registerError 
              });
            }
            
            // Otherwise, continue to the next format
            continue;
          }
          
          // Parse register response
          let registerData;
          try {
            registerData = await registerRes.json();
          } catch (parseError) {
            console.error('Error parsing LinkedIn register response:', parseError);
            return res.status(400).json({ 
              error: 'Invalid JSON response from LinkedIn registration API' 
            });
          }
          
          if (!registerData || !registerData.value || !registerData.value.asset) {
            return res.status(400).json({ 
              error: 'Invalid response from LinkedIn registration API',
              response: registerData 
            });
          }
          
          const asset = registerData.value.asset;
          const uploadMechanism = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];
          
          if (!uploadMechanism || !uploadMechanism.uploadUrl) {
            return res.status(400).json({ 
              error: 'Missing upload URL from LinkedIn',
              response: registerData 
            });
          }
          
          const uploadUrl = uploadMechanism.uploadUrl;
          console.log('LinkedIn registration successful, uploading PDF...');
          
          // 3. Upload the PDF - with error handling for buffer creation
          let buffer;
          try {
            buffer = Buffer.from(pdf, 'base64');
          } catch (bufferError) {
            console.error('Error creating buffer from PDF data:', bufferError);
            return res.status(400).json({
              error: 'Could not process PDF data',
              details: bufferError instanceof Error ? bufferError.message : 'Unknown buffer error'
            });
          }
          
          // Check if buffer is valid (not empty)
          if (buffer.length === 0) {
            return res.status(400).json({
              error: 'Empty PDF data received'
            });
          }
          
          // Upload with proper error handling
          let uploadRes;
          try {
            uploadRes = await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/pdf'
              },
              body: buffer
            });
          } catch (uploadError) {
            console.error('Network error uploading PDF to LinkedIn:', uploadError);
            return res.status(500).json({
              error: 'Network error uploading PDF to LinkedIn',
              details: uploadError instanceof Error ? uploadError.message : 'Unknown network error'
            });
          }
          
          if (!uploadRes.ok) {
            let uploadError;
            try {
              uploadError = await uploadRes.json();
            } catch (e) {
              try {
                uploadError = await uploadRes.text();
              } catch (textError) {
                uploadError = `HTTP status ${uploadRes.status}`;
              }
            }
            
            console.error('LinkedIn PDF upload failed:', uploadError);
            return res.status(uploadRes.status || 400).json({ 
              error: 'LinkedIn PDF upload failed', 
              details: uploadError 
            });
          }
          
          console.log('PDF uploaded successfully, creating post...');
          
          // 4. Create a post with the document
          const shareText = message || 'Check out my professional resume created with TalentAI';
          
          const postBody = {
            author: personURN,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: shareText },
                shareMediaCategory: 'DOCUMENT',
                media: [{ 
                  status: 'READY', 
                  description: { text: 'My Professional Resume' }, 
                  media: asset, 
                  title: { text: 'Resume' } 
                }]
              }
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
          };
          
          let postRes;
          try {
            postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
              },
              body: JSON.stringify(postBody)
            });
          } catch (postError) {
            console.error('Network error creating LinkedIn post:', postError);
            return res.status(500).json({
              error: 'Network error creating LinkedIn post',
              details: postError instanceof Error ? postError.message : 'Unknown network error'
            });
          }
          
          if (!postRes.ok) {
            let postError;
            try {
              postError = await postRes.json();
            } catch (e) {
              try {
                postError = await postRes.text();
              } catch (textError) {
                postError = `HTTP status ${postRes.status}`;
              }
            }
            
            console.log(`Post failed with ${personURN} format:`, postError);
            
            if (postRes.status === 403) {
              // If permission error, try the next format
              if (personURN !== authorFormats[authorFormats.length - 1]) {
                continue;
              }
              
              // If this was the last format, return the error
              return res.status(403).json({ 
                error: 'LinkedIn permission error. The w_member_social permission is required.',
                details: postError
              });
            }
            
            return res.status(postRes.status || 400).json({ 
              error: 'LinkedIn post creation failed', 
              details: postError 
            });
          }
          
          // If we reach here, the post succeeded!
          console.log(`LinkedIn resume post created successfully with format: ${personURN}`);
          
          // Parse the response to get the post id
          let postData;
          try {
            postData = await postRes.json();
          } catch (parseError) {
            // If we can't parse the response, still consider it successful
            return res.status(200).json({
              success: true,
              message: 'Your resume has been shared to LinkedIn',
              warning: 'Could not parse post response'
            });
          }
          
          return res.status(200).json({
            success: true,
            message: 'Your resume has been shared to LinkedIn',
            post: postData
          });
        } catch (formatError) {
          console.error(`Error with format ${personURN}:`, formatError);
          // Continue to the next format
        }
      }
      
      // If we've tried all formats and none worked
      return res.status(400).json({
        error: 'LinkedIn sharing failed with all author formats',
        message: 'Please try reconnecting your LinkedIn account'
      });
    } catch (error) {
      console.error('Error in LinkedIn sharing route:', error);
      return res.status(500).json({
        error: 'Error processing LinkedIn share request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (topLevelError) {
    console.error('Top-level error in LinkedIn sharing:', topLevelError);
    return res.status(500).json({
      error: 'Internal server error',
      message: topLevelError instanceof Error ? topLevelError.message : 'Unknown error'
    });
  }
}
