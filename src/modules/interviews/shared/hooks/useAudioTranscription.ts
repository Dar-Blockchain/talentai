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
  const [accumulatedTurns, setAccumulatedTurns]       = useState<string[]>([]);
  const accumulatedTurnsRef = useRef<string[]>([]);
  // Blocks late AssemblyAI turns that arrive after submit/skip from landing on the next question.
  // Set true on submit/skip; cleared only when the next question's reading time ends.
  const blockTurnsRef = useRef(false);
  // Delays submit availability after each turn so trailing words finish before the button activates.
  const submitGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakingStartTimeRef = useRef<number | null>(null);
  // Tracks the most recent partial transcript within the current turn.
  // AssemblyAI's end_of_turn transcript is sometimes shorter than the last partial
  // (last word gets dropped when the model revises under silence pressure).
  // We compare both and keep whichever has more words.
  const lastPartialRef = useRef('');
  const MAX_ACCUMULATED_TURNS = 10;
  // Lowered from 500ms: short answers like "I used React" were being discarded
  // because speakingStartTimeRef is set on first turn arrival (not actual speech
  // start), so real speaking time measured here is always shorter than actual.
  const minimumSpeakingDuration = 200;

  // ── Agent state ───────────────────────────────────────────────────────────────
  const [agentState, setAgentState]   = useState<AgentState>('idle');
  const [agentMessage, setAgentMessage] = useState<string>('');
  // True only after 700 ms of silence following the last AssemblyAI audio event.
  const [canSubmit, setCanSubmit] = useState(false);

  // ── Silence / speech phase ────────────────────────────────────────────────────
  const [silenceCount, setSilenceCount]               = useState(0);
  const [lastVoiceActivity, setLastVoiceActivity]     = useState<number>(Date.now());
  const [currentSilenceDuration, setCurrentSilenceDuration] = useState(0);
  const [silenceWarning, setSilenceWarning]           = useState<number | null>(null);
  const silenceTimerLastVoiceRef  = useRef<number>(Date.now());
  const silenceAutoSkipFiredRef   = useRef(false);
  const [questionReadingTime, setQuestionReadingTime] = useState<number | null>(null);
  // True only for the last 1500 ms of reading time — flushes AssemblyAI's buffer
  // before reading time ends so no stale turns arrive after it.
  const sendSilenceRef = useRef(false);
  const [speechPhase, _setSpeechPhase]                = useState<SpeechPhase>('reading');
  const speechPhaseRef = useRef<SpeechPhase>('reading');
  const setSpeechPhase = useCallback((phase: SpeechPhase) => {
    speechPhaseRef.current = phase;
    _setSpeechPhase(phase);
  }, []);
  const [adaptiveSilenceThreshold, setAdaptiveSilenceThreshold] = useState(5000);
  const readingTimeBuffer = 10000;

  // ── Reading time ──────────────────────────────────────────────────────────────
  const [isInReadingTime, _setIsInReadingTime] = useState(false);
  const isInReadingTimeRef = useRef(false);
  const setIsInReadingTime = useCallback((val: boolean) => {
    isInReadingTimeRef.current = val;
    _setIsInReadingTime(val);
  }, []);
  const [readingTimeLeft, setReadingTimeLeft] = useState(0);

  // ── Answer timer ──────────────────────────────────────────────────────────────
  const QUESTION_MAX_DURATION = 180000; // 3 minutes
  const prevIsInReadingTimeRef = useRef(false);
  const [questionAnswerStartTime, setQuestionAnswerStartTime] = useState<number | null>(null);
  const [questionAnswerElapsed, setQuestionAnswerElapsed] = useState(0);

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

  const tokenRef       = useRef<string | null>(null);
  const tokenFetchedAt = useRef<number>(0);
  const TOKEN_TTL_MS   = 55_000; // AssemblyAI tokens expire at 60 s; re-fetch 5 s early

  const generateStreamingToken = async (): Promise<string> => {
    const age = Date.now() - tokenFetchedAt.current;
    if (tokenRef.current && age < TOKEN_TTL_MS) return tokenRef.current;

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
    tokenRef.current      = token;
    tokenFetchedAt.current = Date.now();
    return token;
  };

  // ── Keyword extraction for AssemblyAI word boost ──────────────────────────────

  const extractTechnicalKeywords = (config: InterviewConfig, jd?: any): string[] => {
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
    // Proper nouns most likely to be mangled by accented speech
    const ctx: any = (config as any)?.context || {};
    const candidateName: string | undefined = ctx.candidateName || (config as any)?.candidateName;
    const targetRole:    string | undefined = ctx.targetRole    || jd?.jobDetails?.title;
    const targetCompany: string | undefined = ctx.targetCompany || jd?.createdBy?.name || jd?.companyName;
    const priorEmployers: string[] = Array.isArray(ctx.priorEmployers) ? ctx.priorEmployers : [];
    const properNouns = [candidateName, targetRole, targetCompany, ...priorEmployers]
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 1)
      .flatMap(v => v.split(/[\s,;/]+/))
      .filter(v => v.length > 1);
    jdKeywords.push(...properNouns);
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
      return { end_of_turn_confidence_threshold: 0.65, min_end_of_turn_silence_when_confident: 700,  max_turn_silence: 2000 };
    }
    if (questionType === 'technical' || questionType === 'system_design' || questionType === 'coding') {
      return { end_of_turn_confidence_threshold: 0.78, min_end_of_turn_silence_when_confident: 1000, max_turn_silence: 8000 };
    }
    if (questionType === 'behavioral' || questionType === 'experience') {
      return { end_of_turn_confidence_threshold: 0.72, min_end_of_turn_silence_when_confident: 800,  max_turn_silence: 6000 };
    }
    return   { end_of_turn_confidence_threshold: 0.72, min_end_of_turn_silence_when_confident: 800,  max_turn_silence: 6000 };
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
    blockTurnsRef.current = true;

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
    const completedTurns = accumulatedTurnsRef.current;
    const currentVisible  = currentTranscriptRef.current.trim();

    // currentTranscript always equals: joined completed turns + any live partial.
    // Prefer it so trailing words visible in the transcript panel are never dropped.
    // Fall back to joined completed turns if the transcript was already cleared.
    const completeAnswer = currentVisible || completedTurns.join(' ');
    if (!completeAnswer) return;

    if (!socketRef.current?.connected || !sessionIdRef.current) return;

    blockTurnsRef.current = true;
    socketRef.current.emit('candidate_response', {
      sessionId:       sessionIdRef.current,
      transcript:      completeAnswer,
      timestamp:       new Date().toISOString(),
      isFinal:         true,
      turnCount:       completedTurns.length || 1,
      speakingDuration: speakingStartTimeRef.current ? Date.now() - speakingStartTimeRef.current : 0,
      accumulated:     true,
    });

    setAgentState('thinking');
    setAgentMessage('AI is analyzing your complete response...');
    setSpeechPhase('thinking');
    addTranscriptDebugLog(`📤 Sent (${completeAnswer.length} chars)`);

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
    speakingStartTimeRef.current = null;
    setAccumulatedTurns([]);
    accumulatedTurnsRef.current = [];
    setSilenceWarning(null);
    silenceTimerLastVoiceRef.current = Date.now();
    silenceAutoSkipFiredRef.current = false;
    if (submitGraceTimerRef.current) { clearTimeout(submitGraceTimerRef.current); submitGraceTimerRef.current = null; }
    setCanSubmit(false);
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
        }

        const MAX_SPEAKING_DURATION = 180000;
        const speakingDuration = Date.now() - speakingStartTimeRef.current;
        if (speakingDuration > MAX_SPEAKING_DURATION) {
          if (accumulatedTurnsRef.current.length > 0) sendAccumulatedAnswer();
          socketRef.current?.emit('speaking_too_long', { duration: speakingDuration });
          speakingStartTimeRef.current = null;
          return;
        }

        // Block transcript display: after submit OR during reading time.
        // Only show text once the question is read and the Submit button is visible.
        if (blockTurnsRef.current || isInReadingTimeRef.current) {
          setCurrentTranscript('');
          return;
        }

        // Track the last partial so end_of_turn can recover dropped last words
        if (!turn.end_of_turn) lastPartialRef.current = text;

        // Show accumulated turns + live partial so the user sees real-time text
        const accumulated = accumulatedTurnsRef.current.join(' ');
        setCurrentTranscript(accumulated ? `${accumulated} ${text}` : text);
        setSpeechPhase('speaking');
        setAgentState('waiting');
        setAgentMessage('Listening to your answer...');
        addTranscriptDebugLog(`📝 Partial: "${text.slice(0, 50)}..."`);

        // Every audio event (partial or end_of_turn) resets the submit gate and
        // restarts the quiet window. 1500 ms covers AssemblyAI's P99 post-turn
        // flush latency — late words ("developer") arrive as post-end_of_turn
        // partials within ~500 ms, so 1500 ms ensures they always land before
        // the button enables.
        setCanSubmit(false);
        if (submitGraceTimerRef.current) clearTimeout(submitGraceTimerRef.current);
        submitGraceTimerRef.current = setTimeout(() => {
          submitGraceTimerRef.current = null;
          setCanSubmit(true);
        }, 1500);

        if (!turn.end_of_turn) return;

        const now = Date.now();
        const duration = speakingStartTimeRef.current ? now - speakingStartTimeRef.current : 0;
        addTranscriptDebugLog(`✅ Turn complete: conf=${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);

        if (duration < minimumSpeakingDuration) {
          addTranscriptDebugLog(`⏱️ Too short: ${duration}ms < ${minimumSpeakingDuration}ms`);
          return;
        }

        if (turn.end_of_turn_confidence < 0.12) {
          setAgentState('waiting');
          setAgentMessage('We may have missed part of that — please repeat if the text below is wrong.');
          showNotification('We may have missed part of that — please repeat if the text is wrong.', 'info');
          setAccumulatedTranscript(text);
          addTranscriptDebugLog(`⚠️ Very low confidence: ${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);
          return;
        }

        if (blockTurnsRef.current) return;

        if (isInReadingTimeRef.current) {
          setSpeechPhase('reading');
          return;
        }

        // Prefer whichever has more words — end_of_turn sometimes drops the last
        // word that appeared in the final partial (model revision under silence pressure)
        const lastPartial = lastPartialRef.current;
        lastPartialRef.current = '';
        const finalText = lastPartial.split(' ').length > text.split(' ').length ? lastPartial : text;

        const newTurns = [...accumulatedTurnsRef.current, finalText];
        setAccumulatedTurns(newTurns);
        accumulatedTurnsRef.current = newTurns;

        const fullTranscript = newTurns.join(' ');
        setAccumulatedTranscript(fullTranscript);
        setCurrentTranscript(fullTranscript);
        setAgentState('waiting');
        setAgentMessage('Listening to your answer...');
        setSpeechPhase('paused');
        addTranscriptDebugLog(`📥 Turn ${newTurns.length} accumulated (${finalText.length} chars)`);

        if (newTurns.length >= MAX_ACCUMULATED_TURNS) {
          addTranscriptDebugLog(`⚠️ Max turns reached — forcing send`);
          sendAccumulatedAnswer();
        }
      });

      let audioPacketsSent = 0;
      let lastLogTime = Date.now();
      // VAD state — hysteresis prevents flickering on brief / ambient sounds
      let prevVoiceActive  = false;
      let speechFrames     = 0;  // consecutive frames passing speech criteria
      let silenceFrames    = 0;  // consecutive frames failing speech criteria
      // At 16 kHz / 1024 buffer each frame ≈ 64 ms
      const SPEECH_THRESHOLD   = 0.028; // ~−31 dBFS — above breathing (~0.015) and ambient noise
      const FRAMES_TO_ACTIVATE = 8;     // 8 × 64 ms = ~512 ms — filters coughs, throat clears, keyboard clicks
      const FRAMES_TO_RELEASE  = 12;    // 12 × 64 ms = ~768 ms of silence to deactivate

      transcriber.on('open', (_openData: any) => {
        setIsConnecting(false);

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (event) => {
          const inputBuffer = event.inputBuffer.getChannelData(0);

          // ── Voice-activity detection: RMS + ZCR + hysteresis ────────────
          // NOTE: We intentionally send real mic audio even during reading time.
          // The turn handler blocks reading-time speech via isInReadingTimeRef,
          // but sending real audio (vs. silent zeros) keeps the model calibrated
          // to the current acoustic environment — eliminating the cold-start delay
          // that caused the first word to be dropped when the user began answering.
          let sumSq = 0;
          let zcr   = 0;
          for (let i = 0; i < inputBuffer.length; i++) {
            sumSq += inputBuffer[i] * inputBuffer[i];
            if (i > 0 && (inputBuffer[i] >= 0) !== (inputBuffer[i - 1] >= 0)) zcr++;
          }
          const rms     = Math.sqrt(sumSq / inputBuffer.length);
          const zcrRate = zcr / inputBuffer.length;
          // Keyboard clicks / sharp transients spike ZCR above 0.40; speech stays below.
          // RMS gate rejects breathing and ambient noise regardless of ZCR.
          const looksLikeSpeech = rms > SPEECH_THRESHOLD && zcrRate < 0.40;

          if (looksLikeSpeech) {
            speechFrames++;
            silenceFrames = 0;
            // Refresh the silence clock on every speech frame, not just on VAD activation.
            // Without this, 30+ s of continuous speech would trigger the "still silent" warning.
            silenceTimerLastVoiceRef.current = Date.now();
            if (!prevVoiceActive && speechFrames >= FRAMES_TO_ACTIVATE) {
              prevVoiceActive = true;
              setIsVoiceActive(true);
              setSilenceWarning(null);
              silenceAutoSkipFiredRef.current = false;
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

          // Send real audio during most of reading time (keeps AssemblyAI calibrated,
          // prevents cold-start on first word). For the last 1500 ms, send silence
          // so AssemblyAI flushes pending reading-time speech before reading ends.
          const int16Buffer = new Int16Array(inputBuffer.length);
          if (!sendSilenceRef.current) {
            for (let i = 0; i < inputBuffer.length; i++) {
              int16Buffer[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32767));
            }
          }
          transcriber.sendAudio(int16Buffer.buffer);
          audioPacketsSent++;
          const now = Date.now();
          if (now - lastLogTime > 5000) { lastLogTime = now; }
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
    // AGC compresses accented vowels and noiseSuppression can smear consonants.
    // Keep echoCancellation on (needed for laptop mic + speaker setups).
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false, sampleRate: 16000, channelCount: 1 },
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
      setCanSubmit(false);
      if (submitGraceTimerRef.current) { clearTimeout(submitGraceTimerRef.current); submitGraceTimerRef.current = null; }
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
    setAgentState('waiting');
    setAgentMessage('Listening to your answer...');
    setSpeechPhase('reading');
    speakingStartTimeRef.current = null;
    setAccumulatedTurns([]);
    accumulatedTurnsRef.current = [];
    setSilenceWarning(null);
    silenceTimerLastVoiceRef.current = Date.now();
    silenceAutoSkipFiredRef.current = false;
    if (submitGraceTimerRef.current) { clearTimeout(submitGraceTimerRef.current); submitGraceTimerRef.current = null; }
    setCanSubmit(false);
    setQuestionAnswerStartTime(null);
    setQuestionAnswerElapsed(0);
    prevIsInReadingTimeRef.current = false;
    // Unblock turns on every new message, not just question/follow_up/new_topic.
    // Without this, an 'intervention' message leaves blockTurnsRef=true and all
    // speech for the following response is silently discarded.
    blockTurnsRef.current = false;
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
      blockTurnsRef.current = false;
      return;
    }

    setIsInReadingTime(true);
    setIsVoiceActive(false);
    setReadingTimeLeft(remaining);

    const timer = setInterval(() => {
      const rem = readingTimeBuffer - (Date.now() - questionReadingTime);
      if (rem > 0) {
        setReadingTimeLeft(rem);
        // Last 1500 ms: send silence so AssemblyAI flushes any pending
        // reading-time speech before reading ends — no stale turns afterwards.
        sendSilenceRef.current = rem <= 1500;
      } else {
        sendSilenceRef.current = false;
        setIsInReadingTime(false);
        setReadingTimeLeft(0);
        setQuestionReadingTime(null);
        blockTurnsRef.current = false;
      }
    }, 100);

    return () => clearInterval(timer);
  }, [questionReadingTime]);

  // ── Start answer timer when reading phase ends ───────────────────────────────

  useEffect(() => {
    const wasReading = prevIsInReadingTimeRef.current;
    prevIsInReadingTimeRef.current = isInReadingTime;
    if (wasReading && !isInReadingTime) {
      setQuestionAnswerStartTime(Date.now());
      setQuestionAnswerElapsed(0);
    }
  }, [isInReadingTime]);

  useEffect(() => {
    if (!questionAnswerStartTime || !isRecording) return;
    const id = setInterval(() => {
      setQuestionAnswerElapsed(Date.now() - questionAnswerStartTime);
    }, 500);
    return () => clearInterval(id);
  }, [questionAnswerStartTime, isRecording]);

  // ── Auto-advance when answer time (3 min) expires ────────────────────────────

  useEffect(() => {
    if (!questionAnswerStartTime) return;
    if (questionAnswerElapsed < QUESTION_MAX_DURATION) return;

    // Stop the timer first to prevent re-firing
    setQuestionAnswerStartTime(null);
    setQuestionAnswerElapsed(0);

    if (accumulatedTurnsRef.current.length > 0) {
      sendAccumulatedAnswer();
    } else {
      skipQuestion();
    }
  }, [questionAnswerElapsed, questionAnswerStartTime, sendAccumulatedAnswer, skipQuestion]);

  // ── Auto-skip on 60 s silence (warn at 30 s) ─────────────────────────────────

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      if (isInReadingTime || agentState === 'thinking' || silenceAutoSkipFiredRef.current) {
        setSilenceWarning(null);
        return;
      }
      if (!socketRef.current?.connected || !sessionIdRef.current) return;
      const silentMs = Date.now() - silenceTimerLastVoiceRef.current;
      if (silentMs >= 60_000) {
        silenceAutoSkipFiredRef.current = true;
        blockTurnsRef.current = true;
        setSilenceWarning(0);
        // Show "Preparing next question" overlay immediately — same UX as Submit
        setAgentState('thinking');
        setAgentMessage('Moving to next question…');
        silenceTimerLastVoiceRef.current = Date.now();
        socketRef.current.emit('silence_detected', {
          sessionId: sessionIdRef.current,
          durationSeconds: Math.round(silentMs / 1000),
          timestamp: new Date().toISOString(),
        });
      } else if (silentMs >= 30_000) {
        setSilenceWarning(Math.ceil((60_000 - silentMs) / 1000));
      } else {
        setSilenceWarning(null);
      }
    }, 500);
    return () => clearInterval(id);
  }, [isRecording, isInReadingTime, agentState, socketRef, sessionIdRef]);

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
    canSubmit,
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
    silenceWarning,
    questionAnswerElapsed,
    questionAnswerRemaining: Math.max(0, QUESTION_MAX_DURATION - questionAnswerElapsed),
  };
};
