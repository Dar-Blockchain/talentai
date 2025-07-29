'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { Box, CircularProgress, Typography } from '@mui/material';

// ElevenLabs TTS Configuration
const ELEVENLABS_API_KEY = 'sk_d8d6651ea8192e9b1ff3c4dc1d47b4ee1308edc2e480f2f4';
const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

interface AvatarModelProps {
  isSpeaking: boolean;
  onLoaded?: () => void;
  shouldPlayGreeting?: boolean;
  shouldSpeakQuestion?: boolean;
  firstQuestionText?: string;
  hasStartedTest?: boolean;
}

const AvatarModel: React.FC<AvatarModelProps> = ({ isSpeaking, onLoaded, shouldPlayGreeting = false, shouldSpeakQuestion = false, firstQuestionText = "", hasStartedTest }) => {
  const meshRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [fbx, setFbx] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [waveAnimation, setWaveAnimation] = useState<any>(null);
  const [greetingAnimation, setGreetingAnimation] = useState<any>(null);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const [speechMesh, setSpeechMesh] = useState<any>(null);
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState(false);

  // Function to make character speak with lip sync
  const speakWithLipSync = async (text: string) => {
    if (isCurrentlySpeaking) return;
    
    console.log('🗣️ Starting speech with lip sync:', text);
    setIsCurrentlySpeaking(true);
    
    try {
      // Generate TTS audio from ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text,
          voice_settings: {
            stability: 0.3,
            similarity_boost: 0.85,
            style: 1.0,
            use_speaker_boost: true
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Start lip sync animation
      const startLipSync = () => {
        if (!speechMesh) return;
        
        console.log('🎭 Starting lip sync animation');
        const lipSyncInterval = setInterval(() => {
          if (speechMesh.morphTargetInfluences && speechMesh.morphTargetDictionary) {
            // Animate mouth morphs for speech
            const morphNames = Object.keys(speechMesh.morphTargetDictionary);
            
            // Look for mouth/speech related morphs
            const mouthMorphs = morphNames.filter(name => 
              name.toLowerCase().includes('mouth') ||
              name.toLowerCase().includes('lip') ||
              name.toLowerCase().includes('jaw') ||
              name.toLowerCase().includes('speak') ||
              name.toLowerCase().includes('a') ||
              name.toLowerCase().includes('e') ||
              name.toLowerCase().includes('i') ||
              name.toLowerCase().includes('o') ||
              name.toLowerCase().includes('u')
            );
            
            console.log('🎭 Available mouth morphs:', mouthMorphs);
            
            // Animate random mouth shapes for speech effect
            mouthMorphs.forEach((morphName, index) => {
              const morphIndex = speechMesh.morphTargetDictionary[morphName];
              if (morphIndex !== undefined) {
                // Random animation between 0 and 0.8 for speech effect
                speechMesh.morphTargetInfluences[morphIndex] = Math.random() * 0.8;
              }
            });
          }
        }, 100); // Update every 100ms for smooth lip sync
        
        // Stop lip sync when audio ends
        audio.onended = () => {
          clearInterval(lipSyncInterval);
          // Reset mouth to neutral position
          if (speechMesh && speechMesh.morphTargetInfluences) {
            for (let i = 0; i < speechMesh.morphTargetInfluences.length; i++) {
              speechMesh.morphTargetInfluences[i] = 0;
            }
          }
          console.log('🎭 Speech finished, mouth reset to neutral');
          setIsCurrentlySpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
      };
      
      // Play audio and start lip sync
      await audio.play();
      startLipSync();
      
    } catch (error) {
      console.error('❌ Speech error:', error);
      setIsCurrentlySpeaking(false);
    }
  };

  // Trigger speech when greeting should play
  useEffect(() => {
    if (shouldPlayGreeting && fbx && speechMesh && !isCurrentlySpeaking) {
      console.log('🎤 Greeting trigger received, starting speech...');
      speakWithLipSync("Hello, my name is Sinda. I'm here to evaluate your project.");
    }
  }, [shouldPlayGreeting, fbx, speechMesh, isCurrentlySpeaking]);

  const playWaveAnimation = () => {
    if (!mixerRef.current || !waveAnimation) return;

    console.log('🎬 Starting wave animation');

    // Stop current animation smoothly
    if (currentAction) {
      console.log('Stopping current action for wave animation');
      currentAction.fadeOut(0.5);
    }

    // Create and setup wave action
    const waveAction = mixerRef.current.clipAction(waveAnimation);
    waveAction.reset();
    waveAction.setLoop(THREE.LoopRepeat, Infinity); // Loop indefinitely
    waveAction.fadeIn(0.5);

    setCurrentAction(waveAction);

    // Start wave animation
    waveAction.play();
    console.log('✅ Wave animation started and playing');
  };

  const playGreetingAnimation = () => {
    if (!mixerRef.current || !greetingAnimation) return;

    console.log('🎬 Starting greeting animation');

    // Stop current animation smoothly
    if (currentAction) {
      console.log('Stopping current action for greeting animation');
      currentAction.fadeOut(0.5);
    }

    // Create and setup greeting action
    const greetingAction = mixerRef.current.clipAction(greetingAnimation);
    greetingAction.reset();
    greetingAction.setLoop(THREE.LoopOnce, 1); // Play once with repetitions

    // Reset position after animation if head is missing
    const onGreetingFinished = () => {
      if (fbx) {
        fbx.position.set(0, 0, 0); // Adjust as needed for correct position
        fbx.rotation.set(0, 0, 0); // Reset rotation
      }
    };
    mixerRef.current?.addEventListener('finished', onGreetingFinished);

    setCurrentAction(greetingAction);

    // Start greeting animation
    greetingAction.play();
    console.log('✅ Greeting animation started');

    // Clean up listener after animation
    setTimeout(() => {
      mixerRef.current?.removeEventListener('finished', onGreetingFinished);
    }, greetingAnimation.duration * 1000 + 100);

  };

  useEffect(() => {
    const loader = new GLTFLoader() as any;

    // Load main character model
    loader.load(
      '/Avatars/sinda.glb',
      (loadedGltf: any) => {
        setFbx(loadedGltf.scene);
        console.log('✅ Model loaded:', loadedGltf.scene);
        
        // Log morphTargetInfluences
        loadedGltf.scene.traverse((child: any) => {
          if (child.isMesh && child.morphTargetInfluences) {
            console.log('🎭 Mesh with morph targets found:', child.name);
            console.log('🎭 MorphTargetInfluences:', child.morphTargetInfluences);
            console.log('🎭 MorphTargetDictionary:', child.morphTargetDictionary);
            
            // Look for head/face mesh for speech
            if (child.name && (
              child.name.toLowerCase().includes('head') ||
              child.name.toLowerCase().includes('face') ||
              child.name.toLowerCase().includes('mouth') ||
              child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).some(key => 
                key.toLowerCase().includes('mouth') ||
                key.toLowerCase().includes('lip') ||
                key.toLowerCase().includes('jaw')
              )
            )) {
              console.log('🎤 Speech mesh identified:', child.name);
              setSpeechMesh(child);
            }
            
            // If no specific head mesh found, use the first mesh with morphs
            if (!speechMesh && child.morphTargetInfluences.length > 0) {
              console.log('🎤 Using first available mesh for speech:', child.name);
              setSpeechMesh(child);
            }
          }
        });
        
        // Create animation mixer
        const mixer = new THREE.AnimationMixer(loadedGltf.scene);
        mixer.timeScale = 1.0;
        mixerRef.current = mixer;

        // Check if there are animations
        if (loadedGltf.animations && loadedGltf.animations.length > 0) {
          console.log('Found animations:', loadedGltf.animations.map((anim: any) => anim.name));

          // Look for wave animation
          const modelWaveAnim = loadedGltf.animations.find((anim: any) =>
            anim.name.toLowerCase().includes('wave') ||
            anim.name.toLowerCase().includes('wave_')
          );

          // Set wave animation if found
          if (modelWaveAnim) {
            setWaveAnimation(modelWaveAnim);
          } else {
            console.warn('No wave animation found');
          }

          // Look for greeting animation
          const modelGreetingAnim = loadedGltf.animations.find((anim: any) =>
            anim.name.toLowerCase().includes('greeting') ||
            anim.name.toLowerCase().includes('wave')
          );

          // Set greeting animation if found
          if (modelGreetingAnim) {
            setGreetingAnimation(modelGreetingAnim);
          } else {
            console.warn('No greeting animation found');
          }
        }

        // Center the model and scale it properly
        centerModel(loadedGltf.scene);

        // Signal that model is loaded
        onLoaded?.();
      },
      (progress: any) => console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%'),
      (error: any) => {
        setError('Failed to load avatar model');
        console.error('Error loading GLB model:', error);
      }
    );
  }, [onLoaded]);

  // Ensure the model is properly centered, adjusted, and scaled
  const centerModel = (scene: THREE.Group) => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = 3.0 / Math.max(size.x, size.y, size.z);
    scene.scale.setScalar(scale);

    // Adjust the vertical offset to show head and upper torso
    const verticalOffset = -size.y * scale * 0.5; // Balanced value to prevent head clipping
    scene.position.set(0, verticalOffset, 0);

    scene.userData.lockedPosition = scene.position.clone();
    scene.userData.lockedRotation = scene.rotation.clone();
    scene.userData.lockedScale = scene.scale.clone();

    console.log('✅ Character positioned:', { verticalOffset });
  };

  // Start greeting animation if both character and animation are loaded
  useEffect(() => {
    if (fbx && greetingAnimation) {
      console.log('✅ Both character and greeting animation loaded - starting greeting animation...');
      playGreetingAnimation(); // Play greeting animation immediately when loaded
    }
  }, [fbx, greetingAnimation]);

  // Start wave animation after greeting animation
  useEffect(() => {
    if (fbx && waveAnimation) {
      console.log('✅ Both character and wave animation loaded - starting wave animation...');
      setTimeout(() => {
        playWaveAnimation(); // Start wave animation after greeting animation finishes
      }, 5000); // Wait for 5 seconds before starting wave animation
    }
  }, [fbx, waveAnimation]);

  useFrame((state, delta) => {
    // Update animation mixer with clamped delta
    if (mixerRef.current) {
      const clampedDelta = Math.min(delta, 1 / 30);  // Clamp delta to avoid big jumps
      mixerRef.current.update(clampedDelta);
    }
    
    // Log morphTargetInfluences periodically (every 60 frames)
    if (fbx && Math.floor(state.clock.elapsedTime * 60) % 60 === 0) {
      fbx.traverse((child: any) => {
        if (child.isMesh && child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
          console.log('🎭 Live MorphTargetInfluences for', child.name, ':', child.morphTargetInfluences);
        }
      });
    }
    
    // Lock position and rotation AFTER animation update to override root motion
    if (fbx && fbx.userData.lockedPosition && fbx.userData.lockedRotation) {
      // Log pre-lock position to detect motion
      console.log('📍 Pre-lock position:', { y: fbx.position.y });

      fbx.position.copy(fbx.userData.lockedPosition);
      fbx.rotation.copy(fbx.userData.lockedRotation);
      fbx.scale.copy(fbx.userData.lockedScale || new THREE.Vector3(1, 1, 1));

      // Clamp Y position to prevent upward drift
      fbx.position.y = Math.min(fbx.position.y, fbx.userData.lockedPosition.y);

      console.log('🔒 Post-lock position:', { y: fbx.position.y });
    }
  });

  if (error) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#8310FF" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="#8310FF" />
        </mesh>
      </group>
    );
  }

  if (!fbx) {
    return (
      <group ref={meshRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.6, 1.2, 32]} />
          <meshStandardMaterial color="#6366f1" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={meshRef}>
      <primitive object={fbx} />
    </group>
  );
};

