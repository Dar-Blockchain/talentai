const Post_Steps = require('../models/post_Steps');
const Post = require('../models/PostModel');

class PostStepsService {
  // Créer une nouvelle étape de post (unique ou multiple)
  async createPostStep(postStepData) {
    try {
      // Vérifier si c'est un tableau ou un objet unique
      if (Array.isArray(postStepData)) {
        // Traitement multiple
        const savedPostSteps = [];
        
        for (const stepData of postStepData) {
          // Générer un ID unique si pas déjà présent
          if (!stepData.id) {
            const timestamp = Date.now() + Math.random();
            const nodeType = stepData.data?.type || stepData.type || 'node';
            stepData.id = `${nodeType}_${timestamp}`;
          }

          // S'assurer que le nodeNumber est défini dans data.config
          if (stepData.data?.config) {
            if (!stepData.data.config.nodeNumber) {
              // Récupérer le prochain numéro pour ce post
              const nextNodeResult = await this.getNextNodeNumber(stepData.postId);
              if (nextNodeResult.success) {
                stepData.data.config.nodeNumber = nextNodeResult.data;
              }
            }
          }

          const postStep = new Post_Steps(stepData);
          const savedPostStep = await postStep.save();
          savedPostSteps.push(savedPostStep);
        }
        
        // Mettre à jour le post avec les nouvelles références
        if (savedPostSteps.length > 0) {
          const postId = savedPostSteps[0].postId;
          await this.updatePostWithSteps(postId, savedPostSteps.map(step => step._id));
        }
        
        return { success: true, data: savedPostSteps, count: savedPostSteps.length };
      } else {
        // Traitement unique
        // Générer un ID unique si pas déjà présent
        if (!postStepData.id) {
          const timestamp = Date.now();
          const nodeType = postStepData.data?.type || postStepData.type || 'node';
          postStepData.id = `${nodeType}_${timestamp}`;
        }

        // S'assurer que le nodeNumber est défini dans data.config
        if (postStepData.data?.config) {
          if (!postStepData.data.config.nodeNumber) {
            // Récupérer le prochain numéro pour ce post
            const nextNodeResult = await this.getNextNodeNumber(postStepData.postId);
            if (nextNodeResult.success) {
              postStepData.data.config.nodeNumber = nextNodeResult.data;
            }
          }
        }

        const postStep = new Post_Steps(postStepData);
        const savedPostStep = await postStep.save();
        
        // Mettre à jour le post avec la nouvelle référence
        await this.updatePostWithSteps(savedPostStep.postId, [savedPostStep._id]);
        
        return { success: true, data: savedPostStep, count: 1 };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le post avec les références des post_steps
  async updatePostWithSteps(postId, stepIds) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post non trouvé');
      }

      // Ajouter les nouvelles références sans doublons
      const existingSteps = post.post_Steps || [];
      const newSteps = [...new Set([...existingSteps, ...stepIds])];
      
      post.post_Steps = newSteps;
      await post.save();
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du post:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer les références du post lors de la suppression d'un post_step
  async removeStepFromPost(postId, stepId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post non trouvé');
      }

      // Retirer la référence
      post.post_Steps = post.post_Steps.filter(id => id.toString() !== stepId.toString());
      await post.save();
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la référence:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer toutes les étapes de post
  async getAllPostSteps() {
    try {
      const postSteps = await Post_Steps.find().populate('postId', 'title').sort({ 'data.config.nodeNumber': 1 });
      return { success: true, data: postSteps };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer une étape de post par ID
  async getPostStepById(id) {
    try {
      const postStep = await Post_Steps.findById(id).populate('postId', 'title');
      if (!postStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: postStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer une étape par son ID unique (nodeId)
  async getPostStepByNodeId(nodeId) {
    try {
      const postStep = await Post_Steps.findOne({ id: nodeId }).populate('postId', 'title');
      if (!postStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: postStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les étapes d'un post spécifique
  async getPostStepsByPostId(postId) {
    try {
      const postSteps = await Post_Steps.find({ postId }).populate('postId', 'title').sort({ 'data.config.nodeNumber': 1 });
      return { success: true, data: postSteps };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour une étape de post
  async updatePostStep(id, updateData) {
    try {
      const updatedPostStep = await Post_Steps.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('postId', 'title');
      
      if (!updatedPostStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: updatedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour une étape par son ID unique (nodeId)
  async updatePostStepByNodeId(nodeId, updateData) {
    try {
      const updatedPostStep = await Post_Steps.findOneAndUpdate(
        { id: nodeId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('postId', 'title');
      
      if (!updatedPostStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: updatedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Supprimer une étape de post
  async deletePostStep(id) {
    try {
      const deletedPostStep = await Post_Steps.findByIdAndDelete(id);
      if (!deletedPostStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }

      // Retirer la référence du post
      await this.removeStepFromPost(deletedPostStep.postId, deletedPostStep._id);
      
      return { success: true, data: deletedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Supprimer une étape par son ID unique (nodeId)
  async deletePostStepByNodeId(nodeId) {
    try {
      const deletedPostStep = await Post_Steps.findOneAndDelete({ id: nodeId });
      if (!deletedPostStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }

      // Retirer la référence du post
      await this.removeStepFromPost(deletedPostStep.postId, deletedPostStep._id);
      
      return { success: true, data: deletedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les étapes par type
  async getPostStepsByType(type) {
    try {
      const postSteps = await Post_Steps.find({ 'data.type': type }).populate('postId', 'title').sort({ 'data.config.nodeNumber': 1 });
      return { success: true, data: postSteps };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les étapes par type de nœud (technical, interview, etc.)
  async getPostStepsByNodeType(nodeType) {
    try {
      const postSteps = await Post_Steps.find({ 'data.type': nodeType }).populate('postId', 'title').sort({ 'data.config.nodeNumber': 1 });
      return { success: true, data: postSteps };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour la configuration d'un nœud
  async updateNodeConfig(nodeId, configData) {
    try {
      const updatedPostStep = await Post_Steps.findOneAndUpdate(
        { id: nodeId },
        { 
          'data.config': configData,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('postId', 'title');
      
      if (!updatedPostStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: updatedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour la position d'un nœud
  async updateNodePosition(nodeId, positionData) {
    try {
      const updatedPostStep = await Post_Steps.findOneAndUpdate(
        { id: nodeId },
        { 
          position: positionData.position,
          positionAbsolute: positionData.positionAbsolute,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('postId', 'title');
      
      if (!updatedPostStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: updatedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer le prochain numéro de nœud pour un post
  async getNextNodeNumber(postId) {
    try {
      const lastNode = await Post_Steps.findOne({ postId }).sort({ 'data.config.nodeNumber': -1 });
      return { success: true, data: lastNode ? lastNode.data.config.nodeNumber + 1 : 1 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Créer un nœud avec génération automatique de l'ID et du numéro
  async createNode(postId, nodeData) {
    try {
      // Générer le prochain numéro de nœud
      const nextNodeResult = await this.getNextNodeNumber(postId);
      if (!nextNodeResult.success) {
        return nextNodeResult;
      }

      // Générer un ID unique basé sur le type et le timestamp
      const timestamp = Date.now();
      const nodeType = nodeData.data?.type || 'node';
      const nodeId = `${nodeType}_${timestamp}`;

      // S'assurer que le nodeNumber est défini dans data.config
      if (!nodeData.data) {
        nodeData.data = {};
      }
      if (!nodeData.data.config) {
        nodeData.data.config = {};
      }
      nodeData.data.config.nodeNumber = nextNodeResult.data;

      const newNodeData = {
        ...nodeData,
        id: nodeId,
        postId: postId
      };

      const postStep = new Post_Steps(newNodeData);
      const savedPostStep = await postStep.save();
      
      // Mettre à jour le post avec la nouvelle référence
      await this.updatePostWithSteps(postId, [savedPostStep._id]);
      
      return { success: true, data: savedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sauvegarder plusieurs nœuds en une fois
  async saveMultipleNodes(postId, nodesData) {
    try {
      const nodesToSave = nodesData.map((nodeData, index) => {
        // Générer un ID unique si pas déjà présent
        if (!nodeData.id) {
          const timestamp = Date.now() + index;
          const nodeType = nodeData.data?.type || 'node';
          nodeData.id = `${nodeType}_${timestamp}`;
        }

        // S'assurer que le nodeNumber est défini
        if (nodeData.data?.config) {
          nodeData.data.config.nodeNumber = nodeData.data.config.nodeNumber || (index + 1);
        }

        return {
          ...nodeData,
          postId: postId
        };
      });

      const savedNodes = await Post_Steps.insertMany(nodesToSave);
      
      // Mettre à jour le post avec les nouvelles références
      await this.updatePostWithSteps(postId, savedNodes.map(node => node._id));
      
      return { success: true, data: savedNodes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les nœuds par type spécifique (technical, interview, condition, email)
  async getNodesBySpecificType(postId, nodeType) {
    try {
      const nodes = await Post_Steps.find({ 
        postId, 
        'data.type': nodeType 
      }).populate('postId', 'title').sort({ 'data.config.nodeNumber': 1 });
      
      return { success: true, data: nodes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PostStepsService(); 