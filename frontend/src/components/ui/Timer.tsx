'use client';

import { useTimer } from '@/hooks/useTimer';
import { useEffect } from 'react';

interface TimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
  showWarning?: boolean;
  warningThreshold?: number;
}

export function Timer({
  initialSeconds,
  onComplete,
  autoStart = true,
  showWarning = true,
  warningThreshold = 60,
}: TimerProps) {
  const { seconds, isRunning, isComplete, start, pause, reset, formatTime } = useTimer({
    initialSeconds,
    onComplete,
  });

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  const isWarning = showWarning && seconds <= warningThreshold && seconds > 0;
  const isCritical = showWarning && seconds <= 10 && seconds > 0;

  const getTimerStyle = () => {
    if (isComplete) {
      return {
        backgroundColor: 'var(--error)',
        color: 'white',
      };
    }
    if (isCritical) {
      return {
        backgroundColor: 'var(--error)',
        color: 'white',
      };
    }
    if (isWarning) {
      return {
        backgroundColor: 'var(--warning)',
        color: 'var(--text-primary)',
      };
    }
    return {
      backgroundColor: 'var(--surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    };
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-all ${
        isCritical ? 'animate-pulse' : ''
      }`}
      style={getTimerStyle()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <span>{formatTime()}</span>
    </div>
  );
}

interface TimerControlsProps {
  isRunning: boolean;
  isComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  isComplete,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {!isComplete && (
        <button
          onClick={isRunning ? onPause : onStart}
          className="p-2 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          {isRunning ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25v13.5m-7.5-13.5v13.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
              />
            </svg>
          )}
        </button>
      )}
      <button
        onClick={onReset}
        className="p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
    </div>
  );
}
