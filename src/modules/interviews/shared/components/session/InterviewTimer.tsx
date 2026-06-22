import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface InterviewTimerProps {
  elapsedTime: number;
  timeWarning: boolean;
}

const InterviewTimer: React.FC<InterviewTimerProps> = ({ elapsedTime, timeWarning }) => (
  <div
    className="flex items-center gap-1.5 rounded-full px-3 py-1 border"
    style={{
      background: timeWarning ? 'rgba(239,68,68,0.1)' : 'rgba(11,11,15,0.06)',
      borderColor: timeWarning ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.1)',
    }}
  >
    {timeWarning
      ? <AlertTriangle size={12} color="#ef4444" />
      : <Clock size={12} color="#6B7280" />}
    <span
      className="font-sans font-bold text-[0.78rem] tracking-[0.04em]"
      style={{ color: timeWarning ? '#ef4444' : '#374151' }}
    >
      {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
    </span>
  </div>
);

export default InterviewTimer;
