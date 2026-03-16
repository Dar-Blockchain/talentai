import { useState, useRef, useEffect, useCallback } from 'react';
import { AssemblyAI } from 'assemblyai';
import { InterviewConfig, InterviewMessage, AgentState, SpeechPhase } from '@/types/interview';

export interface UseAudioTranscriptionReturn {
  // Recording
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  isMuted: boolean;
  isVoiceActive: boolean;
  setIsVoiceActive: (val: boolean) => void;
  currentTranscript: string;
  accumulatedTranscript: string;
  isConnecting: boolean;
  // Speaking
  accumulatedTurns: string[];
  // Silence
  speechPhase: SpeechPhase;
  currentSilenceDuration: number;
  adaptiveSilenceThreshold: number;
  silenceCount: number;
  setSilenceCount: (val: number) => void;
  // Reading time
  isInReadingTime: boolean;
  readingTimeLeft: number;
  questionReadingTime: number | null;
  setQuestionReadingTime: (val: number | null) => void;
  // Agent state
  agentState: AgentState;
  setAgentState: (val: AgentState) => void;
  agentMessage: string;
  setAgentMessage: (val: string) => void;
  // Debug
  debugMode: boolean;
  setDebugMode: (val: boolean) => void;
  silenceDebugLog: string[];
  transcriptDebugLog: string[];
  // Actions
  initializeAudio: () => Promise<void>;
  cleanupAssemblyAI: () => Promise<void>;
  sendAccumulatedAnswer: () => void;
  resetSilenceDetection: () => void;
  // Refs
  audioStreamRef: React.MutableRefObject<MediaStream | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  // Highlight
  questionHighlight: boolean;
  setQuestionHighlight: (val: boolean) => void;
  // Backend silence config
  backendSilenceConfig: any;
  setBackendSilenceConfig: (val: any) => void;
  setAdaptiveSilenceThreshold: (val: number) => void;
  // Conversation
  conversationHistory: InterviewMessage[];
  setConversationHistory: React.Dispatch<React.SetStateAction<InterviewMessage[]>>;
  // Last voice activity
  lastVoiceActivity: number;
  setLastVoiceActivity: (val: number) => void;
  // Coverage dashboard
  coverageDashboardExpanded: boolean;
  setCoverageDashboardExpanded: (val: boolean) => void;
}

export interface UseAudioTranscriptionOptions {
  socketRef: React.MutableRefObject<any>;
  sessionIdRef: React.MutableRefObject<string | null>;
  interviewConfig: InterviewConfig;
  interviewStatus: string;
  showNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
  jobData?: any;
}

