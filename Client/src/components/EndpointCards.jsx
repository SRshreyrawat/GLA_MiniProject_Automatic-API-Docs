import {
  Activity,
  Globe,
  ArrowRight,
  Server,
  ShieldCheck,
} from "lucide-react";
import PropTypes from "prop-types";

/* 🎨 Method styles */
const METHOD_STYLES = {
  GET: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  POST: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  PUT: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  DELETE: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  PATCH: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  DEFAULT: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

/* 🔹 Helper: safe method style */
const getMethodStyle = (method = "") => {
  return METHOD_STYLES[method.toUpperCase()] || METHOD_STYLES.DEFAULT;
};

/* 🔹 Helper: truncate long paths */
const formatPath = (path = "") => {
  if (!path) return "/";
  return path.length > 30 ? path.slice(0, 30) + "..." : path;
};

/* 🔹 Helper: default description */
const getDescription = (desc) => {
  return desc || "No description available for this endpoint.";
};

export default function EndpointCards({ endpoints = [] }) {
  if (!endpoints.length) {
    return (
      <div className="text-center text-slate-500 py-10">
        No endpoints available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Available API Endpoints
          <span className="text-xs font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-2">
            {endpoints.length} Available
          </span>
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {endpoints.map((endpoint, index) => {
          const methodStyle = getMethodStyle(endpoint.method);

          return (
            <div
              key={endpoint.path || index}
              className="group relative glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/30 hover:bg-slate-900/50 transition-all duration-300"
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

              <div className="relative flex flex-col gap-3">

                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${methodStyle}`}
                  >
                    {endpoint.method || "UNKNOWN"}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-purple-400 transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono">PUBLIC</span>
                  </div>
                </div>

                {/* Path */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 break-all">
                  <Server className="w-3.5 h-3.5 text-slate-500" />
                  {formatPath(endpoint.path)}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {getDescription(endpoint.description)}
                </p>

                {/* Footer */}
                <div className="pt-2 flex items-center justify-between">

                  {/* Status */}
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    ACTIVE
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Decorative dots */}
                <div className="flex gap-1 pt-1">
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className="w-1.5 h-1.5 rounded-full bg-slate-800"
                    />
                  ))}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ✅ PropTypes */
EndpointCards.propTypes = {
  endpoints: PropTypes.arrayOf(
    PropTypes.shape({
      method: PropTypes.string,
      path: PropTypes.string,
      description: PropTypes.string,
    })
  ),
};