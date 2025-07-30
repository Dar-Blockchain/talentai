import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

function FBXModel({ clothingColor = '#4A90E2', selectedOutfit, onLoad }: {
  clothingColor: string;
  selectedOutfit?: {
    tshirt?: string;
    pants?: string;
    shoes?: string;
    accessories?: string;
    skin?: string;
  };
  onLoad?: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the FBX model
    const loader = new FBXLoader();
    loader.load(
      '/final.fbx',
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
  }, [clothingColor, selectedOutfit, onLoad]);

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

export default function FBXAvatar({ clothingColor = '#4A90E2', selectedOutfit, onLoad }: FBXAvatarProps) {
  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* FBX Model */}
        <FBXModel 
          clothingColor={clothingColor} 
          selectedOutfit={selectedOutfit} 
          onLoad={onLoad}
        />
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
} 