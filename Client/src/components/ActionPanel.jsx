import {
  Sparkles,
  FolderOpen,
  CheckCircle2,
  Terminal,
  MousePointer2,
  Loader2,
} from "lucide-react";
import PropTypes from "prop-types";

/* 🔹 Helper: format last updated label */
const getStatusText = (lastUpdated) => {
  if (!lastUpdated) return "Idle";
  return "Live Sync Active";
};

/* 🔹 Helper: button label */
const getButtonLabel = (isGenerating) => {
  return isGenerating ? "Connecting Tracker..." : "Start Live Tracking";
};

export default function ActionPanel({
  onTrack,
  onBrowse,
  isGenerating,
  lastUpdated,
  projectPath,
}) {
  const isDisabled = isGenerating || !projectPath;

  const baseSelectorStyles =
    "relative group/selector w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden";

  const selectorStateStyles = projectPath
    ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50"
    : "border-slate-800 hover:border-purple-500/50 hover:bg-purple-600/5";

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group">

      {/* Background Glow */}
      <div className="absolute -inset-10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Live Documentation Engine
        </h2>

        {/* ✅ Added description */}
        <p className="text-sm text-slate-400 leading-relaxed">
          Connect your local project folder and automatically generate live API
          documentation. Changes in your code will be tracked and synced in real-time.
        </p>
      </div>

      {/* Folder Selector */}
      <div className="flex flex-col gap-4">
        <div
          onClick={onBrowse}
          role="button"
          tabIndex={0}
          aria-label="Select project folder"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onBrowse();
            }
          }}
          className={`${baseSelectorStyles} ${selectorStateStyles}`}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent bg-[length:200%_200%] group-hover/selector:bg-[100%_100%] transition-all duration-1000" />

          {/* Icon */}
          <FolderOpen
            className={`w-10 h-10 mb-3 transition-all duration-500 ${
              projectPath
                ? "text-emerald-400 scale-110"
                : "text-slate-600 group-hover/selector:text-purple-400 group-hover/selector:scale-110"
            }`}
          />

          {/* Text */}
          <div className="text-center px-4 relative z-10">
            <span
              className={`block text-xs font-bold ${
                projectPath
                  ? "text-emerald-200"
                  : "text-slate-400 group-hover/selector:text-slate-100"
              }`}
            >
              {projectPath
                ? "Project Folder Selected"
                : "Select Project Folder"}
            </span>

            {projectPath ? (
              <span className="block text-[10px] text-emerald-500/80 mt-1 font-mono truncate max-w-[240px]">
                {projectPath}
              </span>
            ) : (
              <span className="block text-[10px] text-slate-500 mt-1">
                Click to browse your system
              </span>
            )}
          </div>

          {/* Hover Pointer */}
          <div className="absolute top-2 right-2 opacity-0 group-hover/selector:opacity-100 transition-opacity">
            <MousePointer2 className="w-4 h-4 text-purple-400 animate-bounce" />
          </div>
        </div>

        {/* Selected Location Bar */}
        {projectPath && (
          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Selected Location
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                {projectPath}
              </span>
            </div>

            <button
              onClick={onBrowse}
              className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest"
            >
              Update Folder
            </button>
          </div>
        )}
      </div>

      {/* Connect Button */}
      <button
        onClick={onTrack}
        disabled={isDisabled}
        className={`relative w-full rounded-xl py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isDisabled
            ? "bg-purple-600/30 cursor-not-allowed text-white/50"
            : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 active:scale-[0.98]"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {getButtonLabel(true)}
          </>
        ) : (
          <>
            <Terminal className="w-5 h-5" />
            {getButtonLabel(false)}
          </>
        )}
      </button>

      {/* Status */}
      <div className="text-[10px] text-slate-500 text-center">
        Status: {getStatusText(lastUpdated)}
      </div>

      {/* Live Tracker Status */}
      {lastUpdated && !isGenerating && (
        <div className="flex items-center gap-3 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 p-4 rounded-xl shadow-xl shadow-emerald-500/5">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-sm animate-pulse" />
            <CheckCircle2 className="w-5 h-5 relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold">LIVE TRACKER ACTIVE</span>
            <span className="opacity-80 text-[10px] uppercase font-mono tracking-tighter">
              Syncing with local source
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ✅ Prop Validation */
ActionPanel.propTypes = {
  onTrack: PropTypes.func.isRequired,
  onBrowse: PropTypes.func.isRequired,
  isGenerating: PropTypes.bool,
  lastUpdated: PropTypes.bool,
  projectPath: PropTypes.string,
};