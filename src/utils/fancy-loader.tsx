import "../css/fancy-loader.css";

export default function FancyLoader({
  label = "กำลังโหลด...",
  tip,
}: { label?: string; tip?: string }) {
  return (
    <div className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-white/95 backdrop-blur-sm">
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 animate-pulse rounded-full bg-linear-to-br from-blue-100/40 to-indigo-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-linear-to-br from-slate-100/40 to-gray-100/40 blur-3xl animation-delay-1000" />

      {/* Main loader card */}
      <div className="relative flex w-full max-w-sm flex-col items-center gap-6 ">
        
        {/* Multi-ring spinner */}
        <div
          className="relative h-20 w-20"
          role="status"
          aria-live="polite"
          aria-label={label}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 animate-spin-slow rounded-full border-[3px] border-transparent border-t-blue-500 border-r-blue-500/30" />
          
          {/* Middle ring */}
          <div className="absolute inset-2 animate-spin rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-indigo-500/30" />
          
          {/* Inner ring */}
          <div className="absolute inset-4 animate-spin-fast rounded-full border-[3px] border-transparent border-t-slate-600 border-r-slate-600/30" />
          
          {/* Center dot with pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 animate-pulse rounded-full bg-linear-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30" />
          </div>
        </div>

        {/* Label with professional text */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-base font-semibold text-slate-700">
            {label}
          </p>

          {tip ? (
            <p className="line-clamp-2 text-center text-xs text-slate-500">
              {tip}
            </p>
          ) : null}
        </div>

        {/* Progress bar */}
        {/* <div className="w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-1 animate-progress rounded-full bg-linear-to-r from-blue-500 to-indigo-600 shadow-sm" />
        </div> */}
      </div>
      
    </div>
  );
}