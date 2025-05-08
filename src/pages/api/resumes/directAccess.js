// This is a direct access API that bypasses the backend controller
// and queries MongoDB directly to diagnose issues with resume retrieval
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId } = req.query;
    
    // Validate we have a userId
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    console.log('Direct access API called with userId:', userId);
    
    // Get MongoDB connection string from env or use default
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/talentai";
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const resumesCollection = db.collection('resumes');
    
    // Log the total number of resumes
    const totalCount = await resumesCollection.countDocuments();
    console.log('Total resumes in database:', totalCount);
    
    // Define all the possible query formats we need to try
    const possibleQueries = [
      // Direct userId field
      { userId: userId },
      // userId as ObjectId
      { userId: new ObjectId(userId) },
      // userId in nested object
      { "userId._id": userId },
      // userId in nested object as ObjectId
      { "userId._id": new ObjectId(userId) },
      // _id field direct match
      { _id: userId },
      // _id field as ObjectId
      { _id: new ObjectId(userId) }
    ];
    
    let resumes = [];
    let successQuery = null;
    
    // Try each query format until we find matches
    for (const query of possibleQueries) {
      try {
        const queryResult = await resumesCollection.find(query).toArray();
        console.log(`Query ${JSON.stringify(query)} found ${queryResult.length} resumes`);
        
        if (queryResult.length > 0) {
          resumes = queryResult;
          successQuery = query;
          break;
        }
      } catch (err) {
        console.log(`Error with query ${JSON.stringify(query)}:`, err.message);
      }
    }
    
    // If we still don't have resumes, try a more flexible approach
    if (resumes.length === 0) {
      console.log('No resumes found with standard queries, trying flexible approach');
      
      // Get all resumes and filter
      const allResumes = await resumesCollection.find({}).toArray();
      
      resumes = allResumes.filter(resume => {
        // Check various possible locations of userId
        const checkId = (id) => {
          if (!id) return false;
          
          // Try exact string match
          if (id.toString() === userId) return true;
          
          // Try ObjectId comparison
          try {
            return id.toString() === new ObjectId(userId).toString();
          } catch (e) {
            return false;
          }
        };
        
        // Check direct userId
        if (checkId(resume.userId)) return true;
        
        // Check nested userId._id
        if (resume.userId && checkId(resume.userId._id)) return true;
        
        // Check document _id
        if (checkId(resume._id)) return true;
        
        // Check any string field for userId
        for (const [key, value] of Object.entries(resume)) {
          if (typeof value === 'string' && value === userId) return true;
        }
        
        return false;
      });
    }
    
    // Sort resumes by createdAt (newest first)
    resumes.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
    
    // Log resume IDs for direct access
    if (resumes.length > 0) {
      console.log('Resume IDs found:');
      resumes.forEach(resume => {
        console.log(`- ${resume._id.toString()}`);
      });
    }
    
    // Close the connection
    await client.close();
    console.log('Disconnected from MongoDB');
    
    return res.status(200).json({ 
      total: totalCount,
      found: resumes.length,
      query: successQuery ? JSON.stringify(successQuery) : 'flexible approach',
      resumes: resumes
    });
  } catch (error) {
    console.error('Error in direct access API:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
} 