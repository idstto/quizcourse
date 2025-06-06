'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface QuizListItem {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = getToken();
        const data = await api.quizzes.list(token || undefined);
        setQuizzes(data);
      } catch (err) {
        setError('Failed to load quizzes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

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
          <p style={{ color: 'var(--text-secondary)' }}>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="bordered" padding="lg" className="max-w-md text-center">
          <CardContent>
            <p style={{ color: 'var(--error)' }}>{error}</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Available Quizzes
        </h1>
        <p
          className="mt-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Choose a quiz to test your knowledge
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card variant="bordered" padding="lg" className="text-center">
          <CardContent>
            <p style={{ color: 'var(--text-secondary)' }}>
              No quizzes available at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} variant="bordered" padding="md">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className="mb-4 line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {quiz.description || 'No description available'}
                </p>
                <div
                  className="flex items-center gap-2 text-sm"
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
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <span>{quiz.time_limit_minutes} minutes</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/quizzes/${quiz.id}`} className="w-full">
                  <Button variant="primary" className="w-full">
                    View Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
