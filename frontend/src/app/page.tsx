import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>
          Welcome to QuizCourse
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          Test your knowledge with interactive quizzes. Track your progress and improve your skills.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/quizzes"
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-primary)',
            }}
          >
            Browse Quizzes
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg font-medium transition-colors border"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
