import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f0f4fb] text-[#1a1c1f] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-sm w-full text-center">
        <div className="h-16 w-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 bg-white border border-gray-100 shadow-sm">
          <img src="/images/nisir_bank_logo.svg" alt="Nisir Bank S.C." className="h-14 w-14 object-contain" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1">Page Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">
          This page is temporarily unavailable. Please return to your inbox.
        </p>
        <Link
          href="/internal_email"
          className="inline-flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
        >
          Go to Inbox
        </Link>
      </div>
    </main>
  );
}
