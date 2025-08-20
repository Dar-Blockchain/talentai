import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Box } from '@mui/material';

interface FBXAvatarProps {
  clothingColor?: string;
  selectedOutfit?: {
    tshirt?: string;
    pants?: string;
    shoes?: string;
    accessories?: string;
    skin?: string;
  };
  sindaCategory?: 'sinda1' | 'sinda2' | 'japan' | 'tunisian' | 'alex' | 'jaaf';
  sinda1AvatarType?: 'dressproblond' | 'winterblond' | 'problond';
  sinda2AvatarType?: 'dressproblack' | 'problack' | 'winterblack';
  japanAvatarType?: 'casualjapan' | 'projapan' | 'winterjapan';
  tunisianAvatarType?: 'casualtunisian' | 'dresstunisian' | 'protunisian';
  alexAvatarType?: 'problondman' | 'winterblondman';
  jaafAvatarType?: 'protunisianman' | 'wintertunisianman';
  cameraAngle?: 'front' | 'side' | 'back' | 'full';
  onLoad?: () => void;
}

// Manual material mapping for common FBX models
const MATERIAL_MAPPING = {
  // Common material names for different clothing parts
  tshirt: ['shirt', 'tshirt', 'top', 'upper', 'torso', 'body', 'chest', 'upperbody', 'wolf3d_outfit_top'],
  pants: ['bottom', 'pants', 'trousers', 'legs', 'lower', 'jeans', 'lowerbody', 'pelvis', 'hip', 'wolf3d_outfit_bottom', 'wolf3d_outfit_bot'],
  shoes: ['shoes', 'footwear', 'boots', 'feet', 'foot', 'sneakers', 'toes', 'wolf3d_outfit_footwe', 'wolf3d_outfit_foo'],
  accessories: ['accessories', 'hat', 'cap', 'head', 'hair', 'glasses', 'face'],
  skin: ['skin', 'flesh', 'body', 'face', 'head', 'arm', 'hand', 'leg', 'foot', 'neck', 'torso']
};

// Helper function to determine clothing category from material/mesh name
const getClothingCategory = (materialName: string, meshName: string): string | null => {
  const name = (materialName + ' ' + meshName).toLowerCase();
  
  for (const [category, keywords] of Object.entries(MATERIAL_MAPPING)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }
  
  return null;
};

