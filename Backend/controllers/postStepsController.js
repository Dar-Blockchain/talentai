const postStepsService = require('../services/postStepsService');
const candidatePostStepProgressService = require('../services/candidatePostStepProgressService');

class PostStepsController {
  // Créer une nouvelle étape de post (unique ou multiple)
  async createPostStep(req, res) {
    try {
      const result = await postStepsService.createPostStep(req.body);
      
      if (result.success) {
        // Créer des enregistrements dans candidate_Post_Step_Progress pour les nouvelles étapes
        if (result.data && result.data.length > 0) {
          try {
            for (const step of result.data) {
              const progressData = {
                idCandidate: null, // À adapter selon votre logique
                idPost: step.postId,
                status: "pending",
                currentStep: step._id,
                steps: [step._id],
                InterviewDetails: null // À adapter selon votre logique
              };
              
              const progressResult = await candidatePostStepProgressService.createProgress(progressData);
              if (!progressResult.success) {
                console.error(`Erreur lors de la création du progrès pour l'étape ${step._id}:`, progressResult.error);
              }
            }
          } catch (progressError) {
            console.error('Erreur lors de la création des enregistrements de progression:', progressError);
            // Ne pas faire échouer la requête principale pour cette erreur
          }
        }
        
        const isMultiple = Array.isArray(req.body);
        const message = isMultiple 
          ? `${result.count} étapes de post créées avec succès`
          : 'Étape de post créée avec succès';
        
        return res.status(201).json({
          success: true,
          message: message,
          data: result.data,
          count: result.count
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la création de l\'étape de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Créer un nouveau nœud avec génération automatique
  async createNode(req, res) {
    try {
      const { postId } = req.params;
      const nodeData = req.body;
      
      const result = await postStepsService.createNode(postId, nodeData);
      
      if (result.success) {
        return res.status(201).json({
          success: true,
          message: 'Nœud créé avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la création du nœud',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Sauvegarder plusieurs nœuds en une fois
  async saveMultipleNodes(req, res) {
    try {
      const { postId } = req.params;
      const nodesData = req.body;
      
      const result = await postStepsService.saveMultipleNodes(postId, nodesData);
      
      if (result.success) {
        return res.status(201).json({
          success: true,
          message: 'Nœuds sauvegardés avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la sauvegarde des nœuds',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Ajouter des étapes à un post avec postId en paramètre
  async addStepsToPost(req, res) {
    try {
      const { postId } = req.params;
      const stepsData = req.body;
      
      // Ajouter le postId à chaque étape si pas déjà présent
      const stepsWithPostId = Array.isArray(stepsData) 
        ? stepsData.map(step => ({ ...step, postId }))
        : [{ ...stepsData, postId }];
      
      // Traiter chaque étape : créer si elle n'existe pas, mettre à jour si elle existe
      const results = [];
      let createdCount = 0;
      let updatedCount = 0;
      const createdStepIds = []; // Pour stocker les IDs des étapes créées
      
      for (const step of stepsWithPostId) {
        try {
          // Vérifier si l'étape existe déjà par son ID
          const existingStep = await postStepsService.getPostStepByNodeId(step.id);
          
          if (existingStep.success && existingStep.data) {
            // L'étape existe, faire une mise à jour
            const updateResult = await postStepsService.updatePostStepByNodeId(step.id, step);
            if (updateResult.success) {
              results.push(updateResult.data);
              updatedCount++;
            } else {
              throw new Error(`Erreur lors de la mise à jour de l'étape ${step.id}: ${updateResult.error}`);
            }
          } else {
            // L'étape n'existe pas, la créer
            const createResult = await postStepsService.createPostStep([step]);
            if (createResult.success) {
              results.push(createResult.data[0]);
              createdCount++;
              // Stocker l'ID de l'étape créée pour créer l'enregistrement de progression
              createdStepIds.push(createResult.data[0]._id);
            } else {
              throw new Error(`Erreur lors de la création de l'étape ${step.id}: ${createResult.error}`);
            }
          }
        } catch (stepError) {
          throw new Error(`Erreur lors du traitement de l'étape ${step.id}: ${stepError.message}`);
        }
      }
      
      // Créer des enregistrements dans candidate_Post_Step_Progress pour les nouvelles étapes
      if (createdStepIds.length > 0) {
        try {
          // Récupérer tous les candidats qui ont postulé pour ce post
          // Note: Vous devrez adapter cette partie selon votre logique métier
          // Pour l'instant, nous créons un enregistrement générique
          for (const stepId of createdStepIds) {
            const progressData = {
              idCandidate: null, // À adapter selon votre logique
              idPost: postId,
              status: "pending",
              currentStep: stepId,
              steps: [stepId],
              InterviewDetails: null // À adapter selon votre logique
            };
            
            const progressResult = await candidatePostStepProgressService.createProgress(progressData);
            if (!progressResult.success) {
              console.error(`Erreur lors de la création du progrès pour l'étape ${stepId}:`, progressResult.error);
            }
          }
        } catch (progressError) {
          console.error('Erreur lors de la création des enregistrements de progression:', progressError);
          // Ne pas faire échouer la requête principale pour cette erreur
        }
      }
      
      const isMultiple = Array.isArray(stepsData);
      let message = '';
      
      if (isMultiple) {
        if (createdCount > 0 && updatedCount > 0) {
          message = `${createdCount} étapes créées et ${updatedCount} étapes mises à jour avec succès`;
        } else if (createdCount > 0) {
          message = `${createdCount} étapes créées avec succès`;
        } else if (updatedCount > 0) {
          message = `${updatedCount} étapes mises à jour avec succès`;
        }
      } else {
        if (updatedCount > 0) {
          message = 'Étape mise à jour avec succès';
        } else {
          message = 'Étape créée avec succès';
        }
      }
      
      return res.status(200).json({
        success: true,
        message: message,
        data: results,
        count: results.length,
        created: createdCount,
        updated: updatedCount
      });
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer toutes les étapes de post
  async getAllPostSteps(req, res) {
    try {
      const result = await postStepsService.getAllPostSteps();
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étapes de post récupérées avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération des étapes de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer une étape de post par ID
  async getPostStepById(req, res) {
    try {
      const { id } = req.params;
      const result = await postStepsService.getPostStepById(id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post récupérée avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer une étape par son ID unique (nodeId)
  async getPostStepByNodeId(req, res) {
    try {
      const { nodeId } = req.params;
      const result = await postStepsService.getPostStepByNodeId(nodeId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post récupérée avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer les étapes d'un post spécifique
  async getPostStepsByPostId(req, res) {
    try {
      const { postId } = req.params;
      const result = await postStepsService.getPostStepsByPostId(postId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étapes de post récupérées avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération des étapes de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Mettre à jour une étape de post
  async updatePostStep(req, res) {
    try {
      const { id } = req.params;
      const result = await postStepsService.updatePostStep(id, req.body);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post mise à jour avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Mettre à jour une étape par son ID unique (nodeId)
  async updatePostStepByNodeId(req, res) {
    try {
      const { nodeId } = req.params;
      const result = await postStepsService.updatePostStepByNodeId(nodeId, req.body);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post mise à jour avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Mettre à jour la configuration d'un nœud
  async updateNodeConfig(req, res) {
    try {
      const { nodeId } = req.params;
      const configData = req.body;
      
      const result = await postStepsService.updateNodeConfig(nodeId, configData);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Configuration du nœud mise à jour avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Nœud non trouvé',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Mettre à jour la position d'un nœud
  async updateNodePosition(req, res) {
    try {
      const { nodeId } = req.params;
      const positionData = req.body;
      
      const result = await postStepsService.updateNodePosition(nodeId, positionData);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Position du nœud mise à jour avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Nœud non trouvé',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Supprimer une étape de post
  async deletePostStep(req, res) {
    try {
      const { id } = req.params;
      const result = await postStepsService.deletePostStep(id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post supprimée avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Supprimer une étape par son ID unique (nodeId)
  async deletePostStepByNodeId(req, res) {
    try {
      const { nodeId } = req.params;
      const result = await postStepsService.deletePostStepByNodeId(nodeId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post supprimée avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer les étapes par type
  async getPostStepsByType(req, res) {
    try {
      const { type } = req.params;
      const result = await postStepsService.getPostStepsByType(type);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étapes de post récupérées avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération des étapes de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer les nœuds par type spécifique (technical, interview, condition, email)
  async getNodesBySpecificType(req, res) {
    try {
      const { postId, nodeType } = req.params;
      const result = await postStepsService.getNodesBySpecificType(postId, nodeType);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Nœuds récupérés avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération des nœuds',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer le prochain numéro de nœud
  async getNextNodeNumber(req, res) {
    try {
      const { postId } = req.params;
      const result = await postStepsService.getNextNodeNumber(postId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Prochain numéro de nœud récupéré avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération du numéro de nœud',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }
}

module.exports = new PostStepsController(); 