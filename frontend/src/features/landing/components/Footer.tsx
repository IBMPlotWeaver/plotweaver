export function Footer() {
  return (
    <footer className="border-t border-(--line) bg-(--header-bg) backdrop-blur-xl px-6 py-12 text-center">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src="/plotweaver-logo.png" alt="PlotWeaver Logo" className="h-6 w-auto object-contain opacity-75 grayscale hover:grayscale-0 transition-all" />
          <span className="font-bold text-slate-800 dark:text-slate-200">PlotWeaver</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} PlotWeaver. Built for the IBM AI Builders Challenge.
        </p>
        <div className="flex gap-4">
          <a href="https://github.com/IBMPlotWeaver/plotweaver"
            className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