function FBXModel({ clothingColor = '#4A90E2', selectedOutfit, sindaCategory = 'sinda1', sinda1AvatarType = 'dressproblond', sinda2AvatarType = 'dressproblack', japanAvatarType = 'casualjapan', tunisianAvatarType = 'casualtunisian', alexAvatarType = 'problondman', jaafAvatarType = 'protunisianman', onLoad }: {
  clothingColor: string;
  selectedOutfit?: {
    tshirt?: string;
    pants?: string;
    shoes?: string;
    accessories?: string;
    skin?: string;
  };
  sindaCategory?: 'sinda1' | 'sinda2' | 'japan' | 'tunisian' | 'alex' | 'jaaf';
  sinda1AvatarType?: 'dressproblond' | 'winterblond' | 'problond';
  sinda2AvatarType?: 'dressproblack' | 'problack' | 'winterblack';
  japanAvatarType?: 'casualjapan' | 'projapan' | 'winterjapan';
  tunisianAvatarType?: 'casualtunisian' | 'dresstunisian' | 'protunisian';
  alexAvatarType?: 'problondman' | 'winterblondman';
  jaafAvatarType?: 'protunisianman' | 'wintertunisianman';
  onLoad?: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the FBX model
    const loader = new FBXLoader();
         // Determine which avatar to load based on Sinda category
     let avatarPath;
     switch (sindaCategory) {
       case 'sinda1':
         // Sinda 1 has multiple options
         switch (sinda1AvatarType) {
           case 'dressproblond':
             avatarPath = '/Avatars/dressproblond.fbx';
             break;
           case 'winterblond':
             avatarPath = '/Avatars/winterblond.fbx';
             break;
           case 'problond':
             avatarPath = '/Avatars/problond.fbx';
             break;
           default:
             avatarPath = '/Avatars/dressproblond.fbx';
         }
         break;
       case 'sinda2':
         // Sinda 2 has multiple options
         switch (sinda2AvatarType) {
           case 'dressproblack':
             avatarPath = '/Avatars/dressproblack.fbx';
             break;
           case 'problack':
             avatarPath = '/Avatars/problack.fbx';
             break;
           case 'winterblack':
             avatarPath = '/Avatars/winterblack.fbx';
             break;
           default:
             avatarPath = '/Avatars/dressproblack.fbx';
         }
         break;
      case 'japan':
        // Japan has multiple options
        switch (japanAvatarType) {
          case 'casualjapan':
            avatarPath = '/Avatars/casualjapan.fbx';
            break;
          case 'projapan':
            avatarPath = '/Avatars/projapan.fbx';
            break;
          case 'winterjapan':
            avatarPath = '/Avatars/winterjapan.fbx';
            break;
          default:
            avatarPath = '/Avatars/casualjapan.fbx';
        }
        break;
      case 'tunisian':
        // Tunisian has multiple options
        switch (tunisianAvatarType) {
          case 'casualtunisian':
            avatarPath = '/Avatars/casualtunisian.fbx';
            break;
          case 'dresstunisian':
            avatarPath = '/Avatars/dresstunisian.fbx';
            break;
          case 'protunisian':
            avatarPath = '/Avatars/protunisian.fbx';
            break;
          default:
            avatarPath = '/Avatars/casualtunisian.fbx';
        }
        break;

      case 'alex':
        // Alex has multiple options
        switch (alexAvatarType) {
          case 'problondman':
            avatarPath = '/Avatars/problondman.fbx';
            break;
          case 'winterblondman':
            avatarPath = '/Avatars/winterblondman.fbx';
            break;
          default:
            avatarPath = '/Avatars/problondman.fbx';
        }
        break;
      case 'jaaf':
        // Jaaf has multiple options
        switch (jaafAvatarType) {
          case 'protunisianman':
            avatarPath = '/Avatars/protunisianman.fbx';
            break;
          case 'wintertunisianman':
            avatarPath = '/Avatars/wintertunisianman.fbx';
            break;
          default:
            avatarPath = '/Avatars/protunisianman.fbx';
        }
        break;
      default:
        avatarPath = '/Avatars/dressproblond.fbx';
    }
     
     loader.load(
       avatarPath,
      (object: THREE.Group) => {
        // Scale and position the model
        object.scale.setScalar(0.01); // Adjust scale as needed
        object.position.set(0, -1, 0); // Adjust position as needed
        
        // Debug: Log all material names to understand the structure
        console.log('=== FBX Model Materials ===');
        let allMaterials: string[] = [];
        object.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh && child.material) {
            console.log('Mesh name:', child.name);
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: THREE.Material) => {
                console.log('Material name:', mat.name);
                allMaterials.push(mat.name);
              });
            } else {
              console.log('Material name:', child.material.name);
              allMaterials.push(child.material.name);
            }
          }
        });
        console.log('=== All Material Names ===');
        console.log(allMaterials);
        console.log('=== End Materials ===');
        console.log('Selected outfit:', selectedOutfit);

        // Apply outfit changes to the model with improved material detection
        object.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: THREE.Material) => {
                const category = getClothingCategory(mat.name, child.name);
                if (category && selectedOutfit?.[category as keyof typeof selectedOutfit]) {
                  const color = selectedOutfit[category as keyof typeof selectedOutfit];
                  console.log(`Applying ${category} color:`, color, 'to material:', mat.name);
                  (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(color).getHex());
                } else if (category === 'tshirt' && !selectedOutfit?.tshirt) {
                  // Default t-shirt color
                  (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(clothingColor).getHex());
                }
              });
            } else {
              const category = getClothingCategory(child.material.name, child.name);
              if (category && selectedOutfit?.[category as keyof typeof selectedOutfit]) {
                const color = selectedOutfit[category as keyof typeof selectedOutfit];
                console.log(`Applying ${category} color:`, color, 'to material:', child.material.name);
                (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(color).getHex());
              } else if (category === 'tshirt' && !selectedOutfit?.tshirt) {
                // Default t-shirt color
                (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(clothingColor).getHex());
              }
            }
          }
        });

        // Force apply pants color to any material that might be pants
        if (selectedOutfit?.pants) {
          console.log('Force applying pants color to all potential pants materials');
          object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.material) {
              const meshName = child.name.toLowerCase();
              const matName = Array.isArray(child.material) 
                ? child.material[0]?.name?.toLowerCase() || ''
                : child.material.name.toLowerCase();
              
              // Apply pants color to any material that could be pants
              if (meshName.includes('leg') || meshName.includes('pant') || meshName.includes('trouser') ||
                  meshName.includes('lower') || meshName.includes('bottom') || meshName.includes('hip') ||
                  matName.includes('leg') || matName.includes('pant') || matName.includes('trouser') ||
                  matName.includes('lower') || matName.includes('bottom') || matName.includes('hip') ||
                  matName.includes('jeans') || matName.includes('dress') || matName.includes('casual')) {
                
                console.log('Applying pants color to:', child.name, 'material:', matName);
                
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat: THREE.Material) => {
                    (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.pants).getHex());
                  });
                } else {
                  (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.pants).getHex());
                }
              }
            }
          });
        }

        // Apply pants color to lower body materials
        let materialsColored = 0;
        let shoesMaterialsColored = 0;
        
        if (selectedOutfit?.pants) {
          console.log('Applying pants color:', selectedOutfit.pants);
          
          // First try: Look for specific pants materials
          object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.material) {
              const meshName = child.name.toLowerCase();
              const matName = Array.isArray(child.material) 
                ? child.material[0]?.name?.toLowerCase() || ''
                : child.material.name.toLowerCase();
              
              console.log('Checking material for pants:', child.name, 'material:', matName);
              
              // Check if this is a pants/lower body material
              const isPants = meshName.includes('leg') || meshName.includes('pant') || meshName.includes('trouser') ||
                              meshName.includes('lower') || meshName.includes('bottom') || meshName.includes('hip') ||
                              meshName.includes('pelvis') || meshName.includes('thigh') || meshName.includes('calf') ||
                              meshName.includes('bottom') || meshName.includes('wolf3d_outfit_bottom') || meshName.includes('wolf3d_outfit_bot') ||
                              matName.includes('leg') || matName.includes('pant') || matName.includes('trouser') ||
                              matName.includes('lower') || matName.includes('bottom') || matName.includes('hip') ||
                              matName.includes('pelvis') || matName.includes('thigh') || matName.includes('calf') ||
                              matName.includes('bottom') || matName.includes('wolf3d_outfit_bottom') || matName.includes('wolf3d_outfit_bot');
              
              // Skip if it's clearly a t-shirt or skin material
              const isTshirt = meshName.includes('shirt') || meshName.includes('top') || meshName.includes('upper') ||
                               matName.includes('shirt') || matName.includes('top') || matName.includes('upper') ||
                               meshName.includes('chest') || matName.includes('chest') ||
                               meshName.includes('wolf3d_outfit_top') || matName.includes('wolf3d_outfit_top');
              
              const isSkin = meshName.includes('skin') || meshName.includes('flesh') || meshName.includes('body') ||
                             matName.includes('skin') || matName.includes('flesh') || matName.includes('body');
              
              if (isPants && !isTshirt && !isSkin) {
                console.log('✅ Found pants material:', child.name, 'material:', matName);
                materialsColored++;
                
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat: THREE.Material) => {
                    try {
                      (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.pants).getHex());
                      console.log('Successfully colored pants material:', mat.name);
                    } catch (error) {
                      console.log('Error coloring pants material:', mat.name, error);
                    }
                  });
                } else {
                  try {
                    (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.pants).getHex());
                    console.log('Successfully colored pants material:', child.material.name);
                  } catch (error) {
                    console.log('Error coloring pants material:', child.material.name, error);
                  }
                }
              }
            }
          });
          
          console.log(`Applied pants color to ${materialsColored} materials:`, selectedOutfit.pants);
          
          // If no pants materials found, try to color ANY material that's not t-shirt
          if (materialsColored === 0) {
            console.log('❌ No pants materials found, trying to color ANY non-t-shirt material');
            object.traverse((child: THREE.Object3D) => {
              if (child instanceof THREE.Mesh && child.material) {
                const meshName = child.name.toLowerCase();
                const matName = Array.isArray(child.material) 
                  ? child.material[0]?.name?.toLowerCase() || ''
                  : child.material.name.toLowerCase();
                
                // Skip if it's clearly a t-shirt material
                const isTshirt = meshName.includes('shirt') || meshName.includes('top') || meshName.includes('upper') ||
                                 matName.includes('shirt') || matName.includes('top') || matName.includes('upper') ||
                                 meshName.includes('chest') || matName.includes('chest');
                
                if (!isTshirt) {
                  console.log('🔄 Coloring any non-t-shirt material for pants:', child.name, 'material:', matName);
                  materialsColored++;
                  
                  if (Array.isArray(child.material)) {
                    child.material.forEach((mat: THREE.Material) => {
                      try {
                        (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.pants).getHex());
                        console.log('✅ Applied pants color to:', mat.name);
                      } catch (error) {
                        console.log('❌ Error coloring material:', mat.name, error);
                      }
                    });
                  } else {
                    try {
                      (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.pants).getHex());
                      console.log('✅ Applied pants color to:', child.material.name);
                    } catch (error) {
                      console.log('❌ Error coloring material:', child.material.name, error);
                    }
                  }
                }
              }
            });
            
            console.log(`🔄 Applied pants color to ${materialsColored} materials as fallback:`, selectedOutfit.pants);
          }
        }

        // Apply shoes color to shoes materials
        if (selectedOutfit?.shoes) {
          console.log('Applying shoes color:', selectedOutfit.shoes);
          
          object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.material) {
              const meshName = child.name.toLowerCase();
              const matName = Array.isArray(child.material) 
                ? child.material[0]?.name?.toLowerCase() || ''
                : child.material.name.toLowerCase();
              
              // Check if this is a shoes material
              const isShoes = meshName.includes('shoes') || meshName.includes('footwear') || meshName.includes('boots') ||
                              meshName.includes('feet') || meshName.includes('foot') || meshName.includes('sneakers') ||
                              meshName.includes('toes') || meshName.includes('sole') || meshName.includes('heel') ||
                              meshName.includes('wolf3d_outfit_footwe') || meshName.includes('wolf3d_outfit_foo') ||
                              matName.includes('shoes') || matName.includes('footwear') || matName.includes('boots') ||
                              matName.includes('feet') || matName.includes('foot') || matName.includes('sneakers') ||
                              matName.includes('toes') || matName.includes('sole') || matName.includes('heel') ||
                              matName.includes('wolf3d_outfit_footwe') || matName.includes('wolf3d_outfit_foo');
              
              // Skip if it's clearly a t-shirt, pants, or skin material
              const isTshirt = meshName.includes('shirt') || meshName.includes('top') || meshName.includes('upper') ||
                               matName.includes('shirt') || matName.includes('top') || matName.includes('upper') ||
                               meshName.includes('chest') || matName.includes('chest');
              
              const isPants = meshName.includes('leg') || meshName.includes('pant') || meshName.includes('trouser') ||
                              matName.includes('leg') || matName.includes('pant') || matName.includes('trouser');
              
              const isSkin = meshName.includes('skin') || meshName.includes('flesh') || meshName.includes('body') ||
                             matName.includes('skin') || matName.includes('flesh') || matName.includes('body');
              
              if (isShoes && !isTshirt && !isPants && !isSkin) {
                console.log('Applying shoes color to:', child.name, 'material:', matName);
                shoesMaterialsColored++;
                
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat: THREE.Material) => {
                    try {
                      (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.shoes).getHex());
                      console.log('Successfully colored shoes material:', mat.name);
                    } catch (error) {
                      console.log('Error coloring shoes material:', mat.name, error);
                    }
                  });
                } else {
                  try {
                    (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.shoes).getHex());
                    console.log('Successfully colored shoes material:', child.material.name);
                  } catch (error) {
                    console.log('Error coloring shoes material:', child.material.name, error);
                  }
                }
              }
            }
          });
          
          console.log(`Applied shoes color to ${shoesMaterialsColored} materials:`, selectedOutfit.shoes);
        }

        // SUPER AGGRESSIVE: If pants or shoes colors are selected but no materials were colored, try to color ANY material that's not t-shirt
        if ((selectedOutfit?.pants || selectedOutfit?.shoes) && !materialsColored && !shoesMaterialsColored) {
          console.log('SUPER AGGRESSIVE: No pants/shoes materials found, trying to color any non-t-shirt material');
          
          object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.material) {
              const meshName = child.name.toLowerCase();
              const matName = Array.isArray(child.material) 
                ? child.material[0]?.name?.toLowerCase() || ''
                : child.material.name.toLowerCase();
              
              // Skip if it's clearly a t-shirt material
              const isTshirt = meshName.includes('shirt') || meshName.includes('top') || meshName.includes('upper') ||
                               matName.includes('shirt') || matName.includes('top') || matName.includes('upper') ||
                               meshName.includes('chest') || matName.includes('chest');
              
              if (!isTshirt) {
                console.log('SUPER AGGRESSIVE: Coloring any non-t-shirt material:', child.name, 'material:', matName);
                
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat: THREE.Material) => {
                    try {
                      if (selectedOutfit?.pants) {
                        (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.pants).getHex());
                        console.log('SUPER AGGRESSIVE: Applied pants color to:', mat.name);
                      }
                      if (selectedOutfit?.shoes) {
                        (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.shoes).getHex());
                        console.log('SUPER AGGRESSIVE: Applied shoes color to:', mat.name);
                      }
                    } catch (error) {
                      console.log('Error in super aggressive coloring:', mat.name, error);
                    }
                  });
                } else {
                  try {
                    if (selectedOutfit?.pants) {
                      (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.pants).getHex());
                      console.log('SUPER AGGRESSIVE: Applied pants color to:', child.material.name);
                    }
                    if (selectedOutfit?.shoes) {
                      (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.shoes).getHex());
                      console.log('SUPER AGGRESSIVE: Applied shoes color to:', child.material.name);
                    }
                  } catch (error) {
                    console.log('Error in super aggressive coloring:', child.material.name, error);
                  }
                }
              }
            }
          });
        }

        // Apply skin color to skin materials
        if (selectedOutfit?.skin) {
          console.log('Applying skin color to skin materials:', selectedOutfit.skin);
          let skinMaterialsColored = 0;
          
          object.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.material) {
              const meshName = child.name.toLowerCase();
              const matName = Array.isArray(child.material) 
                ? child.material[0]?.name?.toLowerCase() || ''
                : child.material.name.toLowerCase();
              
              // Check if this is a skin material
              const isSkin = meshName.includes('skin') || meshName.includes('flesh') || meshName.includes('body') ||
                             meshName.includes('face') || meshName.includes('head') || meshName.includes('arm') ||
                             meshName.includes('hand') || meshName.includes('leg') || meshName.includes('foot') ||
                             meshName.includes('neck') || meshName.includes('torso') ||
                             matName.includes('skin') || matName.includes('flesh') || matName.includes('body') ||
                             matName.includes('face') || matName.includes('head') || matName.includes('arm') ||
                             matName.includes('hand') || matName.includes('leg') || matName.includes('foot') ||
                             matName.includes('neck') || matName.includes('torso');
              
              if (isSkin) {
                console.log('Applying skin color to:', child.name, 'material:', matName);
                skinMaterialsColored++;
                
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat: THREE.Material) => {
                    try {
                      (mat as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.skin).getHex());
                      console.log('Successfully colored skin material:', mat.name);
                    } catch (error) {
                      console.log('Error coloring skin material:', mat.name, error);
                    }
                  });
                } else {
                  try {
                    (child.material as THREE.MeshStandardMaterial).color.setHex(new THREE.Color(selectedOutfit.skin).getHex());
                    console.log('Successfully colored skin material:', child.material.name);
                  } catch (error) {
                    console.log('Error coloring skin material:', child.material.name, error);
                  }
                }
              }
            }
          });
          
          console.log(`Applied skin color to ${skinMaterialsColored} materials:`, selectedOutfit.skin);
        }

        setModel(object);
        setLoading(false);
        onLoad?.();
      },
      (progress: ProgressEvent) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
      },
      (error: unknown) => {
        console.error('Error loading FBX model:', error);
        setLoading(false);
      }
    );
     }, [clothingColor, selectedOutfit, sindaCategory, sinda1AvatarType, sinda2AvatarType, japanAvatarType, tunisianAvatarType, onLoad]);

  if (loading) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#666" />
        </mesh>
      </group>
    );
  }

  return model ? (
    <primitive 
      ref={meshRef} 
      object={model} 
      position={[0, -1, 0]}
      scale={[0.01, 0.01, 0.01]}
    />
  ) : null;
}

