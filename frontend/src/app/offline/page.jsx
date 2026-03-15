import Link from "next/link";

export const metadata = {
  title: "Offline | KhataBook",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="glass-card rounded-2xl p-6 sm:p-8 max-w-md text-center">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
          You are offline
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Previously loaded data is still available where cached. Reconnect to sync the latest transactions and budgets.
        </p>
        <Link
          href="/"
          className="inline-block mt-5 px-4 py-2 rounded-lg bg-[#ff5f34] text-white font-medium hover:bg-[#f2512b] transition-colors"
        >
          Retry
        </Link>
      </section>
    </main>
  );
}