export const useAudioTranscription = ({
  socketRef,
  sessionIdRef,
  interviewConfig,
  interviewStatus,
  showNotification,
  jobData,
}: UseAudioTranscriptionOptions): UseAudioTranscriptionReturn => {
  // Audio and Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Assembly AI States
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriberRef = useRef<any | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Enhanced Transcript Management
  const [transcriptChunks, setTranscriptChunks] = useState<string[]>([]);
  const [finalTranscriptSent, setFinalTranscriptSent] = useState(false);
  const [lastFinalTranscriptTime, setLastFinalTranscriptTime] = useState<number>(0);
  const transcriptDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Speaking Duration Tracking
  const [speakingStartTime, setSpeakingStartTime] = useState<number | null>(null);
  const [lastSpeakingTime, setLastSpeakingTime] = useState<number | null>(null);
  const speakingStartTimeRef = useRef<number | null>(null);
  const minimumSpeakingDuration = 1000;

  // Answer Accumulation System
  const [accumulatedTurns, setAccumulatedTurns] = useState<string[]>([]);
  const [lastTurnTime, setLastTurnTime] = useState<number | null>(null);
  const accumulatedTurnsRef = useRef<string[]>([]);
  const MAX_ACCUMULATED_TURNS = 10;

  // Agent State Tracking
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [agentMessage, setAgentMessage] = useState<string>('');

  // Silence Detection States
  const [silenceCount, setSilenceCount] = useState(0);
  const [lastVoiceActivity, setLastVoiceActivity] = useState<number>(Date.now());
  const [currentSilenceDuration, setCurrentSilenceDuration] = useState(0);
  const [silenceStartTime, setSilenceStartTime] = useState<number | null>(null);
  const [isTrueSilence, setIsTrueSilence] = useState(false);
  const [questionReadingTime, setQuestionReadingTime] = useState<number | null>(null);
  const [speechPhase, setSpeechPhase] = useState<SpeechPhase>('reading');
  const [naturalPauseCount, setNaturalPauseCount] = useState(0);
  const [audioLevelHistory, setAudioLevelHistory] = useState<number[]>([]);

  // Adaptive Silence Thresholds
  const [baseSilenceThreshold] = useState(5000);
  const [adaptiveSilenceThreshold, setAdaptiveSilenceThreshold] = useState(5000);
  const readingTimeBuffer = 10000;
  const naturalPauseThreshold = 2000;
  const maxNaturalPauses = 3;

  // Reading Time States
  const [isInReadingTime, setIsInReadingTime] = useState(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState(0);

  // Question Display States
  const [questionHighlight, setQuestionHighlight] = useState(false);
  const [coverageDashboardExpanded, setCoverageDashboardExpanded] = useState(false);

  // Backend Silence Intelligence State
  const [backendSilenceConfig, setBackendSilenceConfig] = useState<any>(null);

  // Debug States
  const [debugMode, setDebugMode] = useState(false);
  const [silenceDebugLog, setSilenceDebugLog] = useState<string[]>([]);
  const [transcriptDebugLog, setTranscriptDebugLog] = useState<string[]>([]);

  // Conversation History
  const [conversationHistory, setConversationHistory] = useState<InterviewMessage[]>([]);

  // Derive currentMessage from internal conversationHistory (eliminates stale prop lag)
  const currentMessage = conversationHistory
    .filter(m => m.type !== 'system')
    .slice(-1)[0] || null;

  // Safety net: auto-recover from stuck 'thinking' state after 45 seconds
  useEffect(() => {
    if (agentState !== 'thinking') return;

    const safetyTimeout = setTimeout(() => {
      console.warn('Safety net: agentState stuck at "thinking" for 45s, resetting to "waiting"');
      setAgentState('waiting');
      setAgentMessage('Response took too long. You can try submitting again.');
      showNotification('AI response timed out. Please try again.', 'warning');
    }, 45000);

    return () => clearTimeout(safetyTimeout);
  }, [agentState, showNotification]);

  // Debug logging functions
  const addSilenceDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setSilenceDebugLog(prev => [...prev.slice(-19), logEntry]);
    console.log('🔍 SILENCE DEBUG:', logEntry);
  }, []);

  const addTranscriptDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setTranscriptDebugLog(prev => [...prev.slice(-19), logEntry]);
    console.log('🔍 TRANSCRIPT DEBUG:', logEntry);
  }, []);

  // Generate temporary token for Assembly AI streaming
  const generateStreamingToken = async (): Promise<string> => {
    console.log('🔑 [INIT-1] Requesting AssemblyAI V3 temporary token...');

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generate_token' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [INIT-1-FAIL] Token generation failed:', response.status, errorText);
        throw new Error(`Failed to generate streaming token: ${response.status} - ${errorText}`);
      }

      const { token } = await response.json();
      console.log('✅ [INIT-1-SUCCESS] Token received, length:', token?.length || 0);
      return token;
    } catch (error) {
      console.error('❌ [INIT-1-ERROR] Exception during token generation:', error);
      throw error;
    }
  };

  // Extract technical keywords for AssemblyAI word boost — JD skills first, then generic fallback
  const extractTechnicalKeywords = (_config: InterviewConfig, jd?: any): string[] => {
    // Priority 1: JD-specific skills (most important for word boost)
    const jdKeywords: string[] = [];
    if (jd) {
      const skills = jd.skillAnalysis?.requiredSkills || [];
      skills.forEach((s: any) => {
        if (s.name) jdKeywords.push(s.name);
      });
      const softSkills = jd.skillAnalysis?.softSkills || [];
      softSkills.forEach((s: any) => {
        if (s.name) jdKeywords.push(s.name);
      });
      // Extract tech terms from requirements text
      const reqs = jd.jobDetails?.requirements || [];
      reqs.forEach((r: string) => {
        const techTerms = r.match(/[A-Z][a-zA-Z]*(?:\.[a-z]+)?/g) || [];
        techTerms.forEach((t: string) => {
          if (t.length >= 2 && !jdKeywords.includes(t)) jdKeywords.push(t);
        });
      });
    }

    // Priority 2: Generic tech vocabulary (no word.length filter — short terms like API, Git, JWT matter)
    const baseKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift',
      'React', 'Angular', 'Vue', 'Node', 'Express', 'Next', 'Next.js', 'Node.js',
      'Django', 'Flask', 'Spring', 'NestJS', 'Fastify',
      'API', 'REST', 'GraphQL', 'WebSocket', 'microservices',
      'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions',
      'AWS', 'Azure', 'GCP', 'Lambda', 'serverless',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'DynamoDB',
      'Git', 'JWT', 'OAuth', 'SSH', 'SSL', 'DNS',
      'HTML', 'CSS', 'SASS', 'SCSS', 'Tailwind',
      'frontend', 'backend', 'fullstack', 'DevOps',
      'testing', 'Jest', 'Mocha', 'Cypress', 'TDD',
      'Agile', 'Scrum', 'Kanban'
    ];

    // JD skills first (highest priority), then generic — deduplicated, max 100
    const combined = [...new Set([...jdKeywords, ...baseKeywords])];
    return combined.slice(0, 100);
  };

  // Get optimal turn detection config
  const getTurnDetectionConfig = (questionType: string = 'general') => {
    if (questionType === 'quick_response' || questionType === 'confirmation') {
      return {
        end_of_turn_confidence_threshold: 0.7,
        min_end_of_turn_silence_when_confident: 400,
        max_turn_silence: 2500,
      };
    }

    if (questionType === 'technical' || questionType === 'system_design' || questionType === 'coding') {
      return {
        end_of_turn_confidence_threshold: 0.85,
        min_end_of_turn_silence_when_confident: 900,
        max_turn_silence: 10000,
      };
    }

    if (questionType === 'behavioral' || questionType === 'experience') {
      return {
        end_of_turn_confidence_threshold: 0.75,
        min_end_of_turn_silence_when_confident: 700,
        max_turn_silence: 8000,
      };
    }

    return {
      end_of_turn_confidence_threshold: 0.78,
      min_end_of_turn_silence_when_confident: 800,
      max_turn_silence: 8000,
    };
  };

  // Send accumulated answer to backend
  const sendAccumulatedAnswer = useCallback(() => {
    const turns = accumulatedTurnsRef.current;

    if (turns.length === 0) {
      console.log('⚠️ No accumulated turns to send');
      return;
    }

    const completeAnswer = turns.join(' ');

    console.log(`📤 [ACCUMULATION] Sending accumulated answer:`);
    console.log(`   - Turn count: ${turns.length}`);
    console.log(`   - Total length: ${completeAnswer.length} chars`);
    console.log(`   - Content preview: "${completeAnswer.substring(0, 100)}..."`);

    if (socketRef.current?.connected && sessionIdRef.current) {
      setFinalTranscriptSent(true);

      socketRef.current.emit('candidate_response', {
        sessionId: sessionIdRef.current,
        transcript: completeAnswer,
        timestamp: new Date().toISOString(),
        isFinal: true,
        turnCount: turns.length,
        speakingDuration: speakingStartTimeRef.current ? Date.now() - speakingStartTimeRef.current : 0,
        accumulated: true
      });

      setAgentState('thinking');
      setAgentMessage('AI is analyzing your complete response...');
      setSpeechPhase('thinking');

      addTranscriptDebugLog(`📤 Sent ${turns.length} accumulated turns (${completeAnswer.length} chars)`);

      setAccumulatedTurns([]);
      accumulatedTurnsRef.current = [];
      setLastTurnTime(null);
      setSpeakingStartTime(null);
      speakingStartTimeRef.current = null;

      setTimeout(() => {
        setCurrentTranscript('');
      }, 1000);
    }
  }, [socketRef, sessionIdRef, addTranscriptDebugLog]);

  // Reset silence detection state
  const resetSilenceDetection = useCallback(() => {
    setSilenceStartTime(null);
    setCurrentSilenceDuration(0);
    setIsTrueSilence(false);
    setNaturalPauseCount(0);
    setSpeechPhase('reading');
    setAccumulatedTranscript('');
    setCurrentTranscript('');
    setTranscriptChunks([]);
    setFinalTranscriptSent(false);

    setSpeakingStartTime(null);
    setLastSpeakingTime(null);
    speakingStartTimeRef.current = null;

    setAccumulatedTurns([]);
    accumulatedTurnsRef.current = [];
    setLastTurnTime(null);

    if (transcriptDebounceRef.current) {
      clearTimeout(transcriptDebounceRef.current);
      transcriptDebounceRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    addSilenceDebugLog('🔄 Silence detection state reset');
  }, [addSilenceDebugLog]);

  // Adaptive threshold adjustment
  const adjustAdaptiveThreshold = useCallback((responseLength: number, pauseCount: number) => {
    let newThreshold = baseSilenceThreshold;

    if (responseLength > 500) {
      newThreshold += 2000;
    } else if (responseLength > 200) {
      newThreshold += 1000;
    }

    if (pauseCount > 2) {
      newThreshold += 1500;
    }

    setAdaptiveSilenceThreshold(Math.min(newThreshold, 10000));
    console.log('🎯 Adaptive threshold adjusted to:', newThreshold, 'ms');
  }, [baseSilenceThreshold]);

  // Setup Assembly AI streaming transcription
  const setupStreamingTranscription = async (stream: MediaStream) => {
    try {
      console.log('🔧 [INIT-B] Starting AssemblyAI V3 streaming setup...');
      setIsConnecting(true);
      mediaStreamRef.current = stream;

      const tempToken = await generateStreamingToken();

      console.log('🔧 [INIT-B-2] Creating AssemblyAI client...');
      const client = new AssemblyAI({
        apiKey: 'dummy'
      });
      console.log('✅ [INIT-B-2] AssemblyAI client created');

      console.log('🔊 [INIT-B-3] Setting up audio context...');
      const isReusingContext = !!audioContextRef.current;
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      if (isReusingContext) {
        console.log('✅ [INIT-B-3] REUSING existing AudioContext (correct!)');
        console.log('   - Context state:', audioContext.state);
        console.log('   - Sample rate:', audioContext.sampleRate);
      } else {
        console.log('⚠️ [INIT-B-3] Creating NEW AudioContext (unexpected - may cause conflicts)');
        audioContextRef.current = audioContext;
      }

      console.log('🎚️ [INIT-B-4] Creating audio processing chain...');
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      console.log('✅ [INIT-B-4] Audio processing chain created');

      console.log('⚙️ [INIT-B-5] Configuring turn detection...');
      const turnDetectionConfig = getTurnDetectionConfig(currentMessage?.type || 'general');
      console.log('   - Turn detection config:', turnDetectionConfig);

      const actualSampleRate = audioContextRef.current?.sampleRate || 16000;
      console.log('⚠️ [INIT-B-5.5] CRITICAL - Sample rate configuration:');
      console.log(`   - Browser AudioContext rate: ${audioContextRef.current?.sampleRate || 'unknown'} Hz`);
      console.log(`   - AssemblyAI will receive: ${actualSampleRate} Hz`);

      console.log('📡 [INIT-B-6] Creating STREAMING transcriber (V3 API)...');

      const transcriber = client.streaming.transcriber({
        token: tempToken,
        sampleRate: actualSampleRate,
        encoding: 'pcm_s16le',
        keytermsPrompt: extractTechnicalKeywords(interviewConfig, jobData),
        endOfTurnConfidenceThreshold: turnDetectionConfig.end_of_turn_confidence_threshold,
        minEndOfTurnSilenceWhenConfident: turnDetectionConfig.min_end_of_turn_silence_when_confident,
        maxTurnSilence: turnDetectionConfig.max_turn_silence,
      });

      transcriberRef.current = transcriber;
      console.log('✅ [INIT-B-6] Transcriber created and stored in ref');

      console.log('📎 [INIT-B-7] Attaching event handlers...');

      // Handle turn events from V3 streaming API
      transcriber.on('turn', (turn: any) => {
        const text = turn.transcript?.trim();
        if (!text) return;

        console.log('📝 [TURN] Turn event received:');
        console.log('   - Text:', text.slice(0, 100));
        console.log('   - End of turn:', turn.end_of_turn);
        console.log('   - Confidence:', turn.end_of_turn_confidence);

        if (!speakingStartTimeRef.current) {
          const now = Date.now();
          setSpeakingStartTime(now);
          speakingStartTimeRef.current = now;
          setQuestionReadingTime(null);
          setIsInReadingTime(false);
          console.log('🎤 Speaking started - reading time cancelled');
        }
        setLastSpeakingTime(Date.now());

        const MAX_SPEAKING_DURATION = 180000;
        if (speakingStartTimeRef.current) {
          const currentSpeakingDuration = Date.now() - speakingStartTimeRef.current;
          if (currentSpeakingDuration > MAX_SPEAKING_DURATION) {
            console.warn(`⏱️  Speaking too long: ${Math.round(currentSpeakingDuration / 1000)}s - sending accumulated answer + interrupt`);

            if (accumulatedTurnsRef.current.length > 0) {
              console.log(`📤 Sending ${accumulatedTurnsRef.current.length} accumulated turns before interrupt`);
              sendAccumulatedAnswer();
            }

            if (socketRef.current) {
              socketRef.current.emit('speaking_too_long', {
                duration: currentSpeakingDuration
              });
            }

            speakingStartTimeRef.current = null;
            setSpeakingStartTime(null);
            return;
          }
        }

        setCurrentTranscript(text.slice(-200));
        setSpeechPhase('speaking');
        setAgentState('waiting');
        setAgentMessage('Listening to your answer...');
        addTranscriptDebugLog(`📝 Partial: "${text.slice(0, 50)}..."`);

        if (turn.end_of_turn) {
          const finalText = text;
          const now = Date.now();
          const speakingDuration = speakingStartTimeRef.current ? now - speakingStartTimeRef.current : 0;

          console.log('🎯 [TURN-COMPLETE] End of turn detected!');
          console.log('   - Final text length:', finalText.length);
          console.log('   - Confidence:', turn.end_of_turn_confidence);
          console.log('   - Speaking duration:', speakingDuration, 'ms');
          addTranscriptDebugLog(`✅ Turn complete: conf=${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);

          if (speakingDuration < minimumSpeakingDuration) {
            console.warn('⚠️ Speaking duration too short, ignoring turn:', speakingDuration, 'ms');
            addTranscriptDebugLog(`⏱️ Too short: ${speakingDuration}ms < ${minimumSpeakingDuration}ms`);
            return;
          }

          if (turn.end_of_turn_confidence < 0.2) {
            console.warn('⚠️ Very low confidence turn detected:', turn.end_of_turn_confidence);
            addTranscriptDebugLog(`⚠️ Very low confidence: ${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);

            setAgentState('waiting');
            setAgentMessage('Could not clearly hear you. Please continue speaking...');

            showNotification('Speech very unclear - please speak more clearly', 'warning');
            setAccumulatedTranscript(finalText);
            return;
          }

          if (turn.end_of_turn_confidence < 0.6) {
            console.log(`ℹ️ Accepted turn with moderate confidence: ${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);
            addTranscriptDebugLog(`✓ Accepted: ${(turn.end_of_turn_confidence * 100).toFixed(1)}% confidence`);
          }

          if (finalTranscriptSent) {
            console.log('⚠️ [TURN-SKIP] Already processed this turn');
            return;
          }

          const isInReadingTimeNow = questionReadingTime && (now - questionReadingTime < readingTimeBuffer);

          if (isInReadingTimeNow) {
            console.log('📖 Still in reading time, transcript saved but not sent');
            setAccumulatedTranscript(finalText);
            setCurrentTranscript(finalText.slice(-200));
            setAgentState('waiting');
            setAgentMessage(`Reading time: ${Math.ceil((readingTimeBuffer - (now - questionReadingTime!)) / 1000)}s remaining`);
            setSpeechPhase('reading');
            return;
          }

          console.log('✅ [ACCUMULATION] Turn complete - adding to accumulation buffer');
          console.log(`   - Current buffer size: ${accumulatedTurnsRef.current.length} turns`);
          console.log(`   - This turn length: ${finalText.length} chars`);

          const newTurns = [...accumulatedTurnsRef.current, finalText];
          setAccumulatedTurns(newTurns);
          accumulatedTurnsRef.current = newTurns;
          setLastTurnTime(now);
          setAccumulatedTranscript(finalText);
          setCurrentTranscript(finalText.slice(-200));

          setAgentState('waiting');
          setAgentMessage('Listening to your answer...');
          setSpeechPhase('paused');

          addTranscriptDebugLog(`📥 Turn ${accumulatedTurnsRef.current.length} accumulated (${finalText.length} chars)`);

          if (accumulatedTurnsRef.current.length >= MAX_ACCUMULATED_TURNS) {
            console.warn(`⚠️  Max accumulated turns reached (${MAX_ACCUMULATED_TURNS}) - forcing send`);
            addTranscriptDebugLog(`⚠️ Max turns reached - forcing send`);
            sendAccumulatedAnswer();
            return;
          }
        }
      });
      console.log('   ✓ turn handler attached');

      let audioPacketsSent = 0;
      let lastLogTime = Date.now();

      transcriber.on('open', ({ id: aaiSessionId, expires_at }: any) => {
        console.log('🎉 [CONNECTED] AssemblyAI Streaming WebSocket connected!');
        console.log('   - Session ID:', aaiSessionId);
        console.log('   - Expires at:', new Date(expires_at * 1000).toISOString());
        setIsConnecting(false);

        console.log('🔗 [AUDIO-CHAIN] Connecting audio processing chain...');
        source.connect(processor);
        processor.connect(audioContext.destination);
        console.log('✅ [AUDIO-CHAIN] Audio chain connected');

        processor.onaudioprocess = (event) => {
          if (transcriber) {
            const inputBuffer = event.inputBuffer.getChannelData(0);
            const int16Buffer = new Int16Array(inputBuffer.length);
            for (let i = 0; i < inputBuffer.length; i++) {
              int16Buffer[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32767));
            }

            transcriber.sendAudio(int16Buffer.buffer);
            audioPacketsSent++;

            const now = Date.now();
            if (now - lastLogTime > 5000) {
              console.log(`📡 [AUDIO-STREAM] Streaming active - ${audioPacketsSent} packets sent`);
              lastLogTime = now;
            }
          }
        };

        console.log('🎧 [AUDIO-PROCESS] Audio processor started - sending data to AssemblyAI');
        addTranscriptDebugLog('🎤 Streaming started');
      });
      console.log('   ✓ open handler attached');

      transcriber.on('error', (error: any) => {
        console.error('❌ [ERROR] AssemblyAI Error:', error);
        setIsConnecting(false);
        showNotification('Speech recognition error. Please try again.', 'error');
        addTranscriptDebugLog(`❌ Error: ${error.message || error}`);
      });
      console.log('   ✓ error handler attached');

      transcriber.on('close', () => {
        console.log('🔌 [CLOSED] AssemblyAI connection closed');
        console.log('   - Total packets sent:', audioPacketsSent);
        setIsConnecting(false);
        addTranscriptDebugLog('🔌 Streaming stopped');
      });
      console.log('   ✓ close handler attached');

      console.log('✅ [INIT-B-7] All event handlers attached');

      console.log('🚀 [INIT-B-8] Connecting to AssemblyAI WebSocket...');
      await transcriber.connect();
      console.log('✅ [INIT-B-8] Connection initiated (waiting for "open" event)');

    } catch (error) {
      console.error('❌ [INIT-B-ERROR] Setup failed at some step:', error);
      setIsConnecting(false);
      showNotification('Failed to setup speech recognition', 'error');
      addTranscriptDebugLog(`❌ Setup failed: ${(error as Error).message}`);
      throw error;
    }

    console.log('✅ [INIT-B-COMPLETE] AssemblyAI V3 setup complete!');
  };

  // Cleanup Assembly AI connections
  const cleanupAssemblyAI = useCallback(async () => {
    try {
      if (transcriberRef.current) {
        try {
          await transcriberRef.current.close();
          console.log('✅ AssemblyAI transcriber closed');
        } catch (error) {
          console.error('Error closing transcriber:', error);
        }
        transcriberRef.current = null;
      }

      if (processorRef.current) {
        try {
          processorRef.current.disconnect();
        } catch (error) {
          console.error('Error disconnecting processor:', error);
        }
        processorRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close();
        } catch (error) {
          console.error('Error closing audio context:', error);
        }
        audioContextRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsConnecting(false);
      console.log('🧹 AssemblyAI cleanup complete');
    } catch (error) {
      console.error('⚠️ Error during Assembly AI cleanup:', error);
    }
  }, []);

  // Voice Activity Detection
  const startVoiceActivityDetection = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Manual submission only - user clicks "Next Question" button when done speaking
  };

  // Initialize audio for recording and voice activity detection
  const initializeAudio = useCallback(async () => {
    try {
      console.log('🎤 [INIT-A] Starting audio initialization...');
      console.log('🎤 [INIT-A-1] Requesting microphone access (getUserMedia)...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      console.log('✅ [INIT-A-1] Microphone access granted');
      console.log('   - Audio tracks:', stream.getAudioTracks().length);
      console.log('   - Track label:', stream.getAudioTracks()[0]?.label || 'unknown');
      console.log('   - Track enabled:', stream.getAudioTracks()[0]?.enabled);

      audioStreamRef.current = stream;

      console.log('🔊 [INIT-A-2] Creating AudioContext for voice activity detection...');
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      console.log('✅ [INIT-A-2] AudioContext created');
      console.log('   - Sample rate:', audioContext.sampleRate);
      console.log('   - State:', audioContext.state);

      console.log('📊 [INIT-A-3] Setting up audio analyser...');
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      console.log('✅ [INIT-A-3] Audio analyser connected');

      setIsRecording(true);
      console.log('🔍 [INIT-A-4] Starting voice activity detection...');
      startVoiceActivityDetection();

      console.log('🚀 [INIT-A-5] Initializing AssemblyAI V3 transcription...');
      try {
        await setupStreamingTranscription(stream);
        console.log('✅ [INIT-A-5] AssemblyAI transcription initialized successfully');
      } catch (transcriptionError) {
        console.error('❌ [INIT-A-5-FAIL] AssemblyAI setup failed:', transcriptionError);
        showNotification('Transcription service unavailable, but interview can continue', 'warning');
      }

      console.log('✅ [INIT-A-COMPLETE] Audio initialization complete');

    } catch (error) {
      console.error('❌ [INIT-A-ERROR] Failed to initialize audio:', error);
      throw error;
    }
  }, [interviewConfig, showNotification]);

  // Reset state when new question arrives
  useEffect(() => {
    if (currentMessage) {
      setAccumulatedTranscript('');
      setCurrentTranscript('');
      setFinalTranscriptSent(false);
      setAgentState('waiting');
      setAgentMessage('Listening to your answer...');
      setSpeechPhase('reading');

      setSpeakingStartTime(null);
      setLastSpeakingTime(null);
      speakingStartTimeRef.current = null;

      setSilenceStartTime(null);
      setIsTrueSilence(false);
      setCurrentSilenceDuration(0);

      setAccumulatedTurns([]);
      accumulatedTurnsRef.current = [];
      setLastTurnTime(null);

      addTranscriptDebugLog(`🆕 New question received, state reset`);
    }
  }, [currentMessage, addTranscriptDebugLog]);

  // Reading Time Management
  useEffect(() => {
    let readingTimer: NodeJS.Timeout | null = null;

    if (questionReadingTime) {
      const now = Date.now();
      const timeElapsed = now - questionReadingTime;
      const timeRemaining = readingTimeBuffer - timeElapsed;

      if (timeRemaining > 0) {
        setIsInReadingTime(true);
        setReadingTimeLeft(timeRemaining);

        readingTimer = setInterval(() => {
          const currentTime = Date.now();
          const elapsed = currentTime - questionReadingTime;
          const remaining = readingTimeBuffer - elapsed;

          if (remaining > 0) {
            setReadingTimeLeft(remaining);
          } else {
            setIsInReadingTime(false);
            setReadingTimeLeft(0);
            setQuestionReadingTime(null);
          }
        }, 100);
      } else {
        setIsInReadingTime(false);
        setReadingTimeLeft(0);
        setQuestionReadingTime(null);
      }
    } else {
      setIsInReadingTime(false);
      setReadingTimeLeft(0);
    }

    return () => {
      if (readingTimer) {
        clearInterval(readingTimer);
      }
    };
  }, [questionReadingTime, readingTimeBuffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAssemblyAI();
    };
  }, [cleanupAssemblyAI]);

  return {
    // Recording
    isRecording,
    setIsRecording,
    isMuted,
    isVoiceActive,
    setIsVoiceActive,
    currentTranscript,
    accumulatedTranscript,
    isConnecting,
    // Speaking
    accumulatedTurns,
    // Silence
    speechPhase,
    currentSilenceDuration,
    adaptiveSilenceThreshold,
    silenceCount,
    setSilenceCount,
    // Reading time
    isInReadingTime,
    readingTimeLeft,
    questionReadingTime,
    setQuestionReadingTime,
    // Agent state
    agentState,
    setAgentState,
    agentMessage,
    setAgentMessage,
    // Debug
    debugMode,
    setDebugMode,
    silenceDebugLog,
    transcriptDebugLog,
    // Actions
    initializeAudio,
    cleanupAssemblyAI,
    sendAccumulatedAnswer,
    resetSilenceDetection,
    // Refs
    audioStreamRef,
    audioContextRef,
    // Highlight
    questionHighlight,
    setQuestionHighlight,
    // Backend silence config
    backendSilenceConfig,
    setBackendSilenceConfig,
    setAdaptiveSilenceThreshold,
    // Conversation
    conversationHistory,
    setConversationHistory,
    // Last voice activity
    lastVoiceActivity,
    setLastVoiceActivity,
    // Coverage dashboard
    coverageDashboardExpanded,
    setCoverageDashboardExpanded,
  };
};