// Camera Controller Component
function CameraController({ cameraAngle }: { cameraAngle: 'front' | 'side' | 'back' | 'full' }) {
  const { camera } = useThree();
  
  useEffect(() => {
    let targetPosition: [number, number, number];
    let lookAtTarget: [number, number, number];
    
    // Focus on head and upper body area (y = 0.3 to 0.5 for upper body focus)
    const upperBodyFocus: [number, number, number] = [0, 0.4, 0];
    
    switch (cameraAngle) {
      case 'front':
        targetPosition = [0, 0.4, 3]; // Closer and higher for upper body
        lookAtTarget = upperBodyFocus;
        break;
      case 'side':
        targetPosition = [3, 0.4, 0]; // Side view focused on upper body
        lookAtTarget = upperBodyFocus;
        break;
      case 'back':
        targetPosition = [0, 0.4, -3]; // Back view focused on upper body
        lookAtTarget = upperBodyFocus;
        break;
      case 'full':
        targetPosition = [0, 0, 5]; // Full body view - further back and centered
        lookAtTarget = [0, 0, 0]; // Look at center for full body
        break;
      default:
        targetPosition = [0, 0.4, 3];
        lookAtTarget = upperBodyFocus;
    }
    
    // Smooth camera transition
    const duration = 1000; // 1 second
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(...targetPosition);
    const startLookAt = new THREE.Vector3(0, 0, 0); // Current look at
    const endLookAt = new THREE.Vector3(...lookAtTarget);
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedProgress = easeInOutCubic(progress);
      
      // Interpolate camera position
      camera.position.lerpVectors(startPosition, endPosition, easedProgress);
      
      // Interpolate look at target
      const currentLookAt = new THREE.Vector3();
      currentLookAt.lerpVectors(startLookAt, endLookAt, easedProgress);
      camera.lookAt(currentLookAt);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
  }, [cameraAngle, camera]);
  
  return null;
}

