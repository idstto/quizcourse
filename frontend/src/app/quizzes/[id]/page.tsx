'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface QuizDetail {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  questions: Array<{
    id: string;
    text: string;
    order_index: number;
    answers: Array<{ id: string; text: string; order_index: number }>;
  }>;
}

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const quizId = params.id as string;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = getToken();
        const data = await api.quizzes.get(quizId, token || undefined);
        setQuiz(data);
      } catch (err) {
        setError('Failed to load quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleStartQuiz = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/quizzes/${quizId}/take`);
  };

  if (isLoading) {
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
          <p style={{ color: 'var(--text-secondary)' }}>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="bordered" padding="lg" className="max-w-md text-center">
          <CardContent>
            <p style={{ color: 'var(--error)' }}>{error || 'Quiz not found'}</p>
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
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-2 mb-6 transition-colors hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Back to Quizzes
      </Link>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>
            <span className="text-3xl">{quiz.title}</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {quiz.description && (
            <p
              className="text-lg mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              {quiz.description}
            </p>
          )}

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--primary-light)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                  style={{ color: 'var(--primary-dark)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Questions
                </p>
                <p
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {quiz.questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--primary-light)' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                  style={{ color: 'var(--primary-dark)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Time Limit
                </p>
                <p
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {quiz.time_limit_minutes} minutes
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-6 p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--warning)',
              color: 'var(--text-primary)',
            }}
          >
            <h3 className="font-semibold mb-2">Before you start:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Make sure you have a stable internet connection</li>
              <li>The timer will start once you begin the quiz</li>
              <li>You cannot pause the quiz once started</li>
              <li>Your answers will be submitted automatically when time runs out</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button variant="primary" size="lg" onClick={handleStartQuiz}>
            {isAuthenticated ? 'Start Quiz' : 'Login to Start'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
