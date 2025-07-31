'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
// @ts-ignore - FBXLoader types not available
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
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

const AvatarModel: React.FC<AvatarModelProps> = ({
  isSpeaking,
  onLoaded,
  shouldPlayGreeting = false,
  shouldSpeakQuestion = false,
  firstQuestionText = "",
  hasStartedTest,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const mouthAnimationRef = useRef<any>(null);
  const [fbx, setFbx] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [idleAnimation, setIdleAnimation] = useState<any>(null);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const [speechMesh, setSpeechMesh] = useState<any>(null);
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState(false);
  const [hasPlayedGreeting, setHasPlayedGreeting] = useState(false);

  // ----------- MOUTH ANIMATION HELPERS -------------
  const startBackgroundMouthAnimation = (mesh: any) => {
    stopBackgroundMouthAnimation();
    if (!mesh) return;
    let mouthOpen = false;
    const animateMouth = () => {
      if (mesh.morphTargetInfluences) {
        for (let i = 0; i < mesh.morphTargetInfluences.length; i++) mesh.morphTargetInfluences[i] = 0;
        if (mouthOpen) {
          const closedVisemes = [0, 1, 50];
          const randomClosed = closedVisemes[Math.floor(Math.random() * closedVisemes.length)];
          if (randomClosed < mesh.morphTargetInfluences.length) mesh.morphTargetInfluences[randomClosed] = 0.4;
          mouthOpen = false;
        } else {
          const openVisemes = [10, 11, 13, 49];
          const randomOpen = openVisemes[Math.floor(Math.random() * openVisemes.length)];
          if (randomOpen < mesh.morphTargetInfluences.length) mesh.morphTargetInfluences[randomOpen] = 0.6;
          mouthOpen = true;
        }
      }
    };
    mouthAnimationRef.current = setInterval(animateMouth, 200);
  };

  const stopBackgroundMouthAnimation = () => {
    if (mouthAnimationRef.current) {
      clearInterval(mouthAnimationRef.current);
      mouthAnimationRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopBackgroundMouthAnimation();
    };
  }, []);
  // -------------------------------------------------

  // Function to make character speak with lipsync and slight delay before/after
  const speakWithLipSync = async (text: string) => {
    if (isCurrentlySpeaking) return;
    setIsCurrentlySpeaking(true);

    stopBackgroundMouthAnimation();

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.preload = 'auto';

      // Start mouth animation 200ms after audio begins
      audio.onplay = () => {
        setTimeout(() => {
          if (speechMesh) startBackgroundMouthAnimation(speechMesh);
        }, 200);
      };

      // Stop mouth animation 200ms after audio ends
      audio.onended = () => {
        setTimeout(() => {
          stopBackgroundMouthAnimation();
          if (speechMesh && speechMesh.morphTargetInfluences) {
            for (let i = 0; i < speechMesh.morphTargetInfluences.length; i++) {
              speechMesh.morphTargetInfluences[i] = 0;
            }
          }
          setIsCurrentlySpeaking(false);
          URL.revokeObjectURL(audioUrl);
        }, 200);
      };

      await audio.play();
    } catch (error) {
      setIsCurrentlySpeaking(false);
      setTimeout(() => {
        if (speechMesh) startBackgroundMouthAnimation(speechMesh);
      }, 500);
    }
  };

  // Fallback speech function without lip sync
  const speakWithoutLipSync = async (text: string) => {
    if (isCurrentlySpeaking) return;
    setIsCurrentlySpeaking(true);

    stopBackgroundMouthAnimation();

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Start mouth animation 200ms after audio begins (optional, or leave idle)
      audio.onplay = () => {
        setTimeout(() => {
          if (speechMesh) startBackgroundMouthAnimation(speechMesh);
        }, 200);
      };

      audio.onended = () => {
        setTimeout(() => {
          stopBackgroundMouthAnimation();
          setIsCurrentlySpeaking(false);
          URL.revokeObjectURL(audioUrl);
        }, 200);
      };

      await audio.play();
    } catch (error) {
      setIsCurrentlySpeaking(false);
      setTimeout(() => {
        if (speechMesh) startBackgroundMouthAnimation(speechMesh);
      }, 500);
    }
  };

  // Find speech mesh (Wolf3D_Head or fallback)
  useEffect(() => {
    if (fbx) {
      let wolf3dHead: any = null;

      fbx.traverse((child: any) => {
        if (
          child.isMesh &&
          child.name === 'Wolf3D_Head' &&
          child.morphTargetInfluences &&
          child.morphTargetInfluences.length > 0
        ) {
          wolf3dHead = child;
        }
      });

      if (wolf3dHead) {
        setSpeechMesh(wolf3dHead);
        setTimeout(() => startBackgroundMouthAnimation(wolf3dHead), 1000);
      } else {
        // Fallback: any mesh with morph targets
        let fallbackMesh: any = null;
        fbx.traverse((child: any) => {
          if (
            child.isMesh &&
            child.morphTargetInfluences &&
            child.morphTargetInfluences.length > 0 &&
            !fallbackMesh
          ) {
            fallbackMesh = child;
          }
        });

        if (fallbackMesh) {
          setSpeechMesh(fallbackMesh);
          setTimeout(() => startBackgroundMouthAnimation(fallbackMesh), 1000);
        }
      }
    }
  }, [fbx]);

  // Trigger speech when greeting should play (only once)
  useEffect(() => {
    if (
      shouldPlayGreeting &&
      fbx &&
      !isCurrentlySpeaking &&
      !hasPlayedGreeting
    ) {
      setHasPlayedGreeting(true); // Mark greeting as played
      if (speechMesh) {
        speakWithLipSync("Hello. My name is Sinda. I am here to evaluate your project.");
      } else {
        speakWithoutLipSync("Hello. My name is Sinda. I am here to evaluate your project.");
      }
    }
  }, [shouldPlayGreeting, fbx, speechMesh, hasPlayedGreeting, isCurrentlySpeaking]);

  // Function to play idle animation
  const playIdleAnimation = () => {
    if (!mixerRef.current || !idleAnimation) return;

    if (currentAction) {
      currentAction.fadeOut(0.5);
    }
    const idleAction = mixerRef.current.clipAction(idleAnimation);
    idleAction.reset();
    idleAction.setLoop(THREE.LoopRepeat, Infinity);
    idleAction.fadeIn(0.5);

    setCurrentAction(idleAction);
    idleAction.play();
  };

  // Model loader
  useEffect(() => {
    const loader = new FBXLoader();

    loader.load(
      '/Avatars/sind.fbx',
      (loadedFbx: any) => {
        setFbx(loadedFbx);

        // Create animation mixer
        const mixer = new THREE.AnimationMixer(loadedFbx);
        mixer.timeScale = 1.0;
        mixerRef.current = mixer;

        // Find speech mesh (if not already set in another effect)
        loadedFbx.traverse((child: any) => {
          if (
            child.isMesh &&
            child.morphTargetInfluences &&
            child.morphTargetInfluences.length > 0
          ) {
            setSpeechMesh(child);
          }
        });

        // Center the model and scale it properly
        centerModel(loadedFbx);

        // Load external idle animation
        loader.load(
          '/animations/_Idle.fbx',
          (idleFbx: any) => {
            if (idleFbx.animations && idleFbx.animations.length > 0) {
              const idleAnim = idleFbx.animations[0];
              idleAnim.name = 'idle';
              setIdleAnimation(idleAnim);

              setTimeout(() => {
                if (mixerRef.current && idleAnim) {
                  const idleAction = mixerRef.current.clipAction(idleAnim);
                  idleAction.reset();
                  idleAction.setLoop(THREE.LoopRepeat, Infinity);
                  idleAction.fadeIn(0.5);
                  idleAction.play();
                  setCurrentAction(idleAction);
                }
              }, 100);
            }
          },
          undefined,
          (error: any) => {
            console.error('Error loading idle animation:', error);
          }
        );

        onLoaded?.();
      },
      undefined,
      (error: any) => {
        setError('Failed to load FBX avatar model');
        console.error('Error loading FBX model:', error);
      }
    );
  }, [onLoaded]);

  // Center model function
  const centerModel = (scene: THREE.Group) => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = 3.0 / Math.max(size.x, size.y, size.z);
    scene.scale.setScalar(scale);

    const verticalOffset = -size.y * scale * 0.78;
    scene.position.set(0, verticalOffset, 0);
  };

  // Start idle animation if both character and animation are loaded
  useEffect(() => {
    if (fbx && idleAnimation) {
      playIdleAnimation();
    }
  }, [fbx, idleAnimation]);

  // Animation update
  useFrame((state, delta) => {
    if (mixerRef.current) {
      const clampedDelta = Math.min(delta, 1 / 30);
      mixerRef.current.update(clampedDelta);
    }
  });

  // ---------- RENDER ---------
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

const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  isSpeaking,
  shouldPlayGreeting = false,
  shouldSpeakQuestion = false,
  firstQuestionText = "",
  hasStartedTest,
}) => {
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

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: '#8310FF' }} />
          <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
            Loading Avatar...
          </Typography>
        </Box>
      )}

      <Canvas
        camera={{ position: [0, 0, 8], fov: 18, near: 0.01 }}
        style={{
          width: '100%',
          height: '100%',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        <ambientLight intensity={0.7} color="#ffffff" />
        <directionalLight
          position={[2, 3, 2]}
          intensity={3.0}
          color="#ffffff"
          target-position={[0, 0, 0]}
          castShadow
        />
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
      </Canvas>
    </Box>
  );
};

export default AvatarCanvas;