// Dynamic Orbit Controls Component
function DynamicOrbitControls({ cameraAngle }: { cameraAngle: 'front' | 'side' | 'back' | 'full' }) {
  const target: [number, number, number] = cameraAngle === 'full' ? [0, -0.1, 0] : [0, 0.4, 0];
  const minDistance = cameraAngle === 'full' ? 2 : 1.5;
  const maxDistance = cameraAngle === 'full' ? 10 : 6;
  
  return (
    <OrbitControls 
      target={target}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={minDistance}
      maxDistance={maxDistance}
      autoRotate={false}
    />
  );
}

export default function FBXAvatar({ clothingColor = '#4A90E2', selectedOutfit, sindaCategory = 'sinda1', sinda1AvatarType = 'dressproblond', sinda2AvatarType = 'dressproblack', japanAvatarType = 'casualjapan', tunisianAvatarType = 'casualtunisian', alexAvatarType = 'problondman', jaafAvatarType = 'protunisianman', cameraAngle = 'front', onLoad }: FBXAvatarProps) {
  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0.4, 3], fov: 20 }}
        style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%)' }}
      >
        {/* Bright Natural Lighting Setup */}
        {/* Strong ambient light */}
        <ambientLight intensity={0.9} color="#FFFFFF" />
        
        {/* Main sun light - increased intensity */}
        <directionalLight 
          position={[10, 15, 8]} 
          intensity={1.5} 
          color="#FFF8DC"
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0001}
        />
        
        {/* Strong fill light */}
        <directionalLight 
          position={[-8, 12, -5]} 
          intensity={0.8} 
          color="#E6F3FF"
        />
        
        {/* Bright ground bounce */}
        <directionalLight 
          position={[0, -5, 0]} 
          intensity={0.4} 
          color="#F5DEB3"
        />
        
        {/* Additional front light for brightness */}
        <directionalLight 
          position={[0, 5, 5]} 
          intensity={0.6} 
          color="#FFFFFF"
        />
        
        {/* Enhanced atmospheric light */}
        <directionalLight 
          position={[5, 8, -10]} 
          intensity={0.5} 
          color="#E0F6FF"
        />
        
        {/* Realistic outdoor environment */}
        <Environment preset="apartment" />
        
        {/* FBX Model */}
        <FBXModel 
          clothingColor={clothingColor} 
          selectedOutfit={selectedOutfit} 
          sindaCategory={sindaCategory}
          sinda1AvatarType={sinda1AvatarType}
          sinda2AvatarType={sinda2AvatarType}
          japanAvatarType={japanAvatarType}
          tunisianAvatarType={tunisianAvatarType}
          alexAvatarType={alexAvatarType}
          jaafAvatarType={jaafAvatarType}
          onLoad={onLoad}
        />
        
        {/* Camera Controller */}
        <CameraController cameraAngle={cameraAngle} />
        
        {/* Controls */}
        <DynamicOrbitControls cameraAngle={cameraAngle} />
      </Canvas>
    </div>
  );
} 