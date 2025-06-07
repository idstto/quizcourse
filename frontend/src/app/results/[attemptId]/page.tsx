'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AttemptResult {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken_seconds: number | null;
  answers: Array<{
    question_text: string;
    selected_answer_text: string;
    correct_answer_text: string;
    is_correct: boolean;
  }>;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);

  const attemptId = params.attemptId as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchResult = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const data = await api.attempts.get(attemptId, token);
        setResult(data);
      } catch (err) {
        setError('Failed to load results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (attemptId && isAuthenticated) {
      fetchResult();
    }
  }, [attemptId, isAuthenticated, authLoading, router]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'var(--success)';
    if (percentage >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep it up!';
    if (percentage >= 60) return 'Not bad! Room for improvement.';
    if (percentage >= 50) return 'You passed, but try again for a better score.';
    return 'Keep practicing! You can do better.';
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4"
            style={{
              borderColor: 'var(--border)',
              borderTopColor: 'var(--primary)',
            }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="bordered" padding="lg" className="max-w-md text-center">
          <CardContent>
            <p style={{ color: 'var(--error)' }}>{error || 'Results not found'}</p>
            <Link href="/quizzes">
              <Button variant="secondary" className="mt-4">
                Back to Quizzes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Score Card */}
      <Card variant="bordered" padding="lg" className="mb-8">
        <CardHeader className="text-center">
          <CardTitle>
            <span className="text-3xl">{result.quiz_title}</span>
          </CardTitle>
          <p
            className="mt-2 text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Quiz Completed!
          </p>
        </CardHeader>

        <CardContent>
          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div
              className="relative w-40 h-40 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'var(--background)',
                border: `8px solid ${getScoreColor(result.percentage)}`,
              }}
            >
              <div className="text-center">
                <span
                  className="text-4xl font-bold"
                  style={{ color: getScoreColor(result.percentage) }}
                >
                  {Math.round(result.percentage)}%
                </span>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {result.score}/{result.total_questions}
                </p>
              </div>
            </div>
          </div>

          {/* Score Message */}
          <p
            className="text-center text-xl font-medium mb-8"
            style={{ color: 'var(--text-primary)' }}
          >
            {getScoreMessage(result.percentage)}
          </p>

          {/* Stats Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <div className="text-center p-4">
              <p
                className="text-sm mb-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Correct Answers
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--success)' }}
              >
                {result.score}
              </p>
            </div>
            <div className="text-center p-4">
              <p
                className="text-sm mb-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Incorrect Answers
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--error)' }}
              >
                {result.total_questions - result.score}
              </p>
            </div>
            <div className="text-center p-4">
              <p
                className="text-sm mb-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Time Taken
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatTime(result.time_taken_seconds)}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-center gap-4">
          <Button
            variant="secondary"
            onClick={() => setShowAnswers(!showAnswers)}
          >
            {showAnswers ? 'Hide Answers' : 'Review Answers'}
          </Button>
          <Link href="/quizzes">
            <Button variant="primary">Take Another Quiz</Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Answers Review */}
      {showAnswers && (
        <div className="space-y-4">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Answer Review
          </h2>

          {result.answers.map((answer, index) => (
            <Card
              key={index}
              variant="bordered"
              padding="md"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: answer.is_correct ? 'var(--success)' : 'var(--error)',
              }}
            >
              <CardContent>
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      backgroundColor: answer.is_correct ? 'var(--success)' : 'var(--error)',
                      color: 'white',
                    }}
                  >
                    {index + 1}
                  </span>
                  <p
                    className="font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {answer.question_text}
                  </p>
                </div>

                <div className="ml-9 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Your answer:
                    </span>
                    <span
                      className="text-sm"
                      style={{
                        color: answer.is_correct ? 'var(--success)' : 'var(--error)',
                      }}
                    >
                      {answer.selected_answer_text}
                      {answer.is_correct ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 inline ml-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 inline ml-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </span>
                  </div>

                  {!answer.is_correct && (
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Correct answer:
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--success)' }}
                      >
                        {answer.correct_answer_text}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
