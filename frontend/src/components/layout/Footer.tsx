export function Footer() {
  return (
    <footer
      className="border-t py-8 mt-auto"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            &copy; {new Date().getFullYear()} QuizCourse. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
