require('dotenv').config();
const { Client, PrivateKey } = require('@hashgraph/sdk');
const { HederaAgentKit } = require('hedera-agent-kit');
const Agenda = require('agenda');
const { calculateSkillMatchScore } = require('./services/matchingService');
const { createAgent, getAgentByName } = require('./services/AgentService');
const Profile = require('./models/ProfileModel');
const Bid = require('./models/BidModel'); // New Bid model
const Topic = require('./models/TopicModel'); // New Topic model
const Post = require('./models/PostModel'); // Added Post model

/**
 * schedulePostMatchingAgenda sets up an agenda job for a new post.
 * @param {string} postId - The id of the post.
 */
async function schedulePostMatchingAgenda(postId) {
  // Operator/MainAgent setup
  const OP_ID = process.env.HEDERA_ACCOUNT_ID;
  const OP_KEY = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  const NETWORK = process.env.HEDERA_NETWORK || 'testnet';
  const operatorClient = Client.forName(NETWORK).setOperator(OP_ID, OP_KEY);

  // Fetch post data from the database to get requiredSkills
  const post = await Post.findById(postId).lean();
  if (!post) {
    console.error(`Post ${postId} not found`);
    return;
  }
  const requiredSkills = post.skillAnalysis?.requiredSkills || [];

  // Create or get post agent
  let postAgent = await getAgentByName(`PostAgent-${postId}`);
  if (!postAgent) {
    postAgent = await createAgent(`PostAgent-${postId}`);
    console.log(`Created post agent for post ${postId}: ${postAgent.accountId}`);
  }

  // Instantiate kits
  const postAgentKit = new HederaAgentKit(postAgent.accountId, postAgent.privkey, postAgent.pubkey, NETWORK);
  
  // Get Main Agent
  const mainAgent = await getAgentByName('Main Agent');
  if (!mainAgent) {
    console.error('Main Agent not found');
    return;
  }
  const mainAgentKit = new HederaAgentKit(mainAgent.accountId, mainAgent.privkey, mainAgent.pubkey, NETWORK);

  // Create or get HCS Topic for this post
  let topic = await Topic.findOne({ postId });
  if (!topic) {
    const creation = await postAgentKit.createTopic(`Auction-${postId}`, false);
    topic = new Topic({
      postId,
      topicId: creation.topicId.toString(),
      createdAt: new Date(),
      status: 'active'
    });
    await topic.save();
    console.log(`Created new topic for post ${postId}: ${topic.topicId}`);
  }

  // Agenda setup
  const agenda = new Agenda({
    db: { address: process.env.MONGODB_URI, collection: 'postAgendaJobs' }
  });

  // Store the highest bid for this post
  let highestBid = null;

  agenda.define('process bids', async job => {
    const { postId, postAgentKit, mainAgentKit } = job.attrs.data;
    
    try {
      // Check if auction should be closed (2 days after first bid)
      const firstBid = await Bid.findOne({ postId }).sort({ createdAt: 1 });
      if (firstBid && new Date() - firstBid.createdAt > 2 * 24 * 60 * 60 * 1000) {
        await closeAuction(postId, mainAgentKit);
        return;
      }

      // Get all bids for this post
      const bids = await Bid.find({ postId, status: 'pending' }).sort({ amount: -1 });
      if (!bids.length) return;

      const currentHighest = bids[0];
      
      // If we have a new highest bid
      if (!highestBid || currentHighest.amount > highestBid.amount) {
        // Skip if the new highest bid is from the same agent
        if (highestBid && currentHighest.bidderId.equals(highestBid.bidderId)) {
          console.log(`Same agent (${currentHighest.bidderId}) remains highest bidder`);
          return;
        }

        // Refund previous highest bid if exists and is from different agent
        if (highestBid && !currentHighest.bidderId.equals(highestBid.bidderId)) {
          await refundBid(highestBid, mainAgentKit);
        }

        // Update highest bid
        highestBid = currentHighest;
        highestBid.status = 'active';
        await highestBid.save();

        console.log(`New highest bid for post ${postId}: ${highestBid.amount} by ${highestBid.bidderId}`);

        // Send HCS message about new highest bid
        const msg = {
          type: 'highest.bid',
          postId,
          bidId: highestBid._id,
          bidderId: highestBid.bidderId,
          amount: highestBid.amount,
          timestamp: new Date().toISOString()
        };
        console.log(JSON.stringify(msg, (key, value) => {
          if (key === 'parent') return; // Skip circular references
          return value;
        }, 2));
        await postAgentKit.submitTopicMessage(topic.topicId, JSON.stringify(msg));
      }
    } catch (error) {
      console.error('Error processing bids:', error);
    }
  });

  agenda.define('post matching', async job => {
    const { postId, requiredSkills, postAgentId } = job.attrs.data;
    console.log(postId);
    // Reconstruct needed objects
    const postAgent = await getAgentByName(`PostAgent-${postId}`);
    const postAgentKit = new HederaAgentKit(postAgent.accountId, postAgent.privkey, postAgent.pubkey, NETWORK);
    
    try {
      // Get all candidate profiles
      const candidates = await Profile.find({ type: 'Candidate' })
        .populate('userId')
        .select('userId skills')
        .lean();

      if (!candidates.length) {
        console.log('No candidates found');
        return;
      }

      // Calculate matches for each candidate
      console.log(requiredSkills);
      const matches = candidates.map(candidate => {
        const score = calculateSkillMatchScore(
          requiredSkills, 
          candidate.skills
        );
        return {
          candidateId: candidate.userId._id,
          accountId: candidate.userId.accountId,
          score,
          skills: candidate.skills
        };
      }).filter(match => match.score > 0);

      // Threshold check
      const threshold = 20;
      const qualified = matches.filter(match => match.score > threshold);
      
      if (!qualified.length) {
        console.log('No qualified candidates');
        return;
      }

      // Get best match
      qualified.sort((a, b) => b.score - a.score);
      const bestMatch = qualified[0];

      // Create bid (amount based on score)
      const bidAmount = Math.floor(bestMatch.score * 100); // Example: score 0.8 = 80 HBAR
      const bid = new Bid({
        postId,
        bidderId: bestMatch.candidateId,
        bidderAccount: bestMatch.accountId,
        amount: bidAmount,
        status: 'pending',
        score: bestMatch.score
      });
      await bid.save();

      // Send HCS message
      const msg = {
        type: 'new.bid',
        postId,
        bidId: bid._id,
        bidderId: bestMatch.candidateId,
        amount: bidAmount,
        timestamp: new Date().toISOString()
      };
      console.log(JSON.stringify(msg, (key, value) => {
        if (key === 'parent') return; // Skip circular references
        return value;
      }, 2));
      await postAgentKit.submitTopicMessage(topic.topicId, JSON.stringify(msg));

      console.log(`New bid created for post ${postId} by ${bestMatch.candidateId} (amount: ${bidAmount})`);

    } catch (error) {
      console.error('Error in matching job:', error);
    }
  });

  // Helper functions
  async function refundBid(bid, mainAgentKit) {
    try {
      const recipients = [{
        accountId: bid.bidderAccount,
        amount: bid.amount
      }];
      
      console.log(`[TOKEN TRANSFER] MainAgent ${mainAgentKit.accountId} -> Agent ${bid.bidderAccount}:`, {
        type: 'refund',
        amount: bid.amount,
        token: process.env.TALENTAI_TOKEN_ID,
        bidId: bid._id
      });
      const result = await mainAgentKit.airdropToken(
        process.env.TALENTAI_TOKEN_ID, 
        recipients
      );
      
      bid.status = 'refunded';
      await bid.save();
      console.log(`Refunded ${bid.amount} tokens to ${bid.bidderId}`, result);
    } catch (error) {
      console.error('Error refunding bid:', error);
      throw error;
    }
  }

  async function closeAuction(postId, mainAgentKit) {
    const topic = await Topic.findOne({ postId });
    if (!topic) return;

    topic.status = 'closed';
    await topic.save();

    // Award to highest bidder
    const winningBid = await Bid.findOne({ postId, status: 'active' });
    if (winningBid) {
      try {
        const recipients = [{
          accountId: winningBid.bidderAccount,
          amount: winningBid.amount
        }];
        
        console.log(`[TOKEN TRANSFER] MainAgent ${mainAgentKit.accountId} -> Winner ${winningBid.bidderAccount}:`, {
          type: 'award',
          amount: winningBid.amount,
          token: process.env.TALENTAI_TOKEN_ID,
          bidId: winningBid._id,
          postId
        });
        const result = await mainAgentKit.airdropToken(
          process.env.TALENTAI_TOKEN_ID,
          recipients
        );
        
        console.log(`Auction for post ${postId} closed. Winner: ${winningBid.bidderId} with ${winningBid.amount} tokens`, result);
      } catch (error) {
        console.error('Error awarding tokens to winner:', error);
      }
    } else {
      console.log(`Auction for post ${postId} closed with no winner`);
    }
  }

  await agenda.start();
  agenda.every('2 minutes', 'post matching', { 
    postId,
    requiredSkills  // Pass only the requiredSkills
  });

  agenda.every('4 minutes', 'process bids', { 
    postId,
    postAgentId: postAgentKit.accountId,
    mainAgentId: mainAgentKit.accountId 
  });
  
  console.log(`Scheduled matching and bid processing for post ${postId}`);
  return { agenda, postAgent, topicId: topic.topicId };
}

module.exports = { schedulePostMatchingAgenda }; 