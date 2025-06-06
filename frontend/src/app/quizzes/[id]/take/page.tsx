'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Timer } from '@/components/ui/Timer';

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

interface SelectedAnswers {
  [questionId: string]: string;
}

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const quizId = params.id as string;

  const handleTimeUp = useCallback(async () => {
    if (attemptId && quiz) {
      await submitQuiz();
    }
  }, [attemptId, quiz]);

  const submitQuiz = async () => {
    if (!attemptId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const answers = Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
        question_id: questionId,
        answer_id: answerId,
      }));

      const result = await api.attempts.submit(attemptId, answers, token);
      router.push(`/results/${result.id}`);
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const startQuiz = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const [quizData, attemptData] = await Promise.all([
          api.quizzes.get(quizId, token),
          api.attempts.start(quizId, token),
        ]);

        setQuiz(quizData);
        setAttemptId(attemptData.id);
      } catch (err) {
        setError('Failed to start quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId && isAuthenticated) {
      startQuiz();
    }
  }, [quizId, isAuthenticated, authLoading, router]);

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (quiz && Object.keys(selectedAnswers).length < quiz.questions.length) {
      const unanswered = quiz.questions.length - Object.keys(selectedAnswers).length;
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }
    await submitQuiz();
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
          <p style={{ color: 'var(--text-secondary)' }}>Starting quiz...</p>
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
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => router.push('/quizzes')}
            >
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestion.id] !== undefined;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Timer */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {quiz.title}
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>
        <Timer
          initialSeconds={quiz.time_limit_minutes * 60}
          onComplete={handleTimeUp}
          autoStart={true}
          showWarning={true}
          warningThreshold={60}
        />
      </div>

      {/* Progress Bar */}
      <div
        className="h-2 rounded-full mb-6 overflow-hidden"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            backgroundColor: 'var(--primary)',
            width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <Card variant="bordered" padding="lg">
        <CardContent>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.answers
              .sort((a, b) => a.order_index - b.order_index)
              .map((answer) => {
                const isSelected = selectedAnswers[currentQuestion.id] === answer.id;
                return (
                  <button
                    key={answer.id}
                    onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                    className="w-full p-4 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--background)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="white"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </div>
                      <span>{answer.text}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {quiz.questions.map((q, index) => {
          const isAnsweredQuestion = selectedAnswers[q.id] !== undefined;
          const isCurrent = index === currentQuestionIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className="w-10 h-10 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: isCurrent
                  ? 'var(--primary)'
                  : isAnsweredQuestion
                  ? 'var(--success)'
                  : 'var(--surface)',
                color: isCurrent || isAnsweredQuestion ? 'white' : 'var(--text-primary)',
                border: isCurrent ? 'none' : '1px solid var(--border)',
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <p
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          {answeredCount} of {quiz.questions.length} answered
        </p>

        {isLastQuestion ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
