const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; token_type: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, full_name: string) =>
      request<{ id: string; email: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name }),
      }),
    me: (token: string) =>
      request<{ id: string; email: string; full_name: string }>('/api/auth/me', {
        token,
      }),
  },
  quizzes: {
    list: (token?: string) =>
      request<Array<{ id: string; title: string; description: string | null; time_limit_minutes: number }>>('/api/quizzes', { token }),
    get: (id: string, token?: string) =>
      request<{
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
      }>(`/api/quizzes/${id}`, { token }),
  },
  attempts: {
    start: (quizId: string, token: string) =>
      request<{ id: string; quiz_id: string; started_at: string }>(`/api/quizzes/${quizId}/attempts`, {
        method: 'POST',
        token,
      }),
    submit: (
      attemptId: string,
      answers: Array<{ question_id: string; answer_id: string }>,
      token: string
    ) =>
      request<{ id: string; score: number; total_questions: number }>(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
        token,
      }),
    get: (attemptId: string, token: string) =>
      request<{
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
      }>(`/api/attempts/${attemptId}`, { token }),
  },
};
