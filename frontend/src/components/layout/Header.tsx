'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 border-b transition-colors"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-xl font-bold"
            style={{ color: 'var(--primary-dark)' }}
          >
            QuizCourse
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/quizzes"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-primary)' }}
            >
              Quizzes
            </Link>

            {isAuthenticated ? (
              <>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {user?.full_name}
                </span>
                <button
                  onClick={logout}
                  className="font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Register
                </Link>
              </>
            )}

            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
