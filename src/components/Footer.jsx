import Link from "next/link";

export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 mt-4 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
        <p>© 2026 Nisir Bank S.C. · Internal Learning Portal</p>

        <div className="flex gap-5">
          <Link href="/policy" className="hover:text-blue-700 transition-colors">
            Policy Center
          </Link>

          <Link href="/support" className="hover:text-blue-700 transition-colors">
            Help &amp; Support
          </Link>

          <Link href="/status" className="hover:text-blue-700 transition-colors">
            System Status
          </Link>
        </div>
      </div>
    </footer>
  );
}