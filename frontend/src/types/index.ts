export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  order_index: number;
  created_at: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  question_id: string;
  text: string;
  order_index: number;
  is_correct?: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  score: number;
  total_questions: number;
  is_completed: boolean;
}

export interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  started_at: string;
  completed_at: string | null;
  time_taken_seconds: number | null;
  answers?: AttemptAnswerDetail[];
}

export interface AttemptAnswerDetail {
  question_id: string;
  question_text: string;
  selected_answer_id: string;
  selected_answer_text: string;
  correct_answer_id: string;
  correct_answer_text: string;
  is_correct: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export type Theme = 'light' | 'dark' | 'system';
