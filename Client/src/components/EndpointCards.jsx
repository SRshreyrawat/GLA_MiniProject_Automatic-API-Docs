import { Activity, Globe, Lock, Cpu, ArrowRight } from 'lucide-react'

export default function EndpointCards({ endpoints }) {
  if (!endpoints || endpoints.length === 0) return null

  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'POST': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'PUT': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'DELETE': return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Available API Endpoints
          <span className="text-xs font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-2">
            {endpoints.length} Available
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {endpoints.map((endpoint, i) => (
          <div 
            key={i}
            className="group relative glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/30 hover:bg-slate-900/50 transition-all duration-300"
          >
            {/* Background Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

            <div className="relative flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getMethodColor(endpoint.method)}`}>
                  {endpoint.method}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-purple-400 transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono">ACTIVE</span>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-sm font-mono font-bold text-slate-100 group-hover:text-white transition-colors truncate">
                  {endpoint.path}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {endpoint.description}
              </p>

              <div className="pt-2 flex items-center justify-between">
                 {/* Decorative elements */}
                 <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                 </div>
                 <button className="flex items-center gap-1 text-[10px] font-bold text-slate-500 group-hover:text-purple-400 transition-colors">
                   View Details <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