interface AvatarCanvasProps {
  isSpeaking: boolean;
  shouldPlayGreeting?: boolean;
  shouldSpeakQuestion?: boolean;
  firstQuestionText?: string;
  hasStartedTest?: boolean;
}

const AvatarCanvas: React.FC<AvatarCanvasProps> = ({ isSpeaking, shouldPlayGreeting = false, shouldSpeakQuestion = false, firstQuestionText = "", hasStartedTest }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (modelLoaded) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [modelLoaded]);

  // Helper component that keeps the camera locked
  const CameraLock: React.FC<{ position: [number, number, number]; fov: number }> = ({ position, fov }) => {
    const { camera } = useThree();
    const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(...position));
    const targetFov = useRef<number>(fov);

    useEffect(() => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.position.set(...position);
        camera.near = 0.01; 
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }, [camera, position, fov]);

    useFrame(() => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.position.set(targetPos.current.x, targetPos.current.y, targetPos.current.z);
        if (camera.fov !== targetFov.current) {
          camera.fov = targetFov.current;
          camera.updateProjectionMatrix();
        }
      }
    });

    return null;
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoading && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          <CircularProgress sx={{ color: '#8310FF' }} />
          <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>Loading Avatar...</Typography>
        </Box>
      )}
      
      <Canvas
        camera={{ position: [0, 1, 8], fov: 20, near: 0.01 }}
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        <CameraLock position={[0, 1, 8]} fov={20} />
        <ambientLight intensity={1.0} color="#ffffff" />
        <directionalLight position={[2, 3, 2]} intensity={3.0} color="#ffffff" target-position={[0, 0, 0]} castShadow />
        <pointLight position={[0, 2, 1]} intensity={2.0} color="#ffffff" distance={10} />
        <AvatarModel 
          isSpeaking={isSpeaking} 
          onLoaded={() => setModelLoaded(true)} 
          shouldPlayGreeting={shouldPlayGreeting}
          shouldSpeakQuestion={shouldSpeakQuestion}
          firstQuestionText={firstQuestionText}
          hasStartedTest={hasStartedTest}
        />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} />
        <Environment preset="sunset" />
      </Canvas>
    </Box>
  );
};

export default AvatarCanvas;
