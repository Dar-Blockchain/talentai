import { useState, useRef, useEffect, useCallback } from 'react';
import { AssemblyAI } from 'assemblyai';
import { InterviewConfig, InterviewMessage, AgentState, SpeechPhase } from '../types/interview';
import type { UseAudioTranscriptionReturn, UseAudioTranscriptionOptions } from '../types/hooks';

export type { UseAudioTranscriptionReturn, UseAudioTranscriptionOptions };

export const useAudioTranscription = ({
  socketRef,
  sessionIdRef,
  interviewConfig,
  showNotification,
  jobData,
}: UseAudioTranscriptionOptions): UseAudioTranscriptionReturn => {

  // ── Recording ────────────────────────────────────────────────────────────────
  const [isRecording, setIsRecording]               = useState(false);
  const [isMuted]                                   = useState(false);
  const [currentTranscript, _setCurrentTranscript]  = useState('');
  const currentTranscriptRef = useRef('');
  const setCurrentTranscript = useCallback((val: string) => {
    currentTranscriptRef.current = val;
    _setCurrentTranscript(val);
  }, []);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const [isVoiceActive, setIsVoiceActive]           = useState(false);
  const [isConnecting, setIsConnecting]             = useState(false);
  const audioStreamRef  = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef    = useRef<ScriptProcessorNode | null>(null);
  const transcriberRef  = useRef<any>(null);
  const mediaStreamRef  = useRef<MediaStream | null>(null);

  // ── Transcript / turn accumulation ───────────────────────────────────────────
  const [finalTranscriptSent, setFinalTranscriptSent] = useState(false);
  const [accumulatedTurns, setAccumulatedTurns]       = useState<string[]>([]);
  const accumulatedTurnsRef = useRef<string[]>([]);
  const speakingStartTimeRef = useRef<number | null>(null);
  const MAX_ACCUMULATED_TURNS = 10;
  const minimumSpeakingDuration = 500;

  // ── Agent state ───────────────────────────────────────────────────────────────
  const [agentState, setAgentState]   = useState<AgentState>('idle');
  const [agentMessage, setAgentMessage] = useState<string>('');

  // ── Silence / speech phase ────────────────────────────────────────────────────
  const [silenceCount, setSilenceCount]               = useState(0);
  const [lastVoiceActivity, setLastVoiceActivity]     = useState<number>(Date.now());
  const [currentSilenceDuration, setCurrentSilenceDuration] = useState(0);
  const [questionReadingTime, setQuestionReadingTime] = useState<number | null>(null);
  const [speechPhase, setSpeechPhase]                 = useState<SpeechPhase>('reading');
  const [adaptiveSilenceThreshold, setAdaptiveSilenceThreshold] = useState(5000);
  const readingTimeBuffer = 10000;

  // ── Reading time ──────────────────────────────────────────────────────────────
  const [isInReadingTime, setIsInReadingTime] = useState(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState(0);

  // ── UI helpers ────────────────────────────────────────────────────────────────
  const [questionHighlight, setQuestionHighlight]               = useState(false);
  const [coverageDashboardExpanded, setCoverageDashboardExpanded] = useState(false);
  const [backendSilenceConfig, setBackendSilenceConfig]         = useState<any>(null);

  // ── Debug ──────────────────────────────────────────────────────────────────────
  const [debugMode, setDebugMode]                 = useState(false);
  const [silenceDebugLog, setSilenceDebugLog]     = useState<string[]>([]);
  const [transcriptDebugLog, setTranscriptDebugLog] = useState<string[]>([]);

  // ── Conversation ──────────────────────────────────────────────────────────────
  const [conversationHistory, setConversationHistory] = useState<InterviewMessage[]>([]);

  const currentMessage = conversationHistory.filter(m => m.type !== 'system').slice(-1)[0] ?? null;

  // ── Debug loggers ─────────────────────────────────────────────────────────────

  const addSilenceDebugLog = useCallback((message: string) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
    setSilenceDebugLog(prev => [...prev.slice(-19), entry]);
  }, []);

  const addTranscriptDebugLog = useCallback((message: string) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
    setTranscriptDebugLog(prev => [...prev.slice(-19), entry]);
  }, []);

  // ── Safety net: recover from stuck 'thinking' after 45 s ─────────────────────

  useEffect(() => {
    if (agentState !== 'thinking') return;
    const t = setTimeout(() => {
      setAgentState('waiting');
      setAgentMessage('Response took too long. You can try submitting again.');
      showNotification('AI response timed out. Please try again.', 'warning');
    }, 45000);
    return () => clearTimeout(t);
  }, [agentState, showNotification]);

  // ── Token ─────────────────────────────────────────────────────────────────────

  const generateStreamingToken = async (): Promise<string> => {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_token' }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token generation failed: ${response.status} - ${text}`);
    }
    const { token } = await response.json();
    return token;
  };

  // ── Keyword extraction for AssemblyAI word boost ──────────────────────────────

  const extractTechnicalKeywords = (_config: InterviewConfig, jd?: any): string[] => {
    const jdKeywords: string[] = [];
    if (jd) {
      (jd.skillAnalysis?.requiredSkills || []).forEach((s: any) => { if (s.name) jdKeywords.push(s.name); });
      (jd.skillAnalysis?.softSkills     || []).forEach((s: any) => { if (s.name) jdKeywords.push(s.name); });
      (jd.jobDetails?.requirements      || []).forEach((r: string) => {
        (r.match(/[A-Z][a-zA-Z]*(?:\.[a-z]+)?/g) || []).forEach((t: string) => {
          if (t.length >= 2 && !jdKeywords.includes(t)) jdKeywords.push(t);
        });
      });
    }
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
      'Agile', 'Scrum', 'Kanban',
    ];
    return [...new Set([...jdKeywords, ...baseKeywords])].slice(0, 100);
  };

  // ── Turn detection config per question type ───────────────────────────────────

  const getTurnDetectionConfig = (questionType: string = 'general') => {
    if (questionType === 'quick_response' || questionType === 'confirmation') {
      return { end_of_turn_confidence_threshold: 0.65, min_end_of_turn_silence_when_confident: 250, max_turn_silence: 2000 };
    }
    if (questionType === 'technical' || questionType === 'system_design' || questionType === 'coding') {
      return { end_of_turn_confidence_threshold: 0.78, min_end_of_turn_silence_when_confident: 550, max_turn_silence: 8000 };
    }
    if (questionType === 'behavioral' || questionType === 'experience') {
      return { end_of_turn_confidence_threshold: 0.72, min_end_of_turn_silence_when_confident: 400, max_turn_silence: 6000 };
    }
    return   { end_of_turn_confidence_threshold: 0.72, min_end_of_turn_silence_when_confident: 400, max_turn_silence: 6000 };
  };

  // ── Skip guard (prevents double-fire) ────────────────────────────────────────

  const skipGuardRef = useRef(false);

  const skipQuestion = useCallback(() => {
    if (skipGuardRef.current) return;
    if (!socketRef.current?.connected || !sessionIdRef.current) return;

    skipGuardRef.current = true;

    setCurrentTranscript('');
    setAccumulatedTranscript('');
    accumulatedTurnsRef.current = [];
    setFinalTranscriptSent(false);

    setAgentState('thinking');
    setAgentMessage('Skipping to next question…');

    socketRef.current.emit('skip_question', {
      sessionId: sessionIdRef.current,
      timestamp: new Date().toISOString(),
    });

    setConversationHistory(prev => [
      ...prev,
      { type: 'system' as const, content: '(Question skipped)', timestamp: new Date().toISOString() },
    ]);
  }, [socketRef, sessionIdRef]);

  const resetSkipGuard = useCallback(() => { skipGuardRef.current = false; }, []);

  // ── Send accumulated turns to backend ────────────────────────────────────────

  const sendAccumulatedAnswer = useCallback(() => {
    // Use accumulated turns; fall back to currentTranscript (e.g. short "I don't know"
    // that passed partial transcription but whose end_of_turn never fired in time).
    let turns = accumulatedTurnsRef.current;
    if (turns.length === 0 && currentTranscriptRef.current.trim()) {
      turns = [currentTranscriptRef.current.trim()];
    }
    if (turns.length === 0) return;

    const completeAnswer = turns.join(' ');

    if (!socketRef.current?.connected || !sessionIdRef.current) return;

    setFinalTranscriptSent(true);
    socketRef.current.emit('candidate_response', {
      sessionId:       sessionIdRef.current,
      transcript:      completeAnswer,
      timestamp:       new Date().toISOString(),
      isFinal:         true,
      turnCount:       turns.length,
      speakingDuration: speakingStartTimeRef.current ? Date.now() - speakingStartTimeRef.current : 0,
      accumulated:     true,
    });

    setAgentState('thinking');
    setAgentMessage('AI is analyzing your complete response...');
    setSpeechPhase('thinking');
    addTranscriptDebugLog(`📤 Sent ${turns.length} turns (${completeAnswer.length} chars)`);

    setAccumulatedTurns([]);
    accumulatedTurnsRef.current = [];
    speakingStartTimeRef.current = null;
    setTimeout(() => setCurrentTranscript(''), 1000);
  }, [socketRef, sessionIdRef, addTranscriptDebugLog]);

  // ── Reset per-question state ──────────────────────────────────────────────────

  const resetSilenceDetection = useCallback(() => {
    setCurrentSilenceDuration(0);
    setSpeechPhase('reading');
    setAccumulatedTranscript('');
    setCurrentTranscript('');
    setFinalTranscriptSent(false);
    speakingStartTimeRef.current = null;
    setAccumulatedTurns([]);
    accumulatedTurnsRef.current = [];
    addSilenceDebugLog('🔄 State reset for new question');
  }, [addSilenceDebugLog]);

  // ── AssemblyAI streaming setup ────────────────────────────────────────────────

  const setupStreamingTranscription = async (stream: MediaStream) => {
    setIsConnecting(true);
    mediaStreamRef.current = stream;

    try {
      const tempToken = await generateStreamingToken();

      const client = new AssemblyAI({ apiKey: 'dummy' });

      const audioContext = audioContextRef.current
        ?? new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!audioContextRef.current) audioContextRef.current = audioContext;

      const source    = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);
      processorRef.current = processor;

      const turnCfg    = getTurnDetectionConfig(currentMessage?.type || 'general');
      const actualRate = audioContextRef.current?.sampleRate || 16000;
      const lang       = interviewConfig.sessionSettings?.language || 'en';
      const isEnglish  = lang === 'en';

      const transcriber = client.streaming.transcriber({
        token:                             tempToken,
        sampleRate:                        actualRate,
        encoding:                          'pcm_s16le',
        speechModel:                       isEnglish ? 'universal-streaming-english' : 'universal-streaming-multilingual',
        ...(isEnglish ? { keytermsPrompt: extractTechnicalKeywords(interviewConfig, jobData) } : {}),
        endOfTurnConfidenceThreshold:      turnCfg.end_of_turn_confidence_threshold,
        minEndOfTurnSilenceWhenConfident:  turnCfg.min_end_of_turn_silence_when_confident,
        maxTurnSilence:                    turnCfg.max_turn_silence,
      });

      transcriberRef.current = transcriber;

      transcriber.on('turn', (turn: any) => {
        const text = turn.transcript?.trim();
        if (!text) return;

        if (!speakingStartTimeRef.current) {
          speakingStartTimeRef.current = Date.now();
          setQuestionReadingTime(null);
          setIsInReadingTime(false);
        }

        const MAX_SPEAKING_DURATION = 180000;
        const speakingDuration = Date.now() - speakingStartTimeRef.current;
        if (speakingDuration > MAX_SPEAKING_DURATION) {
          if (accumulatedTurnsRef.current.length > 0) sendAccumulatedAnswer();
          socketRef.current?.emit('speaking_too_long', { duration: speakingDuration });
          speakingStartTimeRef.current = null;
          return;
        }

        setCurrentTranscript(text);
        setSpeechPhase('speaking');
        setAgentState('waiting');
        setAgentMessage('Listening to your answer...');
        addTranscriptDebugLog(`📝 Partial: "${text.slice(0, 50)}..."`);

        if (!turn.end_of_turn) return;

        const now = Date.now();
        const duration = speakingStartTimeRef.current ? now - speakingStartTimeRef.current : 0;
        addTranscriptDebugLog(`✅ Turn complete: conf=${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);

        if (duration < minimumSpeakingDuration) {
          addTranscriptDebugLog(`⏱️ Too short: ${duration}ms < ${minimumSpeakingDuration}ms`);
          return;
        }

        if (turn.end_of_turn_confidence < 0.2) {
          setAgentState('waiting');
          setAgentMessage('Could not clearly hear you. Please continue speaking...');
          showNotification('Speech very unclear - please speak more clearly', 'warning');
          setAccumulatedTranscript(text);
          addTranscriptDebugLog(`⚠️ Very low confidence: ${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);
          return;
        }

        if (finalTranscriptSent) return;

        const inReadingTime = questionReadingTime && (now - questionReadingTime < readingTimeBuffer);
        if (inReadingTime) {
          setAccumulatedTranscript(text);
          setCurrentTranscript(text);
          setAgentState('waiting');
          setAgentMessage(`Reading time: ${Math.ceil((readingTimeBuffer - (now - questionReadingTime!)) / 1000)}s remaining`);
          setSpeechPhase('reading');
          return;
        }

        const newTurns = [...accumulatedTurnsRef.current, text];
        setAccumulatedTurns(newTurns);
        accumulatedTurnsRef.current = newTurns;

        const fullTranscript = newTurns.join(' ');
        setAccumulatedTranscript(fullTranscript);
        setCurrentTranscript(fullTranscript);
        setAgentState('waiting');
        setAgentMessage('Listening to your answer...');
        setSpeechPhase('paused');
        addTranscriptDebugLog(`📥 Turn ${newTurns.length} accumulated (${text.length} chars)`);

        if (newTurns.length >= MAX_ACCUMULATED_TURNS) {
          addTranscriptDebugLog(`⚠️ Max turns reached — forcing send`);
          sendAccumulatedAnswer();
        }
      });

      let audioPacketsSent = 0;
      let lastLogTime = Date.now();
      // VAD state — hysteresis prevents flickering on brief / ambient sounds
      let prevVoiceActive  = false;
      let speechFrames     = 0;  // consecutive frames above threshold
      let silenceFrames    = 0;  // consecutive frames below threshold
      // At 16 kHz / 1024 buffer each frame ≈ 64 ms
      const SPEECH_THRESHOLD  = 0.022; // ~−33 dBFS — above ambient noise, below normal speech
      const FRAMES_TO_ACTIVATE = 3;    // 3 × 64 ms = ~192 ms sustained to activate
      const FRAMES_TO_RELEASE  = 6;    // 6 × 64 ms = ~384 ms of silence to deactivate

      transcriber.on('open', ({ id: aaiSessionId }: any) => {
        console.log('✅ AssemblyAI connected, session:', aaiSessionId);
        setIsConnecting(false);

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (event) => {
          const inputBuffer = event.inputBuffer.getChannelData(0);

          // ── Voice-activity detection: RMS + hysteresis ───────────────────
          let sumSq = 0;
          for (let i = 0; i < inputBuffer.length; i++) sumSq += inputBuffer[i] * inputBuffer[i];
          const rms = Math.sqrt(sumSq / inputBuffer.length);

          if (rms > SPEECH_THRESHOLD) {
            speechFrames++;
            silenceFrames = 0;
            if (!prevVoiceActive && speechFrames >= FRAMES_TO_ACTIVATE) {
              prevVoiceActive = true;
              setIsVoiceActive(true);
            }
          } else {
            silenceFrames++;
            speechFrames = 0;
            if (prevVoiceActive && silenceFrames >= FRAMES_TO_RELEASE) {
              prevVoiceActive = false;
              setIsVoiceActive(false);
            }
          }
          // ─────────────────────────────────────────────────────────────────

          const int16Buffer = new Int16Array(inputBuffer.length);
          for (let i = 0; i < inputBuffer.length; i++) {
            int16Buffer[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32767));
          }
          transcriber.sendAudio(int16Buffer.buffer);
          audioPacketsSent++;
          const now = Date.now();
          if (now - lastLogTime > 5000) { console.log(`📡 Streaming: ${audioPacketsSent} packets`); lastLogTime = now; }
        };

        addTranscriptDebugLog('🎤 Streaming started');
      });

      transcriber.on('error', (error: any) => {
        console.error('❌ AssemblyAI error:', error);
        setIsConnecting(false);
        showNotification('Speech recognition error. Please try again.', 'error');
        addTranscriptDebugLog(`❌ Error: ${error.message || error}`);
      });

      transcriber.on('close', () => {
        console.log('🔌 AssemblyAI connection closed');
        setIsConnecting(false);
        addTranscriptDebugLog('🔌 Streaming stopped');
      });

      await transcriber.connect();

    } catch (error) {
      setIsConnecting(false);
      showNotification('Failed to setup speech recognition', 'error');
      addTranscriptDebugLog(`❌ Setup failed: ${(error as Error).message}`);
      throw error;
    }
  };

  // ── Initialize audio + transcription ─────────────────────────────────────────

  const initializeAudio = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000, channelCount: 1 },
    });

    audioStreamRef.current = stream;
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    setIsRecording(true);

    try {
      await setupStreamingTranscription(stream);
    } catch {
      showNotification('Transcription service unavailable, but interview can continue', 'warning');
    }
  }, [interviewConfig, showNotification]);

  // ── Cleanup AssemblyAI ────────────────────────────────────────────────────────

  const cleanupAssemblyAI = useCallback(async () => {
    try {
      if (transcriberRef.current) {
        try { await transcriberRef.current.close(); } catch {}
        transcriberRef.current = null;
      }
      if (processorRef.current) {
        processorRef.current.onaudioprocess = null;
        try { processorRef.current.disconnect(); } catch {}
        processorRef.current = null;
      }
      if (audioContextRef.current?.state !== 'closed') {
        try { await audioContextRef.current?.close(); } catch {}
        audioContextRef.current = null;
      }
      setIsVoiceActive(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      setIsConnecting(false);
    } catch (error) {
      console.error('⚠️ Cleanup error:', error);
    }
  }, []);

  // ── Reset state when new question arrives ─────────────────────────────────────

  useEffect(() => {
    if (!currentMessage) return;
    setAccumulatedTranscript('');
    setCurrentTranscript('');
    setFinalTranscriptSent(false);
    setAgentState('waiting');
    setAgentMessage('Listening to your answer...');
    setSpeechPhase('reading');
    speakingStartTimeRef.current = null;
    setAccumulatedTurns([]);
    accumulatedTurnsRef.current = [];
    addTranscriptDebugLog('🆕 New question — state reset');
  }, [currentMessage, addTranscriptDebugLog]);

  // ── Reading time countdown ────────────────────────────────────────────────────

  useEffect(() => {
    if (!questionReadingTime) {
      setIsInReadingTime(false);
      setReadingTimeLeft(0);
      return;
    }

    const elapsed   = Date.now() - questionReadingTime;
    const remaining = readingTimeBuffer - elapsed;
    if (remaining <= 0) {
      setIsInReadingTime(false);
      setReadingTimeLeft(0);
      setQuestionReadingTime(null);
      return;
    }

    setIsInReadingTime(true);
    setReadingTimeLeft(remaining);

    const timer = setInterval(() => {
      const rem = readingTimeBuffer - (Date.now() - questionReadingTime);
      if (rem > 0) {
        setReadingTimeLeft(rem);
      } else {
        setIsInReadingTime(false);
        setReadingTimeLeft(0);
        setQuestionReadingTime(null);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [questionReadingTime]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────────

  useEffect(() => () => { cleanupAssemblyAI(); }, [cleanupAssemblyAI]);

  // ── Return ────────────────────────────────────────────────────────────────────

  return {
    isRecording, setIsRecording,
    isMuted,
    isVoiceActive, setIsVoiceActive,
    currentTranscript,
    accumulatedTranscript,
    isConnecting,
    accumulatedTurns,
    speechPhase,
    currentSilenceDuration,
    adaptiveSilenceThreshold,
    silenceCount, setSilenceCount,
    isInReadingTime,
    readingTimeLeft,
    questionReadingTime, setQuestionReadingTime,
    agentState, setAgentState,
    agentMessage, setAgentMessage,
    debugMode, setDebugMode,
    silenceDebugLog,
    transcriptDebugLog,
    initializeAudio,
    cleanupAssemblyAI,
    sendAccumulatedAnswer,
    resetSilenceDetection,
    audioStreamRef,
    audioContextRef,
    questionHighlight, setQuestionHighlight,
    backendSilenceConfig, setBackendSilenceConfig,
    setAdaptiveSilenceThreshold,
    conversationHistory, setConversationHistory,
    lastVoiceActivity, setLastVoiceActivity,
    coverageDashboardExpanded, setCoverageDashboardExpanded,
    skipQuestion,
    resetSkipGuard,
  };
};
