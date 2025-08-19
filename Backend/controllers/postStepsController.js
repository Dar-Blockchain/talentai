const postStepsService = require('../services/postStepsService');

// Créer une nouvelle étape de post (unique ou multiple)
async function createPostStep(req, res) {
  try {
    const result = await postStepsService.createPostStep(req.body);
    
    if (result.success) {
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
async function createNode(req, res) {
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
async function saveMultipleNodes(req, res) {
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
async function addStepsToPost(req, res) {
  try {
    const { postId } = req.params;
    const stepsData = req.body;
    
    const result = await postStepsService.addStepsToPost(postId, stepsData);
    
    if (result.success) {
      const isMultiple = Array.isArray(stepsData);
      let message = '';
      
      if (isMultiple) {
        if (result.created > 0 && result.updated > 0) {
          message = `${result.created} étapes créées et ${result.updated} étapes mises à jour avec succès`;
        } else if (result.created > 0) {
          message = `${result.created} étapes créées avec succès`;
        } else if (result.updated > 0) {
          message = `${result.updated} étapes mises à jour avec succès`;
        }
      } else {
        if (result.updated > 0) {
          message = 'Étape mise à jour avec succès';
        } else {
          message = 'Étape créée avec succès';
        }
      }
      
      return res.status(200).json({
        success: true,
        message: message,
        data: result.data,
        count: result.count,
        created: result.created,
        updated: result.updated
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Erreur lors de l\'ajout des étapes',
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

// Récupérer toutes les étapes de post
async function getAllPostSteps(req, res) {
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
async function getPostStepById(req, res) {
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
async function getPostStepByNodeId(req, res) {
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
async function getPostStepsByPostId(req, res) {
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
async function updatePostStep(req, res) {
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
async function updatePostStepByNodeId(req, res) {
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
async function updateNodeConfig(req, res) {
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
async function updateNodePosition(req, res) {
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
async function deletePostStep(req, res) {
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
async function deletePostStepByNodeId(req, res) {
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
async function getPostStepsByType(req, res) {
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
async function getNodesBySpecificType(req, res) {
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
async function getNextNodeNumber(req, res) {
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

module.exports.createPostStep = createPostStep;
module.exports.createNode = createNode;
module.exports.saveMultipleNodes = saveMultipleNodes;
module.exports.addStepsToPost = addStepsToPost;
module.exports.getAllPostSteps = getAllPostSteps;
module.exports.getPostStepById = getPostStepById;
module.exports.getPostStepByNodeId = getPostStepByNodeId;
module.exports.getPostStepsByPostId = getPostStepsByPostId;
module.exports.updatePostStep = updatePostStep;
module.exports.updatePostStepByNodeId = updatePostStepByNodeId;
module.exports.updateNodeConfig = updateNodeConfig;
module.exports.updateNodePosition = updateNodePosition;
module.exports.deletePostStep = deletePostStep;
module.exports.deletePostStepByNodeId = deletePostStepByNodeId;
module.exports.getPostStepsByType = getPostStepsByType;
module.exports.getNodesBySpecificType = getNodesBySpecificType;
module.exports.getNextNodeNumber = getNextNodeNumber;